import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Avatar from '@/shared/components/Avatar';
import { formatMinutes } from '@/shared/utils/format';
import type { Person } from '@/db/schema';

interface PersonTimeRowProps {
  person: Person;
  minutesToday: number;
}

export function PersonTimeRow({ person, minutesToday }: PersonTimeRowProps) {
  return (
    <View style={styles.container}>
      <Avatar name={person.name} size={44} />
      <View style={styles.content}>
        <Text style={styles.name}>{person.name}</Text>
        <Text style={styles.time}>{formatMinutes(minutesToday)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  time: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default PersonTimeRow;
