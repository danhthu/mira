import React from 'react';
import { Pressable, View } from 'react-native';
import { CADENCE_STOPS } from '../Models/constants';
import { useWelcomeStyle } from './styles';

/**
 * Thanh nhịp gặp: năm nấc từ hằng ngày tới một lần một tháng, chạm thẳng vào nấc
 * là chọn.
 *
 * Vì sao chạm chứ không kéo: dự án chưa có gói thanh trượt tuyến tính nào
 * (`@react-native-community/slider` không nằm trong `package.json`), và tự viết
 * bằng `PanResponder` thì hành vi trên web khác trên máy. Nấc chạm được cho cùng
 * kết quả trong một thao tác, không phải một cú kéo — hợp trần ba chạm của
 * `05-v1-spec.md` DoD #2 hơn. Xem HANDOFF.md.
 */
export const CadenceSlider = (props: {
  value: number;
  accessibilityLabel: string;
  onChange: (cadence: number) => void;
}) => {
  const style = useWelcomeStyle();

  return (
    <View style={style.track}>
      <View style={style.trackLine} />
      {CADENCE_STOPS.map((stop) => {
        const selected = stop === props.value;
        return (
          <Pressable
            key={stop}
            accessibilityRole="button"
            accessibilityLabel={props.accessibilityLabel}
            accessibilityState={{ selected }}
            style={style.trackStop}
            onPress={() => props.onChange(stop)}
          >
            <View style={selected ? style.trackDotSelected : style.trackDot} />
          </Pressable>
        );
      })}
    </View>
  );
};
