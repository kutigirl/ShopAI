// src/components/DepositModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Vibration,
  Image,
} from 'react-native';
import { COLORS, SIZES } from '@constants/theme';
import { STUDENT, triggerHaptic } from '@constants/student';
import { useStudentWalletStore } from '@store/useStudentWalletStore';
import { useNotificationStore } from '@store/useNotificationStore';
import { useNetworkStore } from '@store/useNetworkStore';
import { BANK_LOGOS } from '@constants/bankLogos';

interface DepositModalProps {
  visible: boolean;
  onClose: () => void;
}

const BANKS = [
  {
    id: 'MB',
    name: 'MB Bank (Quân Đội)',
    sub: 'Ngân hàng TMCP Quân Đội',
    logo: { uri: BANK_LOGOS.MB },
    bgColor: '#1036A0',
    short: 'MB',
  },
  {
    id: 'VCB',
    name: 'Vietcombank',
    sub: 'TMCP Ngoại Thương Việt Nam',
    logo: { uri: BANK_LOGOS.VCB },
    bgColor: '#006847',
    short: 'VCB',
  },
  {
    id: 'TCB',
    name: 'Techcombank',
    sub: 'TMCP Kỹ Thương Việt Nam',
    logo: { uri: BANK_LOGOS.TCB },
    bgColor: '#ED1C24',
    short: 'TCB',
  },
  {
    id: 'BIDV',
    name: 'BIDV',
    sub: 'Đầu tư & Phát triển Việt Nam',
    logo: { uri: BANK_LOGOS.BIDV },
    bgColor: '#006A70',
    short: 'BIDV',
  },
  {
    id: 'ICB',
    name: 'VietinBank',
    sub: 'TMCP Công Thương Việt Nam',
    logo: { uri: BANK_LOGOS.ICB },
    bgColor: '#005BAA',
    short: 'ICB',
  },
  {
    id: 'MOMO',
    name: 'Ví điện tử MoMo',
    sub: 'Ví điện tử liên kết Napas 24/7',
    logo: { uri: BANK_LOGOS.MOMO },
    bgColor: '#A50064',
    short: 'MoMo',
  },
];

const PRESET_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000];

