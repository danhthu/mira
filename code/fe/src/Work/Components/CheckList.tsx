import { useState } from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { BICon } from '../../../libs/components';
import { ICON_LIST } from '../../../libs/components/Icon';
import { useTheme } from '../../../theme';
import { FONTSIZE } from '../../Common';
import { checkListOption } from '../../Common/Interfaces';
import { useText } from '../Text';

export const CheckList: React.FunctionComponent<{
  value: checkListOption;
  label?: string,
  labelInfo?: string,
  icon?: ICON_LIST,
  iconStyle?: StyleProp<TextStyle>
  style?: StyleProp<ViewStyle>
  onChanged?: (value: checkListOption) => void;
}> = ({ label = 'Checklist', value = { data: [] }, onChanged = () => { } }) => {
  const style = useStyles();
  const t = useText().translate;
  const [data, setData] = useState(value.data);
  return <View>
    {data.map((d, i) => <View key={i} style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={() => {
        data.splice(i, 1);
        setData([...data]);
      }}><BICon name='minuscircle' viewStyle={[style.icon_container]} style={style.icon_minus} /></TouchableOpacity>
      <View style={style.text_container}>
        <TextInput style={[style.text]} value={d.text} onChangeText={val => {
          d.text = val;
          setData([...data]);
          onChanged({ data });
        }}></TextInput>
      </View>
    </View>)}
    <TouchableOpacity onPress={() => { setData([...data, { text: '' }]); }} style={{ flexDirection: 'row' }}>
      <View >
        <BICon name='pluscircle' viewStyle={style.icon_container} style={[style.icon_plus]} />
      </View>
      <View style={[style.text_container, { borderBottomWidth: null }]}>
        <Text style={style.text}>{t('Add checklist')}</Text>
      </View>
    </TouchableOpacity>
  </View>;
};

const useStyles = () => {
  const colors = useTheme();
  return StyleSheet.create({
    icon_container: {
      height: 40,
      width: 30,
      alignItems: 'flex-start',
      justifyContent: 'center'
    },
    icon_minus: {
      color: colors.error,
      fontSize: 22,
    },
    icon_plus: {
      color: colors.success,
      fontSize: 22,
    },
    text_container: {
      flex: 1,
      height: 40,
      justifyContent: 'center',
      borderBottomWidth: 1, borderBottomColor: colors.outline
    },
    text: {
      fontSize: FONTSIZE.NORMAL
    }
  });
};