// src/store/useNotificationStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from '@utils/storage';

export interface AppNotification {
  id: string;
  icon: string;
  title: string;
  content: string;
  time: string;
  unread: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (notif: Omit<AppNotification, 'id' | 'unread'> & { id?: string }) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  unreadCount: () => number;
}

const secureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return (await SecureStore.getItemAsync(key)) ?? null;
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.warn('Lỗi lưu thông báo:', e);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.warn('Lỗi xóa thông báo:', e);
    }
  },
};

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_welcome',
    icon: '🎁',
    title: 'Chào mừng bạn đến với ShopAI KTX!',
    content: 'Tặng ngay ưu đãi giảm 20.000đ khi giao hàng đến KTX Trường Đại học Công nghiệp TP.HCM (IUH).',
    time: '5 phút trước',
    unread: true,
  },
  {
    id: 'notif_speed',
    icon: '🛵',
    title: 'Giao hàng siêu tốc 15 phút',
    content: 'Shipper KTXGo sẵn sàng giao tận phòng KTX Nhà B & Nhà C cho sinh viên.',
    time: '1 giờ trước',
    unread: false,
  },
  {
    id: 'notif_qr',
    icon: '🏦',
    title: 'Hỗ trợ quét mã VietQR & MoMo tự động',
    content: 'Thanh toán trực tiếp bằng Camera quét mã QR, xác nhận đơn hàng tức thì.',
    time: 'Hôm qua',
    unread: false,
  },
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: DEFAULT_NOTIFICATIONS,

      addNotification: (notif) => {
        const newNotif: AppNotification = {
          id: notif.id || `notif_${Date.now()}`,
          icon: notif.icon,
          title: notif.title,
          content: notif.content,
          time: notif.time,
          unread: true,
        };
        set((state) => ({
          notifications: [newNotif, ...state.notifications],
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, unread: false })),
        }));
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      unreadCount: () => {
        return get().notifications.filter((n) => n.unread).length;
      },
    }),
    {
      name: 'SHOP_NOTIFICATIONS_STORAGE',
      storage: createJSONStorage(() => secureStoreAdapter),
    },
  ),
);
