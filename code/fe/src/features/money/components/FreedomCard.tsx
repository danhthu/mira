import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '@/shared/components/Card';
import DataState from '@/shared/components/DataState';
import { vi } from '@/i18n/vi';
import { colors, fontSize } from '@/shared/theme/tokens';
import type { FreedomCapitalResult } from '@/core/freedomCapital';
import type { FreedomMonthsDisplay } from '@/core/freedomCapital';

interface FreedomCardProps {
  result: FreedomCapitalResult;
}

function freedomLine(display: FreedomMonthsDisplay): string {
  if (display.unit === 'days') {
    return vi.money.freedomDays(display.value);
  }
  if (display.unit === 'months') {
    return vi.money.freedomMonths(display.value);
  }
  return vi.money.freedomYears(display.value.toFixed(1));
}

export function FreedomCard({ result }: FreedomCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{vi.money.freedomTitle}</Text>

      {result.status === 'no_expense_data' && (
        <View style={styles.state}>
          <DataState message={vi.money.freedomNoData} />
        </View>
      )}

      {result.status === 'in_debt' && (
        // R-078: đang nợ thì tuyệt đối không hiện số âm. Khi chưa có khoản tiết
        // kiệm dương thì cũng không có quãng đường để đo, chỉ nói trạng thái hiện tại.
        <Text style={styles.line}>
          {result.distanceMonths === null
            ? vi.money.freedomInDebtNoSaving
            : vi.money.freedomInDebt(Math.round(result.distanceMonths))}
        </Text>
      )}

      {result.status === 'ok' && (
        <>
          {result.freedomDaysGained !== null && (
            <Text style={styles.delta}>
              {vi.money.daysGained(Math.round(result.freedomDaysGained))}
            </Text>
          )}
          <Text style={styles.line}>{freedomLine(result.display)}</Text>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginBottom: 12 },
  title: {
    fontSize: fontSize.meta,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  // Delta tự do là con số to nhất màn hình (03-formulas.md mục 3), không phải
  // tổng số tháng — nó khả thi cả với người mới bắt đầu.
  delta: {
    fontSize: fontSize.display,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 34,
    marginBottom: 6,
  },
  line: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  state: { minHeight: 96, justifyContent: 'center' },
});

export default FreedomCard;
