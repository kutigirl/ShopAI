import { create } from 'zustand';
import * as SecureStore from '@utils/storage';

interface AuthState {
  token: string | null;
  isLoading: boolean; // Trạng thái đang kiểm tra ổ cứng
  login: (newToken: string) => Promise<void>;
  logout: () => Promise<void>;
  checkLocalToken: () => Promise<void>; // Hàm chạy lúc mở app
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isLoading: true, // Mặc định vừa vào app là Loading

  // Lưu token vào RAM (Đám mây) VÀ lưu xuống Ổ cứng mã hóa (Keystore)
  login: async (newToken: string) => {
    await SecureStore.setItemAsync('SHOP_ACCESS_TOKEN', newToken);
    set({ token: newToken });
  },

  // Hủy Token trên cả 2 nơi
  logout: async () => {
    await SecureStore.deleteItemAsync('SHOP_ACCESS_TOKEN');
    set({ token: null });
  },

  // Hàm móc dữ liệu từ Keystore lên khi người dùng vừa khởi động lại điện thoại
  checkLocalToken: async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('SHOP_ACCESS_TOKEN');
      if (storedToken) {
        set({ token: storedToken }); // Tìm thấy Token -> Đăng nhập luôn!
      }
    } catch (e) {
      console.log('Lỗi Keystore:', e);
    } finally {
      set({ isLoading: false }); // Kiểm tra xong, tắt vòng xoay Loading
    }
  },
}));
