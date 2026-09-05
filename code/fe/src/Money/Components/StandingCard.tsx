import { MetricState } from '../../Core/dataState';
import { WealthStanding } from '../../Core/money';
import { useText } from '../Text';
import { Card, CardHeadline, CardNote } from './Card';

/**
 * Nấc giàu luôn đi kèm quãng đường phía trước (`00-vision.md` rủi ro #3).
 * Nhánh `in_debt` không hiện số âm: Core đã đổi tài sản ròng âm thành `shortfall`
 * dương cộng quãng đường về vạch 0, màn hình chỉ đọc lại đúng thứ đó.
 */
export const StandingCard = ({
  standing,
}: {
  readonly standing: MetricState<WealthStanding>;
}) => {
  const text = useText();

  if (standing.status === 'empty') {
    return (
      <Card title={text.standingTitle} testID="money-standing">
        <CardNote>{text.standingUnavailable(standing.reason)}</CardNote>
      </Card>
    );
  }

  const value = standing.value;

  if (value.kind === 'in_debt') {
    return (
      <Card title={text.standingTitle} testID="money-standing">
        <CardHeadline>{text.standingInDebt(value.shortfall)}</CardHeadline>
        <CardNote>
          {value.monthsOfSavingToBreakEven === null
            ? text.standingInDebtNoSaving
            : text.standingInDebtBySaving(value.monthsOfSavingToBreakEven)}
        </CardNote>
      </Card>
    );
  }

  return (
    <Card title={text.standingTitle} testID="money-standing">
      <CardHeadline>{text.standingOnLadder(value.tier, value.freedomMonths)}</CardHeadline>
      <CardNote>
        {value.nextTier === null
          ? text.standingTopTier
          : value.monthsOfSavingToNextTier === null
            ? text.standingNextByGap(value.monthsGapToNextTier, value.nextTier)
            : text.standingNextBySaving(value.monthsOfSavingToNextTier, value.nextTier)}
      </CardNote>
    </Card>
  );
};
