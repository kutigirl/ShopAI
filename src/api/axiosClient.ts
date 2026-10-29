import axios from 'axios';
import { API_BASE_URL } from '@constants/api';
import { useAuthStore } from '@store/useAuthStore';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Tự động gắn Bearer Token vào mọi request
axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Tự động logout nếu token hết hạn (401)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('⚠️ Token hết hạn hoặc không hợp lệ, tự động đăng xuất.');
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
