import { DrawerActions, useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { B, BICon, BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { FONT_SIZE, FONT_WEIGHT, TBL_ROW_HEIGHT } from '../../../theme/Constraints';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import { useCommonStyle } from '../../Common/Styles';
import { dateUtils } from '../../Common/Utils/common';
import { Background } from '../Components/Background';
import { TimeUsedSectionByDate } from '../Components/TimeUsedSection';
import { timeDataRepository } from '../Entities/repositories';
import { TimeCat } from '../Entities/TimeCat';
import { calc, getActivityInDays, getCats } from '../Models';
import { useText } from '../Text';
import { OpenTimeUsedDetail } from './Routing';


export const Home = ({ route, navigation }) => {
  const style = useCommonStyle();
  return <Background style={style.screen}>
    <Header route={route} navigation={navigation} />
    <Body route={route} navigation={navigation} />
  </Background>;
};

const Header = ({ route, navigation }) => {
  const text = useText();
  const style = useCommonStyle().header;
  const colors = useTheme();
  return <View style={style.container}>
    <Text style={[style.title]}>{text.home_title || 'Your time'}</Text>
    <TouchableOpacity
      style={style.left}
      onPress={() => navigation.dispatch(DrawerActions.openDrawer)}
    >
      <BICon name="menu" style={style.icon}></BICon>
    </TouchableOpacity>
    <TouchableOpacity
      style={style.right}
      onPress={() => navigation.goBack()}
    >
      <BICon name="close" style={[style.icon, { color: colors.error }]}></BICon>
    </TouchableOpacity>
  </View>;
};

const Body = ({ route, navigation }) => {
  const startDate = moment(dateUtils.getStartOfWeek(new Date)).add(-10, 'days').toDate();
  const endDate = new Date;
  const ready = useAsyncAction(async () => {
    await calc(startDate, endDate);
    return true;
  }, []);
  if (!ready) return <View />;
  return <>
    <TimeDetail startDate={startDate} endDate={endDate} />
  </>;
};



const TimeDetail = ({ startDate, endDate }) => {
  const nav = useNavigation();
  const colors = useTheme();
  const [data, setData] = useState({ cats: [], details: [] as Array<{ day: string, data: Array<TimeCat> }> });
  useAsyncAction(async () => {
    setData({
      cats: await getCats(startDate, endDate),
      details: await getActivityInDays(startDate, endDate)
    });
  }, [useDectectDataChanged(timeDataRepository)]);

  return (
    <FlatList
      data={data.details}
      renderItem={({ item, index }) => <View>
        {index == 0 && <TimeUsedSectionByDate startDate={startDate} endDate={endDate} />}
        <View >
          <Text style={{ lineHeight: TBL_ROW_HEIGHT, fontWeight: FONT_WEIGHT.SEMIBOLD, }}>{item.day}</Text>
          {item.data.map((value, index2) =>
            <View
              key={index + '|' + index2}
              style={{ justifyContent: 'center', height: TBL_ROW_HEIGHT, paddingRight: 10, paddingLeft: 20 }}>
              <View style={{ flexDirection: 'row' }}>
                {/*<Text style={{ width: 50, textAlign: 'center', lineHeight: TBL_ROW_HEIGHT }}>{index + 1}</Text>*/}
                <View

                  style={{ flexDirection: 'row', flex: 1 }}>
                  <View style={{
                    height: TBL_ROW_HEIGHT - 26,
                    marginTop: 13,
                    backgroundColor: value.color, borderRadius: 2,
                    width: 5, marginRight: 10
                  }}></View>
                  <Text style={{ flex: 1, lineHeight: TBL_ROW_HEIGHT }}>{value.label} <Text style={{ fontWeight: FONT_WEIGHT.SEMIBOLD }}>({value.total})</Text></Text>
                </View>
                <TouchableOpacity style={{ width: 70, flexDirection: 'row', alignItems: 'flex-end' }}
                  onPress={() => OpenTimeUsedDetail(nav, value.day, value.id)
                  }>
                  <Text style={{ textAlign: 'right', flex: 1, lineHeight: TBL_ROW_HEIGHT, color: colors.primary }}>{parseInt(value.value + '')}</Text>
                  <B.ICon name="right" style={{ marginLeft: 10, lineHeight: TBL_ROW_HEIGHT, color: colors.primary, fontSize: FONT_SIZE.Text }} />
                </TouchableOpacity>
              </View>
            </View>)}
        </View>
      </View>
      }
      ItemSeparatorComponent={() => <View />}
    />
  );

};