export default function DepositModal({ visible, onClose }: DepositModalProps) {
  const depositBalance = useStudentWalletStore((state) => state.depositBalance);
  const currentBalance = useStudentWalletStore((state) => state.balance);

  const [selectedBank, setSelectedBank] = useState<string>(BANKS[0].name);
  const [accountNumber, setAccountNumber] = useState<string>(STUDENT.bankAccount);
  const [accountHolder, setAccountHolder] = useState<string>(STUDENT.hoTen);
  const [amountStr, setAmountStr] = useState('200000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  const handleDeposit = () => {
    if (useNetworkStore.getState().isOffline) {
      triggerHaptic(50);
      Alert.alert(
        'Mất kết nối Internet',
        'Thiết bị của bạn đang mất mạng (offline). Không thể kết nối cổng ngân hàng để nạp tiền lúc này. Vui lòng bật Wi-Fi hoặc 4G.',
      );
      return;
    }

    const amount = parseInt(amountStr.replace(/[^0-9]/g, ''), 10);
    if (isNaN(amount) || amount < 10000) {
      Alert.alert('Số tiền không hợp lệ', 'Số tiền nạp tối thiểu là 10.000 đ.');
      return;
    }

    if (!accountNumber.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập số tài khoản hoặc số thẻ ngân hàng.');
      return;
    }

    setIsProcessing(true);
    triggerHaptic(50);

    setTimeout(() => {
      const ok = depositBalance(amount, selectedBank, accountNumber);
      setIsProcessing(false);

      if (ok) {
        Vibration.vibrate([0, 100, 80, 200]);
        useNotificationStore.getState().addNotification({
          icon: '💰',
          title: 'Nạp tiền vào ví IUH Pay thành công!',
          content: `Đã nạp thành công ${amount.toLocaleString('vi-VN')}đ từ ${selectedBank} (${accountNumber}) vào ví sinh viên IUH Pay. Số dư hiện tại: ${(currentBalance + amount).toLocaleString('vi-VN')}đ.`,
          time: 'Vừa xong',
        });

        Alert.alert(
          '🎉 Nạp tiền thành công!',
          `Đã nạp ${amount.toLocaleString('vi-VN')} đ vào Ví sinh viên IUH Pay!\nSố dư mới: ${(currentBalance + amount).toLocaleString('vi-VN')} đ`,
          [{ text: 'Tuyệt vời', onPress: onClose }],
        );
      } else {
        Alert.alert('Lỗi', 'Không thể hoàn tất giao dịch nạp tiền.');
      }
    }, 600);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginRight: 8 }}>🏦</Text>
              <View>
                <Text style={styles.title}>Nạp tiền vào Ví IUH Pay</Text>
                <Text style={styles.subtitle}>
                  Số dư hiện tại: <Text style={{ fontWeight: 'bold', color: '#16A34A' }}>{currentBalance.toLocaleString('vi-VN')} đ</Text>
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
            {/* 1. Chọn Ngân hàng nguồn */}
            <Text style={styles.sectionLabel}>1. Chọn ngân hàng liên kết nguồn tiền:</Text>
            <View style={styles.bankList}>
              {BANKS.map((b) => {
                const isSelected = selectedBank === b.name;
                return (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.bankItem, isSelected && styles.bankItemSelected]}
                    onPress={() => {
                      triggerHaptic(20);
                      setSelectedBank(b.name);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.bankItemLeft}>
                      <View style={[styles.logoBadge, isSelected && styles.logoBadgeSelected]}>
                        {imageErrorMap[b.id] ? (
                          <View style={[styles.fallbackBadge, { backgroundColor: b.bgColor }]}>
                            <Text style={styles.fallbackText}>{b.short}</Text>
                          </View>
                        ) : (
                          <Image
                            source={b.logo}
                            style={styles.bankLogo}
                            resizeMode="cover"
                            onError={() => {
                              setImageErrorMap((prev) => ({ ...prev, [b.id]: true }));
                            }}
                          />
                        )}
                      </View>
                      <View style={styles.bankTextCol}>
                        <Text style={[styles.bankName, isSelected && styles.bankNameSelected]}>
                          {b.name}
                        </Text>
                        <Text style={styles.bankSub} numberOfLines={1}>
                          {b.sub}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 2. Thông tin tài khoản */}
            <Text style={styles.sectionLabel}>2. Số tài khoản / Thẻ ngân hàng nguồn:</Text>
            <TextInput
              style={styles.input}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="Nhập số tài khoản ngân hàng"
              keyboardType="numeric"
            />

            <Text style={styles.sectionLabel}>Chủ tài khoản ngân hàng:</Text>
            <TextInput
              style={styles.input}
              value={accountHolder}
              onChangeText={setAccountHolder}
              placeholder="Tên chủ tài khoản"
            />

            {/* 3. Chọn hoặc nhập số tiền muốn nạp */}
            <Text style={styles.sectionLabel}>3. Chọn số tiền muốn nạp:</Text>
            <View style={styles.presetContainer}>
              {PRESET_AMOUNTS.map((amt) => {
                const isSelected = amountStr === amt.toString();
                return (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.presetBtn, isSelected && styles.presetBtnSelected]}
                    onPress={() => {
                      triggerHaptic(20);
                      setAmountStr(amt.toString());
                    }}
                  >
                    <Text style={[styles.presetText, isSelected && styles.presetTextSelected]}>
                      {amt.toLocaleString('vi-VN')} đ
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Hoặc tự nhập số tiền:</Text>
            <View style={styles.amountInputRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0, fontSize: 16, fontWeight: '700' }]}
                value={amountStr}
                onChangeText={setAmountStr}
                placeholder="Nhập số tiền (VNĐ)"
                keyboardType="numeric"
              />
              <Text style={styles.currencyTag}>VNĐ</Text>
            </View>
          </ScrollView>

          {/* Nút bấm xác nhận nạp */}
          <TouchableOpacity
            style={[styles.confirmBtn, isProcessing && { opacity: 0.7 }]}
            onPress={handleDeposit}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmBtnText}>
              {isProcessing ? 'Đang xử lý nạp tiền...' : `⚡ XÁC NHẬN NẠP ${parseInt(amountStr || '0', 10).toLocaleString('vi-VN')} Đ`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#64748B',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 6,
  },
  bankList: {
    marginBottom: 10,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  bankItemSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bankItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  logoBadgeSelected: {
    borderColor: '#C7D2FE',
  },
  bankLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  fallbackBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  bankTextCol: {
    flex: 1,
  },
  bankName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  bankNameSelected: {
    color: '#4F46E5',
    fontWeight: '800',
  },
  bankSub: {
    fontSize: 11,
    color: '#64748B',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioCircleSelected: {
    borderColor: '#4F46E5',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4F46E5',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  presetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  presetBtnSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  presetTextSelected: {
    color: '#FFFFFF',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  currencyTag: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 3,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
