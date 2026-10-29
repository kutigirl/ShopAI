import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

/**
 * ImageDemo — minh họa hiển thị ảnh từ URL và ảnh local
 * File: src/screens/demos/ImageDemo.tsx
 */
function ImageDemo() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>1) Ảnh từ mạng (URI)</Text>
      {/* BẮT BUỘC có width + height (hoặc flex) — nếu không, ảnh mạng thường không hiện */}
      <Image
        source={{ uri: 'https://picsum.photos/id/1/400/300' }}
        style={styles.remote}
        resizeMode="cover"
        onError={() => console.log('Tải ảnh lỗi — kiểm tra mạng / URL')}
      />

      <Text style={styles.label}>2) Ảnh local (require)</Text>
      {/*
        Đặt file vào src/assets/logo.png rồi bỏ comment dòng dưới.
        require phải là đường dẫn tĩnh (không ghép chuỗi động).
      */}
      {/* <Image source={require('../../assets/logo.png')} style={styles.local} /> */}
      <Text style={styles.hint}>Bỏ comment dòng require sau khi đã có file logo.png</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff', justifyContent: 'center' },
  label: { marginTop: 16, marginBottom: 8, fontWeight: '600', color: '#2C3E50' },
  remote: { width: '100%', height: 200, borderRadius: 12, backgroundColor: '#EEE' },
  local: { width: 80, height: 80 },
  hint: { color: '#95A5A6', fontSize: 12, marginTop: 4 },
});

export default ImageDemo;
