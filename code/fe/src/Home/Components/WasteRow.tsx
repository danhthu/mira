import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useText } from '../Text';
import { useHomeStyle } from './styles';

/**
 * Bốn nhãn lãng phí của `08-three-pillars.md` §Trụ 1. Chạm ghi ngay khoảng ngắn
 * nhất, giữ thì chọn khoảng — bán tự động qua Screen Time là chuyện của V2.
 */
export const WasteRow = (props: {
  onTap: (label: string) => void;
  onQuick: (label: string) => void;
}) => {
  const style = useHomeStyle();
  const text = useText();
  const labels: readonly string[] = [
    text.wasteDrift,
    text.wasteMeeting,
    text.wasteTraffic,
    text.wasteWaiting,
  ];

  return (
    <View style={style.section}>
      <Text style={style.sectionTitle}>{text.wasteTitle}</Text>
      <Text style={style.sectionHint}>{text.wasteHintRow}</Text>
      <View style={style.chipRow}>
        {labels.map((label) => (
          <Pressable
            key={label}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={style.chip}
            onPress={() => props.onTap(label)}
            onLongPress={() => props.onQuick(label)}
          >
            <Text style={style.chipText}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};
