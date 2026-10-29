import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

/**
 * TextInputDemo — minh họa ô nhập liệu Controlled Component
 * File: src/screens/demos/TextInputDemo.tsx
 */
function TextInputDemo() {
  // State giữ nội dung ô nhập
  const [keyword, setKeyword] = useState('');

  return (
    // KeyboardAvoidingView: đẩy UI lên khi bàn phím mở (iOS thường cần)
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.box}>
        <Text style={styles.label}>Tìm sản phẩm ShopAI</Text>

        <TextInput
          value={keyword}                 // 1) hiển thị đúng state hiện tại
          onChangeText={setKeyword}       // 2) mỗi lần gõ → cập nhật state → re-render
          placeholder="Ví dụ: tai nghe"
          placeholderTextColor="#95A5A6"
          style={styles.input}
          autoCapitalize="none"           // không tự viết hoa
          autoCorrect={false}
          returnKeyType="search"          // nút trên bàn phím hiện chữ Search
          onSubmitEditing={() => {
            // 3) user bấm Search trên bàn phím
            console.log('Tìm:', keyword);
          }}
        />

        <Text style={styles.preview}>Bạn đang gõ: {keyword || '(trống)'}</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  box: { flex: 1, padding: 16, justifyContent: 'center' },
  label: { marginBottom: 8, fontWeight: '600', color: '#2C3E50' },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
    fontSize: 16,
    color: '#2C3E50',
  },
  preview: { marginTop: 12, color: '#7F8C8D' },
});

export default TextInputDemo;
