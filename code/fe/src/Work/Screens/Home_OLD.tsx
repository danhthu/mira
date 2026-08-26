import moment from 'moment';
import React, { Dispatch, SetStateAction, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { B, BICon, BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { FONTSIZE, MARGIN } from '../../Common';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import { dateEqual, dateGreater, dateLesser, getCurrentDay, getDay, getNextWeekend, getStartOfWeek } from '../../Common/Utils/common';
import { workRepository } from '../Entities/Repository';
import { Work } from '../Entities/Work';
import { useText } from '../Text';

import { useNavigation } from '@react-navigation/native';
import { FlatList } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { AddButtonBottom } from '../../../libs/components/AddButtonBottom';
import { Router } from '../../../Router';
import { FONT_SIZE, FONT_WEIGHT, PADDING } from '../../../theme/Constraints';
import { Background } from '../Components/Background';

export const Home = ({ navigation }) => {
  const style = useStyle().screen;

  const [day, setDay] = useState(new Date());
  const [mode, setMode] = useState('normal');

  //return <View />
  return (<Background>
    <View
      style={[
        style.container,
      ]}
    >
      <Caption state={[day, setDay]} />
      {/**Time line in day */}
      <ScrollView style={[{ marginRight: -20, marginLeft: -20, paddingTop: 20, marginTop: -10 }]}>
        <Tips day={day} mode={mode} setMode={setMode} />
        {/*<View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 20,
            marginBottom: 10,
            display: 'none'
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              paddingLeft: 20,
              paddingRight: 20,
              backgroundColor: colors.surfaceContainer,
              borderRadius: 15,
              borderColor: colors.outlineVariant,
              borderWidth: 1,
            }}
          >
            <Text style={{ fontSize: 13, height: 30, lineHeight: 30 }}>
              {text.nhiemvuhoantattronghomnay || 'Đã hoàn thành hôm nay '}
            </Text>
            <Text
              style={{
                fontSize: 17,
                height: 30,
                fontWeight: '600',
                lineHeight: 30,
                color: colors.success,
              }}
            >
              {dataTotal.done || '--'}{' '}
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: 'bold',
                height: 30,
                lineHeight: 30,
              }}
            >
              / {dataTotal.total}
            </Text>
          </View>
        </View>
            */}
        <Body day={day} mode={mode} />
      </ScrollView>

      <AddButtonBottom
        onPlusClick={() =>
          Router.Open(navigation, 'WorkAppModal', { screen: 'Add' })
        }
      ></AddButtonBottom>
    </View>
  </Background>
  );
};


const Caption = (props: { state: [day: Date, setDay: Dispatch<SetStateAction<Date>>] }) => {
  const [day, setDay] = props.state;
  const colors = useTheme();
  const buttonGroupStyle = useButtonGroup();
  const nav = useNavigation();
  const text = useText();
  //**date picker for header */
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setDay(getDay(date));

    hideDatePicker();
  };

  return <View
    style={[
      {
        //  backgroundColor: '#ffffff',
        marginLeft: -20,
        marginRight: -20,
        marginTop: -30,
        paddingTop: 50,
        paddingBottom: 10,
      },
    ]}
  >
    {/**header date selected */}

    <View
      style={{
        flexDirection: 'row',
        marginBottom: 15,
      }}
    >
      <View style={[{ width: 60 }]}></View>

      <View style={[buttonGroupStyle.container]}>
        <TouchableOpacity
          style={[
            buttonGroupStyle.default,
            dateEqual(day, getCurrentDay()) &&
            buttonGroupStyle.selected,
          ]}
          onPress={() => setDay(moment(new Date()).toDate())}
        >
          <Text
            style={[
              { fontSize: 14 },
              dateEqual(day, getCurrentDay()) && {
                color: colors.onPrimary,
              },
            ]}
          >
            {text.homnay || 'Hôm nay'}
          </Text>
        </TouchableOpacity>
        {/**display tomorrow */}
        {(dateLesser(day, getCurrentDay(), 3) &&
          dateGreater(day, getCurrentDay())
        ) && (<TouchableOpacity
          style={[
            buttonGroupStyle.default,
            dateEqual(day, getCurrentDay(), 1) &&
            buttonGroupStyle.selected,
          ]}
          onPress={() =>
            setDay(moment(getCurrentDay()).add(1, 'days').toDate())
          }
        >
          <Text
            style={[
              { fontSize: 14 },
              dateEqual(day, getCurrentDay(), 1) && {
                color: colors.onPrimary,
              },
            ]}
          >
            {text.ngaymai || 'Ngày mai'}
          </Text>
        </TouchableOpacity>)}

        {/**lich chon */}
        <TouchableOpacity
          style={[
            buttonGroupStyle.default,
            (dateGreater(day, getCurrentDay(), 2)
              ||
              dateLesser(day, getCurrentDay())
            ) &&
            buttonGroupStyle.selected,
            { flexDirection: 'row' }
          ]}
          onPress={showDatePicker}
        >
          <Text
            style={[
              { fontSize: 14 },
              (dateGreater(day, getCurrentDay(), 2)
                ||
                dateLesser(day, getCurrentDay())
              ) && {
                color: colors.onPrimary,
              },
            ]}
          >
            {(dateGreater(day, getCurrentDay(), 2)
              ||
              dateLesser(day, getCurrentDay())
            ) ? moment(day).format('DD-MMM') : text.chonngay || 'Chọn'}
          </Text>
          <BICon name="calendar-blank" style={[{ fontSize: 16, marginLeft: 8 }, (dateGreater(day, getCurrentDay(), 2)
            ||
            dateLesser(day, getCurrentDay())
          ) && {
            color: colors.onPrimary,
          },]}></BICon>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          {
            alignSelf: 'flex-end',
            width: 35,
            height: 35,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 15,
            backgroundColor: colors.primary,
            borderRadius: 17,
            marginLeft: 20
          },
        ]}
        onPress={() => Router.Open(nav, 'WorkAppModal', { screen: 'Statistic' })}
      >
        <BICon name="linechart" style={{ fontSize: 14, color: colors.onPrimary }}></BICon>
      </TouchableOpacity>
    </View>
    <DateTimePickerModal
      isVisible={isDatePickerVisible}
      mode="date"
      date={day}
      onConfirm={handleConfirm}
      onCancel={hideDatePicker}
    />
  </View>;
};

