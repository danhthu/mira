import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { memo, useRef, useState } from 'react';
import { FlatList, ScrollView, SectionList, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Router } from '../../../../Router';
import { useTheme } from '../../../../theme';
import { useAsyncAction, useDectectDataChanged } from '../../../Common/Hooks';

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Calendar } from 'react-native-calendars';
import { groupBy } from '../../../../libs/arrayUtils';
import { B, BICon } from '../../../../libs/components';
import { FONT_SIZE, FONT_WEIGHT } from '../../../../theme/Constraints';
import { FONTSIZE } from '../../../Common';
import { Divider } from '../../../Common/Components/Divider';
import { Header } from '../../../Common/Components/Header';
import { useCommonStyle } from '../../../Common/Styles';
import { Work, workRepository } from '../../Entities';
import { useText } from '../../Text';
let i = 0;

export const TabCalendar = () => {
  //2 mode: list vs and calendar, calendar click --> popup
  //2 tab with badge (scheduled), unplan
  //filter
  //dashboard
  const styles = useStyles().root;
  const commonStyle = useCommonStyle();
  const t = useText().translate;
  const colors = useTheme();
  const [mode, setMode] = useState('list' as 'list' | 'calendar');
  const [showTitle, setShowTitle] = useState(false);
  const title = 'Scheduler tasks';
  return <View style={[commonStyle.screen,]}>

    <Header title={showTitle ? title : ''} right={
      <View style={{ height: 40, justifyContent: 'center', alignSelf: 'flex-end' }}>
        <TouchableOpacity
          onPress={() => setMode(mode == 'list' ? 'calendar' : 'list')}
          style={[styles.button, { borderRadius: 8 }, styles.buttonActived]}>
          <BICon name={mode == 'list' ? 'dashboard' : 'menu'} style={[{ fontSize: FONTSIZE.NORMAL, }, {
            color: colors.primary,
            fontWeight: '400',
          }]} />
        </TouchableOpacity>

      </View>
    } />
    <ScrollView style={[{ marginLeft: -16, marginRight: -16 }]}
      onScroll={evt => {
        if (!showTitle && evt.nativeEvent.contentOffset.y > 80) {
          setShowTitle(true);
        }
        if (evt.nativeEvent.contentOffset.y < 80 && showTitle) {
          setShowTitle(false);
        }
      }}
    >
      <View style={{ marginBottom: 16, marginLeft: 16 }}>
        <Text style={{ fontSize: FONTSIZE.PAGE_TITLE, fontWeight: '400', }}>{title}</Text>
      </View>
      <View >
        {mode == 'list' && <ListView />}
        {mode == 'calendar' && <CalendarView />}
      </View>
    </ScrollView>
  </View >;


};

