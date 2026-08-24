import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import HourglassCard from '../components/HourglassCard';
import Button from '@/shared/components/Button';
import { vi } from '@/i18n/vi';
import { findPersonsWithHourglass } from '@/db/repositories/personRepository';
import type { Person } from '@/db/schema';

function estimateVisitsRemaining(person: Person): number {
  if (person.birthYear == null) return 0;
  const currentYear = new Date().getFullYear();
  const age = currentYear - person.birthYear;
  const lifeExpectancy = 75;
  const yearsLeft = Math.max(0, lifeExpectancy - age);
  const visitsPerYear = person.desiredCadence ?? 2;
  return Math.round(yearsLeft * visitsPerYear);
}

export function HourglassScreen() {
  const [persons, setPersons] = useState<Person[]>([]);

  useEffect(() => {
    let cancelled = false;
    findPersonsWithHourglass()
      .then((data) => {
        if (!cancelled) setPersons(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  function handleHideCard(id: string): void {
    setPersons((prev) => prev.filter((p) => p.id !== id));
  }

  if (persons.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>{vi.hourglass.emptyTitle}</Text>
          <Text style={styles.emptyDescription}>
            {vi.hourglass.emptyDescription}
          </Text>
          <Button
            label={vi.hourglass.enableButton}
            onPress={() => {}}
            style={styles.enableButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={persons}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <HourglassCard
            person={item}
            estimatedVisitsRemaining={estimateVisitsRemaining(item)}
            onScheduleCall={() => {}}
            onHide={() => handleHideCard(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  enableButton: { width: '100%' },
  list: { padding: 16 },
});

export default HourglassScreen;
