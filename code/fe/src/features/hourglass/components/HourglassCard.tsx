import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import Avatar from '@/shared/components/Avatar';
import { vi } from '@/i18n/vi';
import { colors, fontSize } from '@/shared/theme/tokens';
import type { Person } from '@/db/schema';
import type { HourglassResult } from '@/core/hourglass';

interface HourglassCardProps {
  person: Person;
  result: HourglassResult;
  onScheduleCall: () => void;
  onHide: () => void;
}

export function HourglassCard({
  person,
  result,
  onScheduleCall,
  onHide,
}: HourglassCardProps) {
  const cadencePerYear = person.desiredCadence != null
    ? person.desiredCadence * 12
    : 0;

  const headline =
    result.type === 'child'
      ? vi.hourglass.hoursLeft(result.hoursLeft)
      : vi.hourglass.visitsLeft(result.visitsLeft);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Avatar name={person.name} size={40} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{person.name}</Text>
          {cadencePerYear > 0 && (
            <Text style={styles.cadence}>
              {vi.hourglass.meetingsPerYear(cadencePerYear)}
            </Text>
          )}
        </View>
      </View>

      <Text style={styles.visitsLeft}>{headline}</Text>

      <Text style={styles.disclaimer}>{vi.hourglass.disclaimer}</Text>

      <View style={styles.actions}>
        <Button
          label={vi.hourglass.scheduleCall}
          onPress={onScheduleCall}
          style={styles.actionButton}
        />
        <Button
          label={vi.hourglass.hideCard}
          onPress={onHide}
          variant="ghost"
          style={styles.actionButton}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: { flex: 1, marginLeft: 12 },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cadence: {
    fontSize: fontSize.meta,
    color: colors.textSecondary,
    marginTop: 2,
  },
  visitsLeft: {
    fontSize: fontSize.heading,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  disclaimer: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: { flex: 1 },
});

export default HourglassCard;
