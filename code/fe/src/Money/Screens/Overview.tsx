import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorToken, fontSize, space } from '../../../theme';
import { Card, CardHeadline, CardNote } from '../Components/Card';
import { EvaporationCard } from '../Components/EvaporationCard';
import { PrimaryButton } from '../Components/PrimaryButton';
import { StandingCard } from '../Components/StandingCard';
import { StatCard } from '../Components/StatCard';
import { useMoneyDashboard } from '../Hooks/useMoneyDashboard';
import { useText } from '../Text';

export interface MoneyScreenProps {
  readonly navigation: { readonly navigate: (name: string) => void };
}

/**
 * Màn Tài chính. Thứ tự đúng theo `08` §Trụ 2: nấc giàu kèm quãng đường trước,
 * rồi bốc hơi, rồi hai con số phụ. Không biểu đồ, không danh mục chi tiêu,
 * không danh mục đầu tư — `08` §"Những gì bị cắt".
 */
export const Overview = (props: MoneyScreenProps) => {
  const token = useColorToken();
  const text = useText();
  const { summary, loading } = useMoneyDashboard();

  if (loading) return <SafeAreaView style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: space.lg }}>
        <Text
          style={{
            color: token.textPrimary,
            fontSize: fontSize.headline,
            marginBottom: space.lg,
          }}
        >
          {text.screenTitle}
        </Text>

        {summary.status === 'empty' ? (
          <Card title={text.emptyLabel} testID="money-empty">
            <CardHeadline>{text.emptyTitle}</CardHeadline>
            <CardNote>{text.emptyBody}</CardNote>
          </Card>
        ) : (
          <View>
            <StandingCard standing={summary.value.standing} />
            <EvaporationCard
              evaporation={summary.value.evaporation}
              lifeHours={summary.value.evaporationLifeHours}
              freedomDays={summary.value.evaporationFreedomDays}
            />
            <StatCard
              title={text.savingsRateTitle}
              state={summary.value.savingsRate}
              format={text.savingsRateValue}
              unavailable={text.savingsRateUnavailable}
              testID="money-savings-rate"
            />
            <StatCard
              title={text.freedomDaysTitle}
              state={summary.value.freedomDaysGained}
              format={text.freedomDaysValue}
              unavailable={text.freedomDaysUnavailable}
              testID="money-freedom-days"
            />
            {summary.status === 'learning' && (
              <Text
                testID="money-learning"
                style={{
                  color: token.textMuted,
                  fontSize: fontSize.caption,
                  marginBottom: space.lg,
                }}
              >
                {text.learningNote(summary.samplesHave, summary.samplesNeed)}
              </Text>
            )}
          </View>
        )}

        <PrimaryButton
          testID="money-open-entry"
          label={summary.status === 'empty' ? text.openEntry : text.updateEntry}
          onPress={() => props.navigation.navigate('MonthlyEntry')}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
