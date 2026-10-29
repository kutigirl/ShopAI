// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Linking,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '@constants/theme';
import { useTheme } from '@contexts/ThemeContext';
import { STUDENT, KTX_COORDS, calculateShippingFee, examStamp, triggerHaptic } from '@constants/student';
import * as SecureStore from '@utils/storage';
import { useStudentWalletStore } from '@store/useStudentWalletStore';
import DepositModal from '@components/DepositModal';

interface ProfileScreenProps {
  onLogout?: () => void;
}

export default function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const { isDarkMode, toggleTheme, colors } = useTheme();

  const walletBalance = useStudentWalletStore((state) => state.balance);
  const walletTransactions = useStudentWalletStore((state) => state.transactions);
  const resetBalance = useStudentWalletStore((state) => state.resetBalance);
  const [showDepositModal, setShowDepositModal] = useState(false);

  // Thông tin cá nhân người dùng
  const [fullName, setFullName] = useState<string>(STUDENT.hoTen);
  const [phone, setPhone] = useState<string>(STUDENT.phone);
  const [room, setRoom] = useState<string>(STUDENT.defaultRoom);
  const [email, setEmail] = useState<string>(STUDENT.email);

  // Cài đặt vị trí GPS & Phí ship
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [gpsPermission, setGpsPermission] = useState<'granted' | 'denied'>('granted');
  const [distanceKm, setDistanceKm] = useState(7.1);
  const [estimatedShipFee, setEstimatedShipFee] = useState(calculateShippingFee(7.1));

  // Cài đặt chung
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Load thông tin đã lưu nếu có
  useEffect(() => {
    (async () => {
      try {
        const savedName = await SecureStore.getItemAsync('USER_FULL_NAME');
        const savedPhone = await SecureStore.getItemAsync('USER_PHONE');
        const savedRoom = await SecureStore.getItemAsync('USER_ROOM');
        if (savedName) setFullName(savedName);
        if (savedPhone) setPhone(savedPhone);
        if (savedRoom) setRoom(savedRoom);
      } catch (e) {
        console.warn('Lỗi load thông tin cá nhân:', e);
      }
    })();
  }, []);

  // Lưu thông tin cá nhân
  const handleSaveProfile = async () => {
    triggerHaptic(40);
    try {
      await SecureStore.setItemAsync('USER_FULL_NAME', fullName);
      await SecureStore.setItemAsync('USER_PHONE', phone);
      await SecureStore.setItemAsync('USER_ROOM', room);
      setIsEditing(false);
      Alert.alert('✅ Thành công', 'Thông tin cá nhân và địa chỉ nhận hàng đã được lưu!');
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lưu thông tin.');
    }
  };

  // Cài đặt vị trí
  const handleToggleGps = async (val: boolean) => {
    triggerHaptic(25);
    setGpsEnabled(val);
    if (val) {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Quyền vị trí ShopAI',
              message: 'Cần quyền vị trí để tính khoảng cách và phí giao hàng KTX.',
              buttonPositive: 'Đồng ý',
              buttonNegative: 'Hủy',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            setGpsPermission('granted');
            setDistanceKm(7.1);
            setEstimatedShipFee(calculateShippingFee(7.1));
          } else {
            setGpsPermission('denied');
          }
        } catch {
          setGpsPermission('granted');
        }
      }
    } else {
      setGpsPermission('denied');
    }
  };

  const handleOpenSettings = () => {
    triggerHaptic(25);
    Linking.openSettings().catch(() => {
      Alert.alert('Lỗi', 'Không thể mở Cài đặt của thiết bị.');
    });
  };

  const handleSelectCampus = (type: 'govap' | 'thuduc' | 'custom') => {
    triggerHaptic(25);
    if (type === 'govap') {
      setRoom('KTX IUH - Nhà B, Phòng 402 (12 Nguyễn Văn Bảo, Gò Vấp)');
      setDistanceKm(1.2);
      setEstimatedShipFee(calculateShippingFee(1.2));
    } else if (type === 'thuduc') {
      setRoom('KTX IUH Cơ sở 2 - Nhà C, P.205 (TP. Thủ Đức)');
      setDistanceKm(14.5);
      setEstimatedShipFee(calculateShippingFee(14.5));
    }
  };

  const handleLogoutPress = () => {
    triggerHaptic(40);
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => {
          if (onLogout) onLogout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.surface }]} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header màn hình Tôi */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Tài khoản & Cài đặt ⚙️</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textLight }]}>
            Thông tin sinh viên và tùy chỉnh hệ thống
          </Text>
        </View>

        {/* 1. THẺ THÔNG TIN SINH VIÊN IUH */}
        <View style={styles.card}>
          <View style={styles.profileHeaderRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>🎓</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.studentName}>{fullName}</Text>
              <Text style={styles.studentMssv}>MSSV: {STUDENT.mssv} · {STUDENT.lop}</Text>
              <Text style={styles.studentSchool}>{STUDENT.truong}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.badgeRow}>
            <View style={styles.stampBadge}>
              <Text style={styles.stampLabel}>Mã Stamp TH2:</Text>
              <Text style={styles.stampValue}>#{examStamp()}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>🟢 Tài khoản KTX</Text>
            </View>
          </View>
        </View>

        {/* THẺ VÍ SINH VIÊN IUH PAY & NẠP TIỀN TỪ NGÂN HÀNG */}
        <View style={[styles.card, { borderColor: '#818CF8', borderWidth: 1.5, backgroundColor: isDarkMode ? '#1E1B4B' : '#EEF2FF' }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginRight: 8 }}>🎓</Text>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '800', color: isDarkMode ? '#FFFFFF' : '#312E81' }}>
                  Ví Sinh Viên IUH Pay
                </Text>
                <Text style={{ fontSize: 12, color: isDarkMode ? '#C7D2FE' : '#4338CA' }}>
                  Tài khoản liên kết MSSV {STUDENT.mssv}
                </Text>
              </View>
            </View>
            <View style={{ backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>KHẢ DỤNG</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={{ marginVertical: 4 }}>
            <Text style={{ fontSize: 12, color: isDarkMode ? '#A5B4FC' : '#6366F1', fontWeight: '600' }}>
              Số dư khả dụng hiện tại:
            </Text>
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#16A34A', marginTop: 2 }}>
              {walletBalance.toLocaleString('vi-VN')} đ
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: COLORS.primary,
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 2,
              }}
              activeOpacity={0.8}
              onPress={() => {
                triggerHaptic(30);
                setShowDepositModal(true);
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>
                ⚡ NẠP TIỀN TỪ NGÂN HÀNG
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: isDarkMode ? '#312E81' : '#E0E7FF',
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.8}
              onPress={() => {
                triggerHaptic(20);
                resetBalance();
                Alert.alert('Đã đặt lại', 'Số dư ví IUH Pay đã được đặt lại 2.500.000 đ!');
              }}
            >
              <Text style={{ color: '#4338CA', fontSize: 13, fontWeight: '700' }}>🔄 Reset</Text>
            </TouchableOpacity>
          </View>

          {/* Lịch sử giao dịch gần nhất */}
          {walletTransactions.length > 0 && (
            <View style={{ marginTop: 14 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: isDarkMode ? '#E2E8F0' : '#475569', marginBottom: 6 }}>
                Giao dịch gần đây ({walletTransactions.length}):
              </Text>
              {walletTransactions.slice(0, 3).map((tx) => (
                <View
                  key={tx.id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 6,
                    borderBottomWidth: 1,
                    borderBottomColor: isDarkMode ? '#312E81' : '#E2E8F0',
                  }}
                >
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: isDarkMode ? '#F8FAFC' : '#1E293B' }} numberOfLines={1}>
                      {tx.type === 'DEPOSIT' ? '➕ ' : '➖ '}
                      {tx.title}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#94A3B8' }}>{tx.date}</Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '800',
                      color: tx.type === 'DEPOSIT' ? '#16A34A' : '#DC2626',
                    }}
                  >
                    {tx.type === 'DEPOSIT' ? '+' : '-'}
                    {tx.amount.toLocaleString('vi-VN')} đ
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 2. CHỈNH SỬA THÔNG TIN CÁ NHÂN & NHẬN HÀNG */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>👤 Thông tin nhận hàng mặc định</Text>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic(20);
                setIsEditing(!isEditing);
              }}
              style={styles.editBtn}
            >
              <Text style={styles.editBtnText}>{isEditing ? 'Hủy' : '✏️ Chỉnh sửa'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Họ và tên người nhận:</Text>
          <TextInput
            style={[styles.inputField, !isEditing && styles.disabledInput]}
            value={fullName}
            onChangeText={setFullName}
            editable={isEditing}
          />

          <Text style={styles.fieldLabel}>Số điện thoại:</Text>
          <TextInput
            style={[styles.inputField, !isEditing && styles.disabledInput]}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={isEditing}
          />

          <Text style={styles.fieldLabel}>Địa chỉ / Phòng KTX giao hàng:</Text>
          <TextInput
            style={[styles.inputField, styles.addressInputField, !isEditing && styles.disabledInput]}
            value={room}
            onChangeText={setRoom}
            editable={isEditing}
            multiline
            numberOfLines={2}
          />

          <Text style={styles.fieldLabel}>Email sinh viên:</Text>
          <TextInput
            style={[styles.inputField, styles.disabledInput]}
            value={email}
            editable={false}
          />

          {isEditing && (
            <TouchableOpacity
              style={styles.saveBtn}
              activeOpacity={0.65}
              onPress={handleSaveProfile}
            >
              <Text style={styles.saveBtnText}>💾 Lưu thay đổi</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 3. CÀI ĐẶT VỊ TRÍ & PHÍ SHIP (GPS SETTINGS) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Cài đặt Vị trí & Phí giao hàng</Text>
          <Text style={styles.cardSubtitle}>
            Hệ thống tự động đo khoảng cách GPS để tính phí ship chính xác đến phòng KTX
          </Text>

          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.settingLabel}>Định vị GPS tự động</Text>
              <Text style={styles.settingDesc}>
                Trạng thái: {gpsPermission === 'granted' ? '🟢 Đã cấp quyền' : '🔴 Chưa cấp quyền'}
              </Text>
            </View>
            <Switch
              value={gpsEnabled}
              onValueChange={handleToggleGps}
              trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
              thumbColor={gpsEnabled ? COLORS.primary : '#F1F5F9'}
            />
          </View>

          {/* Hộp hiển thị khoảng cách và phí ship */}
          <View style={styles.distanceBox}>
            <View style={styles.distanceItem}>
              <Text style={styles.distanceLabel}>Khoảng cách đến KTX:</Text>
              <Text style={styles.distanceValue}>≈ {distanceKm} km</Text>
            </View>
            <View style={styles.distanceItem}>
              <Text style={styles.distanceLabel}>Phí ship ước tính:</Text>
              <Text style={styles.shipValue}>{estimatedShipFee.toLocaleString('vi-VN')} đ</Text>
            </View>
          </View>

          {/* Chọn nhanh cơ sở KTX */}
          <Text style={styles.quickChooseLabel}>Chọn nhanh điểm nhận hàng KTX:</Text>
          <View style={styles.quickChooseRow}>
            <TouchableOpacity
              style={styles.quickChip}
              onPress={() => handleSelectCampus('govap')}
            >
              <Text style={styles.quickChipText}>🏫 KTX Gò Vấp (Cơ sở 1)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickChip}
              onPress={() => handleSelectCampus('thuduc')}
            >
              <Text style={styles.quickChipText}>🏢 KTX Cơ sở 2 (Thủ Đức)</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.openSettingsBtn}
            activeOpacity={0.8}
            onPress={handleOpenSettings}
          >
            <Text style={styles.openSettingsText}>⚙️ Mở Cài đặt thiết bị (Cấp quyền vị trí)</Text>
          </TouchableOpacity>
        </View>

        {/* 4. TÙY CHỌN ỨNG DỤNG */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ Tùy chọn hệ thống</Text>

          {/* Chế độ Sáng / Tối */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Giao diện Tối (Dark Mode)</Text>
              <Text style={styles.settingDesc}>Bảo vệ mắt khi sử dụng vào ban đêm</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={() => {
                triggerHaptic(25);
                toggleTheme();
              }}
              trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
              thumbColor={isDarkMode ? COLORS.primary : '#F1F5F9'}
            />
          </View>

          <View style={styles.divider} />

          {/* Rung phản hồi Haptic */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Rung phản hồi khi nhấn nút</Text>
              <Text style={styles.settingDesc}>Tạo cảm giác ấn chân thực (Haptic feedback)</Text>
            </View>
            <Switch
              value={hapticEnabled}
              onValueChange={(val) => {
                triggerHaptic(25);
                setHapticEnabled(val);
              }}
              trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
              thumbColor={hapticEnabled ? COLORS.primary : '#F1F5F9'}
            />
          </View>

          <View style={styles.divider} />

          {/* Thông báo */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Nhận thông báo ưu đãi</Text>
              <Text style={styles.settingDesc}>Nhận thông tin Flash Sale & Trạng thái giao hàng</Text>
            </View>
            <Switch
              value={notifEnabled}
              onValueChange={(val) => {
                triggerHaptic(25);
                setNotifEnabled(val);
              }}
              trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
              thumbColor={notifEnabled ? COLORS.primary : '#F1F5F9'}
            />
          </View>
        </View>

        {/* 5. NÚT ĐĂNG XUẤT */}
        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.8}
          onPress={handleLogoutPress}
        >
          <Text style={styles.logoutBtnText}>🚪 Đăng xuất tài khoản</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>ShopAI v2.5 · Bản quyền IUH 2026</Text>
      </ScrollView>

      {/* Modal nạp tiền vào Ví sinh viên IUH Pay từ ngân hàng */}
      <DepositModal
        visible={showDepositModal}
        onClose={() => setShowDepositModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 16, paddingBottom: 50 },
  header: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
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
  profileHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C7D2FE',
  },
  avatarText: { fontSize: 28 },
  studentName: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  studentMssv: { fontSize: 13, color: COLORS.primary, fontWeight: '700', marginTop: 2 },
  studentSchool: { fontSize: 12, color: '#64748B', marginTop: 2 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stampBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stampLabel: { fontSize: 12, color: '#64748B', marginRight: 4 },
  stampValue: { fontSize: 12, fontWeight: '800', color: '#1E293B' },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700', color: '#16A34A' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  cardSubtitle: { fontSize: 12, color: '#64748B', marginBottom: 12, lineHeight: 17 },
  editBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 },
  inputField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 10,
  },
  addressInputField: {
    minHeight: 52,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  disabledInput: { backgroundColor: '#F1F5F9', color: '#64748B' },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  settingDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  distanceBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  distanceItem: { flex: 1, alignItems: 'center' },
  distanceLabel: { fontSize: 11, color: '#64748B', marginBottom: 4 },
  distanceValue: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  shipValue: { fontSize: 15, fontWeight: '800', color: '#16A34A' },
  quickChooseLabel: { fontSize: 12, fontWeight: '600', color: '#475569', marginTop: 6, marginBottom: 6 },
  quickChooseRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  quickChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  quickChipText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  openSettingsBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  openSettingsText: { fontSize: 13, fontWeight: '600', color: '#334155' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  logoutBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutBtnText: { color: '#DC2626', fontSize: 15, fontWeight: '700' },
  versionText: { textAlign: 'center', fontSize: 11, color: '#94A3B8', marginTop: 16 },
});
