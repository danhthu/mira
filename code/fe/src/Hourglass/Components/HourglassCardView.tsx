/**
 * Card của một người — khung theo `05-v1-spec.md` §"Màn hình 2 · Đồng hồ cát".
 *
 * Mọi nhánh trạng thái đều kết thúc bằng đúng hai nút: một hành động cụ thể và nút
 * ẩn card. Không có nhánh nào chỉ đưa con số rồi thôi (ràng buộc cứng #4).
 */

import { View } from 'react-native';
import { space } from '../../../theme';
import { HourglassCard, HourglassCardAction } from '../Models/cards';
import { hourglassText } from '../Text';
import { Button, Headline, Muted, Note, Row, Surface, Title } from './Basics';

const actionLabel: Record<HourglassCardAction, string> = {
  enter_birth_year: hourglassText.actionEnterBirthYear,
  plan_contact: hourglassText.actionPlanContact,
  postpone_contact: hourglassText.actionPostponeContact,
};

const Body = ({ card }: { readonly card: HourglassCard }) => {
  if (card.state.status === 'needs_birth_year') {
    return <Headline>{hourglassText.needsBirthYear}</Headline>;
  }
  if (card.state.status === 'quiet') {
    return <Headline>{hourglassText.quiet(card.state.reason)}</Headline>;
  }
  if (card.state.status === 'unavailable') {
    return <Headline>{hourglassText.unavailable(card.state.reason)}</Headline>;
  }

  const value = card.state.value;
  if (value.kind === 'child') {
    return (
      <View>
        <Headline>{hourglassText.childHoursLeft(value.hoursLeft)}</Headline>
        <Note>
          {hourglassText.childHoursIfMore(value.hoursIfMore, value.targetWeeklyHours)}
        </Note>
      </View>
    );
  }

  return (
    <View>
      <Headline>{hourglassText.visitsLeft(value.visitsLeft)}</Headline>
      <Note>{hourglassText.daysTogether(value.daysTogether)}</Note>
    </View>
  );
};

export const HourglassCardView = ({
  card,
  onAction,
  onHide,
}: {
  readonly card: HourglassCard;
  readonly onAction: (card: HourglassCard) => void;
  readonly onHide: (card: HourglassCard) => void;
}) => (
  <Surface testID={'hourglass-card-' + card.personId}>
    <Title>{card.name}</Title>
    {card.cadence ? (
      <Muted>
        {hourglassText.cadenceLine(card.cadence.visitsPerYear, card.cadence.daysPerVisit)}
      </Muted>
    ) : null}

    <Body card={card} />

    {card.plannedContactDate ? (
      <Note>{hourglassText.plannedContact(card.plannedContactDate)}</Note>
    ) : null}

    <View style={{ marginTop: space.lg }}>
      <Row>
        <Button
          testID={'hourglass-action-' + card.personId}
          tone="accent"
          label={actionLabel[card.action]}
          onPress={() => onAction(card)}
        />
        <Button
          testID={'hourglass-hide-' + card.personId}
          tone="quiet"
          label={hourglassText.actionHide}
          onPress={() => onHide(card)}
        />
      </Row>
    </View>
  </Surface>
);