const ListView = () => {
  const t = useText().translate;
  const colors = useTheme();
  const [data, setData] = useState([] as Array<{ title: string, data: Array<Work> }>);
  useAsyncAction(async () => {
    const currentDate = new Date();
    const tasks = await workRepository.filter(w => w.startDate && w.status != 'DONE');
    const maxDate = tasks.length > 0 ? Math.max(...tasks.map(t => t.startDate.getTime())) : 0;
    const tmp = [];
    for (let i = 0; i < Math.max(moment(new Date(maxDate)).diff(moment(), 'days'), 120); i++) {
      const cur = moment(currentDate).add(i, 'days');
      const _data = tasks.filter(t => moment(t.startDate).isSame(cur, 'days'));
      tmp.push({
        title: cur.format('dddd MMM, DD'),
        data: _data.length == 0 ? [] : _data
      });

    }
    setData(tmp);
  }, []);

  const renderItem = ({ item, index }) => {
    return <WorkItem {...item} />;
  };
  const renderTitle = ({ section }) => (
    <View style={[]}>
      <View style={[{ height: 40, paddingLeft: 16, justifyContent: 'center', backgroundColor: colors.surface }]}>
        <Text style={{ fontSize: FONTSIZE.NORMAL, fontWeight: '400' }}>{section.title}</Text>
      </View>
      {section.data.length === 0 && <View style={{ padding: 16 }}><Text>{t('No data')}</Text></View>}
    </View>
  );

  return <SectionList
    sections={data}
    keyExtractor={(item) => item.id}
    renderItem={renderItem}
    renderSectionHeader={renderTitle}
    scrollEnabled={false}
    ListEmptyComponent={() => <Text style={{ margin: 16 }}>{t('Loading...')}</Text>}
  />;
};
let render_CalendarView = 0;
const CalendarView = () => {
  const [date, setDate] = useState(new Date());
  const [isVisible, setIsVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  useAsyncAction(async () => {
    const todos = (await workRepository.list());
    const markedDates = groupBy(todos, (item) =>
      moment(item.startDate).startOf('day').format('YYYY-MM-DD'),
    )
      .map((g) => ({
        key: g.key,
        data: g.data,
      }))
      .reduce((acc, g) => {
        acc[g.key] = {
          selected: g.key == moment(date).format('YYYY-MM-DD'),
          marked: true,
          dotColor: 'transparent', customDot: true,
          //selectedColor: 'blue',
          //selected: g.key==moment(date).format(''),
          dots: [
            g.data.filter((c) => c.mandatory).length > 0 && {
              key: 'dot2',
              color: 'orange',
            },
            { key: 'dot3', color: 'green' },
          ],
        }; // Sử dụng 'key' làm khóa và 'data' làm giá trị
        return acc;
      }, {}); // khởi tạo với một đối tượng trống;
    if (!markedDates[moment(date).format('YYYY-MM-DD')]) {
      markedDates[moment(date).format('YYYY-MM-DD')] = {
        selected: true,
      };
    }

    setMarkedDates(markedDates);
  }, [useDectectDataChanged(workRepository)]);
  const onDayPress = dateType => {
    console.log('run update marked date');
    const date = new Date(dateType.timestamp);
    Object.keys(markedDates).forEach(item => {
      markedDates[item].selected = false;
    });
    if (!markedDates[moment(date).format('YYYY-MM-DD')]) {
      markedDates[moment(date).format('YYYY-MM-DD')] = {
        selected: true,
      };
    } else {
      markedDates[moment(date).format('YYYY-MM-DD')].selected = true;
    }//
    setMarkedDates({ ...markedDates });
    setDate(moment(date).toDate());
    setIsVisible(true);
  };
  console.log('call rerender: CalendarView: ' + render_CalendarView);
  render_CalendarView++;
  return <View style={{ flex: 1, backgroundColor: '#eeeeee', minHeight: 1000 }}>
    <Calendar onDayPress={onDayPress} markedDates={markedDates} />
    <CalendarBottomModal isVisible={isVisible} date={date} onDismiss={() => setIsVisible(false)} />
  </View>;
};
const CalendarView2 = () => {
  const [date, setDate] = useState(new Date());
  const [month, setMonth] = useState(new Date().getMonth());
  const t = useText().translate;
  const colors = useTheme();
  const navigation = useNavigation();
  const [data, setData] = useState({ markedDates: {}, todos: [] });
  const [markedDates, setMarkedDates] = useState({});
  const [isWeekView, setIsWeekView] = useState(false); // Quản lý chế độ hiển thị
  const [modeWeekView, setModeWeekView] = useState(false);
  useAsyncAction(async () => {
    console.log('load month data');
    const todos = (await workRepository.list());
    const markedDates = groupBy(todos, (item) =>
      moment(item.startDate).startOf('day').format('YYYY-MM-DD'),
    )
      .map((g) => ({
        key: g.key,
        data: g.data,
      }))
      .reduce((acc, g) => {
        acc[g.key] = {
          selected: g.key == moment(date).format('YYYY-MM-DD'),
          marked: true,
          dotColor: 'transparent', customDot: true,
          //selectedColor: 'blue',
          //selected: g.key==moment(date).format(''),
          dots: [
            g.data.filter((c) => c.mandatory).length > 0 && {
              key: 'dot2',
              color: 'orange',
            },
            { key: 'dot3', color: 'green' },
          ],
        }; // Sử dụng 'key' làm khóa và 'data' làm giá trị
        return acc;
      }, {}); // khởi tạo với một đối tượng trống;
    if (!markedDates[moment(date).format('YYYY-MM-DD')]) {
      markedDates[moment(date).format('YYYY-MM-DD')] = {
        selected: true,
      };
    }

    setMarkedDates(markedDates);

  }, [useDectectDataChanged(workRepository)]);
  const updateDate = date => {
    console.log('run update marked date');
    Object.keys(markedDates).forEach(item => {
      markedDates[item].selected = false;
    });
    if (!markedDates[moment(date).format('YYYY-MM-DD')]) {
      markedDates[moment(date).format('YYYY-MM-DD')] = {
        selected: true,
      };
    } else {
      markedDates[moment(date).format('YYYY-MM-DD')].selected = true;
    }//
    setMarkedDates({ ...markedDates });
  };

  const styles = useStyles().calendar;
  const renderItem = ({ item = {} as Work }) => <WorkItem {...item} />;
  const emptyList = () => {
    return (
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() =>
            Router.Open(navigation, 'WorkAppModal', { screen: 'Add' })
          }
        >
          <Text>
            {t('Thêm tags để phân loại nhiệm vụ, nhấn ')}
            <Text style={{ color: colors.colorLink }}>{t('+')}</Text>
            <Text>{t(' để thêm.')}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const RenderDayWithStar = memo((props: { date, state, marking, onPress }) => {
    const { date, state, marking, onPress } = props;
    const isMarked = marking?.customDot;
    //console.log('call RenderDayWithStar' + date.dateString, [date, state, marking, onPress]);
    return (
      <TouchableOpacity
        onPress={() => {
          console.log('onPress test');
          onPress(date);
        }}
        style={[styles.dayContainer, marking?.selected && styles.dayContainerSelected]}>
        <Text
          style={[
            styles.dayText,
            state === 'disabled' && styles.disabledText,
            marking?.selected && styles.selectedText,
          ]}
        >
          {date.day}
        </Text>
        <View style={{ position: 'absolute', top: 0, right: 0 }}>
          {isMarked && (
            <BICon name='star' style={{ color: 'orange', fontSize: 10 }} />
          )}
          {!isMarked && marking?.marked && (
            <View style={[styles.defaultDot,]} />
          )}
        </View>
      </TouchableOpacity>
    );
  }, (prevProps, nextProps) => {
    // Chỉ rerender khi date thay đổi
    return prevProps.date.dateString === nextProps.date.dateString;
  });
  console.log('call render....: ' + i);
  const onDayPress = date => {
    //setDate(new Date(date.timestamp));
    setModeWeekView(true);
  };
  i++;


  const [showTitle, setShowTitle] = useState(false);
  const [calendarHeight, setCalendarHeight] = useState(0); // Chiều cao Calendar
  const scrollViewRef = useRef(null);

  // Hàm tính tuần thứ mấy trong tháng
  const getWeekInMonth = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const offset = (startOfMonth.getDay() + 6) % 7; // Điều chỉnh để tuần bắt đầu từ Thứ hai
    return Math.ceil((day + offset) / 7);
  };

  // Hàm xử lý khi chọn ngày
  const handleDayPress = (day) => {
    setDate(day);
  };

  // Hàm xử lý cuộn trong ScrollView
  const handleScroll = (event) => {
    const scrollOffsetY = event.nativeEvent.contentOffset.y;

    if (date && calendarHeight > 0) {
      const rowHeight = calendarHeight / 6; // Tính chiều cao hàng tuần
      const week = getWeekInMonth(date);
      const positionY = (week - 1) * rowHeight;

      // Kiểm tra nếu vị trí ngày nằm ngoài vùng nhìn thấy
      setShowTitle(scrollOffsetY > positionY);
    }
  };


  return (
    <View>
      {showTitle && date && (
        <View >
          <Text >{`Selected Date: ${date}`}</Text>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setCalendarHeight(height); // Lưu chiều cao của Calendar
          }}
        >
          <Calendar
            markedDates={markedDates}
            dayComponent={({ date, state, marking }) => <RenderDayWithStar date={date} state={state} marking={marking}
              onPress={date => {
                // updateDate(new Date(date.timestamp));
                handleDayPress(new Date(date.timestamp));
              }}
            />}
          /></View>
        <DateTaskList date={date} />
      </ScrollView>
    </View>
  );
};


const CalendarBottomModal = ({ isVisible = false, date = new Date, onDismiss = () => { } }) => {
  const t = useText().translate;
  const colors = useTheme();
  const [data, setData] = useState([] as Array<Work>);
  useAsyncAction(async () => {
    setData(await workRepository.getListByDate(date));
  }, [useDectectDataChanged(workRepository), date]);


  return (
    <FlatList data={data}
      renderItem={({ item }) => <WorkItem {...item} />}
      ItemSeparatorComponent={() => <Divider />}
    />
  );
};



const useStyles = () => {
  const colors = useTheme();
  return {
    root: StyleSheet.create({
      container: {
        paddingBottom: 60
      },
      buttonGroupContainer: {
        borderRadius: 8,
        flexDirection: 'row',

      },
      button: {
        //  backgroundColor: '#eee',
        height: 30,
        paddingLeft: 12, paddingRight: 12,
        justifyContent: 'center',
      },
      buttonActived: {
        //backgroundColor: colors.primary30
      }
    }),
    section: StyleSheet.create({
      container: {
        borderColor: colors.outline,
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 16,
      },
      caption: {
        height: 50,
        justifyContent: 'center',
        backgroundColor: colors.primary30,
        borderTopLeftRadius: 8,
        borderTopEndRadius: 8,
        paddingLeft: 16,
      },
      title: { color: '#000000', fontWeight: '400' },
    }),
    calendar: StyleSheet.create({
      container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
      },
      dayContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        position: 'relative',
      }, dayContainerSelected: {
        borderRadius: 16,
        borderColor: 'blue',
        borderWidth: 1

      },
      dayText: {
        fontSize: 16,
        color: '#2d4150',
      },
      disabledText: {
        color: '#d9e1e8',
      },
      selectedText: {
        color: 'blue',

      },
      starImage: {
        width: 12,
        height: 12,
        position: 'absolute',
        bottom: -5,
      },
      defaultDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        position: 'absolute',
        bottom: -5,
      },
    })
  };

};

