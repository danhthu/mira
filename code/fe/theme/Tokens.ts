/**
 * Nguồn màu duy nhất của app.
 *
 * Ràng buộc cứng #3 cấm dùng màu đỏ để báo người dùng làm chưa đủ. Cách chống
 * bằng trí nhớ đã hỏng nhiều lần, nên ở đây không có token nào nằm trong dải đỏ
 * hoặc cam: muốn dùng cũng không có sẵn. `scripts/soi-mau.mjs` chặn mọi màu
 * viết cứng ngoài thư mục này, kể cả trong file .tsx.
 *
 * `destructive` là ngoại lệ duy nhất được phép "nặng" — dành cho xoá vĩnh viễn.
 * Nó là tím mận (hue ~314°), không phải đỏ, để không ai mượn nó làm màu tiến độ.
 */

export type ColorRole =
  | 'background'
  | 'surface'
  | 'surfaceMuted'
  | 'surfaceSunken'
  | 'border'
  | 'borderStrong'
  | 'textPrimary'
  | 'textSecondary'
  | 'textMuted'
  | 'textOnAccent'
  | 'accent'
  | 'accentAlt'
  | 'accentSoft'
  | 'accentMuted'
  | 'accentSurface'
  | 'positive'
  | 'positiveSurface'
  | 'neutral'
  | 'neutralSurface'
  | 'info'
  | 'infoSurface'
  | 'destructive'
  | 'destructiveSurface'
  | 'shadow'
  | 'scrim';

export type ColorTokens = Record<ColorRole, string>;

export const lightColors: ColorTokens = {
  background: '#F7F8F7',
  surface: '#FFFFFF',
  surfaceMuted: '#EFF1F0',
  surfaceSunken: '#E6EAE8',

  border: '#DCE1DF',
  borderStrong: '#C2CAC7',

  textPrimary: '#1B211F',
  textSecondary: '#55605C',
  textMuted: '#838E8A',
  textOnAccent: '#FFFFFF',

  accent: '#13796E',
  accentAlt: '#2C6C93',
  accentSoft: '#4E8C86',
  accentMuted: '#A8D7D0',
  accentSurface: '#E4F1EF',

  positive: '#2F7D5B',
  positiveSurface: '#E2F0E9',

  neutral: '#6B7672',
  neutralSurface: '#ECEFEE',

  info: '#2C6C93',
  infoSurface: '#E3EDF4',

  destructive: '#78406B',
  destructiveSurface: '#F1E6EE',

  shadow: '#000000',
  scrim: '#000000',
};

export const darkColors: ColorTokens = {
  background: '#121614',
  surface: '#1A201E',
  surfaceMuted: '#232A28',
  surfaceSunken: '#0E1211',

  border: '#2E3735',
  borderStrong: '#43504C',

  textPrimary: '#E8EDEB',
  textSecondary: '#AAB5B1',
  textMuted: '#7E8985',
  textOnAccent: '#06231F',

  accent: '#6FCFC1',
  accentAlt: '#8FBEDB',
  accentSoft: '#8CBAB4',
  accentMuted: '#2C5F58',
  accentSurface: '#17322E',

  positive: '#7CC9A2',
  positiveSurface: '#17322A',

  neutral: '#98A29E',
  neutralSurface: '#232A28',

  info: '#8FBEDB',
  infoSurface: '#172A33',

  destructive: '#C79ABE',
  destructiveSurface: '#2E1F2B',

  shadow: '#000000',
  scrim: '#000000',
};

/**
 * `Be Vietnam Pro` được thiết kế riêng cho dấu tiếng Việt nên đứng đầu ngăn xếp.
 * Không nạp qua `@expo-google-fonts` ở đợt này: gói đó buộc phải gọi `useFonts`
 * trong `App.tsx` (đang có agent khác giữ) và thêm ~200KB font vào bundle, trong
 * khi ràng buộc #5 là offline-first nên cũng không được tải font qua mạng lúc mở
 * app. Khai báo ngăn xếp trước để máy nào đã cài sẵn thì dùng ngay, và khi nạp
 * font thật thì chỉ cần đổi một chỗ này.
 *
 * Ngăn xếp chỉ dùng được trên web; native cần tên font đã đăng ký nên `AppStyle`
 * trả `undefined` ở đó (font hệ thống).
 */
export const fontFamilyWeb =
  "'Be Vietnam Pro', 'Segoe UI', system-ui, -apple-system, sans-serif";

export const fontSize = {
  caption: 12,
  body: 15,
  bodyLarge: 17,
  subtitle: 16,
  title: 20,
  headline: 25,
  display: 32,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  bold: '700',
} as const;

export const lineHeight = {
  tight: 1.25,
  normal: 1.45,
  loose: 1.7,
} as const;

export const radius = {
  none: 0,
  small: 8,
  normal: 12,
  large: 20,
  pill: 999,
} as const;

export const space = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;
