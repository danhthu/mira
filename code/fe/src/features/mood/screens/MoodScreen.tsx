import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import DataState from '@/shared/components/DataState';
import { vi } from '@/i18n/vi';
import { colors, fontSize, radius } from '@/shared/theme/tokens';
import { getCurrentISOString } from '@/shared/utils/date';
import {
  createMood,
  findRecentMoods,
  updateMoodNote,
} from '@/db/repositories/moodRepository';
import {
  createWeightOnMind,
  findWeightsDueForReview,
  findWeightsInKeeping,
  markWeightReviewed,
} from '@/db/repositories/weightOnMindRepository';
import { computeReviewAt } from '../reviewSchedule';
import type { Mood, WeightOnMind } from '@/db/schema';

const RECENT_LIMIT = 10;

type MoodLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Năm mức bày cùng một kiểu, cùng một màu. Tô mức thấp khác màu mức cao là chấm
 * điểm cảm xúc — thứ 00-vision.md cấm.
 */
const MOOD_LEVELS: ReadonlyArray<{ value: MoodLevel; label: string }> = [
  { value: 1, label: vi.mood.level1 },
  { value: 2, label: vi.mood.level2 },
  { value: 3, label: vi.mood.level3 },
  { value: 4, label: vi.mood.level4 },
  { value: 5, label: vi.mood.level5 },
];

function labelForLevel(level: number): string {
  return MOOD_LEVELS.find((item) => item.value === level)?.label ?? '';
}

function formatDayMonth(isoString: string): string {
  const d = new Date(isoString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

export function MoodScreen() {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [dueWeights, setDueWeights] = useState<WeightOnMind[]>([]);
  const [keptWeights, setKeptWeights] = useState<WeightOnMind[]>([]);
  const [lastCheckIn, setLastCheckIn] = useState<Mood | null>(null);
  const [note, setNote] = useState('');
  const [weightText, setWeightText] = useState('');

  useEffect(() => {
    let cancelled = false;
    const now = getCurrentISOString();
    Promise.all([
      findRecentMoods(RECENT_LIMIT),
      findWeightsDueForReview(now),
      findWeightsInKeeping(now),
    ])
      .then(([recent, due, kept]) => {
        if (!cancelled) {
          setMoods(recent);
          setDueWeights(due);
          setKeptWeights(kept);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCheckIn(level: MoodLevel): Promise<void> {
    const created = await createMood({
      occurredAt: getCurrentISOString(),
      level,
    });
    setMoods((prev) => [created, ...prev].slice(0, RECENT_LIMIT));
    setLastCheckIn(created);
    setNote('');
  }

  async function handleSaveNote(): Promise<void> {
    if (lastCheckIn === null) return;
    const text = note.trim();
    await updateMoodNote(lastCheckIn.id, text);
    setMoods((prev) =>
      prev.map((m) => (m.id === lastCheckIn.id ? { ...m, note: text } : m)),
    );
    setLastCheckIn(null);
    setNote('');
  }

  async function handleSaveWeight(): Promise<void> {
    const text = weightText.trim();
    if (text === '') return;
    const writtenAt = getCurrentISOString();
    const created = await createWeightOnMind({
      text,
      writtenAt,
      reviewAt: computeReviewAt(writtenAt),
    });
    setKeptWeights((prev) => [created, ...prev]);
    setWeightText('');
  }

  async function handleReview(id: string, stillHeavy: boolean): Promise<void> {
    await markWeightReviewed(id, stillHeavy);
    setDueWeights((prev) => prev.filter((w) => w.id !== id));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {dueWeights.map((w) => (
          <Card key={w.id} style={styles.card}>
            <Text style={styles.cardTitle}>{vi.mood.weightOnMindReview}</Text>
            <Text style={styles.weightText}>{w.text}</Text>
            <View style={styles.reviewActions}>
              <Button
                label={vi.mood.stillHeavy}
                variant="secondary"
                onPress={() => void handleReview(w.id, true)}
                style={styles.reviewButton}
              />
              <Button
                label={vi.mood.notAnymore}
                variant="secondary"
                onPress={() => void handleReview(w.id, false)}
                style={styles.reviewButton}
              />
            </View>
          </Card>
        ))}

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{vi.mood.checkInPrompt}</Text>
          <View style={styles.levelRow}>
            {MOOD_LEVELS.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={styles.levelChip}
                onPress={() => void handleCheckIn(item.value)}
                activeOpacity={0.75}
              >
                <Text style={styles.levelLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {lastCheckIn !== null && (
            <View style={styles.noteBlock}>
              <TextInput
                style={styles.input}
                placeholder={vi.mood.notePlaceholder}
                placeholderTextColor={colors.textMuted}
                value={note}
                onChangeText={setNote}
                multiline
              />
              <Button
                label={vi.common.ok}
                onPress={() => void handleSaveNote()}
                disabled={note.trim() === ''}
                style={styles.blockButton}
              />
            </View>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{vi.mood.weightOnMindTitle}</Text>
          <Text style={styles.hint}>{vi.mood.weightOnMindPrompt}</Text>
          <TextInput
            style={styles.input}
            placeholder={vi.mood.weightOnMindTitle}
            placeholderTextColor={colors.textMuted}
            value={weightText}
            onChangeText={setWeightText}
            multiline
          />
          <Button
            label={vi.common.ok}
            onPress={() => void handleSaveWeight()}
            disabled={weightText.trim() === ''}
            style={styles.blockButton}
          />
          {keptWeights.map((w) => (
            <View key={w.id} style={styles.keptRow}>
              <Text style={styles.keptText} numberOfLines={2}>
                {w.text}
              </Text>
              <Text style={styles.keptDate}>{formatDayMonth(w.reviewAt)}</Text>
            </View>
          ))}
        </Card>

        {moods.length === 0 ? (
          <View style={styles.emptyBox}>
            <DataState message={vi.mood.emptyState} />
          </View>
        ) : (
          <Card style={styles.card}>
            {moods.map((m) => (
              <View key={m.id} style={styles.historyRow}>
                <Text style={styles.historyDate}>
                  {formatDayMonth(m.occurredAt)}
                </Text>
                <View style={styles.historyBody}>
                  <Text style={styles.historyLevel}>
                    {labelForLevel(m.level)}
                  </Text>
                  {m.note !== null && m.note !== '' && (
                    <Text style={styles.historyNote}>{m.note}</Text>
                  )}
                </View>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  card: { gap: 12 },
  cardTitle: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  hint: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: -6,
  },
  levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  levelChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSurface,
  },
  levelLabel: {
    fontSize: fontSize.small,
    fontWeight: '600',
    color: colors.accent,
  },
  noteBlock: { gap: 10 },
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontSize: fontSize.body,
    color: colors.textPrimary,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  blockButton: { width: '100%' },
  weightText: {
    fontSize: fontSize.bodyLarge,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  reviewActions: { flexDirection: 'row', gap: 10 },
  reviewButton: { flex: 1 },
  keptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  keptText: { flex: 1, fontSize: fontSize.small, color: colors.textLabel },
  keptDate: { fontSize: fontSize.meta, color: colors.textMuted },
  historyRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  historyDate: {
    fontSize: fontSize.meta,
    color: colors.textMuted,
    width: 44,
    paddingTop: 2,
  },
  historyBody: { flex: 1 },
  historyLevel: { fontSize: fontSize.body, color: colors.textPrimary },
  historyNote: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 20,
  },
  emptyBox: { minHeight: 180, justifyContent: 'center' },
});

export default MoodScreen;
