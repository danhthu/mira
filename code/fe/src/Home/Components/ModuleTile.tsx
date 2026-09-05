import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ModuleEntry } from '../Models/tiles';
import { useHomeStyle } from './styles';

/**
 * Một lối vào module. Tên ở trên, một câu về hôm nay ở dưới — chữ chứ không phải
 * huy hiệu, và câu chưa-có-dữ-liệu trông giống hệt câu đã-có-dữ-liệu về mặt màu.
 */
export const ModuleTile = (props: {
  entry: ModuleEntry;
  onOpen: (entry: ModuleEntry) => void;
}) => {
  const style = useHomeStyle();
  const { entry } = props;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={entry.title}
      style={style.tile}
      onPress={() => props.onOpen(entry)}
    >
      <View>
        <Text style={style.tileTitle}>{entry.title}</Text>
        <Text style={style.tileLine}>{entry.line}</Text>
      </View>
    </Pressable>
  );
};
