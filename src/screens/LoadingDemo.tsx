import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * LoadingDemo — minh họa vòng xoay tải dữ liệu (ActivityIndicator) khi fetch data / submit
 * File: src/screens/demos/LoadingDemo.tsx
 */
export default function LoadingDemo() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF4D4F" />
        <Text style={styles.caption}>Đang tải sản phẩm...</Text>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text style={styles.done}>Tải xong!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  caption: { marginTop: 12, color: '#7F8C8D', fontSize: 14 },
  done: { fontSize: 18, fontWeight: '700', color: '#2C3E50' },
});
