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
import { useQuietMode } from '@/shared/hooks/useQuietMode';
import { vi } from '@/i18n/vi';
import { createTimeEntry } from '@/db/repositories/timeEntryRepository';
import { createMoment } from '@/db/repositories/momentRepository';
import { colors, fontSize, radius } from '@/shared/theme/tokens';
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
const CUSTOM_MINUTES_VALUE = -1;

export function TodayScreen() {
  useTodayData();

  // Lớp da im lặng (M12). Không chặn ai: ngày trắng cất phần đo đếm đi, giới
  // nghiêm cất hai nút ghi giờ, còn ô ghi khoảnh khắc thì lúc nào cũng mở.
  const quiet = useQuietMode();

  const {
    personsWithTime,
    allPersons,
    isLoading,
    goldenHours,
    activeSession,
    startSession,
    stopSession,
  } = useTodayStore();

  const [momentText, setMomentText] = useState('');
  const [quickLogVisible, setQuickLogVisible] = useState(false);
  const [startPickerVisible, setStartPickerVisible] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedMinutes, setSelectedMinutes] = useState<number>(30);
  const [customMinutesText, setCustomMinutesText] = useState('');

  let headline: string;
  if (isLoading) {
    headline = vi.today.headlineLoading;
  } else if (goldenHours.status === 'ok') {
    headline = vi.today.headline(goldenHours.hoursPerWeek);
  } else if (goldenHours.status === 'insufficient') {
    headline = vi.today.headlineInsufficient(goldenHours.missingDays);
  } else {
    headline = vi.today.headlineEmpty;
  }

  async function handleStartSession(person: Person): Promise<void> {
    startSession(person.id, person.name);
    setStartPickerVisible(false);
  }

  async function handleStopSession(): Promise<void> {
    if (!activeSession) return;
    const elapsedMs = Date.now() - new Date(activeSession.startedAt).getTime();
    const minutes = Math.max(1, Math.round(elapsedMs / 60_000));
    await createTimeEntry({
      date: todayYMD(),
      minutes,
      bucket: PEOPLE_BUCKET,
      personId: activeSession.personId,
      source: 'manual',
    });
    stopSession();
  }

  async function handleMomentSubmit(): Promise<void> {
    const text = momentText.trim();
    if (!text) return;
    await createMoment({
      occurredAt: getCurrentISOString(),
      text,
      bucket: PEOPLE_BUCKET,
      kind: 'moment',
    });
    setMomentText('');
  }

  async function handleQuickLogSave(): Promise<void> {
    if (!selectedPerson) return;
    const minutes =
      selectedMinutes === CUSTOM_MINUTES_VALUE
        ? parseInt(customMinutesText, 10)
        : selectedMinutes;
    if (!Number.isFinite(minutes) || minutes <= 0) return;
    await createTimeEntry({
      date: todayYMD(),
      minutes,
      bucket: PEOPLE_BUCKET,
      personId: selectedPerson.id,
      source: 'manual',
    });
    setQuickLogVisible(false);
    setSelectedPerson(null);
    setSelectedMinutes(30);
    setCustomMinutesText('');
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
          {quiet.notice !== null && (
            <Text style={styles.quietNotice}>{quiet.notice}</Text>
          )}

          {quiet.isWhiteDay ? (
            // Ngày trắng cất luôn con số giờ vàng và danh sách người: hôm nay
            // không có gì để đo. Ô ghi khoảnh khắc bên dưới vẫn còn.
            <View style={styles.flex} />
          ) : (
            <>
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
            </>
          )}

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

          {/* Phiên đang chạy luôn có nút dừng, kể cả trong giới nghiêm: im lặng
              không được biến thành nhốt người dùng lại với một phiên mở. */}
          {activeSession !== null && (
            <View style={styles.activeSessionBar}>
              <Text style={styles.activeSessionText}>
                {vi.today.activeSessionWith(activeSession.personName)}
              </Text>
              <Button
                label={vi.today.stopButton}
                onPress={() => void handleStopSession()}
                variant="secondary"
              />
            </View>
          )}

          {activeSession === null && !quiet.momentOnly && (
            <View style={styles.actions}>
              <Button
                label={vi.today.quickLogButton}
                onPress={() => setQuickLogVisible(true)}
                variant="secondary"
                style={styles.actionButtonSecondary}
              />
              <Button
                label={vi.today.startButton}
                onPress={() => setStartPickerVisible(true)}
                style={styles.actionButtonPrimary}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={startPickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setStartPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{vi.today.withWho}</Text>

            {allPersons.length === 0 ? (
              <Text style={styles.emptyText}>{vi.today.emptyState}</Text>
            ) : (
              allPersons.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.personOption}
                  onPress={() => void handleStartSession(p)}
                >
                  <Text style={styles.personOptionText}>{p.name}</Text>
                </TouchableOpacity>
              ))
            )}

            <Button
              label={vi.today.cancel}
              onPress={() => setStartPickerVisible(false)}
              variant="ghost"
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={quickLogVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setQuickLogVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{vi.today.withWho}</Text>

            {allPersons.length === 0 ? (
              <Text style={styles.emptyText}>{vi.today.emptyState}</Text>
            ) : (
              allPersons.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.personOption,
                    selectedPerson?.id === p.id && styles.personOptionSelected,
                  ]}
                  onPress={() => setSelectedPerson(p)}
                >
                  <Text style={styles.personOptionText}>{p.name}</Text>
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
              <TouchableOpacity
                style={[
                  styles.durationChip,
                  selectedMinutes === CUSTOM_MINUTES_VALUE &&
                    styles.durationChipSelected,
                ]}
                onPress={() => setSelectedMinutes(CUSTOM_MINUTES_VALUE)}
              >
                <Text
                  style={[
                    styles.durationChipText,
                    selectedMinutes === CUSTOM_MINUTES_VALUE &&
                      styles.durationChipTextSelected,
                  ]}
                >
                  {vi.today.durationCustom}
                </Text>
              </TouchableOpacity>
            </View>

            {selectedMinutes === CUSTOM_MINUTES_VALUE && (
              <TextInput
                style={styles.customMinutesInput}
                placeholder={vi.today.duration}
                value={customMinutesText}
                onChangeText={setCustomMinutesText}
                keyboardType="number-pad"
              />
            )}

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
                disabled={
                  !selectedPerson ||
                  (selectedMinutes === CUSTOM_MINUTES_VALUE && !customMinutesText)
                }
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
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  container: { flex: 1, paddingTop: 24 },
  headline: {
    fontSize: fontSize.headline,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  quietNotice: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  list: { flex: 1 },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.body,
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  momentRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  momentInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: fontSize.body,
    borderWidth: 1,
    borderColor: colors.border,
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
  activeSessionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.accentSurface,
  },
  activeSessionText: { fontSize: fontSize.body, color: colors.accent, fontWeight: '600' },
  customMinutesInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: fontSize.body,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 10,
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
  modalSubtitle: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.textLabel,
    marginTop: 16,
    marginBottom: 10,
  },
  personOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  personOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSurface,
  },
  personOptionText: { fontSize: fontSize.body, color: colors.textPrimary },
  durationRow: { flexDirection: 'row', gap: 8 },
  durationChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationChipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSurface,
  },
  durationChipText: { fontSize: fontSize.small, color: colors.textLabel },
  durationChipTextSelected: { color: colors.accent, fontWeight: '600' },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  modalActionButton: { flex: 1 },
});

export default TodayScreen;
