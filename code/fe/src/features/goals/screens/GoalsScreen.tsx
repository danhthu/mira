import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import GoalCard from '../components/GoalCard';
import Button from '@/shared/components/Button';
import DataState from '@/shared/components/DataState';
import { vi } from '@/i18n/vi';
import {
  createGoal,
  expireOverdueGoals,
  findAllGoals,
  releaseGoal,
} from '@/db/repositories/goalRepository';
import { findAllMoneyRecords } from '@/db/repositories/moneyRepository';
import { colors, fontSize, radius } from '@/shared/theme/tokens';
import { todayYMD, getCurrentISOString } from '@/shared/utils/date';
import { formatVND } from '@/shared/utils/format';
import { useSettingsStore } from '@/store/settingsStore';
import { canAddGoalAt } from '@/core/slow/friction';
import {
  canAddGoal,
  detectGoalConflict,
  goalExpiryDate,
  type GoalCostEntry,
} from '@/core/goalCost';
import { MINUTES_IN_HOUR } from '@/core/constants';
import type { Goal, Money } from '@/db/schema';
import type { GoalTier } from '@/shared/types';

const TIERS: ReadonlyArray<{ tier: GoalTier; label: string; hint: string }> = [
  { tier: 'identity', label: vi.goals.tierIdentity, hint: vi.goals.tierIdentityHint },
  { tier: 'season', label: vi.goals.tierSeason, hint: vi.goals.tierSeasonHint },
  { tier: 'rhythm', label: vi.goals.tierRhythm, hint: vi.goals.tierRhythmHint },
];

const STATUS_ORDER: Record<Goal['status'], number> = {
  active: 0,
  renewed: 0,
  expired: 1,
  released: 2,
};

interface TierSection {
  tier: GoalTier;
  title: string;
  hint: string;
  data: Goal[];
}

function isRunning(goal: Goal): boolean {
  return goal.status === 'active' || goal.status === 'renewed';
}

function toCostEntry(goal: Goal): GoalCostEntry {
  return {
    id: goal.id,
    tier: goal.tier,
    costMinutesPerWeek: goal.costMinutesPerWeek,
    costAmountPerMonth: goal.costAmountPerMonth,
  };
}

function buildSections(goals: Goal[]): TierSection[] {
  return TIERS.map(({ tier, label, hint }) => ({
    tier,
    title: label,
    hint,
    data: goals
      .filter(g => g.tier === tier)
      .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]),
  }));
}

function parseHoursToMinutes(text: string): number {
  const hours = Number(text.replace(',', '.'));
  if (!Number.isFinite(hours) || hours <= 0) return 0;
  return Math.round(hours * MINUTES_IN_HOUR);
}

/** 0 nghĩa là chưa có số chi tiêu tháng nào — goalCost hiểu đó là "chưa tính được". */
function latestMonthlyExpense(months: Money[]): number {
  const latest = [...months].sort((a, b) => b.month.localeCompare(a.month))[0];
  return latest?.monthlyExpense ?? 0;
}

function parseAmount(text: string): number {
  const digits = text.replace(/\D/g, '');
  return digits === '' ? 0 : Number(digits);
}

