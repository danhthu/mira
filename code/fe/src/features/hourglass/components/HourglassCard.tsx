import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import Avatar from '@/shared/components/Avatar';
import { vi } from '@/i18n/vi';
import type { Person } from '@/db/schema';

interface HourglassCardProps {
  person: Person;
  estimatedVisitsRemaining: number;
  onScheduleCall: () => void;
  onHide: () => void;
}

export function HourglassCard({
  person,
  estimatedVisitsRemaining,
  onScheduleCall,
  onHide,
}: HourglassCardProps) {
  const cadencePerYear = person.desiredCadence != null
    ? person.desiredCadence * 12
    : 0;

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

      <Text style={styles.visitsLeft}>
        {vi.hourglass.visitsLeft(estimatedVisitsRemaining)}
      </Text>

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
    color: '#1A1A2E',
  },
  cadence: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  visitsLeft: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: '#9CA3AF',
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
