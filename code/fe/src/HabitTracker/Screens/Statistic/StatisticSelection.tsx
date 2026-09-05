import { useNavigation } from '@react-navigation/native';
import { from } from 'linq-to-typescript';
import { useState } from 'react';
import {
  FlatList,
  Image,
  TouchableOpacity,
  View,
} from 'react-native';
import usePerformance from '../../../../hook/useScreenLoadTime';
import { B, BText as Text } from '../../../../libs/components';
import { Cel, Row } from '../../../../libs/components/Row';
import { useTheme } from '../../../../theme';
import {
  FONT_SIZE,
  FONT_WEIGHT,
  HEADER_HEIGHT,
  ICON_TOUCH_WIDTH,
  TBL_ROW_HEIGHT,
} from '../../../../theme/Constraints';
import { getLogger } from '../../../Common';
import { useAsyncAction } from '../../../Common/Hooks';
import { useCommonStyle } from '../../../Common/Styles';
import { Background } from '../../Components/Background';
import { habitRepository, habitTrackerRepository } from '../../Entities';
import { useText } from '../../Text';

const logger = getLogger('StatisticSelection');
export const StatisticSelection = ({ route, navigation }) => {
  usePerformance('HabitTracker\StatisticSelection');
  const commonStyle = useCommonStyle();
  const text = useText();
  const [tag, setTag] = useState('all');
  const colors = useTheme();
  const tags = useAsyncAction(async () => ['all', ...(await habitRepository.getTags())], []);
  const data = useAsyncAction(async () => {
    const habits = await habitRepository.filter(d => tag == 'all' || d.tags && d.tags.includes(tag));
    return from(await habitTrackerRepository.list())
      .groupBy(h => h.hid)
      .select(g => ({ total: g.count(), ...habits.findLast(h => h.id == g.key) }))
      .toArray();
  }, [tag], [], 'HabitTracker\StatisticSelection');

  if (!data) return <Background></Background>;
  return (
    <Background style={commonStyle.modalPadding}>
      <Header />
      <View>
        {tags.length > 1 && (
          <B.HashTag
            activeIndex={tags.indexOf(tag)}
            data={tags}
            onSelected={(val) => {
              setTag(val);
            }}
          />
        )}
      </View>
      <FlatList
        data={data}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              route.params.onGoBack && route.params.onGoBack(item);
              navigation.goBack();
            }}
            style={[
              {
                flexDirection: 'row',
                borderBottomWidth: 1,
                borderBottomColor: colors.outlineVariant,
                paddingTop: 5,
                paddingBottom: 5,
              },
            ]}
          >
            <View style={{ height: TBL_ROW_HEIGHT, justifyContent: 'center' }}>
              <B.ICon name="star" style={{ color: 'yellow', fontSize: FONT_SIZE.ICon, marginRight: 10 }} />
            </View>
            <Text
              style={{
                lineHeight: TBL_ROW_HEIGHT,
                fontSize: FONT_SIZE.ListItem,
                flex: 1,
              }}
            >
              {item.name}
            </Text>
            <View style={{ alignItems: 'flex-end', height: TBL_ROW_HEIGHT, justifyContent: 'center', flexDirection: 'row' }}>
              <Text style={{ marginRight: 5, lineHeight: TBL_ROW_HEIGHT }}>{item.total}</Text>
              <B.ICon name="right" style={{ fontSize: FONT_SIZE.ICon, lineHeight: TBL_ROW_HEIGHT }} />
            </View>
          </TouchableOpacity>
        )}
      ></FlatList>
      {/**empty */}
      {data.length == 0 && <Row style={{ paddingLeft: 16, paddingRight: 16, borderBottomWidth: 0 }}>
        <Cel style={{ flex: 1 }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Image source={require('../Assets/no_habit.png')} style={{ width: 50, height: 50, }} />
          </View>
          <Text style={{ flex: 1, textAlign: 'center' }}>
            {text.no_habit || 'Chưa có thói quen nào.'}</Text>
          <Text style={{ flex: 1, textAlign: 'center' }}>
            {text.no_habit_callaction || 'Nhấn dấu cộng để thêm thói quen đầu tiên.'}
          </Text></Cel>
      </Row>}
    </Background>
  );
};

//aaa
const Header = () => {
  const navigation = useNavigation();
  const text = useText();
  return (
    <View style={[{ flexDirection: 'row' }]}>
      <TouchableOpacity
        style={[
          {
            width: ICON_TOUCH_WIDTH,
            height: HEADER_HEIGHT,
            justifyContent: 'center',
            alignItems: 'flex-start',
          },
        ]}
        onPress={() => navigation.goBack()}
      >
        <B.ICon
          name="return-up-back"
          style={{ fontSize: FONT_SIZE.PageTitle }}
        />
      </TouchableOpacity>
      <View style={[{ flex: 1 }]}>
        <Text
          style={{
            lineHeight: HEADER_HEIGHT,
            textAlign: 'center',
            fontSize: FONT_SIZE.PageTitle,
            fontWeight: FONT_WEIGHT.SEMIBOLD,
          }}
        >
          {text.chon || 'Chọn thói quen'}
        </Text>
      </View>
    </View>
  );
};
