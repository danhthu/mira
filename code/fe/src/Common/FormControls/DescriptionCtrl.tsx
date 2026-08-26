import { useNavigation } from '@react-navigation/native';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { B } from '../../../libs/components';
import { FONTSIZE, TBL_ROW_HEIGHT } from '../../../theme/Constraints';
import { useText } from '../Text';
export const DescriptionCtrl = (props: { value: string, onChanged: (val: string) => void }) => {
  const navigation = useNavigation();
  const text = useText();
  return <TouchableOpacity
  >
    <View style={{ height: TBL_ROW_HEIGHT, justifyContent: 'center' }}>
      <View style={{ flexDirection: 'row' }}>
        <B.ICon name="infocirlce" style={{ fontSize: FONTSIZE.NORMAL, marginRight: 10 }} />
        <B.Text>{text.ghichu || 'Ghi chú'}</B.Text>
      </View>
    </View>
    <View >
      <TextInput multiline style={{ minHeight: 80 }} value={props.value}></TextInput>
    </View>
  </TouchableOpacity>;
};