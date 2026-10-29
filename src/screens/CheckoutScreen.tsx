import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Clipboard,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import axiosClient from '@api/axiosClient';
import ShopButton from '@components/ShopButton';
import DepositModal from '@components/DepositModal';
import { useCartStore, CartItem } from '@store/useCartStore';
import { useNotificationStore } from '@store/useNotificationStore';
import { useStudentWalletStore } from '@store/useStudentWalletStore';
import { useNetworkStore } from '@store/useNetworkStore';
import { COLORS, SIZES } from '@constants/theme';
import { STUDENT, examStamp, triggerHaptic } from '@constants/student';

type PaymentMethod = 'COD' | 'MOMO' | 'VIETQR' | 'IUHPAY';

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  icon: string;
  image?: any;
  desc: string;
  badge?: string;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'COD',
    name: 'Thanh toán khi nhận hàng (COD)',
    icon: '💵',
    desc: 'Chưa thanh toán — Nhận hàng tại KTX và trả tiền mặt cho shipper',
    badge: 'Tiền mặt',
  },
  {
    id: 'VIETQR',
    name: 'Quét mã VietQR (MB Bank)',
    icon: '🏦',
    image: require('@assets/banks/mb.png'),
    desc: 'Mở Camera quét mã QR thanh toán hoặc chuyển khoản MB Bank',
    badge: 'Khuyên dùng',
  },
  {
    id: 'MOMO',
    name: 'Ví điện tử MoMo',
    icon: '🟣',
    image: require('@assets/banks/momo.png'),
    desc: 'Mở Camera quét mã QR MoMo hoặc chuyển tiền ví điện tử',
  },
  {
    id: 'IUHPAY',
    name: 'Ví sinh viên IUH Pay',
    icon: '🎓',
    desc: 'Trừ trực tiếp vào thẻ sinh viên IUH (Miễn phí giao hàng)',
    badge: 'Ưu đãi -15k',
  },
];

type CreateOrderResponse = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
};

const placeOrderAPI = async (
  items: CartItem[],
  total: number,
): Promise<CreateOrderResponse> => {
  const response = await axiosClient.post<CreateOrderResponse>('/api/orders', {
    items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
    total,
  });
  return response.data;
};

