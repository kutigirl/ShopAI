import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

/**
 * SwitchDemo — minh họa công tắc bật/tắt (Switch) với tùy chỉnh trackColor & thumbColor
 * File: src/screens/demos/SwitchDemo.tsx
 */
export default function SwitchDemo() {
  const [enabled, setEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Nhận thông báo đơn hàng</Text>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{ false: '#E5E5E5', true: '#FFB4B4' }}
            thumbColor={enabled ? '#FF4D4F' : '#f4f3f4'}
          />
        </View>
        <Text style={styles.status}>
          Trạng thái: <Text style={styles.statusValue}>{enabled ? 'Đang BẬT' : 'Đang TẮT'}</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { fontSize: 16, color: '#2C3E50', flex: 1, paddingRight: 12, fontWeight: '500' },
  status: { marginTop: 12, fontSize: 14, color: '#7F8C8D' },
  statusValue: { fontWeight: '700', color: '#2C3E50' },
});
