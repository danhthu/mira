import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import SectionLabel from './SectionLabel';
import { colors, spacing } from '@/shared/theme/tokens';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  /** Câu ngắn dưới tiêu đề, dùng khi tiêu đề chưa đủ nói khối này để làm gì. */
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Khối nội dung có tiêu đề, dùng để nhóm các hàng nhập liệu trong một màn. */
export function Section({ title, children, footer, style }: SectionProps) {
  return (
    <View style={[styles.container, style]}>
      <SectionLabel style={styles.title}>{title}</SectionLabel>
      <View style={styles.body}>{children}</View>
      {footer !== undefined && <View style={styles.footer}>{footer}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.sm,
  },
  body: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
  },
  footer: {
    marginTop: spacing.sm,
  },
});

export default Section;
