// src/constants/theme.ts

export const LIGHT_COLORS = {
  primary: '#6366F1',     // Indigo chủ đạo
  secondary: '#8B5CF6',   // Tím phụ trợ
  success: '#10B981',     // Xanh lá thành công
  warning: '#F59E0B',     // Vàng cảnh báo
  danger: '#EF4444',      // Đỏ lỗi
  background: '#F8F9FA',  // Nền sáng chuẩn
  surface: '#FFFFFF',     // Nền card/sheet
  card: '#FFFFFF',
  text: '#111827',        // Chữ chính
  textLight: '#6B7280',
  error: '#EF4444',
  border: '#E5E7EB',
  white: '#FFFFFF',
  black: '#000000',
};

export const DARK_COLORS = {
  primary: '#818CF8',     // Sáng hơn trên nền tối
  secondary: '#A78BFA',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  background: '#0F172A',  // Nền Slate tối
  surface: '#1E293B',     // Nền card tối
  card: '#1E293B',
  text: '#F8FAFC',        // Chữ sáng
  textLight: '#94A3B8',
  error: '#F87171',
  border: '#334155',
  white: '#FFFFFF',
  black: '#000000',
};

export const COLORS = LIGHT_COLORS;

export const SIZES = {
  base: 8,
  padding: 16,
  radius: 12,
  h1: 24,
  h2: 20,
  h3: 18,
  body1: 15,
  body2: 13,
  caption: 11,
  small: 12,
};

export const FONTS = {
  h1: { fontSize: SIZES.h1, fontWeight: '700' as const },
  h2: { fontSize: SIZES.h2, fontWeight: '700' as const },
  h3: { fontSize: SIZES.h3, fontWeight: '600' as const },
  body1: { fontSize: SIZES.body1, fontWeight: '400' as const },
  body2: { fontSize: SIZES.body2, fontWeight: '400' as const },
  small: { fontSize: SIZES.small, fontWeight: '400' as const },
};

export default { COLORS, LIGHT_COLORS, DARK_COLORS, SIZES, FONTS };
