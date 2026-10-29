import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import {
  ViewDemo,
  TextDemo,
  ImageDemo,
  TextInputDemo,
  ScrollDemo,
  PressableDemo,
  FlatListDemo,
  SectionListDemo,
  LoadingDemo,
  SkeletonDemo,
  ModalDemo,
  SwitchDemo,
  AlertDemo,
  SafeAreaDemo,
} from './index';

type DemoKey =
  | 'View'
  | 'Text'
  | 'Image'
  | 'TextInput'
  | 'Scroll'
  | 'Pressable'
  | 'FlatList'
  | 'SectionList'
  | 'Loading'
  | 'Skeleton'
  | 'Modal'
  | 'Switch'
  | 'Alert'
  | 'SafeArea';

interface DemoItem {
  id: DemoKey;
  title: string;
  desc: string;
  badge: string;
}

const DEMOS: DemoItem[] = [
  { id: 'View', title: '<View>', desc: 'Hộp bố cục (tương đương div), Flexbox', badge: '2.6.1' },
  { id: 'Text', title: '<Text>', desc: 'Hiển thị văn bản, lồng Text, numberOfLines', badge: '2.6.2' },
  { id: 'Image', title: '<Image>', desc: 'Ảnh từ URI mạng và require() asset', badge: '2.6.3' },
  { id: 'TextInput', title: '<TextInput>', desc: 'Controlled input, bàn phím, returnKey', badge: '2.6.4' },
  { id: 'Scroll', title: '<ScrollView>', desc: 'Cuộn form ngắn, KeyboardAvoidingView', badge: '2.6.5' },
  { id: 'Pressable', title: '<Pressable>', desc: 'Nút bấm hiện đại, hitSlop, disabled', badge: '2.6.6' },
  { id: 'FlatList', title: '<FlatList>', desc: 'Danh sách dài ảo hóa (Virtualization)', badge: '2.6.7' },
  { id: 'SectionList', title: '<SectionList>', desc: 'Danh sách phân nhóm + sticky header', badge: '2.6.8' },
  { id: 'Loading', title: '<ActivityIndicator>', desc: 'Vòng xoay spinner hệ thống', badge: '2.6.9' },
  { id: 'Skeleton', title: 'Skeleton Loading', desc: 'Khung xương loading mờ ảo với Animated', badge: '2.6.9b' },
  { id: 'Modal', title: '<Modal>', desc: 'Hộp thoại popup đè tùy biến giao diện', badge: '2.6.10' },
  { id: 'Switch', title: '<Switch>', desc: 'Công tắc bật/tắt Boolean', badge: '2.6.11' },
  { id: 'Alert', title: 'Alert (API)', desc: 'Hộp thoại hệ thống nhanh 1/2 nút', badge: '2.6.12' },
  { id: 'SafeArea', title: '<SafeAreaView>', desc: 'Tránh tai thỏ, Dynamic Island, Home bar', badge: '2.6.13' },
];

export default function DemosDashboard() {
  const [activeDemo, setActiveDemo] = useState<DemoKey | null>(null);

  const renderActiveDemo = () => {
    switch (activeDemo) {
      case 'View':
        return <ViewDemo />;
      case 'Text':
        return <TextDemo />;
      case 'Image':
        return <ImageDemo />;
      case 'TextInput':
        return <TextInputDemo />;
      case 'Scroll':
        return <ScrollDemo />;
      case 'Pressable':
        return <PressableDemo />;
      case 'FlatList':
        return <FlatListDemo />;
      case 'SectionList':
        return <SectionListDemo />;
      case 'Loading':
        return <LoadingDemo />;
      case 'Skeleton':
        return <SkeletonDemo />;
      case 'Modal':
        return <ModalDemo />;
      case 'Switch':
        return <SwitchDemo />;
      case 'Alert':
        return <AlertDemo />;
      case 'SafeArea':
        return <SafeAreaDemo />;
      default:
        return null;
    }
  };

  if (activeDemo) {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable style={styles.backBtn} onPress={() => setActiveDemo(null)}>
            <Text style={styles.backText}>‹ Trở về Menu Demos</Text>
          </Pressable>
          <Text style={styles.activeTitle}>{activeDemo} Demo</Text>
        </View>
        <View style={styles.demoContent}>{renderActiveDemo()}</View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={DEMOS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.brand}>ShopAI • Core Components</Text>
            <Text style={styles.subBrand}>Bảng chọn nhanh toàn bộ 14 Demo Chương 2</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => setActiveDemo(item.id)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            </View>
            <Text style={styles.cardDesc}>{item.desc}</Text>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  list: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 20, alignItems: 'center' },
  brand: { fontSize: 22, fontWeight: '800', color: '#FF4D4F' },
  subBrand: { fontSize: 13, color: '#7F8C8D', marginTop: 4 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  cardPressed: {
    backgroundColor: '#FFF7F7',
    borderColor: '#FFCCC7',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#2C3E50' },
  badge: {
    backgroundColor: '#FFF1F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#FF4D4F' },
  cardDesc: { fontSize: 13, color: '#7F8C8D', lineHeight: 18 },
  sep: { height: 10 },
  topBar: {
    height: 52,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  backBtn: { paddingVertical: 6, paddingRight: 12 },
  backText: { color: '#FF4D4F', fontWeight: '700', fontSize: 15 },
  activeTitle: { fontSize: 15, fontWeight: '700', color: '#2C3E50' },
  demoContent: { flex: 1 },
});
