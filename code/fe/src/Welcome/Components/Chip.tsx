import React from 'react';
import { Pressable, Text } from 'react-native';
import { useWelcomeStyle } from './styles';

/** Ô chọn của bước 1. Không dùng màu để khen chê, chỉ để cho biết đang chọn cái nào. */
export const Chip = (props: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => {
  const style = useWelcomeStyle();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.label}
      accessibilityState={{ selected: props.selected }}
      style={props.selected ? [style.chip, style.chipSelected] : style.chip}
      onPress={props.onPress}
    >
      <Text
        style={
          props.selected ? [style.chipText, style.chipTextSelected] : style.chipText
        }
      >
        {props.label}
      </Text>
    </Pressable>
  );
};
