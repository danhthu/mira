import React from 'react';
import { View, Text, StyleSheet, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fontSize, spacing } from '@/shared/theme/tokens';

export interface CheckListItem {
  id: string;
  label: string;
  done: boolean;
  /** Dòng phụ, ví dụ ngày dự kiến của một cột mốc. */
  note?: string;
}

interface CheckListProps {
  items: readonly CheckListItem[];
  onToggle: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

/** Danh sách việc con tick được, dùng cho cột mốc của một mục tiêu. */
export function CheckList({ items, onToggle, style }: CheckListProps) {
  return (
    <View style={style}>
      {items.map((item, index) => (
        <Pressable
          key={item.id}
          onPress={() => onToggle(item.id)}
          style={[styles.row, index < items.length - 1 && styles.divided]}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: item.done }}
          accessibilityLabel={item.label}
        >
          <View style={[styles.box, item.done && styles.boxDone]}>
            {item.done && <Text style={styles.mark}>✓</Text>}
          </View>

          <View style={styles.texts}>
            {/*
              Việc đã xong chỉ đổi sang chữ nhạt, không gạch ngang và không đổi
              màu cảnh báo: đây là ghi nhận, không phải chấm điểm.
            */}
            <Text style={[styles.label, item.done && styles.labelDone]}>{item.label}</Text>
            {item.note !== undefined && <Text style={styles.note}>{item.note}</Text>}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const BOX_SIZE = 22;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  divided: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.controlTrackOff,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxDone: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  mark: {
    color: colors.textOnAccent,
    fontSize: fontSize.caption,
    fontWeight: '700',
  },
  texts: {
    flex: 1,
  },
  label: {
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  labelDone: {
    color: colors.textMuted,
  },
  note: {
    fontSize: fontSize.meta,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default CheckList;