const Tips = (props: { day: Date, mode: string, setMode: Dispatch<SetStateAction<string>> }) => {
  const { day, mode, setMode } = props;
  const colors = useTheme();
  const text = useText();
  return <View style={{
    backgroundColor: colors.primaryColors[500],
    margin: MARGIN.SCREEN,

    borderRadius: 10,
    padding: 10,
    marginTop: 7,
    borderColor: colors.primaryColors[200],
    borderWidth: 1
  }}>
    <Text
      style={{
        textAlign: 'center',
        fontSize: FONT_SIZE.PageTitle,
        lineHeight: 30,
        height: 30,
        fontWeight: FONT_WEIGHT.SEMIBOLD,
        color: colors.onPrimary,
        display: 'none'
      }}
    >{text.work_logan || ' One Time One Task  '}
    </Text>

    <Text
      style={{
        fontSize: FONT_SIZE.PageTitle * 1.3,
        fontWeight: FONT_WEIGHT.BOLD,
        color: colors.onPrimary,
        marginBottom: 10,
        paddingLeft: 16,
        display: 'none'
      }}
    >{text.day || 'Daily task'}
    </Text>
    <View>
      <View style={[{ flex: 1 },]}>
        <View
          style={[
            {
              alignSelf: 'center',
              width: 45,
              height: 45,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderRadius: 23,
              marginTop: - 30
            },
          ]}
        >
          <BICon name="format-quote-close" style={{ fontSize: 30, color: colors.primary }}></BICon>
        </View>
      </View>
      <View style={{ marginTop: 8, marginBottom: 15 }}>
        <Text style={{ fontSize: FONT_SIZE.PageTitle, color: colors.onPrimary, fontWeight: FONT_WEIGHT.SEMIBOLD, textAlign: 'center' }}>
          {text.ontime || 'One time, only task'}
        </Text>
        <Text style={{ fontSize: FONT_SIZE.PageTitle, color: colors.onPrimary, fontWeight: FONT_WEIGHT.SEMIBOLD, textAlign: 'center' }}>
          {text.trytocomplete || 'Try complete and relax'}
        </Text>
      </View>
    </View>
    <View style={{ flexDirection: 'row', marginTop: 10 }}>
      {/** mandatory, today, pending */}
      <View style={[{ flex: 1, alignItems: 'center' }]}>
        <StatusWidget
          active={mode == 'mandatory'}
          onPress={() =>
            setMode(mode == 'mandatory' ? 'normal' : 'mandatory')
          }
          type="mandatory"
          day={day}
        />
      </View>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <StatusWidget
          active={mode == 'today'}
          onPress={() => setMode(mode == 'today' ? 'normal' : 'today')}
          type="today"
          day={day}
        />
      </View>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <StatusWidget
          active={mode == 'pending'}
          onPress={() => setMode(mode == 'pending' ? 'normal' : 'pending')}
          type="pending"
          day={day}
        />
      </View>
    </View>
  </View>;
};

