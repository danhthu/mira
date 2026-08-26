import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '@/shared/components/Card';
import DataState from '@/shared/components/DataState';
import { vi } from '@/i18n/vi';
import { colors, fontSize } from '@/shared/theme/tokens';
import { formatVND } from '@/shared/utils/format';
import type { LifeRateResult } from '@/core/lifeRate';

interface LifeRateCardProps {
  result: LifeRateResult;
}

export function LifeRateCard({ result }: LifeRateCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{vi.money.lifeRateTitle}</Text>
      {result.status === 'ok' ? (
        <Text style={styles.value}>
          {vi.money.lifeRatePerHour(formatVND(Math.round(result.ratePerHour)))}
        </Text>
      ) : (
        <View style={styles.state}>
          <DataState
            message={
              result.status === 'no_work_hours'
                ? vi.money.lifeRateNoWorkHours
                : vi.money.lifeRateNoData
            }
          />
        </View>
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
  value: {
    fontSize: fontSize.heading,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  // DataState dùng flex:1 nên cần một khung có chiều cao tối thiểu để nó nở ra.
  state: { minHeight: 96, justifyContent: 'center' },
});

export default LifeRateCard;
