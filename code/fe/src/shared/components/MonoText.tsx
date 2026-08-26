import React from 'react';
import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { colors, fontFamily, fontSize } from '@/shared/theme/tokens';

interface MonoTextProps {
  children: React.ReactNode;
  size?: keyof typeof fontSize;
  color?: string;
  bold?: boolean;
  style?: StyleProp<TextStyle>;
}

/**
 * Mọi con số, phần trăm và số tiền đi qua đây, không dùng Text thường.
 *
 * Lý do là `tabular-nums`: font tỷ lệ vẽ chữ số 1 hẹp hơn chữ số 8, nên một cột
 * số thay đổi theo thời gian (giờ vàng tuần này, số dư tháng này) sẽ nhảy qua
 * nhảy lại mỗi lần cập nhật. Chữ số cùng bề rộng thì cột số đứng yên.
 */
export function MonoText({ children, size = 'body', color, bold = false, style }: MonoTextProps) {
  return (
    <Text
      style={[
        styles.base,
        { fontSize: fontSize[size], color: color ?? colors.textPrimary },
        bold && styles.bold,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: fontFamily.mono,
    fontVariant: ['tabular-nums'],
    fontWeight: '400',
  },
  bold: {
    fontWeight: '700',
  },
});

export default MonoText;