const Body = (props: { mode: string, day: Date }) => {
  const { mode, day } = props;
  return <>{mode == 'pending' ? (
    <PendingSection />
  ) : (
    <NormalSection day={day} />
  )}
  </>;
};

const useButtonGroup = () => {
  const colors = useTheme();
  return StyleSheet.create({
    default: {
      flex: 1,
      height: 35,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selected: {
      borderColor: colors.outlineVariant,
      borderRadius: 20,
      borderWidth: 1,
      backgroundColor: colors.primary,
    },
    container: {
      flexDirection: 'row',
      flex: 1,
      borderColor: colors.outlineVariant,
      borderWidth: 1,
      borderRadius: 20,
      backgroundColor: colors.surfaceContainer,
    },
  });
};


const PendingSection = () => {
  const colors = useTheme();
  const text = useText();
  const [data, setData] = useState([] as Work[]);
  const [filterIndex, setFilterIndex] = useState(0);
  const filters = [{
    text: text.all || 'Tất cả',
    type: 'all'
  },
  {
    text: text.all || 'Ngày mai',
    type: 'tomorrow'
  },
  {
    text: text.all || 'Tuần này',
    type: 'week'
  },
  {
    text: text.all || 'Chưa sắp xếp',
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
    setData(await workRepository.filter(w => w.status != 'DONE'
      && (!w.startDate ||
        (getDay(w.startDate).getTime() != getCurrentDay().getTime()))));
  }, [useDectectDataChanged(workRepository)]);

  const style = StyleSheet.create({
    sectionLabel: {
      fontWeight: FONT_WEIGHT.SEMIBOLD,
      paddingLeft: 16,
      fontSize: FONT_SIZE.ListTitle,

    },
    sectionLink: {
      color: colors.primary,
      textDecorationLine: 'underline'
    },
    sectionContainer: {
      backgroundColor: '#fff',

      // paddingTop: 10,
      paddingBottom: 5,
      // borderRadius:10,
      //margin: 16,
      //marginTop: 8,
      borderTopWidth: 10,
      //borderTopColor:'#EE4E4E'

    }
  });

  if (!data) return <View></View>;
  return <View style={{ paddingLeft: PADDING.LEFT, paddingRight: PADDING.RIGHT }}>
    {/**tab filter */}
    <ScrollView horizontal style={{ marginBottom: 10, flexDirection: 'row' }}>
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
    </ScrollView>
    {/**body */}
    <View
      style={[style.sectionContainer, { borderTopColor: '#EE4E4E' }]}
    >
      <FlatList
        data={filterData(filters[filterIndex])}
        renderItem={({ item, index }) => <View key={index} style={[{
          flexDirection: 'row',
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 5,
          paddingBottom: 5
        }]}>
          <View style={[{ flex: 1 },]}>
            <Text style={{ lineHeight: 30, fontSize: FONT_SIZE.ListItem, flex: 1, color: colors.primary }}>{item.name}</Text>
            <View style={{ flexDirection: 'row' }}>
              <B.ICon name='clockcircleo' style={{ height: 20, lineHeight: 20, color: '#000', marginRight: 8, fontSize: 16 }}></B.ICon>
              <Text style={{ lineHeight: 20, color: '#000', fontSize: 16 }}>{item.endDate ? moment(item.endDate).format('DD,MMM') : 'Unknown'}</Text>
            </View>
          </View>
          <Text style={{ lineHeight: 30 + 20, fontSize: FONT_SIZE.ListItem, color: '#000', alignSelf: 'flex-end' }}>{item.startDate ? moment(item.startDate).format('DD,MMM') : 'No plan'}</Text>
        </View>}
        ItemSeparatorComponent={() => <View style={{
          borderBottomWidth: 1,
          borderBottomColor: colors.outlineVariant,
        }} />}
      >
      </FlatList>
    </View>
  </View>;
};

const NormalSection = (props: { day: Date }) => {
  const text = useText();
  const colors = useTheme();
  const nav = useNavigation();
  const [data, setData] = useState([] as Work[]);
  useAsyncAction(async () => {
    const tmp = await workRepository.getListByDate(props.day);
    setData(tmp);
  }, [props.day]);
  const style = StyleSheet.create({
    sectionLabel: {
      fontWeight: FONT_WEIGHT.SEMIBOLD,
      paddingLeft: 16,
      fontSize: FONT_SIZE.ListTitle,

    },
    sectionLink: {
      color: colors.primary,
      textDecorationLine: 'underline'
    },
    sectionContainer: {
      backgroundColor: '#fff',
      // padding: 10,
      // paddingTop: 10,
      paddingBottom: 5,
      // borderRadius:10,
      margin: 16,
      marginTop: 8,
      borderTopWidth: 10,
      //borderTopColor:'#EE4E4E'

    }
  });

  if (!data) return <View></View>;
  return (
    <View>
      {data.length == 0 && (
        <>
          <Text style={[style.sectionLabel,]}>
            {text.viectrongngay || 'Việc trong ngày'}
          </Text>
          <View
            style={[style.sectionContainer, { borderTopColor: '#68D2E8', backgroundColor: '#fff3cd' }]}
          >
            <TouchableOpacity
              onPress={() => Router.Open(nav, 'WorkAppModal', { screen: 'Add' })}
            >
              <View style={[{
                flexDirection: 'row', padding: 10, paddingLeft: 16, marginBottom: -5,
                backgroundColor: '#fff3cd'
              }]}>
                <B.ICon name='infocirlce' style={{ color: '#664d03', marginRight: 10, fontSize: 20 }}></B.ICon>
                <Text style={{ color: '#664d03', marginRight: 16 }}>{text.no_work || 'Oh no, chưa lên lịch cho hôm nay, nhấn [+] để bắt đầu một ngày mới'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
      {data.length > 0 && <>
        <TouchableOpacity onPress={() => { Router.Open(nav, 'WorkApp', { screen: 'MandatorySelector', title: 'Chọn' }); }}>
          <Text style={[style.sectionLabel, style.sectionLink]}>
            {text.xongtrongngay || 'Bắt buộc'}
          </Text>
        </TouchableOpacity>
        <View
          style={[style.sectionContainer, { borderTopColor: '#EE4E4E' }]}
        >
          {data
            .filter((d) => d.mandatory && d.status != 'DONE')
            .map((w, i) => (
              <WorkItem key={i} {...w} viewStyle={i == 0 && { borderTopWidth: 0 }} />
            ))}
          {(data.filter((d) => d.mandatory).length > 0 && data.filter((d) => d.mandatory && d.status != 'DONE').length == 0) &&
            <View style={{ flexDirection: 'row', padding: 10, paddingLeft: 16, marginBottom: -5, backgroundColor: colors.hexToRGB(colors.successColors[100], 0.2) }}>
              <B.ICon name='checkcircle' style={{ color: colors.success, marginRight: 10, fontSize: 20 }}></B.ICon>
              <Text style={{ color: colors.success }}>{text.mandatory_completed || 'Bạn đã hoàn thành các việc bắt buộc trong ngày'}</Text>
            </View>
          }
          {data.filter((d) => d.mandatory).length == 0 && (
            <TouchableOpacity style={{}} onPress={() =>
              Router.Open(nav, 'WorkAppModal', {
                screen: 'Selection',
                multiple: true,
                day: props.day.getTime(),
                onGoBack: (works: Work[]) => {
                  workRepository.updates(
                    (w) => works.filter((c) => c.id == w.id).length > 0,
                    (w) => (w.mandatory = true),
                  );
                },
              })
            }>
              <View style={[{
                flexDirection: 'row', padding: 10, paddingLeft: 16, marginBottom: -5,
                backgroundColor: '#fff3cd'
              }]}>
                <B.ICon name='infocirlce' style={{ color: '#664d03', marginRight: 10, fontSize: 20 }}></B.ICon>
                <Text style={{ color: '#664d03', marginRight: 16 }}>{text.no_work || 'Oh no, chọn ít nhất 1 việc bắt buộc trong ngày'}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </>}
      {data
        .filter((d) => !d.mandatory && d.status != 'DONE').length > 0 && <>
          <TouchableOpacity onPress={() => { Router.Open(nav, 'WorkAppModal', { screen: 'ChooseSelector', title: 'Chọn', date: props.day.getTime() }); }}>
            <Text style={[style.sectionLabel, style.sectionLink]}>
              {text.viectrongngay || 'Việc trong ngày'}
            </Text>
          </TouchableOpacity>
          <View
            style={[style.sectionContainer, { borderTopColor: '#68D2E8' }]}
          >
            {data
              .filter((d) => !d.mandatory && d.status != 'DONE')
              .map((w, i) => (
                <WorkItem key={i} {...w} viewStyle={i == 0 && { borderTopWidth: 0 }} />
              ))}
            {data.length > 0 && data.filter((d) => d.status != 'DONE').length == 0 && (
              <View style={{}}>
                <Text
                  style={[
                    { marginLeft: 30, marginRight: 30, textAlign: 'center' },
                    { color: colors.success },
                  ]}
                >
                  {text.daxonghetviec ||
                    'Chúc mừng, bạn đã hoàn thành toàn bộ công việc trong ngày'}
                </Text>
              </View>
            )}
          </View></>
      }
      {data
        .filter((d) => d.status == 'DONE').length > 0 && <>
          <Text style={[style.sectionLabel, {}]}>
            {text.viectrongngay || 'Đã xong'}
          </Text>
          <View style={[style.sectionContainer, { borderTopColor: colors.success }]}>

            {data
              .filter((d) => d.status == 'DONE')
              .map((w, i) => (
                <WorkItem key={i} {...w} viewStyle={i == 0 && { borderTopWidth: 0 }} />
              ))}
          </View>
        </>}
    </View>
  );
};



const WorkItem = (props: { viewStyle?: ViewStyle } & Work) => {
  const nav = useNavigation();
  const colors = useTheme();
  return (
    <View
      style={[{
        flexDirection: 'row',
        //   backgroundColor: 'white',
        //  margin: 10,
        //    marginLeft: 20,
        //  marginRight: 20,
        borderTopColor: colors.outlineVariant,
        borderTopWidth: 1,
        // borderRadius: 10,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 16
      }, props.viewStyle]}
    >

      <TouchableOpacity
        onPress={() =>
          Router.Open(nav, 'WorkApp', { screen: 'Detail', id: props.id })
        }
        style={{ flex: 1, flexDirection: 'column' }}
      >
        <View style={{ height: 25, justifyContent: 'center' }}>
          <Text style={{ fontWeight: FONT_WEIGHT.SEMIBOLD, fontSize: FONT_SIZE.ListItem, color: colors.primary }}>{props.name}</Text>
        </View>
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
      </TouchableOpacity>
      {props.status != 'DONE' && <TouchableOpacity
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
        {props.status != 'DONE' && (
          <B.ICon
            name={props.status == 'DOING' ? 'pause-circle' : 'play-circle'}
            style={{
              color:
                props.status == 'DOING' ? colors.success : colors.secondary,
              fontWeight: FONT_WEIGHT.THIN,
              fontSize: 35,
            }}
          />
        )}
      </TouchableOpacity>}
      {props.status == 'DONE' &&
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
              props.status == 'DONE' ? 'check-circle' : 'radio-button-off-outline'
            }
            size={FONTSIZE.NORMAL}
          />
        </View>
      }
    </View>
  );
};

const StatusWidget = (props: {
  type: 'mandatory' | 'today' | 'pending'
  day?: Date,
  active?: boolean
  onPress?: () => void
}) => {
  const style = useStyle().component;
  const text = useText();
  const colors = useTheme();
  const data = useAsyncAction(async () => {
    if (props.type == 'pending') {
      return {
        done: 0,
        total: (await workRepository.getUnPlanned(props.day)).length,
      };
    }
    const data = (await workRepository.getListByDate(props.day)).filter(
      (w) =>
        (props.type == 'mandatory' && w.mandatory) ||
        (props.type == 'today' && true),
    );
    return {
      done: data.filter((w) => w.status == 'DONE').length,
      total: data.length,
    };
  }, [useDectectDataChanged(workRepository), props.day]);
  if (data == null) return <View></View>;
  const { done, total } = data;
  const icon_name =
    props.type == 'mandatory'
      ? 'work'
      : props.type == 'today'
        ? 'today-outline'
        : 'clockcircleo';
  const title =
    props.type == 'mandatory'
      ? text.batbuoc || 'Bắt buộc'
      : props.type == 'today'
        ? text.homnay || 'Tổng'
        : text.viecton || 'Tồn đọng';

  const bg =
    props.type == 'mandatory'
      ? colors.error
      : props.type == 'today'
        ? colors.tertiary
        : '#000';
  return (
    <>

      <TouchableOpacity
        onPress={props.onPress}
        style={[
          {
            backgroundColor: '#fff',
            height: 70,
            width: 70,
            borderRadius: 35,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 10,

          },
          props.active && {
            borderColor: bg,
            borderWidth: 7
          }
        ]}
      >

        <View style={{ flexDirection: 'column' }}>
          <Text style={{ fontSize: 30, textAlign: 'center', color: bg, fontWeight: FONT_WEIGHT.BOLD }}>
            {total - done == 0 ? '--' : total - done}
          </Text>
        </View>

      </TouchableOpacity>
      <Text style={{ fontSize: 14, textAlign: 'center', color: colors.onPrimary }}>{title}</Text>
    </>
  );
};

/*
const Body = (props: { route; navigation; viewStyle?; day?: Date }) => {
  const text = useText()
  const colors = useTheme()
  const data = useAsyncAction(async () => workRepository.getList(props.day), [
    useDectectDataChanged(workRepository),
    props.day,
  ])
  if (data == null) return <View></View>

  return (
    <View style={props.viewStyle}>
      <View></View>
      <B.Timeline
        data={data.map((item) => {
          return {
            time: !item.startDate
              ? text.for('No plan')
              : moment(new Date(item.startDate)).format('HH:mm'),
            lineColor:
              item.status == 'DONE'
                ? colors.success
                : colors.getColor(colors.onBackground, 500),
            circleColor:
              item.status == 'DONE'
                ? colors.success
                : colors.getColor(colors.onBackground, 500),
            ...item,
          }
        })}
        renderDetail={(row) => <RenderDetailItem row={row} id={row.id} />}
        renderFullLine={true}
      />
    </View>
  )
}

const RenderListWork = React.memo((props: { data: Array<Work> }) => {
  const text = useText()
  const commonStyle = useCommonStyle()
  return (
    <FlatList
      data={props.data}
      renderItem={({ item }) => (
        <View style={[commonStyle.full, { flexDirection: 'row' }]}>
          <View style={[commonStyle.left, commonStyle.icon_wrapper]}>
            <B.ICon style={[commonStyle.normal]} name="play-circle" />
          </View>
          <View style={[commonStyle.full]}>
            <B.Text style={[commonStyle.title]}>{item.name}</B.Text>
            <View style={[{ flexDirection: 'row' }]}>
              <B.Text style={[commonStyle.content]}>
                {item.startDate
                  ? moment(item.startDate).format('HH:mm')
                  : text.for('Chưa lên lịch')}
              </B.Text>
            </View>

          </View>
          <View style={[commonStyle.right, commonStyle.icon_wrapper]}>
            <B.ICon style={[commonStyle.normal]} name="check-circle" />
          </View>
        </View>
      )}
    />
  )
})

const RenderDetailItem = (props: { row: Work; id?}) => {
  const colors = useTheme()
  const { row, id } = props
  return (
    <View
      key={id}
      style={{
        flexDirection: 'row',
        borderBottomColor: colors.outline,
        borderBottomWidth: 1,
      }}
    >
      <WorkItem day={getDay(new Date())} item={row} />
    </View>
  )
}
*/
export const useStyle = () => {
  const colors = useTheme();
  return {
    workItem: StyleSheet.create({
      container: {},
      left_container: {},
      left_icon: {},
      body_container: {},
      body_title: {},
      body_subTitle: {},
    }),
    screen: StyleSheet.create({
      groupLabel: {
        //color: colors.onBackground,
        color: colors.getColor(colors.onBackground, 600),
        fontSize: FONTSIZE.NORMAL,
        lineHeight: 40,
        height: 40,
      },
      container: {
        padding: 20,
        paddingTop: 40,
        flexDirection: 'column',
        flex: 1,
      },
    }),
    component: StyleSheet.create({
      container: {
        height: 110,
        width: 150,
        //backgroundColor: colors.surface,
        borderRadius: 15,
        padding: 20,
        paddingTop: 0,
        marginRight: 20,
      },
      caption_container: {
        flexDirection: 'row',
        marginLeft: -20,
      },
      caption_icon: {
        color: colors.surface,
        fontSize: 20,
      },
      caption_iconContainer: {
        borderTopLeftRadius: 20,
        borderBottomRightRadius: 20,
        backgroundColor: colors.primary,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
      },
      caption_title: {
        color: colors.onSurface,
        textAlign: 'center',
        lineHeight: 40,
        height: 40,

        fontSize: FONTSIZE.NORMAL,
        flex: 1,
      },
      body_container: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
      },
      arrowup: {
        color: colors.success,
        fontWeight: 'bold',
      },
      arrowdown: {
        color: colors.error,
        fontWeight: 'bold',
      },

      normal: {
        color: colors.onBackground,
        fontSize: FONTSIZE.NORMAL,
      },

      label: {
        color: colors.getColor(colors.onSurface, 500),
        textAlign: 'center',
        flex: 1,
      },

      textDone: {
        color: colors.onSurface,
        fontSize: FONTSIZE.LARGE,
        fontWeight: 'bold',
        paddingRight: 5,
        marginBottom: -5,
      },
      timeDone: {
        color: colors.success,
      },
      textTotal: {
        color: colors.onSurface,
        fontSize: FONTSIZE.BIG,
        fontWeight: 'bold',
      },

      footer_container: {
        flexDirection: 'column',
      },
      footer_text: {},
      progress_container: {
        flexDirection: 'row',
        backgroundColor: colors.background,
      },
      progress: {
        flex: 1,
        borderWidth: 3,
        borderRadius: 3,
        borderColor: colors.success,
      },
    }),
    body: {
      timeLine: StyleSheet.create({
        title: {
          color: colors.onBackground,
          fontSize: FONTSIZE.NORMAL,
          fontWeight: 'bold',
        },
        description: {
          color: colors.getColor(colors.onBackground, 500),
          fontSize: FONTSIZE.NORMAL,
        },
      }),
    },
  };
};
