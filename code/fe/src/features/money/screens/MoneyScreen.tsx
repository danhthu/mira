import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import Button from '@/shared/components/Button';
import DataState from '@/shared/components/DataState';
import LifeRateCard from '../components/LifeRateCard';
import FreedomCard from '../components/FreedomCard';
import ExpenseRow from '../components/ExpenseRow';
import MonthFormModal from '../components/MonthFormModal';
import ExpenseFormModal from '../components/ExpenseFormModal';
import { useMoneyData } from '../hooks/useMoneyData';
import { vi } from '@/i18n/vi';
import { colors, fontSize } from '@/shared/theme/tokens';
import { formatDisplayMonth } from '@/shared/utils/date';

export function MoneyScreen() {
  const { isLoading, data, reload } = useMoneyData();
  const [monthFormVisible, setMonthFormVisible] = useState(false);
  const [expenseFormVisible, setExpenseFormVisible] = useState(false);

  async function handleMonthSaved(): Promise<void> {
    setMonthFormVisible(false);
    await reload();
  }

  async function handleExpenseSaved(): Promise<void> {
    setExpenseFormVisible(false);
    await reload();
  }

  const modals = (
    <>
      <MonthFormModal
        visible={monthFormVisible}
        month={data.month}
        initial={data.latest}
        onClose={() => setMonthFormVisible(false)}
        onSaved={() => void handleMonthSaved()}
      />
      <ExpenseFormModal
        visible={expenseFormVisible}
        onClose={() => setExpenseFormVisible(false)}
        onSaved={() => void handleExpenseSaved()}
      />
    </>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <DataState message={vi.common.loading} />
      </SafeAreaView>
    );
  }

  if (data.latest === null || data.freedom === null) {
    return (
      <SafeAreaView style={styles.safe}>
        <DataState
          message={vi.money.emptyState}
          action={{
            label: vi.money.saveMonth,
            onPress: () => setMonthFormVisible(true),
          }}
        />
        {modals}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{vi.money.monthlyTitle}</Text>
          <Text style={styles.headerMonth}>
            {formatDisplayMonth(data.latest.month)}
          </Text>
        </View>

        <FreedomCard result={data.freedom} />
        <LifeRateCard result={data.lifeRate} />

        <View style={styles.buttonRow}>
          <Button
            label={vi.money.saveMonth}
            onPress={() => setMonthFormVisible(true)}
            variant="secondary"
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{vi.money.expensesTitle}</Text>
        </View>

        {data.expenses.map((item) => (
          <ExpenseRow key={item.expense.id} item={item} />
        ))}

        <View style={styles.buttonRow}>
          <Button
            label={vi.money.addExpense}
            onPress={() => setExpenseFormVisible(true)}
          />
        </View>
      </ScrollView>

      {modals}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: 24, paddingBottom: 40 },
  header: { paddingHorizontal: 16, marginBottom: 16 },
  headerTitle: {
    fontSize: fontSize.headline,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerMonth: {
    fontSize: fontSize.meta,
    color: colors.textSecondary,
    marginTop: 2,
  },
  buttonRow: { paddingHorizontal: 16, paddingVertical: 12 },
  sectionHeader: { paddingHorizontal: 16, marginTop: 12, marginBottom: 4 },
  sectionTitle: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

export default MoneyScreen;
