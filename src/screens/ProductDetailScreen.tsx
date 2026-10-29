import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import ShopButton from '@components/ShopButton';
import { COLORS, SIZES } from '@constants/theme';
import type { HomeStackParamList } from '@navigation/HomeStackNavigator';
import { API_BASE_URL } from '@constants/api';
import { Product, ProductSchema } from '@app-types/product.schema';
import { useCartStore } from '@store/useCartStore';
import { triggerHaptic } from '@constants/student';

type ProductDetailRouteProp = RouteProp<HomeStackParamList, 'ProductDetail'>;

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const { productId } = route.params;
  const addItem = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErrorMsg(null);

    fetch(`${API_BASE_URL}/api/products/${productId}`)
      .then(async (res) => {
        if (res.status === 404) {
          throw new Error(`Không tìm thấy sản phẩm có id = ${productId}`);
        }
        if (!res.ok) {
          throw new Error('Lỗi khi tải chi tiết sản phẩm từ Server');
        }
        return res.json();
      })
      .then((data) => {
        const parsed = ProductSchema.safeParse(data);
        if (parsed.success && isMounted) {
          setProduct(parsed.data);
        } else if (!parsed.success) {
          throw new Error('Dữ liệu sản phẩm từ Server không hợp lệ!');
        }
      })
      .catch((err) => {
        if (isMounted) setErrorMsg(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const navigation = useNavigation<any>();

  const handleAddToCart = () => {
    if (!product) return;
    triggerHaptic(30);
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    triggerHaptic(45);
    addItem(product);
    navigation.navigate('Checkout');
  };

  if (loading && !product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (errorMsg || !product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.notFound}>
            {errorMsg ?? `Không tìm thấy sản phẩm với ID: ${productId}`}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.badgeRow}>
          {product.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{product.category}</Text>
            </View>
          )}
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {product.rating ?? 4.9}</Text>
            <Text style={styles.reviewText}>
              ({product.reviewCount ?? 150}+ đánh giá)
            </Text>
          </View>
        </View>

        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(product.price)}
        </Text>

        {/* Thông tin mô tả chi tiết */}
        <View style={styles.descriptionCard}>
          <Text style={styles.sectionHeader}>📖 Mô tả chi tiết sản phẩm</Text>
          <Text style={styles.descriptionText}>
            {product.description ??
              'Sản phẩm công nghệ chính hãng chất lượng cao với thiết kế thời thượng, hiệu năng ổn định và chế độ bảo hành 12 tháng toàn diện.'}
          </Text>
        </View>

        {/* Cam kết & Chính sách mua hàng */}
        <View style={styles.policyCard}>
          <Text style={styles.policyTitle}>🛡️ Cam kết từ ShopAI</Text>
          <View style={styles.policyItem}>
            <Text style={styles.policyIcon}>✓</Text>
            <Text style={styles.policyText}>Hàng chính hãng 100%, nguyên seal mới nhất</Text>
          </View>
          <View style={styles.policyItem}>
            <Text style={styles.policyIcon}>✓</Text>
            <Text style={styles.policyText}>Bảo hành chính hãng 12 tháng - 1 đổi 1 trong 30 ngày</Text>
          </View>
          <View style={styles.policyItem}>
            <Text style={styles.policyIcon}>✓</Text>
            <Text style={styles.policyText}>Giao hàng nhanh tận phòng KTX IUH</Text>
          </View>
        </View>

        <Text style={styles.idNote}>Mã định danh sản phẩm: {product.id}</Text>

        <View style={styles.actionButtonGroup}>
          <ShopButton
            title={added ? '✓ Đã thêm vào giỏ!' : '🛒 Thêm vào giỏ'}
            onPress={handleAddToCart}
            variant="outline"
            style={styles.cartActionBtn}
          />
          <ShopButton
            title="Mua ngay ⚡"
            onPress={handleBuyNow}
            style={styles.buyNowActionBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  container: { padding: SIZES.padding, paddingBottom: 40 },
  image: {
    width: '100%',
    height: 320,
    borderRadius: SIZES.radius,
    marginBottom: 16,
    backgroundColor: '#F1F5F9',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryBadgeText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: SIZES.caption,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontWeight: '700',
    fontSize: SIZES.body2,
    color: '#D97706',
  },
  reviewText: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
  },
  name: {
    fontSize: SIZES.h2,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
    lineHeight: 28,
  },
  price: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 16,
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: SIZES.body2,
    color: '#475569',
    lineHeight: 24,
  },
  policyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  policyTitle: {
    fontSize: SIZES.body1,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  policyIcon: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginRight: 8,
  },
  policyText: {
    fontSize: SIZES.body2,
    color: '#64748B',
  },
  idNote: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
    marginBottom: 16,
    textAlign: 'center',
  },
  buyBtn: {
    marginTop: 8,
  },
  actionButtonGroup: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cartActionBtn: {
    flex: 1,
    height: 46,
  },
  buyNowActionBtn: {
    flex: 1,
    height: 46,
  },
  notFound: {
    padding: SIZES.padding,
    fontSize: SIZES.body1,
    color: COLORS.danger,
    textAlign: 'center',
  },
});

export default ProductDetailScreen;
