// src/store/useNetworkStore.ts
import { create } from 'zustand';

interface NetworkState {
  isOffline: boolean;
  isChecking: boolean;
  lastChecked: number | null;
  setOffline: (offline: boolean) => void;
  checkConnectivity: () => Promise<boolean>;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOffline: false,
  isChecking: false,
  lastChecked: null,

  setOffline: (offline: boolean) => {
    set({ isOffline: offline, lastChecked: Date.now() });
  },

  checkConnectivity: async () => {
    set({ isChecking: true });
    try {
      // Kiểm tra kết nối Internet thực tế từ Google 204 endpoint (nhẹ, nhanh, chuẩn xác)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`https://clients3.google.com/generate_204?t=${Date.now()}`, {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const isConnected = res.status >= 200 && res.status < 400;
      set({ isOffline: !isConnected, isChecking: false, lastChecked: Date.now() });
      return isConnected;
    } catch {
      // Khi ngắt Wi-Fi/4G, lệnh gọi internet ngoài chắc chắn throw lỗi -> Xác định chính xác là OFFLINE
      set({ isOffline: true, isChecking: false, lastChecked: Date.now() });
      return false;
    }
  },
}));
