import { MetricState, MetricEmptyReason } from '../../Core/dataState';
import { Card, CardHeadline, CardNote } from './Card';

export interface StatCardProps {
  readonly title: string;
  readonly state: MetricState<number>;
  readonly format: (value: number) => string;
  readonly unavailable: (reason: MetricEmptyReason) => string;
  readonly testID: string;
}

/** Một con số kèm nhãn. Nhánh `empty` nói lý do bằng lời, không hiện 0. */
export const StatCard = (props: StatCardProps) => (
  <Card title={props.title} testID={props.testID}>
    {props.state.status === 'empty' ? (
      <CardNote>{props.unavailable(props.state.reason)}</CardNote>
    ) : (
      <CardHeadline>{props.format(props.state.value)}</CardHeadline>
    )}
  </Card>
);
