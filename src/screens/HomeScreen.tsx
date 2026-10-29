// src/screens/HomeScreen.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import ProductCard from '@components/ProductCard';
import SearchBar from '@components/SearchBar';
import FilterModal, { FilterOptions } from '@components/FilterModal';
import LocationBadge from '@components/LocationBadge';
import { MOCK_PRODUCTS } from '@data/mockProducts';
import { Product, ProductListSchema } from '@app-types/product.schema';
import { API_BASE_URL } from '@constants/api';
import { COLORS, SIZES } from '@constants/theme';
import { useTheme } from '@contexts/ThemeContext';
import { useDebounce } from '@hooks/useDebounce';
import { useCartStore } from '@store/useCartStore';
import { useNotificationStore } from '@store/useNotificationStore';
import { useNetworkStore } from '@store/useNetworkStore';
import { STUDENT, triggerHaptic } from '@constants/student';
import type { HomeStackParamList } from '@navigation/HomeStackNavigator';

type HomeNavProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;
type HomeRouteProp = RouteProp<HomeStackParamList, 'Home'>;

const API_URL = `${API_BASE_URL}/api/products`;

const fetchProductsAPI = async (): Promise<Product[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Lỗi mạng từ Server NestJS');
  }
  const rawData = await response.json();
  const result = ProductListSchema.safeParse(rawData);
  if (!result.success) {
    console.error('Zod chặn dữ liệu bẩn từ Server NestJS:', result.error.format());
    throw new Error('Dữ liệu sản phẩm từ Server không hợp lệ!');
  }
  return result.data;
};

const DEFAULT_FILTER: FilterOptions = {
  priceRange: 'all',
  sortBy: 'default',
};

const CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'Ba lô & Túi xách', label: 'Ba lô & Túi' },
  { id: 'Phụ kiện máy tính', label: 'Phụ kiện PC' },
  { id: 'Âm thanh', label: 'Âm thanh' },
  { id: 'Điện thoại & Tablet', label: 'Điện thoại' },
  { id: 'Laptop & Màn hình', label: 'Laptop' },
  { id: 'Thiết bị thông minh', label: 'Thông minh 🎮' },
];

const NOTIFICATIONS = [
  {
    id: 'notif_1',
    icon: '🎁',
    title: 'Ưu đãi sinh viên KTX IUH',
    content: 'Tặng ngay 20.000đ phí ship cho đơn hàng công nghệ đầu tiên đến KTX Trường Đại học Công nghiệp TP.HCM!',
    time: '5 phút trước',
    unread: true,
  },
  {
    id: 'notif_2',
    icon: '🛵',
    title: 'Giao hàng siêu tốc 15 phút',
    content: 'Đội shipper KTXGo đã sẵn sàng trực chiến tại cổng Nhà B & Nhà C KTX.',
    time: '1 giờ trước',
    unread: true,
  },
  {
    id: 'notif_3',
    icon: '⚡',
    title: 'Flash Sale: Ba lô & Chuột công thái học',
    content: 'Giảm đến 30% bộ sưu tập Ba lô Tigernu và chuột Logitech MX Master 3S trong tuần lễ sinh viên.',
    time: 'Hôm nay',
    unread: false,
  },
  {
    id: 'notif_4',
    icon: '🏦',
    title: 'Hỗ trợ quét mã VietQR tự động',
    content: 'Thanh toán quét mã QR mọi ngân hàng nhanh chóng, xác nhận đơn tức thì không cần chờ đợi.',
    time: 'Hôm qua',
    unread: false,
  },
];

interface HomeScreenProps {
  onLogout?: () => void;
}

