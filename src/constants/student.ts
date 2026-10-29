// src/constants/student.ts
import { Vibration, Platform, PermissionsAndroid } from 'react-native';

export const STUDENT = {
  mssv: '23710971',
  hoTen: 'Võ Hiếu Trang Kiên',
  email: '23710971@student.iuh.edu.vn',
  phone: '0328140841',
  khoa: 'Khoa Công nghệ Thông tin',
  truong: 'Trường Đại học Công nghiệp TP.HCM (IUH)',
  lop: 'DHKTPM19A',
  defaultRoom: 'KTX ĐH Công nghiệp TP.HCM (IUH) - Nhà B, Phòng 402',
  bankName: 'MB Bank (Quân Đội)',
  bankAccount: '0358899888',
  momoPhone: '0328140841',
} as const;

export const KTX_COORDS = {
  latitude: 10.8221,
  longitude: 106.6868,
  address: '12 Nguyễn Văn Bảo, Phường 4, Quận Gò Vấp, TP. Hồ Chí Minh',
};

export const BASE_SHIP_FEE = 10000;

export function calculateShippingFee(km: number): number {
  return BASE_SHIP_FEE + Math.round(km * 1500) + 2000;
}

export function examStamp(): string {
  const raw = `TH2|${STUDENT.mssv}|${STUDENT.hoTen}`;
  let h = 5381;
  for (let i = 0; i < raw.length; i++) {
    h = Math.imul(h, 33) ^ raw.charCodeAt(i);
  }
  return String(Math.abs(h) % 1000000).padStart(6, '0');
}

/**
 * Hiệu ứng rung phản hồi xúc giác chân thực khi nhấn bất kỳ nút nào
 */
export async function triggerHaptic(duration: number = 30): Promise<void> {
  try {
    if (Platform.OS === 'android') {
      const hasPerm = await PermissionsAndroid.check(
        'android.permission.VIBRATE' as any
      ).catch(() => false);
      if (!hasPerm) {
        Vibration.vibrate(duration);
        return;
      }
    }
    Vibration.vibrate(duration);
  } catch {
    // Không làm sập ứng dụng nếu thiết bị không hỗ trợ rung
  }
}