const DateTaskList = ({ date = new Date }) => {
  const [data, setData] = useState([] as Array<Work>);
  useAsyncAction(async () => {
    setData(await workRepository.filter(w => w.startDate && moment(w.startDate).isSame(moment(date), 'day')));
  }, [date]);
  return (
    <>
      <Section
        data={data.filter((d) => d.mandatory)}
        date={date}
        type="mandatory"
      />
      <Section
        data={data.filter((d) => !d.mandatory)}
        date={date}
        type="normal"
      />
      <Section
        data={data.filter((d) => d.status == 'DONE')}
        date={date}
        type="done"
      />
    </>
  );
};

const Section = ({
  type = 'normal' as 'normal' | 'mandatory' | 'done',
  data = [] as Array<Work>,
  date = new Date(),

}) => {
  const colors = useTheme();
  const t = useText().translate;
  const styles = useStyles().section;
  const nav = useNavigation();
  const isDoneSection = type == 'done';
  const bgColors = type == 'normal' ? [
    colors.hexToRGB(colors.secondary, 0.7),
    colors.hexToRGB(colors.secondary, 0.3),
    colors.hexToRGB(colors.secondary, 0.1),
  ] : type == 'mandatory' ? [
    colors.hexToRGB(colors.tertiary, 0.7),
    colors.hexToRGB(colors.tertiary, 0.3),
    colors.hexToRGB(colors.tertiary, 0.1),
  ] : [
    colors.hexToRGB(colors.success, 0.7),
    colors.hexToRGB(colors.success, 0.3),
    colors.hexToRGB(colors.success, 0.1),
  ];
  const title = type == 'normal' ? t('Daily tasks') :
    type == 'mandatory' ? t('Mandatory') : t('Done');
  return (
    <View style={styles.container}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={bgColors}
        style={styles.caption}
      >
        <TouchableOpacity
          //style={[styles.caption]}
          onPress={() => {
            Router.Open(nav, 'WorkAppModal', {
              screen: 'ChooseSelector',
              title: 'Chọn',
              date: date.getTime(),
            });
          }}
        >
          <Text style={styles.title}>{title}</Text>
        </TouchableOpacity>
      </LinearGradient>
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}
      >
        {data
          .filter(
            (w) => (!isDoneSection && w.status != 'DONE') || isDoneSection,
          )
          .map((w, i) => (
            <WorkItem key={i} {...w} viewStyle={i == 0 && { borderWidth: 0 }} />
          ))}
        {!isDoneSection && data.filter((d) => d.status != 'DONE').length == 0 && (
          <View
            style={{
              flexDirection: 'row',
              padding: 16,
            }}
          >
            <B.ICon
              name="checkcircle"
              style={{
                color: colors.success,
                marginRight: 10,
                fontSize: 20,
              }}
            ></B.ICon>
            <Text style={{ color: colors.success, fontWeight: '400' }}>
              {data.length} {t('tasks has done')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const WorkItem = (props: { viewStyle?: ViewStyle } & Work) => {
  const nav = useNavigation();
  const colors = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          //   backgroundColor: 'white',
          //  margin: 10,
          //    marginLeft: 20,
          //  marginRight: 20,

          // borderRadius: 10,
          paddingTop: 5,
          paddingBottom: 5,
          paddingLeft: 16,
        },
        props.viewStyle,
      ]}
    >
      <TouchableOpacity
        onPress={() =>
          Router.Open(nav, 'WorkApp', { screen: 'Detail', id: props.id })
        }
        style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
      >
        <View style={{ height: 25, justifyContent: 'center' }}>
          <Text
            style={{
              fontWeight: FONT_WEIGHT.SEMIBOLD,
              fontSize: FONT_SIZE.ListItem,
              color: colors.primary,
            }}
          >
            {props.name}
          </Text>
        </View>
        {props.timeStart && (
          <View style={{ height: 25, justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row' }}>
              <B.ICon
                style={{
                  marginRight: 10,
                  fontSize: FONTSIZE.SMALL,
                  fontWeight: '300',
                }}
                name="clockcircleo"
              />
              <Text
                style={{
                  fontSize: FONTSIZE.SMALL,
                  fontWeight: '300',
                  color: colors.tertiary,
                }}
              >
                {props.timeStart
                  ? props.timeStart.hour + ':' + props.timeStart.minute
                  : '--:--'}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
      {props.status != 'DONE' && (
        <TouchableOpacity
          onPress={async () =>
            props.status != 'DONE' &&
            (await workRepository.update(
              (w) => w.id == props.id,
              (w) => (w.status = w.status == 'DOING' ? 'DONE' : 'DOING'),
            ))
          }
          style={{
            alignSelf: 'flex-start',
            width: 50,
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <B.ICon
            name={props.status == 'DOING' ? 'pause-circle' : 'play-circle'}
            style={{
              color:
                props.status == 'DOING' ? colors.success : colors.secondary,
              fontWeight: FONT_WEIGHT.THIN,
              fontSize: 35,
            }}
          />
        </TouchableOpacity>
      )}
      {props.status == 'DONE' && (
        <View
          style={{
            alignSelf: 'flex-end',
            width: 50,
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <B.ICon
            style={{
              color: props.status == 'DONE' ? colors.success : colors.secondary,
              fontSize: 24,
            }}
            name={
              props.status == 'DONE'
                ? 'check-circle'
                : 'radio-button-off-outline'
            }
            size={FONTSIZE.NORMAL}
          />
        </View>
      )}
    </View>
  );
};
