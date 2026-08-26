import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Button from '@/shared/components/Button';
import AmountField from './AmountField';
import { vi } from '@/i18n/vi';
import { colors, fontSize, radius } from '@/shared/theme/tokens';
import { getCurrentISOString } from '@/shared/utils/date';
import { createExpense } from '@/db/repositories/expenseRepository';

interface ExpenseFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ExpenseFormModal({
  visible,
  onClose,
  onSaved,
}: ExpenseFormModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setAmount('');
    setDescription('');
  }, [visible]);

  const amountValue = parseInt(amount, 10);
  const canSave =
    Number.isFinite(amountValue) && amountValue > 0 && description.trim() !== '';

  async function handleSave(): Promise<void> {
    if (!canSave) return;
    setSaving(true);
    try {
      await createExpense({
        occurredAt: getCurrentISOString(),
        amount: amountValue,
        description: description.trim(),
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
            <Text style={styles.title}>{vi.money.addExpense}</Text>

            <AmountField
              label={vi.money.expenseAmount}
              value={amount}
              onChangeText={setAmount}
            />

            <Text style={styles.label}>{vi.money.expenseDescription}</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              returnKeyType="done"
            />

            <View style={styles.actions}>
              <Button
                label={vi.today.cancel}
                onPress={onClose}
                variant="ghost"
                style={styles.action}
              />
              <Button
                label={vi.today.save}
                onPress={() => void handleSave()}
                disabled={!canSave}
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
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  label: {
    fontSize: fontSize.meta,
    color: colors.textLabel,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: fontSize.bodyLarge,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  action: { flex: 1 },
});

export default ExpenseFormModal;
