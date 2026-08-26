import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { vi } from '@/i18n/vi';
import { colors, fontSize } from '@/shared/theme/tokens';
import { formatVND } from '@/shared/utils/format';
import type { ExpenseWithCost } from '../hooks/useMoneyData';

interface ExpenseRowProps {
  item: ExpenseWithCost;
}

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

export function ExpenseRow({ item }: ExpenseRowProps) {
  const parts: string[] = [];
  if (item.hoursCost !== null) {
    parts.push(vi.money.expenseHoursCost(roundToTenth(item.hoursCost)));
  }
  if (item.freedomDaysCost !== null) {
    parts.push(vi.money.expenseFreedomCost(roundToTenth(item.freedomDaysCost)));
  }

  return (
    <View style={styles.row}>
      <View style={styles.main}>
        <Text style={styles.description} numberOfLines={1}>
          {item.expense.description}
        </Text>
        {parts.length > 0 && (
          <Text style={styles.conversion}>{parts.join(' · ')}</Text>
        )}
      </View>
      <Text style={styles.amount}>{formatVND(item.expense.amount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  main: { flex: 1, paddingRight: 12 },
  description: {
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  conversion: {
    fontSize: fontSize.meta,
    color: colors.textSecondary,
    marginTop: 3,
  },
  amount: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

export default ExpenseRow;
