import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

/**
 * ScrollDemo — minh họa ScrollView cho form / trang tĩnh
 * File: src/screens/demos/ScrollDemo.tsx
 */
export default function ScrollDemo() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Đăng nhập ShopAI</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable style={styles.btn}>
          <Text style={styles.btnText}>Đăng nhập</Text>
        </Pressable>

        <Text style={styles.policy}>
          Kéo xuống để đọc tóm tắt điều khoản. ScrollView phù hợp form + vài đoạn chữ.
          Không dùng ScrollView để map() hàng trăm sản phẩm — hãy dùng FlatList.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16, paddingBottom: 40, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 16, color: '#2C3E50' },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  btn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FF4D4F',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnText: { color: '#fff', fontWeight: '700' },
  policy: { marginTop: 24, lineHeight: 22, color: '#7F8C8D' },
});
