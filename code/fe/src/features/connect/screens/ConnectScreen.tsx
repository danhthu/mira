import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import PersonRingRow from '../components/PersonRingRow';
import {
  daysBetween,
  findLastMetDate,
  groupByRing,
  pickMeetingSuggestion,
  toExpectedIntervalDays,
} from '../logic/relationship';
import type { RelationshipStatus } from '../logic/relationship';
import Avatar from '@/shared/components/Avatar';
import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import DataState from '@/shared/components/DataState';
import { vi } from '@/i18n/vi';
import { colors, fontSize, radius } from '@/shared/theme/tokens';
import { findAllPersons } from '@/db/repositories/personRepository';
import {
  createTimeEntry,
  findEntriesByPersonId,
} from '@/db/repositories/timeEntryRepository';
import { todayYMD } from '@/shared/utils/date';
import type { Person } from '@/db/schema';
import type { DunbarRing } from '@/shared/types';

const RING_LABELS: Record<DunbarRing, string> = {
  5: vi.connect.ringInner,
  15: vi.connect.ringMiddle,
  50: vi.connect.ringOuter,
};

// Nhật ký gặp gỡ vẫn phải sinh ra một time_entry để nhiệt kế lần sau có mốc, mà
// time_entry bắt buộc có số phút. Ba lựa chọn một chạm thay cho ô nhập số.
const DURATION_OPTIONS: ReadonlyArray<{ minutes: number; label: string }> = [
  { minutes: 30, label: vi.today.duration30m },
  { minutes: 60, label: vi.today.duration1h },
  { minutes: 120, label: vi.today.duration2h },
];
const DEFAULT_LOG_MINUTES = 60;

async function buildStatus(
  person: Person,
  today: string,
): Promise<RelationshipStatus> {
  const entries = await findEntriesByPersonId(person.id);
  const lastMet = findLastMetDate(entries);
  return {
    person,
    daysSinceLastMet: lastMet === null ? null : daysBetween(lastMet, today),
    expectedIntervalDays: toExpectedIntervalDays(person.desiredCadence),
  };
}

export function ConnectScreen() {
  const [statuses, setStatuses] = useState<RelationshipStatus[]>([]);
  const [logTarget, setLogTarget] = useState<Person | null>(null);
  const [logNote, setLogNote] = useState('');
  const [logMinutes, setLogMinutes] = useState<number>(DEFAULT_LOG_MINUTES);

  const load = useCallback(async () => {
    const persons = await findAllPersons();
    const today = todayYMD();
    setStatuses(await Promise.all(persons.map((p) => buildStatus(p, today))));
  }, []);

  useEffect(() => {
    void load().catch(() => {
      setStatuses([]);
    });
  }, [load]);

  function openLog(person: Person): void {
    setLogTarget(person);
    setLogNote('');
    setLogMinutes(DEFAULT_LOG_MINUTES);
  }

  async function handleSaveLog(person: Person): Promise<void> {
    const note = logNote.trim();
    await createTimeEntry({
      date: todayYMD(),
      minutes: logMinutes,
      bucket: 'people',
      personId: person.id,
      note: note === '' ? undefined : note,
    });
    setLogTarget(null);
    await load();
  }

  if (statuses.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <DataState message={vi.connect.emptyState} />
      </SafeAreaView>
    );
  }

  const suggestion = pickMeetingSuggestion(statuses);
  const groups = groupByRing(statuses);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.list}>
        {suggestion !== null && (
          <Card style={styles.suggestion}>
            <Text style={styles.suggestionQuestion}>
              {vi.connect.suggestMeeting}
            </Text>
            <View style={styles.suggestionPerson}>
              <Avatar name={suggestion.person.name} size={36} />
              <Text style={styles.suggestionName}>
                {suggestion.person.name}
              </Text>
            </View>
            <Button
              label={vi.connect.logMeeting}
              variant="secondary"
              onPress={() => openLog(suggestion.person)}
            />
          </Card>
        )}

        {groups.map((group) => (
          <View key={group.ring} style={styles.ring}>
            <Text style={styles.ringTitle}>{RING_LABELS[group.ring]}</Text>
            {group.members.map((status) => (
              <PersonRingRow
                key={status.person.id}
                status={status}
                onLogMeeting={() => openLog(status.person)}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={logTarget !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setLogTarget(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {logTarget !== null && (
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>{logTarget.name}</Text>
              <TextInput
                style={styles.noteInput}
                placeholder={vi.connect.logMeeting}
                value={logNote}
                onChangeText={setLogNote}
                autoFocus
              />
              <Text style={styles.durationLabel}>{vi.today.duration}</Text>
              <View style={styles.durationRow}>
                {DURATION_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.minutes}
                    style={[
                      styles.durationChip,
                      logMinutes === option.minutes && styles.durationChipOn,
                    ]}
                    onPress={() => setLogMinutes(option.minutes)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.durationChipLabel,
                        logMinutes === option.minutes &&
                          styles.durationChipLabelOn,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                <Button
                  label={vi.today.cancel}
                  onPress={() => setLogTarget(null)}
                  variant="ghost"
                  style={styles.modalActionButton}
                />
                <Button
                  label={vi.today.save}
                  onPress={() => void handleSaveLog(logTarget)}
                  style={styles.modalActionButton}
                />
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { paddingBottom: 32 },
  suggestion: { margin: 16 },
  suggestionQuestion: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  suggestionPerson: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    marginBottom: 16,
  },
  suggestionName: {
    fontSize: fontSize.bodyLarge,
    color: colors.textPrimary,
  },
  ring: { marginTop: 8 },
  ringTitle: {
    fontSize: fontSize.meta,
    fontWeight: '700',
    color: colors.textSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  noteInput: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: 14,
    fontSize: fontSize.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationLabel: {
    fontSize: fontSize.meta,
    color: colors.textLabel,
    marginTop: 16,
    marginBottom: 8,
  },
  durationRow: { flexDirection: 'row', gap: 8 },
  durationChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  durationChipOn: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSurface,
  },
  durationChipLabel: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
  },
  durationChipLabelOn: { color: colors.accent, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalActionButton: { flex: 1 },
});

export default ConnectScreen;
