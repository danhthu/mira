import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import { vi } from '@/i18n/vi';
import { colors, fontSize } from '@/shared/theme/tokens';
import { formatVND } from '@/shared/utils/format';
import { calculateGoalCost, goalExpiry } from '@/core/goalCost';
import type { Goal } from '@/db/schema';

interface GoalCardProps {
  goal: Goal;
  monthlyExpense: number;
  today: string;
  onRelease: (goal: Goal) => void;
}

export function GoalCard({ goal, monthlyExpense, today, onRelease }: GoalCardProps) {
  const cost = calculateGoalCost(goal, monthlyExpense);
  const expiry = goalExpiry(goal.expiresAt, today);
  const isReleased = goal.status === 'released';
  const isExpired = goal.status === 'expired';
  const isRunning = !isReleased && !isExpired;

  return (
    <Card style={styles.card}>
      <Text style={[styles.title, isExpired && styles.mutedTitle]}>{goal.title}</Text>

      {cost.status === 'ok' && (
        <View style={styles.costs}>
          {cost.hoursPerWeek > 0 && (
            <Text style={styles.costLine}>{vi.goals.costHours(cost.hoursPerWeek)}</Text>
          )}
          {cost.amountPerMonth > 0 && (
            <Text style={styles.costLine}>
              {vi.goals.costMoney(formatVND(cost.amountPerMonth))}
            </Text>
          )}
          {cost.freedomDelayDays !== null && cost.freedomDelayDays > 0 && (
            <Text style={styles.costLine}>
              {vi.goals.freedomDelay(cost.freedomDelayDays)}
            </Text>
          )}
        </View>
      )}

      {isRunning && expiry.status === 'running' && (
        <Text style={styles.expiry}>{vi.goals.expiresIn(expiry.daysLeft)}</Text>
      )}

      {isReleased && (
        <View style={styles.releasedBlock}>
          <Text style={styles.releasedLabel}>{vi.goals.released}</Text>
          {goal.releaseReason !== null && (
            <Text style={styles.releasedReason}>{goal.releaseReason}</Text>
          )}
        </View>
      )}

      {isRunning && (
        <Button
          label={vi.goals.release}
          onPress={() => onRelease(goal)}
          variant="ghost"
          style={styles.releaseButton}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginBottom: 12 },
  title: {
    fontSize: fontSize.bodyLarge,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  // Hết hạn chỉ là hết hạn: xám trung tính, không phải màu cảnh báo.
  mutedTitle: { color: colors.textMuted },
  costs: { marginTop: 8, gap: 2 },
  costLine: { fontSize: fontSize.meta, color: colors.textSecondary },
  expiry: { fontSize: fontSize.caption, color: colors.textMuted, marginTop: 8 },
  releasedBlock: { marginTop: 8 },
  // Buông là việc đáng mừng, nên dùng màu nhấn chứ không phải màu mờ đi.
  releasedLabel: { fontSize: fontSize.meta, fontWeight: '600', color: colors.accent },
  releasedReason: { fontSize: fontSize.meta, color: colors.textSecondary, marginTop: 2 },
  releaseButton: { alignSelf: 'flex-start', paddingHorizontal: 0, paddingBottom: 0 },
});

export default GoalCard;
