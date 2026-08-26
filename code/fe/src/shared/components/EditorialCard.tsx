import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import SectionLabel from './SectionLabel';
import StatStrip, { type StatItem } from './StatStrip';
import { colors, fontSize, spacing } from '@/shared/theme/tokens';
import type { MetricState } from '@/shared/types/metricState';

interface EditorialCardProps {
  /** Kỳ mà con số nói tới: "TUẦN NÀY", "THÁNG 8". */
  periodLabel: string;
  /** Một câu, là thứ người dùng đọc trước tiên. */
  headline: string;
  body?: string;
  stats?: [StatItem, StatItem, StatItem];
  children?: React.ReactNode;
  accentColor?: string;
  /**
   * Chỉ dùng để nói dữ liệu còn thiếu gì. Không có biến thể nào đánh giá người
   * dùng — xem lý do trong `shared/types/metricState.ts`.
   */
  state?: MetricState;
}

/** Khối nội dung chính của một màn hình: nhãn kỳ, một câu, rồi ba chỉ số. */
export function EditorialCard({
  periodLabel,
  headline,
  body,
  stats,
  children,
  accentColor,
  state,
}: EditorialCardProps) {
  return (
    <Card>
      <View style={styles.header}>
        <SectionLabel color={accentColor}>{periodLabel}</SectionLabel>
        {state?.kind === 'needs-more' && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{state.reason}</Text>
          </View>
        )}
      </View>

      <Text style={[styles.headline, accentColor !== undefined && { color: accentColor }]}>
        {headline}
      </Text>

      {body !== undefined && <Text style={styles.body}>{body}</Text>}

      {children}

      {stats !== undefined && (
        <View style={styles.stats}>
          <StatStrip stats={stats} />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: colors.borderSubtle,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginLeft: spacing.sm,
    flexShrink: 1,
  },
  badgeText: {
    fontSize: fontSize.micro,
    // Xám, không cam không đỏ: đây là ghi chú về dữ liệu, không phải cảnh báo.
    color: colors.textSecondary,
  },
  headline: {
    fontSize: fontSize.headline,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 30,
    marginBottom: spacing.xs,
  },
  body: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  stats: {
    marginTop: spacing.xs,
  },
});

export default EditorialCard;
