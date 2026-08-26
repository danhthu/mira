import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MonoText from './MonoText';
import { colors, fontSize, spacing } from '@/shared/theme/tokens';

export interface StatItem {
  label: string;
  value: string;
  subLabel?: string;
  color?: string;
}

interface StatStripProps {
  /** Ba ô là cố định: bốn ô trở lên thì chữ nhãn bị cắt trên màn hình hẹp. */
  stats: [StatItem, StatItem, StatItem];
}

/** Hàng ba chỉ số đặt dưới chân một khối nội dung. Giá trị luôn là MonoText. */
export function StatStrip({ stats }: StatStripProps) {
  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <React.Fragment key={stat.label}>
          {index > 0 && <View style={styles.divider} />}
          <View style={styles.cell}>
            <MonoText size="title" bold color={stat.color} style={styles.value}>
              {stat.value}
            </MonoText>
            <Text style={styles.label}>{stat.label}</Text>
            {stat.subLabel !== undefined && <Text style={styles.subLabel}>{stat.subLabel}</Text>}
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  divider: {
    width: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.xs,
  },
  value: {
    textAlign: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: fontSize.micro,
    color: colors.textMuted,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  subLabel: {
    fontSize: fontSize.micro,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 1,
  },
});

export default StatStrip;