export default function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice());
  const clearCart = useCartStore((state) => state.clearCart);

  const studentBalance = useStudentWalletStore((state) => state.balance);
  const deductBalance = useStudentWalletStore((state) => state.deductBalance);
  const [showDepositModal, setShowDepositModal] = useState(false);

  // Mặc định tự động điền sẵn thông tin chuẩn sinh viên Võ Hiệu Trang Kiên
  const [receiverName, setReceiverName] = useState<string>(STUDENT.hoTen);
  const [phoneNumber, setPhoneNumber] = useState<string>(STUDENT.phone);
  const [deliveryAddress, setDeliveryAddress] = useState<string>(STUDENT.defaultRoom);
  const [note, setNote] = useState<string>('Giao tận phòng KTX, gọi trước khi đến nhé shipper');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(route.params?.paymentMethod ?? 'COD');

  useEffect(() => {
    if (route.params?.paymentMethod) {
      setPaymentMethod(route.params.paymentMethod);
    }
  }, [route.params?.paymentMethod]);

  // Quét mã thanh toán bằng Camera thật
  const [scannedQR, setScannedQR] = useState<string | null>(null);

  const [isPlacing, setIsPlacing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{
    id: string;
    stamp: string;
    total: number;
    method: string;
    paymentStatus: string;
    scannedCode?: string | null;
    address: string;
    phone: string;
    time: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Lắng nghe kết quả trả về từ Camera Scanner (nếu người dùng vừa mở Camera quét mã)
  useEffect(() => {
    if (route.params?.scannedPaymentCode) {
      triggerHaptic(35);
      setScannedQR(route.params.scannedPaymentCode);
      Alert.alert(
        '🎉 Đã quét mã QR thành công!',
        `Hệ thống đã nhận diện mã thanh toán:\n${route.params.scannedPaymentCode}`,
      );
    }
  }, [route.params?.scannedPaymentCode]);

  const shippingFee = paymentMethod === 'IUHPAY' ? 0 : 15000;
  const discount = paymentMethod === 'IUHPAY' ? 15000 : 0;
  const finalTotal = totalPrice + shippingFee - discount;

  // Tự động điền lại thông tin mặc định chuẩn KTX IUH
  const handleAutoFillDefault = () => {
    triggerHaptic(25);
    setReceiverName(STUDENT.hoTen);
    setPhoneNumber(STUDENT.phone);
    setDeliveryAddress(STUDENT.defaultRoom);
    setNote('Giao tận phòng KTX, gọi trước khi đến nhé shipper');
    Alert.alert('⚡ Tự động điền', 'Đã điền lại thông tin sinh viên Võ Hiệu Trang Kiên mặc định!');
  };

  const handleCopyAccount = (text: string) => {
    triggerHaptic(20);
    Clipboard.setString(text);
    Alert.alert('Đã sao chép', `Đã sao chép "${text}" vào bộ nhớ tạm!`);
  };

  // Mở Camera thật để quét mã QR thanh toán (Match hình 1 & hình 2)
  const handleOpenCameraScanner = () => {
    if (useNetworkStore.getState().isOffline) {
      triggerHaptic(50);
      Alert.alert(
        'Mất kết nối Internet',
        'Thiết bị đang mất kết nối mạng. Không thể mở camera quét thanh toán trực tuyến lúc này.',
      );
      return;
    }
    if (items.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng chọn sản phẩm vào giỏ hàng trước khi thanh toán.');
      return;
    }
    triggerHaptic(30);
    navigation.navigate('Scanner', {
      fromCheckout: true,
      paymentMethod,
      finalTotal,
      receiverName,
      phoneNumber,
      deliveryAddress,
      note,
    });
  };

  const handleConfirm = async () => {
    // Chặn đặt hàng khi thiết bị đang ngắt kết nối mạng
    if (useNetworkStore.getState().isOffline) {
      triggerHaptic(50);
      Alert.alert(
        'Mất kết nối Internet',
        'Thiết bị của bạn đang mất mạng (offline). Không thể gửi đơn hàng đến hệ thống lúc này. Vui lòng bật lại Wi-Fi hoặc 4G để tiếp tục.',
      );
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Giỏ hàng của bạn đang trống.');
      return;
    }
    if (!receiverName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên người nhận.');
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length < 9) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập số điện thoại hợp lệ.');
      return;
    }
    if (!deliveryAddress.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập địa chỉ nhận hàng.');
      return;
    }

    // Nếu chọn thanh toán qua Ví sinh viên IUH Pay -> Kiểm tra số dư trước
    if (paymentMethod === 'IUHPAY' && studentBalance < finalTotal) {
      Alert.alert(
        '⚠️ Số dư Ví không đủ',
        `Số dư ví sinh viên IUH Pay của bạn hiện tại là ${studentBalance.toLocaleString('vi-VN')} đ, không đủ thanh toán đơn hàng ${finalTotal.toLocaleString('vi-VN')} đ.\n\nBạn có muốn nạp thêm tiền từ tài khoản ngân hàng không?`,
        [
          { text: 'Để sau', style: 'cancel' },
          {
            text: '⚡ Nạp tiền ngay',
            onPress: () => setShowDepositModal(true),
          },
        ],
      );
      return;
    }

    setIsPlacing(true);
    setErrorMessage(null);
    triggerHaptic(50);

    try {
      const order = await placeOrderAPI(items, finalTotal);
      const selectedMethodObj = PAYMENT_OPTIONS.find((p) => p.id === paymentMethod);

      // Xác định trạng thái thanh toán chuẩn xác
      let paymentStatusText = '🟡 Chưa thanh toán (Thanh toán tiền mặt khi nhận hàng tại KTX)';
      let shouldMarkPaid = false;

      if (paymentMethod === 'IUHPAY') {
        shouldMarkPaid = true;
        // Trừ tiền thật vào ví sinh viên IUH Pay!
        deductBalance(finalTotal, order.id);
        paymentStatusText = `🟢 ĐÃ THANH TOÁN (Trừ ${finalTotal.toLocaleString('vi-VN')} đ ví IUH Pay - Số dư còn: ${(studentBalance - finalTotal).toLocaleString('vi-VN')} đ)`;
      } else if (paymentMethod === 'VIETQR' || paymentMethod === 'MOMO') {
        if (scannedQR) {
          shouldMarkPaid = true;
          paymentStatusText = `🟢 ĐÃ THANH TOÁN (Xác thực ${paymentMethod === 'MOMO' ? 'Ví MoMo' : 'VietQR'}: ${scannedQR})`;
        } else {
          shouldMarkPaid = false;
          paymentStatusText = `🟡 Chưa thanh toán (Chờ quét mã ${paymentMethod === 'MOMO' ? 'MoMo' : 'VietQR'} tại KTX)`;
        }
      }

      // Chỉ gửi yêu cầu xác nhận thanh toán khi thực sự đã quét mã thành công hoặc trừ ví
      if (shouldMarkPaid) {
        try {
          await axiosClient.post(`/api/orders/${order.id}/pay`);
        } catch (payErr) {
          console.warn('Lỗi ghi nhận pay đơn hàng:', payErr);
        }
      }

      // 1. Rung nhịp điệu báo hiệu đặt hàng thành công
      Vibration.vibrate([0, 120, 80, 200, 100, 350]);

      const orderTimeStr = new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      // 2. Tự động thêm thông báo vào chuông thông báo 🔔
      useNotificationStore.getState().addNotification({
        icon: '🛍️',
        title: 'Đặt hàng thành công!',
        content: `Đơn hàng #${order.id} trị giá ${finalTotal.toLocaleString('vi-VN')}đ đã được tiếp nhận lúc ${orderTimeStr}. Phương thức: ${selectedMethodObj?.name}. Shipper KTX đang chuẩn bị hàng giao đến ${deliveryAddress.trim()}!`,
        time: 'Vừa xong',
      });

      setCompletedOrder({
        id: order.id,
        stamp: examStamp(),
        total: finalTotal,
        method: selectedMethodObj?.name ?? 'COD',
        paymentStatus: paymentStatusText,
        scannedCode: scannedQR,
        address: deliveryAddress.trim(),
        phone: phoneNumber.trim(),
        time: orderTimeStr,
      });

      clearCart();

      // NẾU THANH TOÁN BẰNG QR, MOMO HOẶC VÍ SINH VIÊN IUH PAY:
      // Chuyển thẳng sang trang Chi tiết Hóa đơn (OrderDetailScreen) để xem trạng thái ✅ ĐÃ THANH TOÁN
      // (Không quay về hoặc giữ lại màn hình Checkout để chống ấn nhầm đặt lại lần hai)
      if (paymentMethod === 'VIETQR' || paymentMethod === 'MOMO' || paymentMethod === 'IUHPAY') {
        if (typeof navigation.replace === 'function') {
          navigation.replace('OrderDetail', { orderId: order.id });
        } else {
          navigation.navigate('OrderDetail', { orderId: order.id });
        }
        return;
      }

      setIsDone(true);
    } catch (error: any) {
      const serverMessage = error?.response?.data?.message;
      const message = Array.isArray(serverMessage)
        ? serverMessage.join(', ')
        : serverMessage ?? 'Đặt hàng thất bại, vui lòng kiểm tra kết nối mạng';
      setErrorMessage(message);
    } finally {
      setIsPlacing(false);
    }
  };

  // MÀN HÌNH HOÀN TẤT ĐẶT HÀNG / HÓA ĐƠN ĐIỆN TỬ
  if (isDone && completedOrder) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.doneContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.doneHeader}>
            <View style={styles.successCircle}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.doneTitle}>ĐẶT HÀNG THÀNH CÔNG!</Text>
            <Text style={styles.doneSubtitle}>Đơn hàng đã được tiếp nhận và chuyển đến bếp / kho KTX</Text>
          </View>

          <View style={styles.receiptCard}>
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptShopName}>ShopAI 🛵 IUH</Text>
              <Text style={styles.receiptBadge}>HÓA ĐƠN ĐIỆN TỬ</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Mã đơn hàng:</Text>
              <Text style={styles.receiptValueBold}>{completedOrder.id}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Mã Stamp TH2:</Text>
              <Text style={styles.receiptValue}>#{completedOrder.stamp}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Sinh viên đặt:</Text>
              <Text style={styles.receiptValue}>{receiverName} ({STUDENT.mssv})</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Thời gian đặt:</Text>
              <Text style={styles.receiptValue}>{completedOrder.time}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Hình thức:</Text>
              <Text style={styles.receiptValue}>{completedOrder.method}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Trạng thái:</Text>
              <Text style={[styles.receiptValue, { flex: 1, textAlign: 'right', fontWeight: '700' }]}>
                {completedOrder.paymentStatus}
              </Text>
            </View>

            {completedOrder.scannedCode && (
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Mã QR xác thực:</Text>
                <Text style={[styles.receiptValue, { flex: 1, textAlign: 'right', color: '#2563EB', fontSize: 11 }]}>
                  {completedOrder.scannedCode}
                </Text>
              </View>
            )}

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Số điện thoại:</Text>
              <Text style={styles.receiptValue}>{completedOrder.phone}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Địa chỉ giao:</Text>
              <Text style={[styles.receiptValue, { flex: 1, textAlign: 'right' }]}>
                {completedOrder.address}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.receiptTotalRow}>
              <Text style={styles.receiptTotalLabel}>Tổng thanh toán:</Text>
              <Text style={styles.receiptTotalValue}>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(completedOrder.total)}
              </Text>
            </View>
          </View>

          <View style={styles.doneButtonRow}>
            <TouchableOpacity
              style={styles.detailBtn}
              activeOpacity={0.65}
              onPress={() => {
                triggerHaptic(25);
                navigation.navigate('OrderDetail', { orderId: completedOrder.id });
              }}
            >
              <Text style={styles.detailBtnText}>🔍 Xem chi tiết hóa đơn này</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ordersBtn}
              activeOpacity={0.65}
              onPress={() => {
                triggerHaptic(25);
                navigation.navigate('MainTabs', { screen: 'Orders' });
              }}
            >
              <Text style={styles.ordersBtnText}>📦 Xem danh sách đơn hàng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.homeBtn}
              activeOpacity={0.65}
              onPress={() => {
                triggerHaptic(25);
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              }}
            >
              <Text style={styles.homeBtnText}>Tiếp tục mua sắm</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // URL QR CODE ĐỘNG
  const vietQrUrl = `https://img.vietqr.io/image/MB-0358899888-compact2.png?amount=${finalTotal}&addInfo=KTX23710971%20ShopAI&accountName=VO%20HIEU%20TRANG%20KIEN`;
  const momoQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=2|99|0328140841|VO%20HIEU%20TRANG%20KIEN||0|0|${finalTotal}|Thanh%20toan%20ShopAI%20KTX`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.screenHeader}>
          <Text style={styles.title}>Thanh toán đơn hàng 🛒</Text>
          <Text style={styles.subtitle}>Kiểm tra thông tin giao nhận và chọn cách thanh toán</Text>
        </View>

        {/* 1. THÔNG TIN GIAO HÀNG */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>📍 Thông tin giao hàng</Text>
            <TouchableOpacity
              style={styles.autoFillBtn}
              activeOpacity={0.65}
              onPress={handleAutoFillDefault}
            >
              <Text style={styles.autoFillBtnText}>⚡ Điền mặc định KTX</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Họ và tên người nhận:</Text>
          <TextInput
            style={styles.textInput}
            value={receiverName}
            onChangeText={setReceiverName}
            placeholder="Ví dụ: Võ Hiếu Trang Kiên"
          />

          <Text style={styles.inputLabel}>Số điện thoại nhận hàng:</Text>
          <TextInput
            style={styles.textInput}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Ví dụ: 0328140841"
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>Địa chỉ nhận hàng (Phòng / Tòa nhà KTX):</Text>
          <TextInput
            style={[styles.textInput, styles.addressInput]}
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            placeholder="Ví dụ: KTX ĐH Công nghiệp TP.HCM (IUH) - Nhà B, Phòng 402"
            multiline
            numberOfLines={2}
          />

          <Text style={styles.inputLabel}>Ghi chú cho shipper:</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={note}
            onChangeText={setNote}
            placeholder="Ví dụ: Gọi trước khi đến, giao trước cửa phòng..."
            multiline
          />
        </View>

        {/* 2. CHỌN PHƯƠNG THỨC THANH TOÁN */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>💳 Phương thức thanh toán</Text>

          {PAYMENT_OPTIONS.map((option) => {
            const isSelected = paymentMethod === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.paymentCard, isSelected && styles.paymentCardSelected]}
                onPress={() => {
                  triggerHaptic(25);
                  if (option.id !== paymentMethod) {
                    setScannedQR(null);
                  }
                  setPaymentMethod(option.id);
                }}
                activeOpacity={0.65}
              >
                <View style={styles.paymentCardLeft}>
                  {option.image ? (
                    <View style={styles.paymentLogoBadge}>
                      <Image source={option.image} style={styles.paymentLogoImg} resizeMode="contain" />
                    </View>
                  ) : (
                    <Text style={styles.paymentIcon}>{option.icon}</Text>
                  )}
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.paymentName, isSelected && styles.paymentNameSelected]}>
                        {option.name}
                      </Text>
                      {option.badge && (
                        <View style={styles.paymentBadge}>
                          <Text style={styles.paymentBadgeText}>{option.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.paymentDesc}>{option.desc}</Text>
                  </View>
                </View>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* NẾU CHỌN TIỀN MẶT KHI NHẬN HÀNG (COD) -> ĐỂ NGUYÊN CHƯA TRẢ */}
          {paymentMethod === 'COD' && (
            <View style={styles.codNoticeBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontSize: 18, marginRight: 6 }}>💵</Text>
                <Text style={styles.codNoticeTitle}>Thanh toán tiền mặt khi nhận hàng</Text>
              </View>
              <Text style={styles.codNoticeText}>
                Trạng thái thanh toán: <Text style={styles.codNoticeHighlight}>🟡 Chưa thanh toán</Text>
              </Text>
              <Text style={styles.codNoticeDesc}>
                Bạn sẽ thanh toán trực tiếp số tiền <Text style={{ fontWeight: 'bold' }}>{finalTotal.toLocaleString('vi-VN')} đ</Text> cho shipper khi nhận được hàng tận tay tại phòng KTX.
              </Text>
            </View>
          )}

          {/* NẾU CHỌN QUÉT MÃ QR (VIETQR HOẶC MOMO) */}
          {(paymentMethod === 'VIETQR' || paymentMethod === 'MOMO') && (
            <View style={styles.qrDisplayBox}>
              {scannedQR ? (
                /* 1. NẾU ĐÃ QUÉT MÃ QR THÀNH CÔNG -> CHỈ HIỂN THỊ THẺ XÁC NHẬN (KHÔNG HIỆN LẠI NÚT QUÉT HAY ẢNH QR NỮA) */
                <View style={styles.scannedSuccessCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 24, marginRight: 8 }}>✅</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.scannedSuccessTitle}>ĐÃ QUÉT MÃ QR THÀNH CÔNG!</Text>
                      <Text style={styles.scannedSuccessStatus}>
                        🟢 Đã xác thực thanh toán qua Camera
                      </Text>
                    </View>
                  </View>

                  <View style={styles.qrDetailRow}>
                    <Text style={styles.qrDetailLabel}>Mã xác thực:</Text>
                    <Text
                      style={[styles.qrDetailValue, { color: '#15803D' }]}
                      numberOfLines={1}
                    >
                      {scannedQR}
                    </Text>
                  </View>

                  <View style={styles.qrDetailRow}>
                    <Text style={styles.qrDetailLabel}>Số tiền:</Text>
                    <Text style={styles.qrPriceHighlight}>
                      {finalTotal.toLocaleString('vi-VN')} đ
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      triggerHaptic(20);
                      setScannedQR(null);
                    }}
                    style={styles.rescanBtn}
                    activeOpacity={0.65}
                  >
                    <Text style={styles.rescanBtnText}>🔄 Hủy mã / Quét lại nếu muốn</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* 2. NẾU CHƯA QUÉT MÃ QR -> HIỆN NÚT MỞ CAMERA VÀ ẢNH QR / TÀI KHOẢN NGÂN HÀNG */
                <>
                  <TouchableOpacity
                    style={styles.openCameraBtn}
                    activeOpacity={0.7}
                    onPress={handleOpenCameraScanner}
                  >
                    <Text style={styles.cameraIcon}>📷</Text>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.openCameraBtnText}>MỞ CAMERA QUÉT MÃ QR THANH TOÁN</Text>
                      <Text style={styles.openCameraBtnSub}>Dùng camera điện thoại để quét mã thanh toán trực tiếp</Text>
                    </View>
                    <Text style={{ fontSize: 18, color: '#FFFFFF', fontWeight: 'bold' }}>➔</Text>
                  </TouchableOpacity>

                  <View style={styles.qrOrDivider}>
                    <View style={styles.qrOrLine} />
                    <Text style={styles.qrOrText}>HOẶC QUÉT MÃ NGÂN HÀNG DƯỚI ĐÂY</Text>
                    <View style={styles.qrOrLine} />
                  </View>

                  <View style={styles.qrImageContainer}>
                    <Image
                      source={{ uri: paymentMethod === 'VIETQR' ? vietQrUrl : momoQrUrl }}
                      style={styles.qrImage}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={styles.qrDetailsCard}>
                    <View style={styles.qrDetailRow}>
                      <Text style={styles.qrDetailLabel}>Ngân hàng / Ví:</Text>
                      <Text style={styles.qrDetailValue}>
                        {paymentMethod === 'VIETQR' ? STUDENT.bankName : 'Ví điện tử MoMo'}
                      </Text>
                    </View>
                    <View style={styles.qrDetailRow}>
                      <Text style={styles.qrDetailLabel}>Số tài khoản / SĐT:</Text>
                      <TouchableOpacity
                        onPress={() =>
                          handleCopyAccount(
                            paymentMethod === 'VIETQR' ? STUDENT.bankAccount : STUDENT.momoPhone,
                          )
                        }
                        style={styles.copyRow}
                        activeOpacity={0.65}
                      >
                        <Text style={styles.qrDetailHighlight}>
                          {paymentMethod === 'VIETQR' ? STUDENT.bankAccount : STUDENT.momoPhone}
                        </Text>
                        <Text style={styles.copyIcon}>📋</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.qrDetailRow}>
                      <Text style={styles.qrDetailLabel}>Chủ tài khoản:</Text>
                      <Text style={styles.qrDetailValue}>{STUDENT.hoTen}</Text>
                    </View>
                    <View style={styles.qrDetailRow}>
                      <Text style={styles.qrDetailLabel}>Số tiền:</Text>
                      <Text style={styles.qrPriceHighlight}>
                        {finalTotal.toLocaleString('vi-VN')} đ
                      </Text>
                    </View>
                    <View style={styles.qrDetailRow}>
                      <Text style={styles.qrDetailLabel}>Nội dung CK:</Text>
                      <TouchableOpacity
                        onPress={() => handleCopyAccount(`KTX23710971 ${phoneNumber.slice(-4)}`)}
                        style={styles.copyRow}
                        activeOpacity={0.65}
                      >
                        <Text style={styles.qrDetailHighlight}>KTX23710971 {phoneNumber.slice(-4)}</Text>
                        <Text style={styles.copyIcon}>📋</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
            </View>
          )}

          {/* KHỐI VÍ SINH VIÊN IUH PAY */}
          {paymentMethod === 'IUHPAY' && (
            <View style={[styles.qrDisplayBox, { borderColor: '#818CF8', backgroundColor: '#EEF2FF' }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.qrBoxTitle, { color: '#3730A3' }]}>🎓 Ví sinh viên IUH Pay</Text>
                <TouchableOpacity
                  onPress={() => {
                    triggerHaptic(25);
                    setShowDepositModal(true);
                  }}
                  style={{
                    backgroundColor: '#4F46E5',
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 6,
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>⚡ NẠP TIỀN VÀO VÍ</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 13, color: '#4338CA', marginTop: 6 }}>
                Tài khoản MSSV: <Text style={{ fontWeight: 'bold' }}>{STUDENT.mssv}</Text> ({STUDENT.hoTen})
              </Text>
              <Text style={{ fontSize: 13, color: '#4338CA', marginTop: 2 }}>
                Số dư khả dụng:{' '}
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: studentBalance >= finalTotal ? '#16A34A' : '#DC2626',
                  }}
                >
                  {studentBalance.toLocaleString('vi-VN')} đ
                </Text>
                {studentBalance < finalTotal && (
                  <Text style={{ color: '#DC2626', fontWeight: 'bold' }}> (Không đủ số dư)</Text>
                )}
              </Text>
              <Text style={{ fontSize: 12, color: '#4F46E5', marginTop: 6, fontStyle: 'italic' }}>
                🎉 Ưu đãi: Miễn phí vận chuyển 15.000đ khi thanh toán bằng ví sinh viên IUH Pay.
              </Text>
            </View>
          )}
        </View>

        {/* 3. DANH SÁCH SẢN PHẨM */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📦 Sản phẩm trong đơn ({items.length})</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.productRow}>
              <Image source={{ uri: item.image }} style={styles.productThumb} resizeMode="cover" />
              <View style={styles.productDetail}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productQty}>Số lượng: {item.quantity}</Text>
              </View>
              <Text style={styles.productPrice}>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* 4. TÓM TẮT CHI PHÍ */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🧾 Tóm tắt chi phí</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Tạm tính hàng hóa:</Text>
            <Text style={styles.costValue}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Phí giao hàng KTX:</Text>
            <Text style={styles.costValue}>
              {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')} đ`}
            </Text>
          </View>
          {discount > 0 && (
            <View style={styles.costRow}>
              <Text style={[styles.costLabel, { color: '#16A34A' }]}>Ưu đãi sinh viên IUH:</Text>
              <Text style={[styles.costValue, { color: '#16A34A' }]}>
                -{discount.toLocaleString('vi-VN')} đ
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
            <Text style={styles.totalValue}>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(finalTotal)}
            </Text>
          </View>
        </View>

        {errorMessage && <Text style={styles.errorText}>⚠️ {errorMessage}</Text>}

        {/* Nút đặt hàng chuẩn Shopee */}
        <ShopButton
          title={
            isPlacing
              ? 'Đang xử lý đặt hàng...'
              : paymentMethod === 'COD'
              ? `Đặt hàng (Tiền mặt COD) • ${finalTotal.toLocaleString('vi-VN')} đ`
              : paymentMethod === 'IUHPAY'
              ? `Thanh toán Ví IUH Pay • ${finalTotal.toLocaleString('vi-VN')} đ`
              : paymentMethod === 'VIETQR'
              ? `Đặt hàng (Chuyển khoản QR) • ${finalTotal.toLocaleString('vi-VN')} đ`
              : `Đặt hàng (Ví MoMo) • ${finalTotal.toLocaleString('vi-VN')} đ`
          }
          onPress={handleConfirm}
          loading={isPlacing}
          style={styles.confirmBtn}
        />
      </ScrollView>

      <DepositModal
        visible={showDepositModal}
        onClose={() => setShowDepositModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SIZES.padding, paddingBottom: 50 },
  screenHeader: { marginBottom: 16 },
  title: { fontSize: SIZES.h1, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: SIZES.body2, color: COLORS.textLight },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.text },
  autoFillBtn: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  autoFillBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  inputLabel: { fontSize: SIZES.caption, fontWeight: '700', color: '#475569', marginBottom: 6 },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 14,
  },
  addressInput: {
    minHeight: 52,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  textArea: { height: 70, textAlignVertical: 'top' },

  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
  },
  paymentCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#EEF2FF',
  },
  paymentCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  paymentLogoBadge: {
    width: 44,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    padding: 2,
  },
  paymentLogoImg: {
    width: 38,
    height: 22,
  },
  paymentIcon: { fontSize: 24, marginRight: 10 },
  paymentName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  paymentNameSelected: { color: COLORS.primary },
  paymentBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paymentBadgeText: { fontSize: 10, fontWeight: '700', color: '#16A34A' },
  paymentDesc: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: { borderColor: COLORS.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  /* COD Notice */
  codNoticeBox: {
    backgroundColor: '#FEFCE8',
    borderWidth: 1.5,
    borderColor: '#FDE047',
    borderRadius: 12,
    padding: 14,
    marginTop: 6,
  },
  codNoticeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#854D0E',
  },
  codNoticeText: {
    fontSize: 13,
    color: '#713F12',
    marginVertical: 4,
  },
  codNoticeHighlight: {
    fontWeight: '800',
    color: '#B45309',
  },
  codNoticeDesc: {
    fontSize: 12,
    color: '#A16207',
    lineHeight: 18,
  },

  /* Nút Mở Camera Quét Mã Thật */
  openCameraBtn: {
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  cameraIcon: {
    fontSize: 26,
  },
  openCameraBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  openCameraBtnSub: {
    color: '#DCFCE7',
    fontSize: 11,
    marginTop: 2,
  },

  /* Thẻ khi đã quét thành công */
  scannedSuccessCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  scannedSuccessTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#166534',
  },
  scannedSuccessCode: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600',
    marginVertical: 4,
  },
  scannedSuccessStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  rescanBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rescanBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },

  /* KHỐI QR DISPLAY */
  qrDisplayBox: {
    marginTop: 6,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  qrBoxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  qrOrDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  qrOrLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  qrOrText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    paddingHorizontal: 8,
  },
  qrImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  qrDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    minHeight: 34,
  },
  qrDetailLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    width: 125,
    flexShrink: 0,
  },
  qrDetailValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    flexShrink: 1,
  },
  copyRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 1,
  },
  qrDetailHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'right',
  },
  copyIcon: {
    fontSize: 13,
    marginLeft: 6,
  },
  qrPriceHighlight: {
    flex: 1,
    textAlign: 'right',
    fontSize: 15,
    fontWeight: '900',
    color: '#DC2626',
  },

  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  productThumb: { width: 44, height: 44, borderRadius: 6, marginRight: 10 },
  productDetail: { flex: 1 },
  productName: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  productQty: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  productPrice: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  costLabel: { fontSize: 14, color: COLORS.textLight },
  costValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.text },
  totalValue: { fontSize: SIZES.h2, fontWeight: '900', color: COLORS.primary },
  errorText: { color: COLORS.danger, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  confirmBtn: { marginTop: 6, height: 48 },

  /* MÀN HÌNH HOÀN TẤT */
  doneContainer: { padding: SIZES.padding, alignItems: 'center', paddingVertical: 30 },
  doneHeader: { alignItems: 'center', marginBottom: 20 },
  successCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  successIcon: { fontSize: 36, color: '#16A34A', fontWeight: 'bold' },
  doneTitle: { fontSize: SIZES.h1, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
  doneSubtitle: { fontSize: 13, color: COLORS.textLight, textAlign: 'center' },
  receiptCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  receiptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receiptShopName: { fontSize: 16, fontWeight: '900', color: COLORS.primary },
  receiptBadge: {
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 5,
  },
  receiptLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    width: 115,
    flexShrink: 0,
  },
  receiptValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  receiptValueBold: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  receiptTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  receiptTotalLabel: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  receiptTotalValue: { fontSize: 18, fontWeight: '900', color: COLORS.primary },
  doneButtonRow: { width: '100%', marginTop: 24, gap: 10 },
  detailBtn: {
    backgroundColor: '#0EA5E9',
    height: 46,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  ordersBtn: {
    backgroundColor: COLORS.primary,
    height: 46,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ordersBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  homeBtn: {
    backgroundColor: '#F1F5F9',
    height: 46,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  homeBtnText: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  directPayBtn: {
    backgroundColor: '#16A34A',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    elevation: 2,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  directPayBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
