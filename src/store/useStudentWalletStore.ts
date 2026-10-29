// src/store/useStudentWalletStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from '@utils/storage';
import { triggerHaptic } from '@constants/student';

export interface WalletTransaction {
  id: string;
  type: 'PAYMENT' | 'DEPOSIT';
  title: string;
  amount: number;
  date: string;
  bankName?: string;
  accountNumber?: string;
}

interface StudentWalletState {
  balance: number;
  transactions: WalletTransaction[];
  deductBalance: (amount: number, orderId: string) => boolean;
  depositBalance: (amount: number, bankName: string, accountNumber: string) => boolean;
  resetBalance: () => void;
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
      console.warn('Lỗi lưu ví sinh viên:', e);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.warn('Lỗi xoá ví sinh viên:', e);
    }
  },
};

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx_init',
    type: 'DEPOSIT',
    title: 'Học bổng sinh viên KTX IUH',
    amount: 2500000,
    date: '28/10/2026 08:00',
    bankName: 'Hệ thống IUH Pay',
  },
];

export const useStudentWalletStore = create<StudentWalletState>()(
  persist(
    (set, get) => ({
      balance: 2500000,
      transactions: INITIAL_TRANSACTIONS,

      deductBalance: (amount: number, orderId: string) => {
        const currentBalance = get().balance;
        if (currentBalance < amount) {
          return false;
        }

        const newTx: WalletTransaction = {
          id: `tx_pay_${Date.now()}`,
          type: 'PAYMENT',
          title: `Thanh toán đơn hàng #${orderId}`,
          amount,
          date: new Date().toLocaleString('vi-VN'),
        };

        set({
          balance: currentBalance - amount,
          transactions: [newTx, ...get().transactions],
        });

        triggerHaptic(40);
        return true;
      },

      depositBalance: (amount: number, bankName: string, accountNumber: string) => {
        if (amount <= 0) return false;

        const newTx: WalletTransaction = {
          id: `tx_dep_${Date.now()}`,
          type: 'DEPOSIT',
          title: `Nạp tiền từ ${bankName}`,
          amount,
          date: new Date().toLocaleString('vi-VN'),
          bankName,
          accountNumber,
        };

        set({
          balance: get().balance + amount,
          transactions: [newTx, ...get().transactions],
        });

        triggerHaptic(50);
        return true;
      },

      resetBalance: () => {
        set({
          balance: 2500000,
          transactions: INITIAL_TRANSACTIONS,
        });
      },
    }),
    {
      name: 'STUDENT_WALLET_STORAGE',
      storage: createJSONStorage(() => secureStoreAdapter),
    },
  ),
);
