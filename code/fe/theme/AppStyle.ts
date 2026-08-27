import Color from 'color';
// Đổi tên từ `global`: Metro bọc mỗi module trong `function (global, ...)`, nên
// khai một biến cùng tên ở đây là khai trùng tham số — bundle web chết ngay khi
// phân tích cú pháp, màn hình trắng không thông báo gì.
const baseStyle = {
  FONTSIZE: {
    small: 12,
    normal: 15,
    large: 20,
    h1: 20,
    h2: 15,
    h3: 10,
    hs: 20,
    icon: 20,
    title: 20,
    subTitle: 16,
    biggest: 25,
  },
  COLOR: {
    primary: 'white',
    secondary: '#B0A695',
    accent: 'green',
  },
  MARGIN: {
    groups: 10,
    elements: 20,
    screen: 10,
  },
  BORDER: {
    normal: 15,
    big: 20,
    small: 10,
  },
  PADDING: {
    normal: 7,
    big: 10,
    small: 3,
  },
};

const emotion_screen = {
  line_text_default_color: 'red',
};

const time_tracker = {
  work: '#99CCFF',
  family: '#FFA500',
  personal: '#800080',
  balance: '#008000',
  wasted: '#000000',
};

const colorHelper = {
  success: 'green',
  error: 'red',
  info: '#d9edf7',
  warn: 'orang',
};

const lightColorScheme = {
  brightness: 'light',
  primary: '#13b39f', //'#61dd95',
  onPrimary: '#FFFFFF',
  primaryContainer: '#7ed9ad',
  onPrimaryContainer: '#21005D',
  secondary: '#ff912e',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#f9d273',
  onSecondaryContainer: '#1D192B',
  tertiary: '#0db2fe',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#87d9fe',
  onTertiaryContainer: '#31111D',
  error: '#f6726e',
  onError: '#FFFFFF',
  errorContainer: '#fbb9ad',
  onErrorContainer: '#410E0B',
  outline: '#79747E',
  background: '#e4eff5',
  onBackground: '#000000',
  surface: '#d3e1ec',
  onSurface: '#F3EEEA',
  surfaceContainer: '#F3EEEA',
  onSurfaceContainer: '#FFFFFF',
  surfaceVariant: '#E7E0EC',
  onSurfaceVariant: '#49454F',
  inverseSurface: '#313033',
  onInverseSurface: '#F4EFF4',
  inversePrimary: '#D0BCFF',
  shadow: '#000000',
  surfaceTint: '#6750A4',
  outlineVariant: '#CAC4D0',
  scrim: '#000000',
  elevation_1: 0.95,
  elevation_2: 0.92,
  elevation_3: 0.9,
};

