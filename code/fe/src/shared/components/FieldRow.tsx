import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, fontSize, spacing } from '@/shared/theme/tokens';

interface FieldRowProps {
  label: string;
  /** Giá trị đang chọn. Bỏ trống thì hàng hiện như chưa ai đụng tới. */
  value?: string;
  onPress?: () => void;
  /** Nút xoá giá trị. Chỉ hiện khi hàng đang có giá trị. */
  onClear?: { label: string; onPress: () => void };
  /** Hàng cuối trong một Section thì không cần vạch kẻ dưới. */
  isLast?: boolean;
}

/**
 * Một hàng trong biểu mẫu: nhãn bên trái, giá trị bên phải, xoá được.
 *
 * Tách riêng vì đây là khuôn lặp lại ở mọi ô nhập — bản Batify 2024 chép tay
 * khuôn này mười một lần trong `Common/FormControls`, nên mỗi ô lại lệch nhau
 * một chút về chiều cao và về chỗ đặt nút xoá.
 */
export function FieldRow({ label, value, onPress, onClear, isLast = false }: FieldRowProps) {
  const hasValue = value !== undefined && value !== '';

  return (
    <View style={[styles.row, !isLast && styles.divided]}>
      <Pressable
        style={styles.main}
        onPress={onPress}
        disabled={onPress === undefined}
        accessibilityRole={onPress === undefined ? undefined : 'button'}
        accessibilityLabel={label}
        accessibilityValue={hasValue ? { text: value } : undefined}
      >
        <Text style={styles.label}>{label}</Text>
        {hasValue && <Text style={styles.value}>{value}</Text>}
      </Pressable>

      {hasValue && onClear !== undefined && (
        <Pressable
          onPress={onClear.onPress}
          style={styles.clear}
          accessibilityRole="button"
          accessibilityLabel={onClear.label}
          hitSlop={spacing.sm}
        >
          <Text style={styles.clearMark}>×</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  divided: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  label: {
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  value: {
    flexShrink: 1,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  clear: {
    paddingLeft: spacing.sm,
  },
  clearMark: {
    fontSize: fontSize.heading,
    color: colors.textMuted,
    lineHeight: fontSize.heading + 2,
  },
});

export default FieldRow;
