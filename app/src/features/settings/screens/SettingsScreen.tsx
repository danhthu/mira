import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import PersonSettingRow from '../components/PersonSettingRow';
import Button from '@/shared/components/Button';
import { vi } from '@/i18n/vi';
import { findAllPersons, updatePersonHourglass } from '@/db/repositories/personRepository';
import { useSettingsStore } from '@/store/settingsStore';
import type { Person } from '@/db/schema';

export function SettingsScreen() {
  const [persons, setPersons] = useState<Person[]>([]);
  const { curfewHour, whiteDayOfWeek } = useSettingsStore();

  useEffect(() => {
    let cancelled = false;
    findAllPersons()
      .then((data) => {
        if (!cancelled) setPersons(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleToggleHourglass(
    personId: string,
    enabled: boolean,
  ): Promise<void> {
    await updatePersonHourglass(personId, enabled);
    setPersons((prev) =>
      prev.map((p) =>
        p.id === personId ? { ...p, hourglassEnabled: enabled } : p,
      ),
    );
  }

  function handleDeleteAll(): void {
    Alert.alert(
      vi.settings.deleteAll,
      vi.settings.deleteConfirm,
      [
        { text: vi.common.ok, style: 'cancel' },
        {
          text: vi.settings.deleteButton,
          style: 'destructive',
          onPress: () => {},
        },
      ],
    );
  }

  const curfewDisplay = `${String(curfewHour).padStart(2, '0')}:00`;
  const whiteDayDisplay =
    whiteDayOfWeek != null
      ? ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'][whiteDayOfWeek] ?? vi.settings.whiteDayOff
      : vi.settings.whiteDayOff;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>{vi.settings.people}</Text>
        <View style={styles.section}>
          {persons.map((person) => (
            <PersonSettingRow
              key={person.id}
              person={person}
              onToggleHourglass={(enabled) =>
                void handleToggleHourglass(person.id, enabled)
              }
            />
          ))}
          <Button
            label={vi.settings.addPerson}
            onPress={() => {}}
            variant="ghost"
            style={styles.addButton}
          />
        </View>

        <Text style={styles.sectionTitle}>{vi.settings.curfew}</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{vi.settings.curfew}</Text>
            <Text style={styles.rowValue}>{curfewDisplay}</Text>
          </View>
          <Text style={styles.hint}>{vi.settings.curfewHint}</Text>
        </View>

        <Text style={styles.sectionTitle}>{vi.settings.whiteDay}</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{vi.settings.whiteDay}</Text>
            <Text style={styles.rowValue}>{whiteDayDisplay}</Text>
          </View>
          <Text style={styles.hint}>{vi.settings.whiteDayHint}</Text>
        </View>

        <Text style={styles.sectionTitle}>{vi.settings.data}</Text>
        <View style={styles.section}>
          <Button
            label={vi.settings.exportJson}
            onPress={() => {}}
            variant="secondary"
            style={styles.dataButton}
          />
          <Button
            label={vi.settings.deleteAll}
            onPress={handleDeleteAll}
            variant="ghost"
            style={[styles.dataButton, styles.deleteButton]}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { paddingBottom: 40 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLabel: {
    fontSize: 15,
    color: '#1A1A2E',
  },
  rowValue: {
    fontSize: 15,
    color: '#6B7280',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    lineHeight: 18,
  },
  addButton: { marginHorizontal: 16, marginVertical: 12 },
  dataButton: { marginHorizontal: 16, marginVertical: 6 },
  deleteButton: { marginBottom: 12 },
});

export default SettingsScreen;