const lightColorSchemeV2 = {
  brightness: 'light',
  primary: '#13b39f', //'#61dd95',
  onPrimary: '#FFFFFF',
  primaryContainer: '#7ed9ad',
  onPrimaryContainer: '#21005D',
  secondary: '#ff912e',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#f9d273',
  onSecondaryContainer: '#1D192B',
  tertiary: '#0db2fe',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#87d9fe',
  onTertiaryContainer: '#31111D',
  error: '#f6726e',
  onError: '#FFFFFF',
  errorContainer: '#fbb9ad',
  onErrorContainer: '#410E0B',

  outline: '#CAC4D0',

  background: '#F8F4E1',
  onBackground: '#000000',

  surface: '#F3EEEA',
  onSurface: '#000000',
  surfaceContainer: '#F3EEEA',
  onSurfaceContainer: '#333333',
  surfaceVariant: '#E7E0EC',
  onSurfaceVariant: '#49454F',
  inverseSurface: '#313033',
  onInverseSurface: '#F4EFF4',
  inversePrimary: '#D0BCFF',
  shadow: '#000000',
  surfaceTint: '#6750A4',
  outlineVariant: '#CAC4D0',
  scrim: '#000000',
  elevation_1: 0.95,
  elevation_2: 0.92,
  elevation_3: 0.9,
};
const home_screen = {
  background: lightColorScheme.background,
  surface: lightColorScheme.surface,
  surface_border: lightColorScheme.surfaceVariant,

  caption_title: lightColorScheme.primary,
  caption_subTitle: lightColorScheme.secondary,

  statistic_container: lightColorScheme.background,
  statistic_container_border: lightColorScheme.outlineVariant,
  statistic_group_warn: lightColorScheme.error,
  statistic_lineString_text: lightColorScheme.primary,
};
function hexToRGB(hex, alpha) {
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
/*
function generateMaterialColorVariants2(color: string, number: number): string | null {
  // Ensure the number is within the valid range
  if (number < 100 || number > 900 || (number % 100 !== 0)) {
    console.error('Invalid number. Please enter a number between 100 and 900, in increments of 100.');
    return null;
  }

  // Parse the color string to extract the RGB values
  const baseColor = color.substring(1);
  const baseRed = parseInt(baseColor.substring(0, 2), 16);
  const baseGreen = parseInt(baseColor.substring(2, 4), 16);
  const baseBlue = parseInt(baseColor.substring(4, 6), 16);

  // Calculate the step size for each color component
  const stepSize: number = 255 / 8;

  // Calculate the index based on the given number
  const index: number = (900 - number) / 100;

  // Calculate the RGB values for the variant
  const red: number = Math.round(baseRed + index * stepSize);
  const green: number = Math.round(baseGreen + index * stepSize);
  const blue: number = Math.round(baseBlue + index * stepSize);

  return `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
}
*/

export function convertHex(hexCode, opacity = 1) {
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

function generateMaterialColorVariants(
  color: string,
  number: number,
): string | null {
  // Ensure the number is within the valid range
  if (number < 100 || number > 900 || number % 100 !== 0) {
    console.error(
      'Invalid number. Please enter a number between 100 and 900, in increments of 100.',
    );
    return null;
  }

  // Parse the color using the `color` library
  const baseColor = Color(color);

  // Define lightness adjustment factors for each variant
  const lightnessFactors = {
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

  // Calculate the lightness factor based on the provided number
  const factor = lightnessFactors[number];

  // Adjust the lightness of the color
  const adjustedColor = baseColor
    .hsl()
    .lightness(baseColor.lightness() * factor);

  // Return the adjusted color as a hex string
  return adjustedColor.hex();
}

const createColors = (baseColor) => {
  return {
    //50: generateMaterialColorVariants(baseColor,50),
    100: generateMaterialColorVariants(baseColor, 100),
    200: generateMaterialColorVariants(baseColor, 200),
    300: generateMaterialColorVariants(baseColor, 300),
    400: generateMaterialColorVariants(baseColor, 400),
    500: generateMaterialColorVariants(baseColor, 500),
    600: generateMaterialColorVariants(baseColor, 600),
    700: generateMaterialColorVariants(baseColor, 700),
    800: generateMaterialColorVariants(baseColor, 800),
    900: generateMaterialColorVariants(baseColor, 900),
  };
};

const primary = '#0E4274',
  onPrimary = '#FAEBEF';
const secondary = '#f57c20',
  onSecondary = '#ffffff';
const success = '#198754',
  warning = '#ffc107',
  info = '#0dcaf0',
  error = '#dc3545';
const tertiary = '#d4c6a1',
  onTertiary = '#ffffff';
const gray = '#808080';
const colorLink = '#0E65FF';

export const AppStyle = {
  ...baseStyle,
  ...colorHelper,
  ...lightColorScheme,
  ...lightColorSchemeV2,

  grayColor: '#e9ecef',
  bgColor: '#ffffff',

  colorLink,
  text: {
    main: '#000000',
    secondary: '#e9ecef',
  },
  button: {
    main: primary,
    secondary: '#757575',
  },

  primaryColors: createColors(primary),
  onPrimaryColors: createColors(onPrimary),
  secondaryColors: createColors(secondary),
  onSecondaryColors: createColors(onSecondary),
  tertiaryColors: createColors(tertiary),
  onTertiaryColors: createColors(onTertiary),

  successColors: createColors(success),
  warningColors: createColors(warning),
  infoColors: createColors(info),
  errorColors: createColors(error),
  grayColors: createColors(gray),

  primary,
  primary10: hexToRGB(primary, 0.1),
  primary30: hexToRGB(primary, 0.3),
  primary70: hexToRGB(primary, 0.7),
  secondary,
  tertiary,
  bg: '#ffffff',
  surface: '#eeeeee',

  onPrimary,
  onSecondary,

  onTertiary,
  success,
  bgSuccess: hexToRGB(createColors(success)[100], 0.2),
  warning,
  info,
  error,

  getColor: (color: string, number: number) =>
    generateMaterialColorVariants(color, number),
  hexToRGB: (color: string, alpha: number) => hexToRGB(color, alpha),
  time_tracker,
  emotion_screen,
  home_screen,
};
