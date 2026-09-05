import React from 'react';
import { View } from 'react-native';
import { MetricView } from '../Models/presenter';
import { Metric } from './Metric';
import { useHomeStyle } from './styles';

/**
 * Bảng điều khiển của `08-three-pillars.md`: bốn con số, một đường kẻ giữa trụ
 * Thời gian và trụ Tài chính. Không biểu đồ — trống là tính năng.
 */
export const Board = (props: {
  meaningful: MetricView;
  waste: MetricView;
  wealth: MetricView;
  evaporation: MetricView;
}) => {
  const style = useHomeStyle();

  return (
    <View style={style.board}>
      <Metric view={props.meaningful} />
      <Metric view={props.waste} />
      <View style={style.boardDivider} />
      <Metric view={props.wealth} />
      <Metric view={props.evaporation} />
    </View>
  );
};
