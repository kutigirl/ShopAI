import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import axiosClient from '@api/axiosClient';
import { COLORS, SIZES } from '@constants/theme';
import { triggerHaptic } from '@constants/student';
import { useStudentWalletStore } from '@store/useStudentWalletStore';
import { useNotificationStore } from '@store/useNotificationStore';
import { useNetworkStore } from '@store/useNetworkStore';

export type OrderSummary = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
};

export default function OrdersScreen() {
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setErrorMsg(null);
      const res = await axiosClient.get<OrderSummary[]>('/api/orders');
      setOrders(res.data);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Không thể tải lịch sử đơn hàng';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleCancelOrder = (item: OrderSummary) => {
    if (useNetworkStore.getState().isOffline) {
      triggerHaptic(50);
      Alert.alert(
        'Mất kết nối Internet',
        'Thiết bị đang mất mạng (offline). Không thể gửi yêu cầu hủy đơn hàng lúc này.',
      );
      return;
    }
    triggerHaptic(40);
    Alert.alert(
      'Xác nhận hủy đơn hàng',
      `Bạn có chắc chắn muốn hủy đơn hàng #${item.id} không?\nThao tác này sẽ hủy giao hàng.`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Chắc chắn hủy',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancellingId(item.id);
              triggerHaptic(50);
              const res = await axiosClient.post(`/api/orders/${item.id}/cancel`);
              setOrders((prev) =>
                prev.map((o) => (o.id === item.id ? { ...o, status: 'CANCELLED' } : o)),
              );

              if (item.status === 'PAID') {
                useStudentWalletStore.getState().depositBalance(item.total, 'Hoàn tiền đơn hủy', item.id);
              }

              useNotificationStore.getState().addNotification({
                icon: '❌',
                title: 'Đã hủy đơn hàng thành công',
                content: `Đơn hàng #${item.id} đã được hủy.${item.status === 'PAID' ? ` Số tiền ${item.total.toLocaleString('vi-VN')}đ đã được hoàn lại ví IUH Pay.` : ''}`,
                time: 'Vừa xong',
              });

              Alert.alert('Thành công', `Đơn hàng #${item.id} đã được hủy thành công!`);
            } catch (err: any) {
              const msg = err?.response?.data?.message ?? 'Không thể hủy đơn hàng';
              Alert.alert('Lỗi hủy đơn', Array.isArray(msg) ? msg.join(', ') : msg);
            } finally {
              setCancellingId(null);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: OrderSummary }) => {
    const isPaid = item.status === 'PAID';
    const isCancelled = item.status === 'CANCELLED';

    return (
      <Pressable
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>{item.id}</Text>
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
              {isCancelled ? '🔴 ĐÃ HỦY ĐƠN' : isPaid ? '🟢 ĐÃ THANH TOÁN' : '🟡 CHỜ GIAO (COD)'}
            </Text>
          </View>
        </View>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleString('vi-VN')}
        </Text>
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.totalLabel}>Tổng tiền:</Text>
            <Text style={styles.totalValue}>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(item.total)}
            </Text>
          </View>

          {!isCancelled && (
            <TouchableOpacity
              style={styles.inlineCancelBtn}
              onPress={() => handleCancelOrder(item)}
              disabled={cancellingId === item.id}
            >
              {cancellingId === item.id ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <Text style={styles.inlineCancelBtnText}>Hủy đơn</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đơn hàng của tôi 📦</Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : errorMsg ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
            <Text style={styles.emptySubtitle}>Khi bạn mua hàng, lịch sử đơn sẽ xuất hiện tại đây.</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: SIZES.h2, fontWeight: '800', color: COLORS.text },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  listContent: { padding: SIZES.padding },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderId: { fontSize: SIZES.body1, fontWeight: '700', color: COLORS.text },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pendingBadge: { backgroundColor: '#FEF3C7' },
  paidBadge: { backgroundColor: '#DCFCE7' },
  cancelledBadge: { backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  pendingText: { color: '#B45309' },
  paidText: { color: '#15803D' },
  cancelledText: { color: '#B91C1C' },
  date: { fontSize: SIZES.body2, color: COLORS.textLight, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  totalLabel: { fontSize: SIZES.body2, color: COLORS.textLight },
  totalValue: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.primary },
  inlineCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F87171',
    backgroundColor: '#FEF2F2',
  },
  inlineCancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: SIZES.h2, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  emptySubtitle: { fontSize: SIZES.body2, color: COLORS.textLight, textAlign: 'center' },
  errorText: { color: COLORS.danger, fontSize: SIZES.body1, textAlign: 'center' },
});
