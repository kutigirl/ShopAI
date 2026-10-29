import React from 'react';
import { SectionList, Text, View, StyleSheet } from 'react-native';

/**
 * SectionListDemo — minh họa danh sách phân nhóm (Category/Section) với sticky header
 * File: src/screens/demos/SectionListDemo.tsx
 */

type ProductItem = { id: string; name: string };
type ProductSection = { title: string; data: ProductItem[] };

const SECTIONS: ProductSection[] = [
  {
    title: 'Điện thoại',
    data: [
      { id: '1', name: 'iPhone 15' },
      { id: '2', name: 'Galaxy S24' },
    ],
  },
  {
    title: 'Phụ kiện',
    data: [
      { id: '3', name: 'Ốp lưng' },
      { id: '4', name: 'Sạc nhanh' },
    ],
  },
];

export default function SectionListDemo() {
  return (
    <SectionList
      sections={SECTIONS}
      keyExtractor={(item) => item.id}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.itemName}>{item.name}</Text>
        </View>
      )}
      stickySectionHeadersEnabled
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24, backgroundColor: '#F5F5F5' },
  sectionHeader: { backgroundColor: '#E8E8E8', paddingHorizontal: 16, paddingVertical: 10 },
  sectionTitle: { fontWeight: '700', color: '#2C3E50', fontSize: 16 },
  item: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemName: { fontSize: 15, color: '#333' },
});
