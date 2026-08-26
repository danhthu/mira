import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Button from '@/shared/components/Button';
import AmountField from './AmountField';
import { vi } from '@/i18n/vi';
import { colors, fontSize, radius } from '@/shared/theme/tokens';
import { formatDisplayMonth } from '@/shared/utils/date';
import { upsertMoney } from '@/db/repositories/moneyRepository';
import type { Money } from '@/db/schema';

interface MonthFormModalProps {
  visible: boolean;
  month: string;
  initial: Money | null;
  onClose: () => void;
  onSaved: () => void;
}

function toField(value: number | undefined): string {
  return value === undefined || value === 0 ? '' : String(value);
}

function toAmount(text: string): number {
  const parsed = parseInt(text, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function MonthFormModal({
  visible,
  month,
  initial,
  onClose,
  onSaved,
}: MonthFormModalProps) {
  const [netIncome, setNetIncome] = useState('');
  const [monthlyExpense, setMonthlyExpense] = useState('');
  const [netWorth, setNetWorth] = useState('');
  const [debt, setDebt] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setNetIncome(toField(initial?.netIncome));
    setMonthlyExpense(toField(initial?.monthlyExpense));
    setNetWorth(toField(initial?.netWorth));
    setDebt(toField(initial?.debt));
  }, [visible, initial]);

  async function handleSave(): Promise<void> {
    setSaving(true);
    try {
      await upsertMoney({
        month,
        netIncome: toAmount(netIncome),
        monthlyExpense: toAmount(monthlyExpense),
        netWorth: toAmount(netWorth),
        debt: toAmount(debt),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.title}>{vi.money.monthlyTitle}</Text>
            <Text style={styles.subtitle}>{formatDisplayMonth(month)}</Text>

            <ScrollView keyboardShouldPersistTaps="handled">
              <AmountField
                label={vi.money.netIncome}
                value={netIncome}
                onChangeText={setNetIncome}
              />
              <AmountField
                label={vi.money.monthlyExpense}
                value={monthlyExpense}
                onChangeText={setMonthlyExpense}
              />
              <AmountField
                label={vi.money.netWorth}
                value={netWorth}
                onChangeText={setNetWorth}
              />
              <AmountField
                label={vi.money.debt}
                value={debt}
                onChangeText={setDebt}
              />
            </ScrollView>

            <View style={styles.actions}>
              <Button
                label={vi.today.cancel}
                onPress={onClose}
                variant="ghost"
                style={styles.action}
              />
              <Button
                label={vi.money.saveMonth}
                onPress={() => void handleSave()}
                loading={saving}
                style={styles.action}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.meta,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  action: { flex: 1 },
});

export default MonthFormModal;
