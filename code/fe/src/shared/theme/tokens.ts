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
