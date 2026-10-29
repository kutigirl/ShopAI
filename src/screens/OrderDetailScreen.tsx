import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import axiosClient from '@api/axiosClient';
import ShopButton from '@components/ShopButton';
import { COLORS, SIZES } from '@constants/theme';
import { MOCK_PRODUCTS } from '@data/mockProducts';
import { triggerHaptic } from '@constants/student';
import { useStudentWalletStore } from '@store/useStudentWalletStore';
import { useNotificationStore } from '@store/useNotificationStore';
import { useNetworkStore } from '@store/useNetworkStore';

export type OrderDetail = {
  id: string;
  userId: string;
  total: number;
  status: string;
  createdAt: string;
  items: {
    id?: number;
    productId: string;
    quantity: number;
    price: number;
  }[];
};

export default function OrderDetailScreen() {
  const route = useRoute<RouteProp<{ params: { orderId: string } }, 'params'>>();
  const navigation = useNavigation<any>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOrderDetail = useCallback(async () => {
    try {
      setErrorMsg(null);
      const res = await axiosClient.get<OrderDetail>(`/api/orders/${orderId}`);
      setOrder(res.data);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Không thể tải chi tiết hóa đơn';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const handleCancelPress = () => {
    if (!order) return;
    if (useNetworkStore.getState().isOffline) {
      triggerHaptic(50);
      Alert.alert(
        'Mất kết nối Internet',
        'Thiết bị đang mất mạng (offline). Không thể gửi yêu cầu hủy đơn hàng lên hệ thống lúc này.',
      );
      return;
    }
    triggerHaptic(40);
    Alert.alert(
      'Xác nhận hủy đơn hàng',
      `Bạn có chắc chắn muốn hủy đơn hàng #${order.id} không?\nThao tác này sẽ hủy giao nhận hàng.`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Chắc chắn hủy',
          style: 'destructive',
          onPress: executeCancelOrder,
        },
      ],
    );
  };

  const executeCancelOrder = async () => {
    if (!order) return;
    try {
      setIsCancelling(true);
      triggerHaptic(50);
      const res = await axiosClient.post<OrderDetail>(`/api/orders/${order.id}/cancel`);
      setOrder(res.data);

      // Nếu đã thanh toán ví IUH Pay trước đó, hoàn tiền lại ví
      if (order.status === 'PAID') {
        useStudentWalletStore.getState().depositBalance(order.total, 'Hoàn tiền đơn hủy', order.id);
      }

      useNotificationStore.getState().addNotification({
        icon: '❌',
        title: 'Đã hủy đơn hàng thành công',
        content: `Đơn hàng #${order.id} đã được hủy.${order.status === 'PAID' ? ` Số tiền ${order.total.toLocaleString('vi-VN')}đ đã được hoàn lại ví IUH Pay.` : ''}`,
        time: 'Vừa xong',
      });

      Alert.alert('Thành công', `Đơn hàng #${order.id} đã được hủy thành công!`);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Không thể hủy đơn hàng vào lúc này';
      Alert.alert('Lỗi hủy đơn', Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (errorMsg || !order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {errorMsg ?? 'Không tìm thấy hóa đơn'}</Text>
          <ShopButton
            title="Quay lại"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isPaid = order.status === 'PAID';
  const isCancelled = order.status === 'CANCELLED';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* THÔNG TIN HÓA ĐƠN */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Chi tiết hóa đơn</Text>
            <View
              style={[
                styles.badge,
                isCancelled ? styles.cancelledBadge : isPaid ? styles.paidBadge : styles.pendingBadge,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  isCancelled ? styles.cancelledText : isPaid ? styles.paidText : styles.pendingText,
                ]}
              >
                {isCancelled ? '🔴 ĐÃ HỦY ĐƠN' : isPaid ? '🟢 ĐÃ THANH TOÁN' : '🟡 CHỜ THANH TOÁN (COD)'}
              </Text>
            </View>
          </View>
          <Text style={styles.metaText}>Mã hóa đơn: {order.id}</Text>
          <Text style={styles.metaText}>
            Ngày tạo: {new Date(order.createdAt).toLocaleString('vi-VN')}
          </Text>
        </View>

        {/* DANH SÁCH MẶT HÀNG */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Các mặt hàng ({order.items.length})</Text>
          {order.items.map((item, idx) => {
            const matchedProduct = MOCK_PRODUCTS.find((p) => p.id === item.productId);
            const productName = matchedProduct?.name ?? item.productId;
            const productImage = matchedProduct?.image;

            return (
              <View key={idx} style={styles.itemRow}>
                {productImage ? (
                  <Image source={{ uri: productImage }} style={styles.itemImage} resizeMode="cover" />
                ) : (
                  <View style={styles.itemImagePlaceholder}>
                    <Text style={{ fontSize: 16 }}>📦</Text>
                  </View>
                )}
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {productName}
                  </Text>
                  <Text style={styles.quantity}>Số lượng: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(item.price * item.quantity)}
                </Text>
              </View>
            );
          })}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalValue}>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(order.total)}
            </Text>
          </View>
        </View>

        {/* THÔNG BÁO TRẠNG THÁI */}
        {isCancelled ? (
          <View style={styles.cancelledNotice}>
            <Text style={styles.cancelledNoticeTitle}>❌ ĐƠN HÀNG ĐÃ ĐƯỢC HỦY</Text>
            <Text style={styles.cancelledNoticeText}>
              Đơn hàng này đã được hủy theo yêu cầu. Toàn bộ tiến trình đóng gói và vận chuyển đã dừng lại.
            </Text>
          </View>
        ) : isPaid ? (
          <View style={styles.paidNotice}>
            <Text style={styles.paidNoticeTitle}>✅ ĐƠN HÀNG ĐÃ ĐƯỢC THANH TOÁN</Text>
            <Text style={styles.paidNoticeText}>
              Hệ thống đã xác nhận thanh toán trực tuyến thành công. Shipper KTX đang chuẩn bị hàng để giao đến bạn!
            </Text>
          </View>
        ) : (
          <View style={styles.codNotice}>
            <Text style={styles.codNoticeTitle}>💵 THANH TOÁN KHI NHẬN HÀNG (COD)</Text>
            <Text style={styles.codNoticeText}>
              Đơn hàng thanh toán bằng tiền mặt khi nhận hàng. Bạn chỉ cần trả tiền cho shipper khi nhận hàng tại phòng KTX.
            </Text>
          </View>
        )}

        <View style={styles.buttonGroup}>
          {/* NÚT HỦY ĐƠN HÀNG (khi đơn chưa bị hủy) */}
          {!isCancelled && (
            <TouchableOpacity
              style={styles.cancelOrderBtn}
              onPress={handleCancelPress}
              disabled={isCancelling}
              activeOpacity={0.8}
            >
              {isCancelling ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <Text style={styles.cancelOrderBtnText}>❌ Hủy đơn hàng này</Text>
              )}
            </TouchableOpacity>
          )}

          <ShopButton
            title="🛍️ Tiếp tục mua sắm"
            onPress={() => {
              triggerHaptic(20);
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            }}
            style={styles.actionBtn}
          />
          <ShopButton
            title="📦 Danh sách đơn hàng"
            variant="outline"
            onPress={() => {
              triggerHaptic(20);
              navigation.navigate('MainTabs', { screen: 'Orders' });
            }}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SIZES.padding, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: SIZES.h2, fontWeight: '800', color: COLORS.text },
  metaText: { fontSize: SIZES.body2, color: COLORS.textLight, marginTop: 4 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  pendingBadge: { backgroundColor: '#FEF3C7' },
  paidBadge: { backgroundColor: '#DCFCE7' },
  badgeText: { fontSize: 12, fontWeight: '800' },
  pendingText: { color: '#B45309' },
  paidText: { color: '#15803D' },
  sectionTitle: { fontSize: SIZES.h3, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  itemImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  productName: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  quantity: { fontSize: 12, color: COLORS.textLight, marginTop: 3 },
  itemPrice: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 10 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  totalLabel: { fontSize: SIZES.h3, fontWeight: '700', color: COLORS.text },
  totalValue: { fontSize: SIZES.h2, fontWeight: '900', color: COLORS.primary },
  paidNotice: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 16,
  },
  paidNoticeTitle: {
    color: '#15803D',
    fontWeight: '900',
    fontSize: 14,
    marginBottom: 4,
  },
  paidNoticeText: {
    color: '#166534',
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18,
  },
  codNotice: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 16,
  },
  codNoticeTitle: {
    color: '#92400E',
    fontWeight: '900',
    fontSize: 14,
    marginBottom: 4,
  },
  codNoticeText: {
    color: '#B45309',
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18,
  },
  cancelledBadge: { backgroundColor: '#FEE2E2' },
  cancelledText: { color: '#B91C1C' },
  cancelledNotice: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 16,
  },
  cancelledNoticeTitle: {
    color: '#B91C1C',
    fontWeight: '900',
    fontSize: 14,
    marginBottom: 4,
  },
  cancelledNoticeText: {
    color: '#991B1B',
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18,
  },
  cancelOrderBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#F87171',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  cancelOrderBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '800',
  },
  buttonGroup: {
    gap: 10,
  },
  actionBtn: {
    height: 46,
  },
  errorText: { color: COLORS.danger, fontSize: SIZES.body1, textAlign: 'center' },
});
