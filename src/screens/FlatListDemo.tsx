import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

/**
 * FlatListDemo — minh họa hiển thị danh sách ảo hóa (Virtualization) với Header, Separator, Empty
 * File: src/screens/demos/FlatListDemo.tsx
 */

type Product = { id: string; name: string; price: number };

const DATA: Product[] = [
  { id: '1', name: 'Tai nghe Pro', price: 1500000 },
  { id: '2', name: 'Ốp lưng trong', price: 120000 },
  { id: '3', name: 'Sạc nhanh 65W', price: 450000 },
];

export default function FlatListDemo() {
  return (
    <View style={styles.flex}>
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.index}>#{index + 1}</Text>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>
                {item.price.toLocaleString('vi-VN')} đ
              </Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListHeaderComponent={
          <Text style={styles.header}>Danh sách mẫu ShopAI</Text>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>Chưa có sản phẩm</Text>
        }
        contentContainerStyle={styles.listContent}
        initialNumToRender={8}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F5F5F5' },
  listContent: { padding: 16, flexGrow: 1 },
  header: {
    marginBottom: 12,
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
  },
  index: { width: 36, color: '#95A5A6', fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#2C3E50' },
  price: { marginTop: 4, color: '#FF4D4F', fontWeight: '700' },
  sep: { height: 10 },
  empty: { textAlign: 'center', marginTop: 40, color: '#95A5A6' },
});
