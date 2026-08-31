import { from } from 'linq-to-typescript';
import moment from 'moment';
import { useState } from 'react';
import { FlatList, Image, ScrollView, View } from 'react-native';
import { sortBy } from 'sort-by-typescript';
import usePerformance from '../../../../hook/useScreenLoadTime';
import { B, BText as Text } from '../../../../libs/components';
import { Link } from '../../../../libs/components/Link';
import { Cel, Row } from '../../../../libs/components/Row';
import { useTheme } from '../../../../theme';
import { FONT_SIZE, FONT_WEIGHT } from '../../../../theme/Constraints';
import { useAsyncAction } from '../../../Common/Hooks';
import { useCommonStyle } from '../../../Common/Styles';
import { dateGreater } from '../../../Common/Utils/common';
import { Background } from '../../Components/Background';
import { Header } from '../../Components/Header';
import { habitRepository, habitTrackerRepository } from '../../Entities';
import { useText } from '../../Text';

interface FILTER {
  tag?: string,
  hids?: Array<string>,
  time?: { from_date: number, to_date: number }
}
function bgDiff<T extends { day: number }>(data: Array<T>, evenColor, oddColor): Array<T> {
  data = data || [];
  if (data.length > 0) {
    const result = data.map(h => { return { ...h, bgColor: null }; });
    result.sort(sortBy('day'));
    result[0].bgColor = evenColor;
    for (let i = 1; i < result.length; i++) {
      result[i].bgColor = result[i - 1].bgColor;
      if (dateGreater(new Date(result[i].day), new Date(result[i - 1].day), 1)) {
        result[i].bgColor = result[i - 1].bgColor == evenColor ? oddColor : evenColor;
      }
    }
    return result;
  }
  return data;
}
export const StatisticSumary = ({ route, navigation }) => {
  usePerformance('HabitTracker\StatisticSumary');
  const commonStyle = useCommonStyle();
  const colors = useTheme();
  const text = useText();
  const [filters, setFilters] = useState(route.params as FILTER);
  const tags = useAsyncAction(async () => ['all', ...(await habitRepository.getTags())], []);
  const data = useAsyncAction(async () => {
    const habits = await habitRepository.filter(h => filters.hids && filters.hids.indexOf(h.id) > -1
      || !filters.hids && (filters.tag == 'all' || h.tags && h.tags.indexOf(filters.tag) > -1)
    );

    const trackers = (await habitTrackerRepository.filter(ht => habits.filter(h => h.id == ht.hid).length > 0 &&
      (!filters.time || ht.day < filters.time.to_date && ht.day > filters.time.from_date)
    )).map(ht => ({ ...ht, habit: habits.findLast(v => v.id == ht.hid) }));
    trackers.sort(sortBy('day'));
    if (habits.length == 1) {
      return { habits, trackers };
    }
    const tmp = from(trackers)
      .groupBy(t => t.day)
      .select(g => ({ day: g.key, done: g.count(), total: habits.filter(h => h.created_date <= g.key).length }))
      .toArray()
      .map(g => ({ ...g, data: g.done == g.total ? null : { goal: { done: g.done, total: g.total } } }));
    return { habits, trackers: tmp } as any;
  }, [route.params, filters], { habits: [], trackers: [] }, 'HabitTracker\StatisticSumary');
  return <Background style={[commonStyle.screen, { paddingTop: 60 }]}>
    <Header title={''} />
    <View style={{ flexDirection: 'row', marginTop: 10 }}>
      <Text style={{ fontWeight: FONT_WEIGHT.SEMIBOLD, marginRight: 30 }}>
        {text.totalDone || 'Total Done'}: {data.trackers.length || '--'}
      </Text>
    </View>
    <ScrollView style={{ marginBottom: 30 }}>
      <View>
        {tags && tags.length > 1 && (
          <B.HashTag
            activeIndex={tags.indexOf(filters.tag)}
            data={tags}
            onSelected={(tag) => {
              setFilters({ tag });
            }}
          />
        )}
      </View>
      {/**body */}
      <View style={{ backgroundColor: '#fff', borderColor: colors.outlineVariant, borderWidth: 1, marginTop: 20, borderTopWidth: 10, borderTopColor: colors.secondary }}>
        <Row style={{ paddingLeft: 16, paddingRight: 16 }}>
          <Cel style={{ flex: 1 }}><Text style={{ fontSize: FONT_SIZE.ListItem, fontWeight: FONT_WEIGHT.SEMIBOLD }}>{text.name || 'Ngày'}</Text></Cel>
          <Cel style={{ width: 50 }}><Text style={{ fontSize: FONT_SIZE.ListItem, fontWeight: FONT_WEIGHT.SEMIBOLD }}>{text.done || 'Done'}</Text></Cel>
        </Row>
        {/**data */}
        <FlatList
          scrollEnabled={false}
          data={bgDiff(data.trackers, colors.hexToRGB(colors.grayColors[100], 0.3), '#fff') as Array<any>}
          renderItem={({ item, index }) =>
            <Row style={{ backgroundColor: item.bgColor, paddingLeft: 16, paddingRight: 16 }}>
              <Cel style={{ flex: 1 }}><Text style={{ fontSize: FONT_SIZE.ListItem }}>{moment(new Date(item.day)).format('DD MMM YYYY')}</Text></Cel>
              <Cel style={{ width: 50, alignItems: 'center' }}>
                {!item.data || !item.data.goal && <B.ICon name="check-circle" style={{ color: colors.success, fontSize: FONT_SIZE.ListItem }} />}
                {item.data.goal && <Text style={[{ fontSize: FONT_SIZE.ListItem }, item.data.goal.done == item.data.goal.total && {
                  color: colors.success,
                }, item.data.goal.done < item.data.goal.total * 0.5 && { color: colors.grayColors[700] },
                item.data.goal.done < item.data.goal.total
                && item.data.goal.done > item.data.goal.total * 0.5 && { color: colors.warning },]}>{item.data.goal.done} <Text style={{ fontSize: FONT_SIZE.SecondaryText }}>{item.data.goal.unit}</Text></Text>}
              </Cel>
            </Row>
          }
        ></FlatList>
        {/**empty */}
        {data.trackers.length == 0 &&
          <Row style={{ paddingLeft: 16, paddingRight: 16, borderBottomWidth: 0 }}>
            <Cel style={{ flex: 1 }}>
              <View style={{ flex: 1, alignItems: 'center', marginBottom: 10 }}>
                <Image source={require('../Assets/no_habit_tracker.png')} style={{ width: 50, height: 50 }} />
              </View>
              <Text style={{ flex: 1, textAlign: 'center', color: colors.errorColors[200], marginBottom: 10 }}>
                {text.no_habit_tracker || 'Oh no, không thấy dữ liệu thời gian này.'}</Text>
              <Link onPress={() => navigation.goBack()} style={{ flex: 1, textAlign: 'center', marginBottom: 10 }}>{text.no_habit_tracker || 'Mỗi ngày là một cơ hội để cải thiện bản thân. Cố gắng nha bạn của tôi !'}</Link>
            </Cel>
          </Row>
        }
      </View>
    </ScrollView>
  </Background>;
};

