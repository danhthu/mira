import React from 'react';
import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { colors, fontSize } from '@/shared/theme/tokens';

interface SectionLabelProps {
  children: string;
  color?: string;
  style?: StyleProp<TextStyle>;
}

/** Nhãn nhỏ in hoa đặt trên đầu một khối nội dung: "TUẦN NÀY", "THÁNG 8". */
export function SectionLabel({ children, color, style }: SectionLabelProps) {
  return (
    <Text style={[styles.label, color !== undefined && { color }, style]}>
      {children.toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: fontSize.micro,
    color: colors.textMuted,
    letterSpacing: 1.6,
    fontWeight: '600',
  },
});

export default SectionLabel;
