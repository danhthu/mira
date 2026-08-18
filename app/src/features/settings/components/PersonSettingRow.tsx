import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import Avatar from '@/shared/components/Avatar';
import { vi } from '@/i18n/vi';
import type { Person } from '@/db/schema';

interface PersonSettingRowProps {
  person: Person;
  onToggleHourglass: (enabled: boolean) => void;
}

export function PersonSettingRow({
  person,
  onToggleHourglass,
}: PersonSettingRowProps) {
  const roleLabel =
    vi.settings.roles[person.role as keyof typeof vi.settings.roles] ??
    vi.settings.roles.other;

  return (
    <View style={styles.container}>
      <Avatar name={person.name} size={40} />
      <View style={styles.info}>
        <Text style={styles.name}>{person.name}</Text>
        <Text style={styles.role}>{roleLabel}</Text>
      </View>
      <View style={styles.toggle}>
        <Text style={styles.toggleLabel}>{vi.settings.hourglassToggle}</Text>
        <Switch
          value={person.hourglassEnabled}
          onValueChange={onToggleHourglass}
          trackColor={{ true: '#3B5BDB', false: '#D1D5DB' }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  role: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  toggle: {
    alignItems: 'center',
    gap: 4,
  },
  toggleLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});

export default PersonSettingRow;
