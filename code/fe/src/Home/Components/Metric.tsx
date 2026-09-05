import React from 'react';
import { Text, View } from 'react-native';
import { MetricView } from '../Models/presenter';
import { useText } from '../Text';
import { useHomeStyle } from './styles';

/**
 * Một dòng của bảng bốn con số. Không có màu theo dấu: dấu trừ ở dòng lãng phí là
 * tin tốt, dấu trừ ở dòng ý nghĩa thì không — tô màu theo dấu sẽ phán xét sai
 * (ràng buộc cứng #3).
 */
export const Metric = (props: { view: MetricView }) => {
  const style = useHomeStyle();
  const text = useText();
  const { view } = props;

  return (
    <View style={style.metric}>
      <View style={style.metricLine}>
        <Text style={style.metricLabel}>{view.label}</Text>
        <Text style={view.value === null ? style.metricValueMissing : style.metricValue}>
          {view.value === null ? text.missingValue : view.value}
        </Text>
        {view.unit === null ? null : <Text style={style.metricUnit}>{view.unit}</Text>}
        <Text style={style.metricDelta}>{view.delta === null ? '' : view.delta}</Text>
      </View>
      {view.notes.map((note) => (
        <Text key={note} style={style.metricNote}>
          {note}
        </Text>
      ))}
    </View>
  );
};
