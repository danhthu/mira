import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { PersonCardView } from '../Models/presenter';
import { useText } from '../Text';
import { usePersonStyle } from './styles';

/**
 * Một người. Không có thanh tiến độ, không có phần trăm, không có màu theo mức —
 * ràng buộc cứng #3 cấm xếp hạng và chấm điểm quan hệ, nên thẻ chỉ đặt sự thật lên
 * bàn: giờ ở cùng tuần này, lần gần nhất, nhịp gặp mà chính người dùng đã chọn.
 */
export const PersonCard = (props: { view: PersonCardView; onEdit: () => void }) => {
  const style = usePersonStyle();
  const text = useText();
  const { view } = props;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={view.name}
      style={style.card}
      onPress={props.onEdit}
    >
      <View style={style.cardLine}>
        <Text style={style.cardName}>{view.name}</Text>
        <Text style={view.hours === null ? style.cardValueMissing : style.cardValue}>
          {view.hours === null ? text.missingValue : view.hours}
        </Text>
        {view.hoursUnit === null ? null : (
          <Text style={style.cardUnit}>{view.hoursUnit}</Text>
        )}
        <Text style={style.cardWeek}>{text.weekLabel}</Text>
      </View>

      {view.notes.map((note) => (
        <Text key={note} style={style.cardNote}>
          {note}
        </Text>
      ))}

      <Text style={style.cardEdit}>{text.edit}</Text>
    </Pressable>
  );
};
