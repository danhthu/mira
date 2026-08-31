
import { useEffect } from 'react';
import { FlatList, Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { B } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { FONT_SIZE, PADDING, TBL_ROW_HEIGHT } from '../../../theme/Constraints';
import { useAsyncAction, useStateData } from '../../Common/Hooks';
import { getDay } from '../../Common/Utils/common';
import { Background } from '../Components/Background';
import { Work, workRepository } from '../Entities';

export const MandatorySelector = ({ route, navigation }) => {
  const colors = useTheme();
  const day = getDay(route.params.date || new Date);
  const [data, setData, dataRef] = useStateData([] as Work[]);
  useAsyncAction(async () => {
    //load data
    setData(await workRepository.getListByDate(day));
  }, [route.params]);
  const save = () => {
    workRepository.updateList(dataRef.current);
    workRepository.save();
  };
  useEffect(() => {
    navigation.setOptions({
      title: 'Chọn việc bắt buộc'
    });
    return save;
  }, []);
  const selectItem = (item) => {
    const target = data.filter(d => d.id == item.id)[0];
    target.mandatory = !item.mandatory;
    setData([...data]);
  };
  return <Background><FlatList
    style={{ padding: PADDING.SCREEN, }}
    data={data}
    renderItem={({ item, index }) => <TouchableOpacity key={index} onPress={() => selectItem(item)}
      style={[{
        flexDirection: 'row', borderBottomWidth: 1,
        borderBottomColor: colors.outlineVariant, paddingTop: 5, paddingBottom: 5,
      }]}>
      <Text style={{ lineHeight: TBL_ROW_HEIGHT, fontSize: FONT_SIZE.ListItem, flex: 1 }}>{item.name}</Text>
      {item.mandatory && <B.ICon name="checkcircle" style={{
        alignSelf: 'flex-end',

        height: TBL_ROW_HEIGHT, lineHeight: TBL_ROW_HEIGHT, justifyContent: 'center',
        marginRight: 10,
        color: colors.primary,
        fontSize: FONT_SIZE.ListItem + 2
      }} />}
    </TouchableOpacity>}
  >
  </FlatList></Background>;
};