export function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [addVisible, setAddVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTier, setNewTier] = useState<GoalTier>('rhythm');
  const [newHoursText, setNewHoursText] = useState('');
  const [newAmountText, setNewAmountText] = useState('');
  const [releasing, setReleasing] = useState<Goal | null>(null);
  const [releaseText, setReleaseText] = useState('');

  const lastGoalAddedAt = useSettingsStore((state) => state.lastGoalAddedAt);
  const setLastGoalAddedAt = useSettingsStore((state) => state.setLastGoalAddedAt);

  const today = todayYMD();

  // Ma sát cố ý (M12): mục tiêu kế tiếp mở vào sáng hôm sau. Tính lại mỗi lần
  // render từ giờ máy — không có timer, vì lớp này chỉ khoá nút chứ không báo gì.
  const frictionBlocked = !canAddGoalAt(
    lastGoalAddedAt === null ? null : new Date(lastGoalAddedAt),
    new Date(),
  );

  useEffect(() => {
    let cancelled = false;
    expireOverdueGoals(today)
      .then(() => Promise.all([findAllGoals(), findAllMoneyRecords()]))
      .then(([loaded, months]) => {
        if (!cancelled) {
          setGoals(loaded);
          setMonthlyExpense(latestMonthlyExpense(months));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [today]);

  const runningGoals = goals.filter(isRunning);
  const runningEntries = runningGoals.map(toCostEntry);
  const conflict = detectGoalConflict(runningEntries);

  const candidateMinutes = parseHoursToMinutes(newHoursText);
  const admission = canAddGoal(runningEntries, {
    tier: newTier,
    costMinutesPerWeek: candidateMinutes,
  });

  function tierIsFull(tier: GoalTier): boolean {
    return canAddGoal(runningEntries, { tier, costMinutesPerWeek: 0 }).status === 'tier_full';
  }

  function closeAdd(): void {
    setAddVisible(false);
    setNewTitle('');
    setNewHoursText('');
    setNewAmountText('');
  }

  async function handleSave(): Promise<void> {
    const title = newTitle.trim();
    if (title === '' || admission.status !== 'allowed' || frictionBlocked) return;

    const amount = parseAmount(newAmountText);
    const created = await createGoal({
      tier: newTier,
      title,
      startedAt: today,
      expiresAt: goalExpiryDate(today),
      costMinutesPerWeek: candidateMinutes > 0 ? candidateMinutes : undefined,
      costAmountPerMonth: amount > 0 ? amount : undefined,
    });
    setGoals(prev => [created, ...prev]);
    setLastGoalAddedAt(getCurrentISOString());
    closeAdd();
  }

  async function handleConfirmRelease(): Promise<void> {
    const target = releasing;
    const reason = releaseText.trim();
    if (target === null || reason === '') return;

    await releaseGoal(target.id, reason);
    setGoals(prev =>
      prev.map(g =>
        g.id === target.id ? { ...g, status: 'released', releaseReason: reason } : g,
      ),
    );
    setReleasing(null);
    setReleaseText('');
  }

  const sections = buildSections(goals).filter(s => s.data.length > 0);

  return (
    <SafeAreaView style={styles.safe}>
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <GoalCard
            goal={item}
            monthlyExpense={monthlyExpense}
            today={today}
            onRelease={setReleasing}
          />
        )}
        ListHeaderComponent={
          <View>
            <Text style={styles.screenTitle}>{vi.goals.title}</Text>
            {conflict.status === 'conflict' && (
              <View style={styles.conflictBanner}>
                <Text style={styles.conflictText}>{vi.goals.conflictWarning}</Text>
              </View>
            )}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionHint}>{section.hint}</Text>
          </View>
        )}
        ListEmptyComponent={
          <DataState
            message={vi.goals.emptyState}
            action={{ label: vi.goals.addGoal, onPress: () => setAddVisible(true) }}
          />
        }
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={addVisible}
        animationType="slide"
        transparent
        onRequestClose={closeAdd}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{vi.goals.addGoal}</Text>

            <TextInput
              style={styles.textInput}
              placeholder={vi.goals.goalTitle}
              placeholderTextColor={colors.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
            />

            <View style={styles.tierRow}>
              {TIERS.map(({ tier, label, hint }) => {
                const full = tier !== newTier && tierIsFull(tier);
                const selected = tier === newTier;
                return (
                  <TouchableOpacity
                    key={tier}
                    style={[
                      styles.tierChip,
                      selected && styles.tierChipSelected,
                      full && styles.tierChipDisabled,
                    ]}
                    onPress={() => setNewTier(tier)}
                    disabled={full}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.tierLabel, selected && styles.tierLabelSelected]}
                    >
                      {label}
                    </Text>
                    <Text style={styles.tierHint}>{hint}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.costField}>
              <Text style={styles.costLabel}>{vi.goals.labelCostHours}</Text>
              <TextInput
                style={styles.numberInput}
                value={newHoursText}
                onChangeText={setNewHoursText}
                keyboardType="numeric"
              />
              <Text style={styles.costPreview}>
                {vi.goals.costHours(
                  Math.round((candidateMinutes / MINUTES_IN_HOUR) * 10) / 10,
                )}
              </Text>
            </View>

            <View style={styles.costField}>
              <Text style={styles.costLabel}>{vi.goals.labelCostMoney}</Text>
              <TextInput
                style={styles.numberInput}
                value={newAmountText}
                onChangeText={setNewAmountText}
                keyboardType="numeric"
              />
              <Text style={styles.costPreview}>
                {vi.goals.costMoney(formatVND(parseAmount(newAmountText)))}
              </Text>
            </View>

            {(frictionBlocked || admission.status !== 'allowed') && (
              // Khoá nút mà im lặng thì người dùng đoán là app hỏng. Nói vì sao.
              <Text style={styles.blockedReason}>
                {frictionBlocked
                  ? vi.slow.frictionWait
                  : admission.status === 'tier_full'
                    ? vi.goals.tierFull(
                        TIERS.find((t) => t.tier === admission.tier)?.label ?? '',
                        admission.limit,
                      )
                    : vi.goals.budgetFull}
              </Text>
            )}

            <View style={styles.modalActions}>
              <Button
                label={vi.today.cancel}
                onPress={closeAdd}
                variant="ghost"
                style={styles.modalActionButton}
              />
              <Button
                label={vi.today.save}
                onPress={() => void handleSave()}
                disabled={
                  newTitle.trim() === '' ||
                  admission.status !== 'allowed' ||
                  frictionBlocked
                }
                style={styles.modalActionButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={releasing !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setReleasing(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{vi.goals.release}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={vi.goals.releaseReason}
              placeholderTextColor={colors.textMuted}
              value={releaseText}
              onChangeText={setReleaseText}
              multiline
              autoFocus
            />
            <View style={styles.modalActions}>
              <Button
                label={vi.today.cancel}
                onPress={() => setReleasing(null)}
                variant="ghost"
                style={styles.modalActionButton}
              />
              <Button
                label={vi.today.save}
                onPress={() => void handleConfirmRelease()}
                disabled={releaseText.trim() === ''}
                style={styles.modalActionButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { paddingBottom: 96, flexGrow: 1 },
  screenTitle: {
    fontSize: fontSize.headline,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  conflictBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSurface,
  },
  conflictText: { fontSize: fontSize.meta, color: colors.textLabel },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: fontSize.bodyLarge,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionHint: { fontSize: fontSize.caption, color: colors.textSecondary, marginTop: 2 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: { fontSize: fontSize.headline, color: colors.textOnAccent, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  tierRow: { flexDirection: 'row', gap: 8 },
  tierChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 10,
  },
  tierChipSelected: { borderColor: colors.accent, backgroundColor: colors.accentSurface },
  tierChipDisabled: { opacity: 0.4 },
  costLabel: {
    fontSize: fontSize.small,
    fontWeight: '600',
    color: colors.textLabel,
    marginBottom: 6,
  },
  blockedReason: {
    fontSize: fontSize.meta,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 12,
  },
  tierLabel: { fontSize: fontSize.small, fontWeight: '600', color: colors.textLabel },
  tierLabelSelected: { color: colors.accent },
  tierHint: { fontSize: fontSize.caption, color: colors.textSecondary, marginTop: 2 },
  costField: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  numberInput: {
    width: 96,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  costPreview: { flex: 1, fontSize: fontSize.meta, color: colors.textSecondary },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalActionButton: { flex: 1 },
});

export default GoalsScreen;
