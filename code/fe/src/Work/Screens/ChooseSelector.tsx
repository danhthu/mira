
import moment from 'moment';
import { useEffect, useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { B, BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { FONT_SIZE, PADDING, TBL_ROW_HEIGHT } from '../../../theme/Constraints';
import { useAsyncAction, useStateData } from '../../Common/Hooks';
import { getCurrentDay, getDay, getNextWeekend, getStartOfWeek } from '../../Common/Utils/common';
import { Background } from '../Components/Background';
import { Work, workRepository } from '../Entities';
import { useText } from '../Text';

export const ChooseSelector = ({ route, navigation }) => {
  const colors = useTheme();
  const [day, setDay, dayRef] = useStateData(getDay(route.params.date ? getDay(new Date((route.params.date))) : getCurrentDay()));
  const [data, setData, dataRef] = useStateData([] as Work[]);
  const text = useText();
  const [filterIndex, setFilterIndex] = useState(0);
  const filters = [{
    text: text.all || 'Tất cả',
    type: 'all'
  },
  {
    text: text.tomorrow || 'Ngày mai',
    type: 'tomorrow'
  },
  {
    text: text.week || 'Tuần này',
    type: 'week'
  },
  {
    text: text.unknow || 'Chưa sắp xếp',
    type: 'unknow'
  },
  ];

  const filterData = (filter) => {
    return data.filter(h => filter.type == 'all' ? true :
      filter.type == 'tomorrow' ? h.startDate && getDay(h.startDate).getTime() == moment(getCurrentDay()).add(1, 'days').toDate().getTime() :
        filter.type == 'week' ? h.startDate && getDay(h.startDate).getTime() >= getDay(getStartOfWeek(getCurrentDay())).getTime()
          && getDay(h.startDate).getTime() <= getDay(getNextWeekend(getCurrentDay())).getTime() :
          !h.startDate
    );
  };

  useAsyncAction(async () => {
    //load data
    const data = await workRepository.filter(w => w.status != 'DONE');
    setDay(prev => new Date(getDay(route.params.date)));
    setData(prev => data);
  }, [route.params]);
  const save = () => {
    workRepository.updateList(dataRef.current);
    workRepository.save();
  };
  useEffect(() => {
    navigation.setOptions({
      title: 'Ngày [ ' + moment(day || new Date).format('DD, MMM') + ' ]'
    });
    return save;
  }, []);
  const selectItem = (item) => {
    const old = data.filter(d => d.id == item.id)[0];
    old.startDate = old.startDate ? undefined : dayRef.current;
    setData([...data]);
  };
  return <>
    {/**tab filter */}
    <Background>
      <View>
        <ScrollView horizontal style={[{ marginBottom: 10, }]}>
          <View style={[{ flexDirection: 'row' }]}>
            {filters.map((item, index) => <TouchableOpacity
              style={[{ margin: 5, padding: 5, paddingLeft: 8, paddingRight: 8 }, filterIndex == index && {
                backgroundColor: colors.hexToRGB(colors.primary, 0.35),
                borderRadius: 20,
                borderWidth: 1, borderColor: colors.outlineVariant
              }]}
              key={index} onPress={() => {
                setFilterIndex(prev => index);
              }}>
              <Text style={[filterIndex == index && { color: colors.onPrimary }]}>{item.text}</Text>
            </TouchableOpacity>)}
          </View>
        </ScrollView>
        {/**body */}
        <FlatList
          style={{ padding: PADDING.SCREEN, paddingTop: 0 }}
          data={data}
          renderItem={({ item, index }) => <TouchableOpacity key={index} onPress={() => selectItem(item)}
            style={[{
              flexDirection: 'row', paddingTop: 5, paddingBottom: 5,
            }]}>
            <Text style={{ lineHeight: TBL_ROW_HEIGHT, fontSize: FONT_SIZE.ListItem, flex: 1 }}>{item.name}</Text>
            {(item.startDate && getDay(item.startDate).getTime() == day.getTime()) && <B.ICon name="checkcircle" style={{
              alignSelf: 'flex-end',

              height: TBL_ROW_HEIGHT, lineHeight: TBL_ROW_HEIGHT, justifyContent: 'center',
              marginRight: 10,
              color: colors.primary,
              fontSize: FONT_SIZE.ListItem + 2
            }} />}
          </TouchableOpacity>
          }
          ItemSeparatorComponent={() => <View style={{
            borderBottomWidth: 1,
            borderBottomColor: colors.outlineVariant,
          }} />}
        >
        </FlatList>
      </View>
    </Background>
  </>;
};

