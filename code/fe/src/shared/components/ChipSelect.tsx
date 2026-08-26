import React from 'react';
import { View, Text, StyleSheet, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fontSize, spacing } from '@/shared/theme/tokens';

export interface ChipOption {
  id: string;
  label: string;
}

interface ChipSelectProps {
  options: readonly ChipOption[];
  /** Id đang chọn. Nguồn sự thật nằm ở nơi gọi, component này không giữ state. */
  selectedIds: readonly string[];
  onToggle: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Chọn nhiều mục bằng cách chạm vào từng thẻ.
 *
 * Không giữ state bên trong — bản Batify 2024 làm thế và dính hai lỗi cùng lúc:
 * danh sách nội bộ không bao giờ nạp từ props nên mục đã chọn sẵn không hiện
 * ra, và thẻ được render bằng `View` thường nên chạm vào không có gì xảy ra.
 */
export function ChipSelect({ options, selectedIds, onToggle, style }: ChipSelectProps) {
  return (
    <View style={[styles.wrap, style]}>
      {options.map((option) => {
        const selected = selectedIds.includes(option.id);

        return (
          <Pressable
            key={option.id}
            onPress={() => onToggle(option.id)}
            style={[styles.chip, selected && styles.chipSelected]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={option.label}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSurface,
  },
  label: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
});

export default ChipSelect;
