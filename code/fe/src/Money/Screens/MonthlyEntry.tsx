import { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorToken, fontSize, space } from '../../../theme';
import { AmountInput } from '../Components/AmountInput';
import { PrimaryButton } from '../Components/PrimaryButton';
import { useMoneyDashboard } from '../Hooks/useMoneyDashboard';
import { currentMonthKey } from '../Models/month';
import { saveMonthlyMoney } from '../Models/storage';
import { useText } from '../Text';

/** Năm ô, mỗi ô là số nguyên VND hoặc `null` khi còn trống. */
interface Draft {
  netIncome: number | null;
  monthlyExpense: number | null;
  debt: number | null;
  savings: number | null;
  netWorth: number | null;
}

const EMPTY_DRAFT: Draft = {
  netIncome: null,
  monthlyExpense: null,
  debt: null,
  savings: null,
  netWorth: null,
};

export interface MonthlyEntryProps {
  readonly navigation: { readonly goBack: () => void };
}

/**
 * Vòng lặp tháng của `08` §"Ba vòng lặp": năm ô, ≤ 2 phút. Số của tháng gần nhất
 * được điền sẵn vì bốn trong năm ô hiếm khi đổi — người dùng chỉ sửa chỗ nào lệch.
 * Không có ô thứ sáu, không có màn ghi từng khoản chi (`08` §"Những gì bị cắt").
 */
export const MonthlyEntry = (props: MonthlyEntryProps) => {
  const token = useColorToken();
  const text = useText();
  const { records, loading } = useMoneyDashboard();
  const month = currentMonthKey();
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  // Ô 5 nhập độ lớn, công tắc này quyết định dấu — bàn phím số không có dấu trừ.
  const [netWorthBelowZero, setNetWorthBelowZero] = useState(false);
  const [prefilledFromPastMonth, setPrefilledFromPastMonth] = useState(false);
  // Chỉ điền sẵn một lần: bản ghi đổi sau khi lưu sẽ không được đè lên chữ đang gõ.
  const hydrated = useRef(false);

  useEffect(() => {
    if (loading || hydrated.current) return;
    hydrated.current = true;

    const thisMonth = records.filter((record) => record.month === month)[0];
    const source = thisMonth || records[records.length - 1];
    if (!source) return;

    setDraft({
      netIncome: source.netIncome,
      monthlyExpense: source.monthlyExpense,
      debt: source.debt,
      savings: source.savings,
      netWorth: Math.abs(source.netWorth),
    });
    setNetWorthBelowZero(source.netWorth < 0);
    setPrefilledFromPastMonth(!thisMonth);
  }, [loading, records, month]);

  const filled = (value: number | null) => (value === null ? 0 : value);
  const canSave =
    draft.netIncome !== null ||
    draft.monthlyExpense !== null ||
    draft.debt !== null ||
    draft.savings !== null ||
    draft.netWorth !== null;

  const save = () => {
    saveMonthlyMoney({
      month,
      netIncome: filled(draft.netIncome),
      monthlyExpense: filled(draft.monthlyExpense),
      debt: filled(draft.debt),
      savings: filled(draft.savings),
      netWorth: netWorthBelowZero ? -filled(draft.netWorth) : filled(draft.netWorth),
    }).then(() => props.navigation.goBack());
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: space.lg }}>
        <Text
          style={{
            color: token.textPrimary,
            fontSize: fontSize.headline,
          }}
        >
          {text.entryTitle}
        </Text>
        <Text
          style={{
            color: token.textSecondary,
            fontSize: fontSize.body,
            marginTop: space.xs,
          }}
        >
          {text.entryMonth(month)}
        </Text>
        <Text
          style={{
            color: token.textMuted,
            fontSize: fontSize.caption,
            marginTop: space.xxs,
            marginBottom: space.xl,
          }}
        >
          {prefilledFromPastMonth ? text.entryPrefilled : text.entryIntro}
        </Text>

        <AmountInput
          testID="money-input-net-income"
          label={text.fieldNetIncome}
          hint={text.fieldNetIncomeHint}
          unit={text.currencyUnit}
          value={draft.netIncome}
          onChange={(value) => setDraft({ ...draft, netIncome: value })}
        />
        <AmountInput
          testID="money-input-monthly-expense"
          label={text.fieldMonthlyExpense}
          hint={text.fieldMonthlyExpenseHint}
          unit={text.currencyUnit}
          value={draft.monthlyExpense}
          onChange={(value) => setDraft({ ...draft, monthlyExpense: value })}
        />
        <AmountInput
          testID="money-input-debt"
          label={text.fieldDebt}
          hint={text.fieldDebtHint}
          unit={text.currencyUnit}
          value={draft.debt}
          onChange={(value) => setDraft({ ...draft, debt: value })}
        />
        <AmountInput
          testID="money-input-savings"
          label={text.fieldSavings}
          hint={text.fieldSavingsHint}
          unit={text.currencyUnit}
          value={draft.savings}
          onChange={(value) => setDraft({ ...draft, savings: value })}
        />
        <AmountInput
          testID="money-input-net-worth"
          label={text.fieldNetWorth}
          hint={text.fieldNetWorthHint}
          unit={text.currencyUnit}
          value={draft.netWorth}
          onChange={(value) => setDraft({ ...draft, netWorth: value })}
          belowZero={{
            label: text.fieldNetWorthBelowZero,
            value: netWorthBelowZero,
            onChange: setNetWorthBelowZero,
            testID: 'money-input-net-worth-below-zero',
          }}
        />

        <View style={{ marginTop: space.md }}>
          <PrimaryButton
            testID="money-save"
            label={text.save}
            disabled={!canSave}
            onPress={save}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
