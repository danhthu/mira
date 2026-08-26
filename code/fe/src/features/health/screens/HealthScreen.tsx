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
import { todayYMD } from '@/shared/utils/date';
import { MINUTES_IN_HOUR } from '@/core/constants';
import {
  findHealthByDate,
  findRecentHealth,
  upsertHealth,
} from '@/db/repositories/healthRepository';
import type { Health } from '@/db/schema';

const RECENT_LIMIT = 7;
const ENERGY_LEVELS = [1, 2, 3, 4, 5] as const;
const NO_VALUE = '—';

type EnergyLevel = (typeof ENERGY_LEVELS)[number];

function parseHoursToMinutes(input: string): number | undefined {
  const normalized = input.trim().replace(',', '.');
  if (normalized === '') return undefined;
  const hours = Number(normalized);
  if (!Number.isFinite(hours) || hours < 0) return undefined;
  return Math.round(hours * MINUTES_IN_HOUR);
}

function parseSteps(input: string): number | undefined {
  const digits = input.trim();
  if (digits === '') return undefined;
  const steps = Number(digits);
  if (!Number.isInteger(steps) || steps < 0) return undefined;
  return steps;
}

function formatHours(minutes: number): string {
  const hours = minutes / MINUTES_IN_HOUR;
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1).replace('.', ',');
}

function minutesToInput(minutes: number | null): string {
  return minutes === null ? '' : formatHours(minutes);
}

function formatDayMonth(date: string): string {
  const parts = date.split('-');
  return `${parts[2] ?? ''}/${parts[1] ?? ''}`;
}

function isEnergyLevel(value: number): value is EnergyLevel {
  return ENERGY_LEVELS.some((level) => level === value);
}

export function HealthScreen() {
  const [recent, setRecent] = useState<Health[]>([]);
  const [sleepInput, setSleepInput] = useState('');
  const [stepsInput, setStepsInput] = useState('');
  const [energy, setEnergy] = useState<EnergyLevel | null>(null);

  useEffect(() => {
    let cancelled = false;
    const date = todayYMD();
    Promise.all([findHealthByDate(date), findRecentHealth(RECENT_LIMIT)])
      .then(([today, history]) => {
        if (cancelled) return;
        setRecent(history);
        if (today === null) return;
        setSleepInput(minutesToInput(today.sleepMinutes));
        setStepsInput(today.steps === null ? '' : String(today.steps));
        setEnergy(
          today.energySelfRated !== null && isEnergyLevel(today.energySelfRated)
            ? today.energySelfRated
            : null,
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(): Promise<void> {
    const date = todayYMD();
    const saved = await upsertHealth({
      date,
      sleepMinutes: parseHoursToMinutes(sleepInput),
      steps: parseSteps(stepsInput),
      energySelfRated: energy ?? undefined,
    });
    setRecent((prev) =>
      [saved, ...prev.filter((h) => h.date !== date)].slice(0, RECENT_LIMIT),
    );
  }

  const hasInput =
    sleepInput.trim() !== '' || stepsInput.trim() !== '' || energy !== null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>{vi.health.sleep}</Text>
            <TextInput
              style={styles.input}
              value={sleepInput}
              onChangeText={setSleepInput}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{vi.health.steps}</Text>
            <TextInput
              style={styles.input}
              value={stepsInput}
              onChangeText={setStepsInput}
              keyboardType="number-pad"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{vi.health.energy}</Text>
            <View style={styles.energyRow}>
              {ENERGY_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.energyChip,
                    energy === level && styles.energyChipSelected,
                  ]}
                  onPress={() => setEnergy(level)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.energyValue,
                      energy === level && styles.energyValueSelected,
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            label={vi.common.ok}
            onPress={() => void handleSave()}
            disabled={!hasInput}
          />
        </Card>

        {recent.length === 0 ? (
          <View style={styles.emptyBox}>
            <DataState message={vi.health.emptyState} />
          </View>
        ) : (
          <Card style={styles.card}>
            <View style={styles.historyRow}>
              <Text style={[styles.historyDate, styles.historyHeader]} />
              <Text style={[styles.historyCell, styles.historyHeader]}>
                {vi.health.sleep}
              </Text>
              <Text style={[styles.historyCell, styles.historyHeader]}>
                {vi.health.steps}
              </Text>
              <Text style={[styles.historyCell, styles.historyHeader]}>
                {vi.health.energy}
              </Text>
            </View>
            {recent.map((h) => (
              <View key={h.id} style={styles.historyRow}>
                <Text style={styles.historyDate}>{formatDayMonth(h.date)}</Text>
                <Text style={styles.historyCell}>
                  {h.sleepMinutes === null
                    ? NO_VALUE
                    : vi.health.sleepHours(formatHours(h.sleepMinutes))}
                </Text>
                <Text style={styles.historyCell}>
                  {h.steps === null ? NO_VALUE : String(h.steps)}
                </Text>
                <Text style={styles.historyCell}>
                  {h.energySelfRated === null
                    ? NO_VALUE
                    : String(h.energySelfRated)}
                </Text>
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
  card: { gap: 16 },
  field: { gap: 8 },
  label: {
    fontSize: fontSize.bodyLarge,
    fontWeight: '600',
    color: colors.textLabel,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  energyRow: { flexDirection: 'row', gap: 8 },
  energyChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  energyChipSelected: {
    backgroundColor: colors.accentSurface,
    borderColor: colors.accent,
  },
  energyValue: { fontSize: fontSize.body, color: colors.textSecondary },
  energyValueSelected: { color: colors.accent, fontWeight: '700' },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  historyDate: { width: 44, fontSize: fontSize.meta, color: colors.textMuted },
  historyCell: {
    flex: 1,
    fontSize: fontSize.meta,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  historyHeader: { color: colors.textSecondary, fontWeight: '600' },
  emptyBox: { minHeight: 180, justifyContent: 'center' },
});

export default HealthScreen;
