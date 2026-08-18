import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useTodayStore } from '../store/todayStore';
import { useTodayData } from '../hooks/useTodayData';
import PersonTimeRow from '../components/PersonTimeRow';
import Button from '@/shared/components/Button';
import { vi } from '@/i18n/vi';
import { createTimeEntry } from '@/db/repositories/timeEntryRepository';
import { createMoment } from '@/db/repositories/momentRepository';
import { todayYMD, getCurrentISOString } from '@/shared/utils/date';
import type { PersonWithTime } from '../store/todayStore';
import type { Person } from '@/db/schema';
import type { TimeBucket } from '@/shared/types';

const QUICK_DURATIONS: Array<{ label: string; minutes: number }> = [
  { label: vi.today.duration30m, minutes: 30 },
  { label: vi.today.duration1h, minutes: 60 },
  { label: vi.today.duration2h, minutes: 120 },
];

const PEOPLE_BUCKET: TimeBucket = 'people';

export function TodayScreen() {
  useTodayData();

  const { personsWithTime, isLoading, goldenMinutesToday } = useTodayStore();

  const [momentText, setMomentText] = useState('');
  const [quickLogVisible, setQuickLogVisible] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedMinutes, setSelectedMinutes] = useState<number>(30);

  const goldenHours = Math.floor(goldenMinutesToday / 60);

  const headline = isLoading
    ? vi.today.headlineLoading
    : vi.today.headline(goldenHours);

  async function handleMomentSubmit(): Promise<void> {
    const text = momentText.trim();
    if (!text) return;
    await createMoment({
      occurredAt: getCurrentISOString(),
      text,
      bucket: PEOPLE_BUCKET,
    });
    setMomentText('');
  }

  async function handleQuickLogSave(): Promise<void> {
    if (!selectedPerson) return;
    await createTimeEntry({
      date: todayYMD(),
      minutes: selectedMinutes,
      bucket: PEOPLE_BUCKET,
      personId: selectedPerson.id,
      source: 'manual',
    });
    setQuickLogVisible(false);
    setSelectedPerson(null);
  }

  function renderPersonRow({ item }: { item: PersonWithTime }) {
    return (
      <PersonTimeRow person={item.person} minutesToday={item.minutesToday} />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.headline}>{headline}</Text>

          <FlatList
            data={personsWithTime}
            keyExtractor={(item) => item.person.id}
            renderItem={renderPersonRow}
            style={styles.list}
            ListEmptyComponent={
              !isLoading ? (
                <Text style={styles.emptyText}>{vi.today.emptyState}</Text>
              ) : null
            }
          />

          <View style={styles.momentRow}>
            <TextInput
              style={styles.momentInput}
              placeholder={vi.today.momentPlaceholder}
              value={momentText}
              onChangeText={setMomentText}
              onSubmitEditing={() => void handleMomentSubmit()}
              returnKeyType="send"
              blurOnSubmit
            />
          </View>

          <View style={styles.actions}>
            <Button
              label={vi.today.quickLogButton}
              onPress={() => setQuickLogVisible(true)}
              variant="secondary"
              style={styles.actionButtonSecondary}
            />
            <Button
              label={vi.today.startButton}
              onPress={() => setQuickLogVisible(true)}
              style={styles.actionButtonPrimary}
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={quickLogVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setQuickLogVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{vi.today.withWho}</Text>

            {personsWithTime.length === 0 ? (
              <Text style={styles.emptyText}>{vi.today.emptyState}</Text>
            ) : (
              personsWithTime.map((item) => (
                <TouchableOpacity
                  key={item.person.id}
                  style={[
                    styles.personOption,
                    selectedPerson?.id === item.person.id &&
                      styles.personOptionSelected,
                  ]}
                  onPress={() => setSelectedPerson(item.person)}
                >
                  <Text style={styles.personOptionText}>{item.person.name}</Text>
                </TouchableOpacity>
              ))
            )}

            <Text style={styles.modalSubtitle}>{vi.today.duration}</Text>

            <View style={styles.durationRow}>
              {QUICK_DURATIONS.map((d) => (
                <TouchableOpacity
                  key={d.minutes}
                  style={[
                    styles.durationChip,
                    selectedMinutes === d.minutes && styles.durationChipSelected,
                  ]}
                  onPress={() => setSelectedMinutes(d.minutes)}
                >
                  <Text
                    style={[
                      styles.durationChipText,
                      selectedMinutes === d.minutes &&
                        styles.durationChipTextSelected,
                    ]}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button
                label={vi.today.cancel}
                onPress={() => setQuickLogVisible(false)}
                variant="ghost"
                style={styles.modalActionButton}
              />
              <Button
                label={vi.today.save}
                onPress={() => void handleQuickLogSave()}
                disabled={!selectedPerson}
                style={styles.modalActionButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  flex: { flex: 1 },
  container: { flex: 1, paddingTop: 24 },
  headline: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  list: { flex: 1 },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  momentRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  momentInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  actionButtonSecondary: { flex: 1 },
  actionButtonPrimary: { flex: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 10,
  },
  personOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  personOptionSelected: {
    borderColor: '#3B5BDB',
    backgroundColor: '#EEF2FF',
  },
  personOptionText: { fontSize: 15, color: '#1A1A2E' },
  durationRow: { flexDirection: 'row', gap: 8 },
  durationChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  durationChipSelected: {
    borderColor: '#3B5BDB',
    backgroundColor: '#EEF2FF',
  },
  durationChipText: { fontSize: 14, color: '#374151' },
  durationChipTextSelected: { color: '#3B5BDB', fontWeight: '600' },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  modalActionButton: { flex: 1 },
});

export default TodayScreen;
