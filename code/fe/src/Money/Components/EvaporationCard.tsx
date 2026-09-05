import { MetricState } from '../../Core/dataState';
import { useText } from '../Text';
import { Card, CardHeadline, CardNote } from './Card';

export interface EvaporationCardProps {
  readonly evaporation: MetricState<number>;
  readonly lifeHours: MetricState<number>;
  readonly freedomDays: MetricState<number>;
}

/**
 * Phát hiện chính của trụ Tài chính (`08` §"Bốc hơi"). Không phân loại chi tiêu,
 * không hỏi tiền đi đâu — chỉ nói thẳng phần không giải thích được, rồi quy ra
 * giờ đời và ngày tự do. Dòng giờ đời chỉ hiện khi đã biết tỷ giá đời; chưa biết
 * thì bỏ hẳn dòng đó chứ không hiện 0 giờ.
 */
export const EvaporationCard = (props: EvaporationCardProps) => {
  const text = useText();
  const { evaporation, lifeHours, freedomDays } = props;

  if (evaporation.status === 'empty') {
    return (
      <Card title={text.evaporationTitle} testID="money-evaporation">
        <CardNote>{text.evaporationUnavailable(evaporation.reason)}</CardNote>
      </Card>
    );
  }

  if (evaporation.value === 0) {
    return (
      <Card title={text.evaporationTitle} testID="money-evaporation">
        <CardHeadline>{text.evaporationBalanced}</CardHeadline>
      </Card>
    );
  }

  if (evaporation.value < 0) {
    return (
      <Card title={text.evaporationTitle} testID="money-evaporation">
        <CardHeadline>{text.evaporationOverspent(evaporation.value)}</CardHeadline>
        <CardNote>{text.evaporationOverspentBody}</CardNote>
      </Card>
    );
  }

  const amount = evaporation.value;
  return (
    <Card title={text.evaporationTitle} testID="money-evaporation">
      <CardHeadline>{text.evaporationAmount(amount)}</CardHeadline>
      <CardNote>{text.evaporationBody}</CardNote>
      {freedomDays.status !== 'empty' && (
        <CardNote>
          {lifeHours.status === 'empty'
            ? text.evaporationInFreedomDays(amount, freedomDays.value)
            : text.evaporationInLife(amount, lifeHours.value, freedomDays.value)}
        </CardNote>
      )}
    </Card>
  );
};
