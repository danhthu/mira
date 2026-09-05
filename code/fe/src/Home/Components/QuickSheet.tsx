import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { QUICK_MINUTES } from '../Models/constants';
import { useText } from '../Text';
import { useHomeStyle } from './styles';

/**
 * Ghi nhanh 30p/1h/2h (`05-v1-spec.md` §"Màn hình 1"). Mở bằng cách giữ một avatar
 * hoặc một nhãn lãng phí, nên chọn xong là hết hai thao tác.
 */
export const QuickSheet = (props: {
  visible: boolean;
  title: string;
  onPick: (minutes: number) => void;
  onCancel: () => void;
}) => {
  const style = useHomeStyle();
  const text = useText();
  const labels: Record<number, string> = {
    30: text.quick30,
    60: text.quick60,
    120: text.quick120,
  };

  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="fade"
      onRequestClose={props.onCancel}
    >
      <Pressable style={style.sheetScrim} onPress={props.onCancel}>
        <View style={style.sheet}>
          <Text style={style.sheetTitle}>{props.title}</Text>
          {QUICK_MINUTES.map((minutes) => (
            <Pressable
              key={minutes}
              accessibilityRole="button"
              style={style.sheetOption}
              onPress={() => props.onPick(minutes)}
            >
              <Text style={style.sheetOptionText}>{labels[minutes]}</Text>
            </Pressable>
          ))}
          <Pressable
            accessibilityRole="button"
            style={style.sheetOption}
            onPress={props.onCancel}
          >
            <Text style={style.sheetCancelText}>{text.quickCancel}</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};
