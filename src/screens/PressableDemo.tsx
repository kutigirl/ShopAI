import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';

/**
 * PressableDemo — minh họa các kiểu nút bấm với Pressable (style function theo pressed, hitSlop, disabled, onLongPress)
 * File: src/screens/demos/PressableDemo.tsx
 */
export default function PressableDemo() {
  const [count, setCount] = useState(0);

  const handleAdd = () => {
    setCount(prev => prev + 1);
    Alert.alert('ShopAI', 'Đã thêm vào giỏ');
  };

  return (
    <View style={styles.box}>
      <Text style={styles.label}>Số lượng đã thêm: {count}</Text>

      <Pressable
        onPress={handleAdd}
        onLongPress={() => Alert.alert('ShopAI', 'Giữ lâu — mở mua nhanh')}
        hitSlop={8}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
      >
        <Text style={styles.btnText}>Thêm vào giỏ</Text>
      </Pressable>

      <Pressable
        disabled={count === 0}
        onPress={() => setCount(0)}
        style={({ pressed }) => [
          styles.btnOutline,
          count === 0 && styles.btnDisabled,
          pressed && styles.btnPressed,
        ]}
      >
        <Text style={styles.btnOutlineText}>Xóa hết</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, justifyContent: 'center', padding: 24, gap: 12, backgroundColor: '#fff' },
  label: { textAlign: 'center', marginBottom: 8, fontSize: 18, fontWeight: '600', color: '#2C3E50' },
  btn: {
    backgroundColor: '#FF4D4F',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutline: {
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF4D4F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnOutlineText: { color: '#FF4D4F', fontWeight: '700', fontSize: 16 },
});
