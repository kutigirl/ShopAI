// src/components/OfflineBanner.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNetworkStore } from '@store/useNetworkStore';
import { triggerHaptic } from '@constants/student';

export default function OfflineBanner() {
  const isOffline = useNetworkStore((state) => state.isOffline);
  const isChecking = useNetworkStore((state) => state.isChecking);
  const checkConnectivity = useNetworkStore((state) => state.checkConnectivity);

  const [wasOffline, setWasOffline] = useState(false);
  const [showRestored, setShowRestored] = useState(false);

  // Heartbeat định kỳ kiểm tra kết nối mạng mỗi 4 giây
  useEffect(() => {
    checkConnectivity();
    const interval = setInterval(() => {
      checkConnectivity();
    }, 4000);
    return () => clearInterval(interval);
  }, [checkConnectivity]);

  // Hiệu ứng thông báo khi phục hồi mạng
  useEffect(() => {
    if (isOffline) {
      setWasOffline(true);
      setShowRestored(false);
    } else if (wasOffline && !isOffline) {
      setShowRestored(true);
      setWasOffline(false);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOffline, wasOffline]);

  const handleRetry = () => {
    triggerHaptic(30);
    checkConnectivity();
  };

  if (!isOffline && !showRestored) {
    return null;
  }

  if (showRestored) {
    return (
      <View style={[styles.container, styles.onlineContainer]}>
        <Text style={styles.icon}>🟢</Text>
        <Text style={styles.onlineText}>Đã khôi phục kết nối Internet</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.offlineContainer]}>
      <Text style={styles.icon}>⚠️</Text>
      <View style={styles.textCol}>
        <Text style={styles.title}>Mất kết nối Internet</Text>
        <Text style={styles.subtitle}>
          Vui lòng kiểm tra lại kết nối Wi-Fi hoặc 4G/5G
        </Text>
      </View>
      <TouchableOpacity
        style={styles.retryBtn}
        onPress={handleRetry}
        disabled={isChecking}
        activeOpacity={0.8}
      >
        {isChecking ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.retryBtnText}>Thử lại</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 9999,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  offlineContainer: {
    backgroundColor: '#DC2626',
  },
  onlineContainer: {
    backgroundColor: '#16A34A',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
  },
  textCol: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 11,
    color: '#FEE2E2',
    marginTop: 1,
  },
  onlineText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  retryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