export default function HomeScreen({ onLogout }: HomeScreenProps) {
  const navigation = useNavigation<HomeNavProp>();
  const route = useRoute<HomeRouteProp>();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const addItem = useCartStore((state) => state.addItem);

  // Store thông báo
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount());
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  const scannedCode = route.params?.scannedCode;

  // Dữ liệu sản phẩm
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isServerOnline, setIsServerOnline] = useState<boolean | null>(null);

  // Bộ lọc & Tìm kiếm & Danh mục
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterVisible, setFilterVisible] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTER);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  const debouncedSearch = useDebounce(searchQuery, 350);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/health`)
      .then((res) => setIsServerOnline(res.ok))
      .catch(() => setIsServerOnline(false));

    fetchProductsAPI()
      .then((data) => setProducts(data))
      .catch((err) => {
        console.warn('⚠️ Lỗi kết nối Server NestJS, dùng mock data tạm:', err.message);
        setProducts(MOCK_PRODUCTS);
      });
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priceRange !== 'all') count++;
    if (filters.sortBy !== 'default') count++;
    return count;
  }, [filters]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Lọc theo danh mục
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Lọc theo từ khóa tìm kiếm
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query),
      );
    }

    // Lọc theo khoảng giá
    if (filters.priceRange === 'under1m5') {
      result = result.filter((p) => p.price < 1500000);
    } else if (filters.priceRange === 'over1m5') {
      result = result.filter((p) => p.price >= 1500000);
    }

    // Sắp xếp
    if (filters.sortBy === 'priceAsc') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'priceDesc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, selectedCategory, debouncedSearch, filters]);

  const handleRefresh = useCallback(() => {
    if (useNetworkStore.getState().isOffline) {
      triggerHaptic(30);
      Alert.alert(
        'Chế độ ngoại tuyến',
        'Thiết bị đang mất kết nối Internet. Đang hiển thị sản phẩm đã lưu trữ trong máy.',
      );
      setRefreshing(false);
      return;
    }

    setRefreshing(true);
    fetchProductsAPI()
      .then((data) => {
        setProducts(data);
        setIsServerOnline(true);
      })
      .catch((err) => {
        console.warn('Lỗi refresh sản phẩm:', err.message);
        setIsServerOnline(false);
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, []);

  // Xử lý Mua ngay: Thêm vào giỏ hàng và điều hướng ngay đến màn hình Checkout
  const handleBuyNow = useCallback(
    (product: Product) => {
      triggerHaptic(40);
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
      navigation.navigate('Checkout');
    },
    [addItem, navigation],
  );

  // Xử lý Thêm nhanh vào giỏ hàng
  const handleAddToCart = useCallback(
    (product: Product) => {
      triggerHaptic(30);
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
      Alert.alert('🛒 Đã thêm vào giỏ', `Đã thêm "${product.name}" vào giỏ hàng thành công!`);
    },
    [addItem],
  );

  const handleSelectCategory = (catId: string) => {
    triggerHaptic(20);
    setSelectedCategory(catId);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.surface }]} edges={['top', 'left', 'right']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header AppBar chuẩn, không bao giờ bị tràn lề */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <View style={styles.titleRow}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>ShopAI ✨</Text>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isServerOnline ? '#10B981' : '#EF4444' },
                ]}
              />
            </View>
            <Text style={[styles.headerSubtitle, { color: colors.textLight }]} numberOfLines={1}>
              {STUDENT.hoTen} · {STUDENT.mssv}
            </Text>
          </View>

          {/* Các nút hành động biểu tượng tròn tinh tế bên phải */}
          <View style={styles.headerRight}>
            {/* Nút Chuông thông báo */}
            <TouchableOpacity
              onPress={() => {
                triggerHaptic(25);
                setShowNotifications(true);
                markAllAsRead();
              }}
              style={[styles.iconButton, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}
              activeOpacity={0.65}
            >
              <Text style={styles.iconText}>🔔</Text>
              {unreadCount > 0 && <View style={styles.unreadBadge} />}
            </TouchableOpacity>

            {/* Nút Đổi giao diện Sáng / Tối */}
            <TouchableOpacity
              onPress={() => {
                triggerHaptic(25);
                toggleTheme();
              }}
              style={[styles.iconButton, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}
              activeOpacity={0.7}
            >
              <Text style={styles.iconText}>{isDarkMode ? '🌙' : '☀️'}</Text>
            </TouchableOpacity>

            {/* Nút Hỏi AI */}
            <TouchableOpacity
              onPress={() => {
                triggerHaptic(25);
                navigation.navigate('AIChat');
              }}
              style={[styles.iconButton, styles.aiButton]}
              activeOpacity={0.7}
            >
              <Text style={styles.iconText}>🤖</Text>
            </TouchableOpacity>

            {/* Nút Quét mã vạch */}
            <TouchableOpacity
              onPress={() => {
                triggerHaptic(25);
                navigation.navigate('Scanner');
              }}
              style={[styles.iconButton, styles.scanButton]}
              activeOpacity={0.7}
            >
              <Text style={styles.iconText}>📷</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Thẻ vị trí + phí ship (tự động dò khoảng cách và tính ship KTX) */}
        <LocationBadge />

        {/* Thông báo mã vừa quét nếu có */}
        {scannedCode && (
          <View style={styles.scannedBanner}>
            <Text style={styles.scannedText}>📷 Mã vừa quét: {scannedCode}</Text>
          </View>
        )}

        {/* Thanh tìm kiếm & Nút mở Bộ Lọc */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onPressFilter={() => {
            triggerHaptic(25);
            setFilterVisible(true);
          }}
          activeFilterCount={activeFilterCount}
        />

        {/* Thanh cuộn chọn Danh mục sản phẩm (Category Chips) */}
        <View style={styles.categoryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleSelectCategory(cat.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* FlashList danh sách sản phẩm Grid 2 cột */}
        <FlashList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => {
                triggerHaptic(25);
                navigation.navigate('ProductDetail', { productId: item.id });
              }}
              onBuyNow={handleBuyNow}
              onAddToCart={handleAddToCart}
            />
          )}
          numColumns={2}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔎</Text>
              <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
              <Text style={styles.emptySubtitle}>
                Thử chọn danh mục khác hoặc đặt lại bộ lọc giá xem sao nhé!
              </Text>
            </View>
          }
        />

        {/* Modal Bộ lọc giá và sắp xếp */}
        <FilterModal
          visible={filterVisible}
          onClose={() => setFilterVisible(false)}
          currentFilters={filters}
          onApplyFilters={setFilters}
        />

        {/* Modal Danh sách Thông báo */}
        <Modal
          visible={showNotifications}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowNotifications(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.notifModalContent}>
              <View style={styles.notifModalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 22, marginRight: 8 }}>🔔</Text>
                  <Text style={styles.notifModalTitle}>Thông báo mới</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowNotifications(false)}
                  style={styles.closeModalBtn}
                >
                  <Text style={styles.closeModalText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                {notifications.map((n) => (
                  <View
                    key={n.id}
                    style={[styles.notifCard, n.unread && styles.notifCardUnread]}
                  >
                    <Text style={styles.notifIcon}>{n.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.notifTitle}>{n.title}</Text>
                      <Text style={styles.notifText}>{n.content}</Text>
                      <Text style={styles.notifTime}>{n.time}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.markReadBtn}
                activeOpacity={0.8}
                onPress={() => {
                  triggerHaptic(25);
                  setShowNotifications(false);
                }}
              >
                <Text style={styles.markReadBtnText}>Đóng thông báo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    marginLeft: 6,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  iconText: {
    fontSize: 16,
  },
  aiButton: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  scanButton: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  unreadBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  scannedBanner: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  scannedText: {
    fontSize: 13,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  categoryContainer: {
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  categoryScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 6,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  notifModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 34,
  },
  notifModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  notifModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeModalText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: 'bold',
  },
  notifCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  notifCardUnread: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  notifIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 3,
  },
  notifText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 6,
  },
  notifTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  markReadBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  markReadBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
