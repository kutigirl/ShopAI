import React from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';

/**
 * AlertDemo — minh họa sử dụng API Alert của React Native
 * File: src/screens/demos/AlertDemo.tsx
 */
export default function AlertDemo() {
  const showSimpleAlert = () => {
    Alert.alert('ShopAI', 'Thao tác thành công!');
  };

  const showConfirmAlert = () => {
    Alert.alert(
      'ShopAI',
      'Bạn có muốn thêm sản phẩm vào giỏ hàng?',
      [
        { text: 'Ở lại', style: 'cancel', onPress: () => console.log('Bấm Ở lại') },
        { text: 'Xem giỏ', onPress: () => console.log('Bấm Xem giỏ') },
      ],
      { cancelable: true }
    );
  };

  const showDeleteAlert = () => {
    Alert.alert(
      'Cảnh báo',
      'Bạn có chắc chắn muốn xóa tài khoản này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa vĩnh viễn', style: 'destructive', onPress: () => console.log('Đã xóa') },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Demo Alert API</Text>
      <Text style={styles.subtitle}>Hộp thoại Native của hệ điều hành</Text>

      <Pressable style={styles.btn} onPress={showSimpleAlert}>
        <Text style={styles.btnText}>1. Alert Đơn giản (1 nút)</Text>
      </Pressable>

      <Pressable style={[styles.btn, styles.btnPrimary]} onPress={showConfirmAlert}>
        <Text style={styles.btnText}>2. Alert Xác nhận (2 nút)</Text>
      </Pressable>

      <Pressable style={[styles.btn, styles.btnDanger]} onPress={showDeleteAlert}>
        <Text style={styles.btnText}>3. Alert Cảnh báo xóa (Destructive)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#2C3E50', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#7F8C8D', textAlign: 'center', marginBottom: 16 },
  btn: {
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: '#FF4D4F',
  },
  btnDanger: {
    backgroundColor: '#333333',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
