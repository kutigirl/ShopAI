import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import ShopButton from '@components/ShopButton';
import { useCartStore, CartItem } from '@store/useCartStore';
import { COLORS, SIZES } from '@constants/theme';
import { triggerHaptic } from '@constants/student';

export default function CartScreen() {
  const navigation = useNavigation<any>();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const totalPrice = useCartStore((state) => state.totalPrice());

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Giỏ hàng của bạn đang trống</Text>
          <Text style={styles.emptySubtitle}>Hãy khám phá các sản phẩm công nghệ tuyệt vời trên ShopAI!</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleUpdateQty = (id: string, newQty: number) => {
    triggerHaptic(25);
    updateQuantity(id, newQty);
  };

  const handleRemove = (id: string) => {
    triggerHaptic(35);
    removeItem(id);
  };

  const handleGoCheckout = () => {
    triggerHaptic(40);
    navigation.navigate('Checkout');
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(item.price)}
        </Text>
        <View style={styles.quantityRow}>
          <Pressable
            onPress={() => handleUpdateQty(item.id, item.quantity - 1)}
            style={styles.qtyBtn}
          >
            <Text style={styles.qtyBtnText}>-</Text>
          </Pressable>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <Pressable
            onPress={() => handleUpdateQty(item.id, item.quantity + 1)}
            style={styles.qtyBtn}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </Pressable>
          <Pressable onPress={() => handleRemove(item.id)} style={styles.removeBtn}>
            <Text style={styles.removeText}>Xoá</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Giỏ hàng 🛍️</Text>
          <Text style={styles.itemCount}>{items.length} món đồ</Text>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />

        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalPrice}>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(totalPrice)}
            </Text>
          </View>
          <ShopButton
            title="Tiến hành Đặt hàng 🛍️"
            onPress={handleGoCheckout}
            style={styles.checkoutBtn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: SIZES.h2, fontWeight: '800', color: COLORS.text },
  itemCount: { fontSize: SIZES.body2, color: COLORS.textLight },
  listContent: { padding: SIZES.padding, paddingBottom: 24 },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radius,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  productImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  productInfo: { flex: 1 },
  productName: { fontSize: SIZES.body1, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  productPrice: { fontSize: SIZES.body2, fontWeight: '700', color: COLORS.primary, marginBottom: 8 },
  quantityRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  qtyText: { marginHorizontal: 12, fontSize: SIZES.body1, fontWeight: '700', color: COLORS.text },
  removeBtn: { marginLeft: 'auto', paddingHorizontal: 8, paddingVertical: 4 },
  removeText: { color: COLORS.danger, fontSize: 13, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: SIZES.h2, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  emptySubtitle: { fontSize: SIZES.body2, color: COLORS.textLight, textAlign: 'center', lineHeight: 20 },
  footer: {
    padding: SIZES.padding,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  totalLabel: { fontSize: SIZES.h3, fontWeight: '700', color: COLORS.text },
  totalPrice: { fontSize: SIZES.h2, fontWeight: '800', color: COLORS.primary },
  checkoutBtn: { marginTop: 4 },
});
