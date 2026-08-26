import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { vi } from '@/i18n/vi';
import { colors, fontSize, radius } from '@/shared/theme/tokens';
import { formatVND } from '@/shared/utils/format';
import type { Item } from '@/db/schema';
import { costPerUse } from '../itemCost';

interface ItemRowProps {
  item: Item;
  onMarkUsed: (id: string) => void;
  onRelease: (id: string) => void;
}

export function ItemRow({ item, onMarkUsed, onRelease }: ItemRowProps) {
  const perUse = costPerUse(item.price, item.useCount);

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>{vi.items.useCount(item.useCount)}</Text>
        {perUse !== null && (
          <Text style={styles.meta}>{vi.items.costPerUse(formatVND(perUse))}</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.useButton}
        onPress={() => onMarkUsed(item.id)}
        activeOpacity={0.75}
      >
        {/* Dấu +1 thay cho chữ: i18n chưa có nhãn cho nút cộng lượt dùng. */}
        <Text style={styles.useButtonLabel}>+1</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.releaseButton}
        onPress={() => onRelease(item.id)}
        activeOpacity={0.75}
      >
        <Text style={styles.releaseLabel}>{vi.items.release}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  info: { flex: 1 },
  name: {
    fontSize: fontSize.bodyLarge,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: fontSize.meta,
    color: colors.textSecondary,
    marginTop: 2,
  },
  useButton: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  useButtonLabel: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.accent,
  },
  releaseButton: { paddingVertical: 8 },
  releaseLabel: {
    fontSize: fontSize.meta,
    color: colors.textSecondary,
  },
});

export default ItemRow;
