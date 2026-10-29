// src/hooks/useAppLock.ts
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '@store/useAuthStore';

/** Sau bao lâu ở nền thì bắt khoá lại — 2 phút là mức cân bằng cho một App thương mại điện tử. */
export const APP_LOCK_TIMEOUT_MS = 2 * 60 * 1000;

type Params = {
  isUnlocked: boolean;
  setIsUnlocked: (value: boolean) => void;
};

/**
 * Tự động khoá lại ứng dụng (bắt xác thực sinh trắc học lại) nếu App bị đưa
 * vào nền quá lâu. Đây là lớp phòng thủ BỔ SUNG cho BiometricGateScreen.
 */
export const useAppLock = ({ isUnlocked: _isUnlocked, setIsUnlocked }: Params) => {
  const token = useAuthStore((state) => state.token);
  // Mốc thời gian lúc App RỜI sang nền — dùng useRef vì đổi giá trị không cần re-render
  const backgroundedAtRef = useRef<number | null>(null);

  useEffect(() => {
    // Chưa đăng nhập thì chưa có gì để khoá
    if (token == null) return;

    const handleChange = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        backgroundedAtRef.current = Date.now();
        return;
      }

      if (nextState === 'active' && backgroundedAtRef.current != null) {
        const elapsedMs = Date.now() - backgroundedAtRef.current;
        if (elapsedMs > APP_LOCK_TIMEOUT_MS) {
          setIsUnlocked(false); // Quá hạn -> khoá lại, bắt quét sinh trắc học từ đầu
        }
        backgroundedAtRef.current = null;
      }
    };

    const sub = AppState.addEventListener('change', handleChange);
    return () => sub.remove(); // Dọn listener khi Component unmount
  }, [token, setIsUnlocked]);
};
