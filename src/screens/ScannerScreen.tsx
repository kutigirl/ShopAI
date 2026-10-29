import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  Alert,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { Camera, Code, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShopButton from '@components/ShopButton';
import { COLORS } from '@constants/theme';
import { hapticSuccess } from '@utils/haptics';
import { triggerHaptic } from '@constants/student';
import axiosClient from '@api/axiosClient';
import { useCartStore } from '@store/useCartStore';
import { useNotificationStore } from '@store/useNotificationStore';
import { useNetworkStore } from '@store/useNetworkStore';

type PermissionState = 'checking' | 'granted' | 'denied';

const ScannerScreen = ({ navigation, route }: any) => {
  const fromCheckout = route.params?.fromCheckout;
  const paymentMethod = route.params?.paymentMethod || 'VIETQR';
  const finalTotal = route.params?.finalTotal;
  const [permission, setPermission] = useState<PermissionState>('checking');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  
  // Tùy chọn chuyển đổi Camera Trước / Sau và Đèn Flash
  const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('back');
  const [torch, setTorch] = useState<'on' | 'off'>('off');

  // State hiển thị Popup Modal Kết quả Thanh toán / Quét thành công
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const device = useCameraDevice(cameraPosition);
  const isFocused = useIsFocused();

  // Khóa Debounce chống quét dồn dập
  const isScanning = useRef(false);

  // 1. Kiểm tra & Xin quyền Camera
  const requestPermission = useCallback(async () => {
    const current = Camera.getCameraPermissionStatus();
    if (current === 'granted') {
      setPermission('granted');
      return;
    }

    const status = await Camera.requestCameraPermission();
    setPermission(status === 'granted' ? 'granted' : 'denied');
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') requestPermission();
    });
    return () => sub.remove();
  }, [requestPermission]);

  const openAppSettings = () => {
    Alert.alert(
      'Cần quyền Camera',
      'Bạn đã từ chối quyền Camera nên ShopAI không thể quét mã vạch. Hãy vào Cài đặt > ShopAI và bật lại quyền Camera nhé.',
      [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
      ],
    );
  };

  // Xử lý thanh toán QR tự động chuẩn Shopee: Quét thành công -> Sang ngay đơn hàng, Lỗi -> Thanh toán lại
  const processCheckoutPayment = async (code: string) => {
    // Chặn thanh toán khi mất mạng
    if (useNetworkStore.getState().isOffline) {
      triggerHaptic(50);
      isScanning.current = false;
      setIsProcessingOrder(false);
      Alert.alert(
        'Mất kết nối Internet',
        'Thiết bị của bạn đang mất mạng (offline). Không thể kết nối cổng thanh toán trực tuyến. Vui lòng bật lại Wi-Fi hoặc 4G rồi quét lại.',
      );
      return;
    }

    setIsProcessingOrder(true);
    try {
      const cartItems = useCartStore.getState().items;
      if (cartItems.length === 0) {
        Alert.alert('Giỏ hàng trống', 'Không tìm thấy sản phẩm trong giỏ hàng.', [
          { text: 'Quay lại', onPress: () => navigation.goBack() },
        ]);
        setIsProcessingOrder(false);
        return;
      }

      const total = finalTotal || useCartStore.getState().totalPrice() + 15000;

      // 1. Tạo đơn hàng qua API
      const orderRes = await axiosClient.post('/api/orders', {
        items: cartItems.map((item) => ({ productId: item.id, quantity: item.quantity })),
        total,
      });
      const orderId = orderRes.data.id;

      // 2. Xác nhận thanh toán PAID ngay lập tức vì đã quét mã thành công
      try {
        await axiosClient.post(`/api/orders/${orderId}/pay`);
      } catch (payErr) {
        console.warn('Lỗi ghi nhận pay đơn hàng:', payErr);
      }

      // 3. Rung báo hiệu & Xóa sạch giỏ hàng (chống đặt trùng / thanh toán 2 lần)
      Vibration.vibrate([0, 120, 80, 200, 100, 350]);
      useCartStore.getState().clearCart();

      // 4. Bắn thông báo đẩy vào chuông 🔔
      const orderTimeStr = new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const methodName = paymentMethod === 'MOMO' ? 'Ví MoMo' : 'VietQR';
      useNotificationStore.getState().addNotification({
        icon: '🛍️',
        title: 'Thanh toán thành công!',
        content: `Đơn hàng #${orderId} (${total.toLocaleString('vi-VN')}đ) đã thanh toán thành công qua ${methodName} lúc ${orderTimeStr}. Mã xác thực: ${code}. Shipper KTX đang chuẩn bị giao hàng!`,
        time: 'Vừa xong',
      });

      setIsProcessingOrder(false);

      // 5. CHUYỂN THẲNG SANG CHI TIẾT HÓA ĐƠN (ORDER DETAIL) - KHÔNG BẮT NGƯỜI DÙNG BẤM CHỌN LẠI GÌ NỮA!
      if (typeof navigation.replace === 'function') {
        navigation.replace('OrderDetail', { orderId });
      } else {
        navigation.navigate('OrderDetail', { orderId });
      }
    } catch (err: any) {
      setIsProcessingOrder(false);
      const serverMessage = err?.response?.data?.message;
      const msg = Array.isArray(serverMessage)
        ? serverMessage.join(', ')
        : serverMessage ?? 'Không thể hoàn tất đơn hàng. Vui lòng thử lại!';

      // Đúng chuẩn: Nếu lỗi thì hỏi thanh toán lại để quét lại, không bắt chọn lòng vòng
      Alert.alert(
        'Thanh toán chưa thành công',
        `${msg}\n\nVui lòng đưa mã QR vào khung hình để thanh toán lại.`,
        [
          {
            text: 'Thanh toán lại',
            onPress: () => {
              isScanning.current = false; // Mở lại camera cho quét lại ngay
            },
          },
          {
            text: 'Quay lại',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    }
  };

  // 2. Cỗ máy quét mã Vision Camera JSI
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128', 'pdf-417'],
    onCodeScanned: (codes: Code[]) => {
      if (isScanning.current) return;
      if (codes.length === 0) return;

      const value = codes[0].value;
      if (!value) return;

      isScanning.current = true; // Đóng khóa lập tức
      console.log('[scanner] Quét trúng mã:', value);

      // 📳 Rung Haptic phản hồi lập tức
      hapticSuccess();

      // NẾU TỪ CHECKOUT QUÉT MÃ THANH TOÁN -> XỬ LÝ ĐẶT HÀNG NGAY & CHUYỂN SANG ĐƠN HÀNG (GIỐNG SHOPEE)
      if (fromCheckout) {
        processCheckoutPayment(value);
        return;
      }

      // Lưu kết quả & Mở Popup Modal khi quét sản phẩm bình thường ngoài trang chủ
      setScannedResult(value);
      setShowSuccessModal(true);
    },
  });

  // Chuyển đổi Camera Trước / Sau
  const toggleCameraPosition = () => {
    triggerHaptic(20);
    setCameraPosition((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  // Chuyển đổi Bật / Tắt Flash
  const toggleTorch = () => {
    triggerHaptic(20);
    setTorch((prev) => (prev === 'off' ? 'on' : 'off'));
  };

  // Đồng ý hoàn tất & về Trang Chủ hoặc xem sản phẩm
  const handleConfirmHome = async () => {
    triggerHaptic(30);
    const code = scannedCodeResult();
    setShowSuccessModal(false);

    // Nếu mã quét là ID sản phẩm (vd: prod_1, prod_2...) -> Nhảy thẳng sang màn Chi tiết Sản phẩm
    setShowSuccessModal(false);
    if (code.startsWith('prod_')) {
      navigation.navigate('MainTabs', {
        screen: 'HomeTab',
        params: {
          screen: 'ProductDetail',
          params: { productId: code },
        },
      });
    } else {
      navigation.navigate('MainTabs', {
        screen: 'HomeTab',
        params: {
          screen: 'Home',
          params: { scannedCode: code },
        },
      });
    }
  };

  // Đóng Modal để quét lại mã khác / thanh toán lần nữa
  const handleScanAgain = () => {
    triggerHaptic(25);
    setShowSuccessModal(false);
    setScannedResult(null);
    isScanning.current = false; // Mở lại khóa cho phép quét tiếp
  };

  const scannedCodeResult = () => scannedResult ?? 'QR-PAYMENT-SUCCESS';


  // ---------- Giao diện Trạng thái Quyền ----------
  if (permission === 'checking') {
    return (
      <View style={styles.center}>
        <Text style={styles.stateText}>Đang kiểm tra quyền Camera...</Text>
      </View>
    );
  }

  if (permission === 'denied') {
    return (
      <View style={styles.center}>
        <Text style={styles.deniedTitle}>Chưa có quyền Camera</Text>
        <Text style={styles.deniedDesc}>
          ShopAI cần Camera để quét mã vạch sản phẩm & mã QR thanh toán.
        </Text>
        <ShopButton
          title="Mở Cài đặt"
          onPress={openAppSettings}
          style={{ width: 200, marginBottom: 12 }}
        />
        <ShopButton
          title="Quay lại"
          onPress={() => navigation.goBack()}
          style={{ width: 200, backgroundColor: COLORS.secondary }}
        />
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.center}>
        <Text style={styles.stateText}>Thiết bị không có Camera khả dụng!</Text>
        <ShopButton title="Quay lại" onPress={() => navigation.goBack()} style={{ width: 200 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Luồng Camera 60FPS */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused && !showSuccessModal}
        codeScanner={codeScanner}
        torch={torch}
      />

      {/* OVERLAY GIAO DIỆN HEADER & NÚT ĐIỀU KHIỂN */}
      <SafeAreaView style={styles.safeOverlay} edges={['top']}>
        {/* Header Top Navigation */}
        <View style={styles.topHeader}>
          {/* Nút Đóng (X) */}
          <TouchableOpacity
            style={styles.iconCircleBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.closeIconText}>✕</Text>
          </TouchableOpacity>

          {/* Badge Trung Tâm: QUÉT MÃ THANH TOÁN */}
          <View style={styles.titleBadge}>
            <Text style={styles.titleBadgeDot}>🟢</Text>
            <Text style={styles.titleBadgeText}>QUÉT MÃ THANH TOÁN</Text>
          </View>

          {/* Các nút Toggle Flash & Đổi Camera */}
          <View style={styles.topRightControls}>
            <TouchableOpacity
              style={[styles.iconPillBtn, torch === 'on' && styles.activePillBtn]}
              onPress={toggleTorch}
              activeOpacity={0.7}
            >
              <Text style={styles.pillText}>{torch === 'on' ? '⚡ Bật' : '⚡ Tắt'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconPillBtn}
              onPress={toggleCameraPosition}
              activeOpacity={0.7}
            >
              <Text style={styles.pillText}>
                📷 {cameraPosition === 'back' ? 'Sau' : 'Trước'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* KHUNG BẮT MÃ QR MÀU XANH LÁ (TARGET CORNER SQUARE) */}
      <View style={styles.scannerCenterWrapper} pointerEvents="none">
        <View style={styles.scannerTargetBox}>
          {/* 4 Góc Bo Xanh Lá Đặc Trưng */}
          <View style={[styles.corner, styles.topLeftCorner]} />
          <View style={[styles.corner, styles.topRightCorner]} />
          <View style={[styles.corner, styles.bottomLeftCorner]} />
          <View style={[styles.corner, styles.bottomRightCorner]} />
        </View>
      </View>

      {/* GIAO DIỆN BOTTOM BAR GUİDANCE & BUTTON HỦY */}
      <SafeAreaView style={styles.bottomOverlay} edges={['bottom']}>
        <View style={styles.guidancePill}>
          <Text style={styles.guidanceText}>
            Đưa mã QR thanh toán / sản phẩm vào khung hình
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cancelRedBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelRedText}>Hủy bỏ</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* MODAL THÔNG BÁO THANH TOÁN / QUÉT THÀNH CÔNG (MATCH 100% ẢNH MẪU) */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleScanAgain}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {/* Header Icon */}
            <Text style={styles.successEmoji}>🎉</Text>

            {/* Tiêu đề */}
            <Text style={styles.modalTitle}>Thanh toán thành công!</Text>

            {/* Nội dung chi tiết */}
            <Text style={styles.modalBody}>
              Đã xử lý mã QR thành công:{'\n'}
              <Text style={styles.modalCodeHighlight}>{scannedCodeResult()}</Text>
            </Text>

            {/* Hàng nút bấm lựa chọn */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                onPress={handleConfirmHome}
                disabled={isProcessingOrder}
                activeOpacity={0.65}
              >
                {isProcessingOrder ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.modalBtnSecondaryText}>ĐANG TẠO HÓA ĐƠN...</Text>
                  </View>
                ) : (
                  <Text style={styles.modalBtnSecondaryText}>
                    {fromCheckout ? '🧾 XEM CHI TIẾT HÓA ĐƠN' : '🏠 VỀ TRANG CHỦ'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={handleScanAgain}
                activeOpacity={0.8}
              >
                <Text style={styles.modalBtnPrimaryText}>🔄 QUÉT TIẾP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* OVERLAY ĐANG XỬ LÝ THANH TOÁN (KHI QUÉT MÃ QR TỪ CHECKOUT) */}
      {isProcessingOrder && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color="#16A34A" />
            <Text style={styles.processingTitle}>Đang xử lý thanh toán...</Text>
            <Text style={styles.processingDesc}>
              Hệ thống đang xác thực mã QR và tạo đơn hàng. Vui lòng chờ trong giây lát.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  stateText: { fontSize: 16, marginBottom: 12, textAlign: 'center' },
  deniedTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: COLORS.error },
  deniedDesc: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },

  // Header Bar
  safeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A', // Xanh lá cây rực rỡ như ảnh
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  titleBadgeDot: {
    fontSize: 8,
  },
  titleBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  topRightControls: {
    flexDirection: 'row',
    gap: 8,
  },
  iconPillBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activePillBtn: {
    backgroundColor: '#EAB308', // Màu vàng rực khi bật Flash
    borderColor: '#FACC15',
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Target Box Green Corners
  scannerCenterWrapper: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scannerTargetBox: {
    width: 260,
    height: 260,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: '#22C55E', // Khung bo góc xanh lá lánh bóng
  },
  topLeftCorner: {
    top: 0,
    left: 0,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderTopLeftRadius: 16,
  },
  topRightCorner: {
    top: 0,
    right: 0,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderTopRightRadius: 16,
  },
  bottomLeftCorner: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderBottomLeftRadius: 16,
  },
  bottomRightCorner: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderBottomRightRadius: 16,
  },

  // Bottom Overlay Controls
  bottomOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  guidancePill: {
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    marginBottom: 16,
  },
  guidanceText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelRedBtn: {
    backgroundColor: '#EF4444', // Nút đỏ rực như ảnh
    width: '100%',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  cancelRedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  // Modal Pop-up Thành Công
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  successEmoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  modalBody: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalCodeHighlight: {
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalBtnSecondary: {
    backgroundColor: '#F1F5F9',
  },
  modalBtnSecondaryText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 12,
  },
  modalBtnPrimary: {
    backgroundColor: '#16A34A',
  },
  modalBtnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
    padding: 24,
  },
  processingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  processingDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ScannerScreen;
