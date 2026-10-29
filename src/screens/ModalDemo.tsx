import React, { useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';

/**
 * ModalDemo — minh họa hộp thoại tùy biến Modal (backdrop mờ, animation fade, nút hủy/xóa)
 * File: src/screens/demos/ModalDemo.tsx
 */
export default function ModalDemo() {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.screen}>
      <Pressable style={styles.btn} onPress={() => setVisible(true)}>
        <Text style={styles.btnText}>Xóa giỏ hàng</Text>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Text style={styles.title}>Xóa toàn bộ giỏ?</Text>
            <Text style={styles.body}>Thao tác không hoàn tác.</Text>
            <View style={styles.row}>
              <Pressable style={styles.secondary} onPress={() => setVisible(false)}>
                <Text style={styles.secondaryText}>Hủy</Text>
              </Pressable>
              <Pressable
                style={styles.danger}
                onPress={() => {
                  setVisible(false);
                  // clearCart() ở Ch.6
                }}
              >
                <Text style={styles.btnText}>Xóa</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F5F5F5' },
  btn: {
    backgroundColor: '#FF4D4F',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  title: { fontSize: 18, fontWeight: '800', color: '#2C3E50' },
  body: { marginTop: 8, color: '#7F8C8D' },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20, alignItems: 'center' },
  secondary: { padding: 12 },
  secondaryText: { color: '#7F8C8D', fontWeight: '600' },
  danger: {
    backgroundColor: '#FF4D4F',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
});
