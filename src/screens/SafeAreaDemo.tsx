import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * SafeAreaDemo — minh họa hoạt động của SafeAreaView và useSafeAreaInsets
 * File: src/screens/demos/SafeAreaDemo.tsx
 */
export default function SafeAreaDemo() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ShopAI Safe Area</Text>
        <Text style={styles.subtitle}>Bảo vệ giao diện khỏi tai thỏ, Dynamic Island & thanh Home bar</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thông số Safe Area Insets hiện tại:</Text>
        <Text style={styles.insetItem}>Top (Notch/Status Bar): <Text style={styles.value}>{insets.top} px</Text></Text>
        <Text style={styles.insetItem}>Bottom (Home Indicator): <Text style={styles.value}>{insets.bottom} px</Text></Text>
        <Text style={styles.insetItem}>Left: <Text style={styles.value}>{insets.left} px</Text></Text>
        <Text style={styles.insetItem}>Right: <Text style={styles.value}>{insets.right} px</Text></Text>
      </View>

      <View style={styles.noteBox}>
        <Text style={styles.noteText}>
          Chuẩn ShopAI: Dùng thư viện <Text style={styles.highlight}>react-native-safe-area-context</Text> với <Text style={styles.highlight}>SafeAreaProvider</Text> bọc ngoài root và <Text style={styles.highlight}>SafeAreaView edges={['top', 'bottom']}</Text> hoặc hook <Text style={styles.highlight}>useSafeAreaInsets()</Text>.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF4D4F',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
  },
  insetItem: {
    fontSize: 15,
    color: '#34495E',
    marginVertical: 4,
  },
  value: {
    fontWeight: '700',
    color: '#FF4D4F',
  },
  noteBox: {
    backgroundColor: '#FFF1F0',
    borderColor: '#FFA39E',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  noteText: {
    fontSize: 13,
    color: '#CF1322',
    lineHeight: 20,
  },
  highlight: {
    fontWeight: '700',
  },
});
