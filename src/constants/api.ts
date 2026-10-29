import { Platform } from 'react-native';

// Đổi IP LAN này thành IP thật của máy tính bạn (xem bằng lệnh ipconfig / ifconfig).
// Máy tính và điện thoại phải chung 1 mạng Wifi (nhắc lại bẫy Localhost ở Phần 9.4).
export const DEV_LAN_IP = '192.168.50.231';

export const API_BASE_URL = __DEV__
  ? (Platform.OS === 'android'
      ? 'http://localhost:3000'
      : `http://${DEV_LAN_IP}:3000`)
  : 'https://api.shopai.com';
