import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { B, BICon, BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { FONTSIZE } from '../../Common';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import { workRepository } from '../Entities/Repository';
import { Work } from '../Entities/Work';
import { useText } from '../Text';

import { useNavigation } from '@react-navigation/native';
import { AddButtonBottom } from '../../../libs/components/AddButtonBottom';
import { Router } from '../../../Router';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/Constraints';
import { useCommonStyle } from '../../Common/Styles';

import { LinearGradient } from 'expo-linear-gradient';
import { Dashboard } from './Tools/Dashboard';
import { TabAll } from './Tools/TabAll';
import { TabCalendar } from './Tools/TabCalendar';
import { TabSettings } from './Tools/TabSettings';

export const Home = ({ navigation }) => {
  const colors = useTheme();
  const t = useText().translate;
  const styles = useCommonStyle();
  const [day, setDay] = useState(new Date());
  const [tabIndex, setTabIndex] = useState(0);
  const [showTitle, setShowTitle] = useState(false);
  //return <View />
  return (
    <View style={[{ flex: 1 }]}>
      {/**Time line in day */}

      <View
        style={[styles.screen]}

      >
        <View style={[{ flexDirection: 'row' }]}>
          <Text
            style={{
              fontSize: FONTSIZE.PAGE_TITLE,
              flex: 1,
              fontWeight: 'bold',
              color: colors.text.main,
            }}
          >
            {t('Todo', 'Todo')}
          </Text>
          <TouchableOpacity
            style={[
              {
                width: 36,
                justifyContent: 'center',
                height: 36,
                backgroundColor: colors.primary10,
                borderRadius: 18,
                marginRight: 10,
              },
            ]}
            onPress={() => {
              setTabIndex(4);
            }}
          >
            <BICon
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: colors.text.main,
              }}
              name="search"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              {
                width: 36,
                justifyContent: 'center',
                height: 36,
                backgroundColor: colors.primary10,
                borderRadius: 18,
              },
            ]}
            onPress={() => {
              setTabIndex(5);
            }}
          >
            <BICon
              style={{ fontSize: 22, fontWeight: 'bold' }}
              name="setting"
            />
          </TouchableOpacity>
        </View>
        {/**tab link */}
        <TabLink
          data={[t('Today'), t('Scheduled'), t('All')]}
          activeIndex={tabIndex}
          style={{ marginBottom: 15, marginTop: 10 }}
          onChange={(index) => {
            setTabIndex(index);
            Router.Open(navigation, 'WorkApp', { screen: 'Scheduler' });
          }}
        />
        <View style={[{ flex: 1, marginBottom: 80, marginLeft: -16, marginRight: -16 }]}>
          {tabIndex == 0 && <Body day={day} />}
          {tabIndex == 1 && <TabCalendar />}
          {tabIndex == 3 && <TabAll />}
          {tabIndex == 4 && <Dashboard />}
          {tabIndex == 5 && <TabSettings />}
        </View>
      </View>

      <AddButtonBottom
        onPlusClick={() =>
          Router.Open(navigation, 'WorkAppModal', { screen: 'Add' })
        }
      ></AddButtonBottom>
    </View>
  );
};

const TabLink = (props: {
  data: Array<any>
  activeIndex?
  style?: StyleProp<ViewStyle>
  onChange?: (index: number) => void
}) => {
  const [activeIndex, setActiveIndex] = useState(props.activeIndex || 0);
  const colors = useTheme();
  useEffect(() => {
    if (activeIndex != props.activeIndex) {
      props.onChange && props.onChange(activeIndex);
    }
  }, [activeIndex]);
  return (
    <View style={[{ flexDirection: 'row' }, props.style]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {props.data.map((item, index) => (
          <TouchableOpacity
            onPress={() => setActiveIndex(index)}
            key={index}
            style={[
              { padding: 5, paddingLeft: 10, paddingRight: 10 },
              activeIndex == index && {
                borderRadius: 15,
                backgroundColor: colors.primary30,
              },
            ]}
          >
            <Text
              style={[
                { fontSize: FONTSIZE.NORMAL },
                activeIndex == index && {
                  color: colors.primary,
                  fontWeight: '400',
                },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const Body = (props: { day: Date }) => {
  return <ScrollView contentContainerStyle={{ paddingBottom: 80 }}><NormalSection day={props.day} /></ScrollView>;
};

const NormalSection = (props: { day: Date }) => {
  const colors = useTheme();
  const [data, setData] = useState([] as Work[]);
  useAsyncAction(async () => {
    const tmp = await workRepository.getListByDate(props.day);
    setData(tmp);
  }, [props.day]);

  if (!data) return <View></View>;
  return (
    <>
      <Section
        data={data.filter((d) => d.mandatory)}
        date={props.day}
        type="mandatory"
      />
      <Section
        data={data.filter((d) => !d.mandatory)}
        date={props.day}
        type="normal"
      />
      <Section
        data={data.filter((d) => d.status == 'DONE')}
        date={props.day}
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

const useStyles = () => {
  const colors = useTheme();
  return {
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
  };
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
          borderTopColor: colors.outline,
          borderTopWidth: 1,
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
        style={{ flex: 1, flexDirection: 'column' }}
      >
        <View
          style={{
            height: props.status == 'DONE' ? 50 : 25,
            justifyContent: 'center',
          }}
        >
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
        {props.status != 'DONE' && (
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

const StatusWidget = (props: {
  type: 'mandatory' | 'today' | 'pending'
  day?: Date
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
            borderWidth: 7,
          },
        ]}
      >
        <View style={{ flexDirection: 'column' }}>
          <Text
            style={{
              fontSize: 30,
              textAlign: 'center',
              color: bg,
              fontWeight: FONT_WEIGHT.BOLD,
            }}
          >
            {total - done == 0 ? '--' : total - done}
          </Text>
        </View>
      </TouchableOpacity>
      <Text
        style={{ fontSize: 14, textAlign: 'center', color: colors.onPrimary }}
      >
        {title}
      </Text>
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
