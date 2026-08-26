import moment from 'moment';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { B, BICon, BText as Text } from '../../../libs/components';
import { Router } from '../../../Router';
import { useTheme } from '../../../theme';
import { goalRepository } from '../Entities';
import { useText } from '../Text';

import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native';
import { FONT_SIZE, FONT_WEIGHT, HEADER_HEIGHT, ICON_TOUCH_WIDTH } from '../../../theme/Constraints';
import { useAsyncAction, useDectectDataChanged, useSettings } from '../../Common/Hooks';
import { useCommonStyle } from '../../Common/Styles';
import { Background } from '../Components/Background';
import { GoalDataType, RowItem } from '../Components/RowItem';

declare type DataType = { current: number, target: number, details: Array<{ day: Date, status: number | string }> } & GoalDataType


/**params id */
export const Detail = ({ route, navigation }) => {
  const [data, setData] = useState({ details: [] } as DataType);
  const text = useText();
  const colors = useTheme();
  const style = useCommonStyle();
  const [settings] = useSettings();
  useAsyncAction(async () => {
    if (route.params && route.params.id) {
      setData((await loadData(route.params.id)));
    }
  }, [route.params, useDectectDataChanged(goalRepository)]);
  return <Background style={[{}]}>
    <View style={{ padding: 16, paddingBottom: 0 }}>
      <Header data={data} />
      <RowItem Goal={data} style={[{ borderRadius: 10, borderColor: colors.primary }]} />
    </View>
    <ScrollView style={[style.screen, { paddingTop: 0 }]}>
      <View style={{
        borderWidth: 1, borderColor: colors.primary, marginTop: 20, borderTopWidth: 10,
        borderTopColor: colors.primary, backgroundColor: '#fff', padding: 20,

      }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ flex: 1, alignSelf: 'flex-start', color: colors.warn }}>{text.current || 'Hiện tại'}: {data.current}</Text>
          <Text style={{ flex: 1, alignSelf: 'flex-end', textAlign: 'right' }}>{text.target || 'Mục tiêu'}: {data.target}</Text>
        </View>
        {data.details.length > 0 && <>
          <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: colors.outline, paddingBottom: 10 }}>
              <Text style={{ flex: 1, fontWeight: FONT_WEIGHT.SEMIBOLD }}>{text.day || 'Ngày'}</Text>
              <Text style={{ width: 100, alignSelf: 'flex-end', fontWeight: FONT_WEIGHT.SEMIBOLD, textAlign: 'right' }}>{text.result || 'Kết quả'}</Text>
            </View>
            {data.details.map((d, i) => <View key={i} style={{ backgroundColor: i % 2 ? colors.hexToRGB(colors.grayColor, 0.1) : '#fff' }}>
              <Text style={{ flex: 1, fontWeight: FONT_WEIGHT.SEMIBOLD }}>{moment(d.day).format(settings.dateFormat)}</Text>
              <Text style={{ width: 100, alignSelf: 'flex-end', fontWeight: FONT_WEIGHT.SEMIBOLD, textAlign: 'right' }}>{d.status}</Text>
            </View>)}

          </View>
        </>}
        {!data.details.length && <View>
        </View>}
      </View>
    </ScrollView>
  </Background>;
};


const loadData = async (id): Promise<DataType> => {
  const Goal = await goalRepository.findOne(c => c.id == id);
  const current = moment(new Date).diff(Goal.start, 'days');
  const target = moment(Goal.end).diff(Goal.start, 'days');
  const details = [];
  let percentage: 0;
  const total = moment(Goal.end).diff(Goal.start, 'days');
  //Goal --> type {link times, target}

  return { percentage, total, current, target, details, ...Goal };
};



const Header = (props: { data: DataType }) => {
  const navigation = useNavigation();
  const text = useText();
  const colors = useTheme();
  return (<View>
    <View style={[{ height: HEADER_HEIGHT }]}>
      <TouchableOpacity
        style={[
          {
            width: ICON_TOUCH_WIDTH,
            height: HEADER_HEIGHT,
            justifyContent: 'center',
            alignItems: 'flex-start',
            position: 'absolute',
            top: 0,
            left: 0
          }
        ]}
        onPress={navigation.goBack}
      >
        <B.ICon
          name="return-up-back"
          style={{ fontSize: FONT_SIZE.PageTitle }}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          {
            width: ICON_TOUCH_WIDTH + 16,
            height: HEADER_HEIGHT,
            justifyContent: 'center',
            alignItems: 'flex-end',
            position: 'absolute',
            right: 0,
            paddingRight: 10,

          },
        ]}
        onPress={() => Router.Open(navigation, 'GoalApp', { screen: 'Edit', id: props.data.id })}            >
        <BICon name="edit" style={{ fontSize: FONT_SIZE.ICon }} />
      </TouchableOpacity>

    </View>

  </View>
  );
};

