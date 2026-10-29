import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

/**
 * TextDemo — đủ import, đủ style, có Text lồng Text + onPress
 * File: src/screens/demos/TextDemo.tsx
 */
function TextDemo() {
  const productName = 'Tai nghe Bluetooth Pro';
  const price = 1500000;

  return (
    <View style={styles.container}>
      {/* 1) Text thường */}
      <Text style={styles.heading}>Chi tiết sản phẩm</Text>

      {/* 2) Nội suy biến JS vào JSX bằng { } */}
      <Text style={styles.name}>{productName}</Text>

      {/* 3) Text lồng Text: phần "Giá:" màu đen, phần số tiền màu đỏ kế thừa fontSize từ cha nếu không ghi đè */}
      <Text style={styles.priceLine}>
        Giá:{' '}
        <Text style={styles.priceValue}>
          {price.toLocaleString('vi-VN')} đ
        </Text>
      </Text>

      {/* 4) Cắt chữ dài thành tối đa 2 dòng + dấu ... */}
      <Text style={styles.desc} numberOfLines={2} ellipsizeMode="tail">
        Mô tả dài: chống ồn chủ động, pin 30 giờ, tương thích iOS/Android,
        bảo hành chính hãng 12 tháng tại ShopAI trên toàn quốc.
      </Text>

      {/* 5) Text bấm được — giống link */}
      <Text
        style={styles.link}
        onPress={() => Alert.alert('ShopAI', 'Bạn vừa bấm vào chính sách đổi trả')}
      >
        Xem chính sách đổi trả
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff', justifyContent: 'center' },
  heading: { fontSize: 14, color: '#95A5A6', marginBottom: 8 },
  name: { fontSize: 22, fontWeight: '700', color: '#2C3E50' },
  priceLine: { marginTop: 12, fontSize: 16, color: '#2C3E50' },
  priceValue: { color: '#FF4D4F', fontWeight: '700' },
  desc: { marginTop: 12, fontSize: 14, color: '#7F8C8D', lineHeight: 20 },
  link: { marginTop: 16, color: '#1890FF', textDecorationLine: 'underline' },
});

export default TextDemo;
