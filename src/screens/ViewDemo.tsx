import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * DemoView — minh họa View lồng View
 * File: src/screens/demos/ViewDemo.tsx (học viên có thể tạo thư mục demos để thử)
 */
function ViewDemo() {
  return (
    // View ngoài cùng: chiếm full màn hình
    <View style={styles.screen}>
      {/* View con: một "thẻ" trắng nằm giữa */}
      <View style={styles.card}>
        <Text style={styles.title}>ShopAI</Text>
        <Text style={styles.caption}>View chỉ là hộp chứa — chữ phải nằm trong Text</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1, // chiếm hết không gian cha (ở đây = cả màn hình)
    backgroundColor: '#F5F5F5',
    justifyContent: 'center', // xếp con theo trục dọc, căn giữa
    alignItems: 'center', // căn giữa theo trục ngang
    padding: 16,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#FF4D4F' },
  caption: { marginTop: 8, color: '#7F8C8D' },
});

export default ViewDemo;
