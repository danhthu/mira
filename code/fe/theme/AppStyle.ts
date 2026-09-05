import Color from 'color';
import { Platform } from 'react-native';
import {
  ColorTokens,
  fontFamilyWeb,
  fontSize,
  fontWeight,
  lightColors,
  lineHeight,
  radius,
  space,
} from './Tokens';

// Đổi tên từ `global`: Metro bọc mỗi module trong `function (global, ...)`, nên
// khai một biến cùng tên ở đây là khai trùng tham số — bundle web chết ngay khi
// phân tích cú pháp, màn hình trắng không thông báo gì.
const baseStyle = {
  FONTSIZE: {
    small: fontSize.caption,
    normal: fontSize.body,
    large: fontSize.title,
    h1: fontSize.title,
    h2: fontSize.body,
    h3: fontSize.caption,
    hs: fontSize.title,
    icon: fontSize.title,
    title: fontSize.title,
    subTitle: fontSize.subtitle,
    biggest: fontSize.headline,
  },
  MARGIN: {
    groups: space.md,
    elements: space.xl,
    screen: space.md,
  },
  BORDER: {
    normal: radius.normal,
    big: radius.large,
    small: radius.small,
  },
  PADDING: {
    normal: space.sm,
    big: space.md,
    small: space.xs,
  },
};

function hexToRGB(hex: string, alpha?: number): string {
  if (!hex || hex.length < 6) return hex;
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
  } else {
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
  }
}

export function convertHex(hexCode: string, opacity = 1): string {
  try {
    let hex = hexCode.replace('#', '');

    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    const r = parseInt(hex.substring(0, 2), 16),
      g = parseInt(hex.substring(2, 4), 16),
      b = parseInt(hex.substring(4, 6), 16);

    /* Backward compatibility for whole number based opacity values. */
    if (opacity > 1 && opacity <= 100) {
      opacity = opacity / 100;
    }

    return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
  } catch {
    return hexCode;
  }
}

const lightnessFactors: Record<number, number> = {
  100: 1.4,
  200: 1.2,
  300: 1.1,
  400: 1.05,
  500: 1.0,
  600: 0.9,
  700: 0.75,
  800: 0.6,
  900: 0.45,
};

function generateMaterialColorVariants(
  color: string,
  number: number,
): string | null {
  const factor = lightnessFactors[number];
  if (!factor) {
    console.error(
      'Invalid number. Please enter a number between 100 and 900, in increments of 100.',
    );
    return null;
  }

  const baseColor = Color(color);
  return baseColor.hsl().lightness(baseColor.lightness() * factor).hex();
}

type ColorRamp = Record<100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string | null>;

const createColors = (baseColor: string): ColorRamp => ({
  100: generateMaterialColorVariants(baseColor, 100),
  200: generateMaterialColorVariants(baseColor, 200),
  300: generateMaterialColorVariants(baseColor, 300),
  400: generateMaterialColorVariants(baseColor, 400),
  500: generateMaterialColorVariants(baseColor, 500),
  600: generateMaterialColorVariants(baseColor, 600),
  700: generateMaterialColorVariants(baseColor, 700),
  800: generateMaterialColorVariants(baseColor, 800),
  900: generateMaterialColorVariants(baseColor, 900),
});

/**
 * Các tên `error`, `warning`, `danger`, `warn` là di sản Batify, hơn 100 màn đang
 * gọi nên không xoá được trong một đợt. Chúng đều trỏ về `neutral`: chỗ nào đang
 * dùng chúng để báo "chưa đủ" thì bây giờ ra màu xám, đúng ràng buộc #3. Muốn màu
 * cho hành động xoá vĩnh viễn thì dùng `destructive`.
 */
export const buildAppStyle = (c: ColorTokens, brightness: 'light' | 'dark') => ({
  ...baseStyle,

  brightness,

  token: c,
  fontFamily: Platform.select({ web: fontFamilyWeb, default: undefined }),
  fontSize,
  fontWeight,
  lineHeight,
  radius,
  space,

  primary: c.accent,
  onPrimary: c.textOnAccent,
  primaryContainer: c.accentMuted,
  onPrimaryContainer: c.textPrimary,
  primary10: hexToRGB(c.accent, 0.1),
  primary30: hexToRGB(c.accent, 0.3),
  primary70: hexToRGB(c.accent, 0.7),

  secondary: c.accentAlt,
  onSecondary: c.textOnAccent,
  secondaryContainer: c.infoSurface,
  onSecondaryContainer: c.textPrimary,

  tertiary: c.accentSoft,
  onTertiary: c.textOnAccent,
  tertiaryContainer: c.accentSurface,
  onTertiaryContainer: c.textPrimary,

  background: c.background,
  onBackground: c.textPrimary,
  surface: c.surface,
  onSurface: c.textPrimary,
  surfaceContainer: c.surfaceMuted,
  onSurfaceContainer: c.textSecondary,
  surfaceVariant: c.surfaceMuted,
  onSurfaceVariant: c.textSecondary,

  outline: c.borderStrong,
  outlineVariant: c.border,

  inverseSurface: c.textPrimary,
  onInverseSurface: c.surface,
  inversePrimary: c.accentMuted,
  surfaceTint: c.accent,
  shadow: c.shadow,
  scrim: c.scrim,

  elevation_1: 0.95,
  elevation_2: 0.92,
  elevation_3: 0.9,

  success: c.positive,
  bgSuccess: c.positiveSurface,
  info: c.info,
  destructive: c.destructive,
  destructiveSurface: c.destructiveSurface,

  error: c.neutral,
  onError: c.textOnAccent,
  errorContainer: c.neutralSurface,
  onErrorContainer: c.textPrimary,
  warning: c.neutral,
  warn: c.neutral,
  danger: c.neutral,

  grayColor: c.surfaceMuted,
  bgColor: c.surface,
  bg: c.surface,
  colorLink: c.accentAlt,

  text: {
    main: c.textPrimary,
    secondary: c.textSecondary,
  },
  button: {
    main: c.accent,
    secondary: c.neutral,
  },

  primaryColors: createColors(c.accent),
  onPrimaryColors: createColors(c.textOnAccent),
  secondaryColors: createColors(c.accentAlt),
  onSecondaryColors: createColors(c.textOnAccent),
  tertiaryColors: createColors(c.accentSoft),
  onTertiaryColors: createColors(c.textOnAccent),
  successColors: createColors(c.positive),
  warningColors: createColors(c.neutral),
  infoColors: createColors(c.info),
  errorColors: createColors(c.neutral),
  grayColors: createColors(c.neutral),

  getColor: (color: string, number: number) =>
    generateMaterialColorVariants(color, number),
  hexToRGB: (color: string, alpha: number) => hexToRGB(color, alpha),
});

export const AppStyle = buildAppStyle(lightColors, 'light');
