import { Platform } from 'react-native';

// Tên token đặt theo vai trò, không theo màu: đổi bảng màu sau này chỉ sửa file này.
export const colors = {
  background: '#F9FAFB',
  surface: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.4)',
  shadow: '#000',

  textPrimary: '#1A1A2E',
  textLabel: '#374151',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textOnAccent: '#FFFFFF',

  accent: '#3B5BDB',
  accentSurface: '#EEF2FF',
  avatarSurface: '#E8F0FE',

  border: '#E5E7EB',
  borderSubtle: '#F3F4F6',
  controlTrackOff: '#D1D5DB',
} as const;

export const fontSize = {
  micro: 10,
  caption: 12,
  meta: 13,
  small: 14,
  body: 15,
  bodyLarge: 16,
  title: 18,
  heading: 20,
  headline: 22,
  display: 26,
} as const;

export const radius = {
  sm: 10,
  md: 12,
  lg: 20,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

/**
 * App chưa nhúng font riêng, nên mono lấy font sẵn có của hệ điều hành. Khai báo
 * ở đây để ngày nào nhúng font thật thì chỉ sửa một chỗ — và để không ai viết
 * `fontFamily: 'IBMPlexMono'` rồi tưởng là đã có mono trong khi nó rơi về font
 * mặc định không ai thấy.
 */
export const fontFamily = {
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
} as const;
