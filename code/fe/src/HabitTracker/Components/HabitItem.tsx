import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { FontICon } from '../../../libs/components/Icon';
import { getCurrentDay, getDay } from '../../../libs/dateUtils';
import { Router } from '../../../Router';
import { AppStyle, useTheme } from '../../../theme';

import { useNavigation } from '@react-navigation/native';
import { useText } from '../../../lang';
import { B } from '../../../libs/components';
import { FONTSIZE, getLogger } from '../../Common';
import { useSettings } from '../../Common/Hooks';
import { Habit, HabitTracker, habitTrackerRepository } from '../Entities';
const logger = getLogger('HabitItem');
export const HabitItem = (props: {
  color?: any
  item: Habit
  tracker: HabitTracker
  day: Date
  styles?: StyleProp<ViewStyle>
  onChanged?: (done: boolean) => void
}) => {
  // console.log(['HabitItem', props.item.name, props.tracker.status])
  const size = 60;
  const item = props.item;
  const tracker = props.tracker;
  const theme = useTheme();
  const style = stlyes(theme);
  const text = useText();
  const navigation = useNavigation();
  const [settings] = useSettings();
  const allow_previous = settings.habit_day_previous_allow || 5;
  //const styles = segmentStyles(useTheme())

  const onCompleted = async (props) => {
    if (getDay(props.day) <= getCurrentDay() && tracker.status != 'DONE') {
      logger.info('use touch done tracker', props.day.getTime());
      await habitTrackerRepository.doneTracker(item.id, props.day);
      props.onChanged(true);
    } else {
      if (getDay(props.day) <= getCurrentDay() && tracker.status == 'DONE') {
        logger.info('use touch undone tracker');
        await habitTrackerRepository.unDoneTracker(item.id, props.day);
        props.onChanged(false);
      }
    }
  };

  const onOpenDetail = () =>
    Router.Open(navigation, 'HabitAppModal', {
      screen: 'Detail', data: {
        habit: props.item, tracker: props.tracker, day: props.day.getTime(), id: item.id,
      }
    });

  const canTouch = (day, allow) => {
    return true;
    /*return (
      getDay(day) <= getCurrentDay() &&
      getDay(day) >=
      getDay(
        new Date(getCurrentDay().getTime() - allow * 24 * 60 * 60 * 1000),
      )
    );*/
  };
  const colors = useTheme();
  if (!props.item) return <View></View>;
  return (
    <View style={[style.container, props.styles, item.style]} key={item.id}>
      <View style={[style.leftContainer, {}]}>
        <B.ImageFor
          name={item.icon || item.name}
          height={54}
          width={54}
          style={[item.icon && { backgroundColor: 'transparent' }]}
          textStyle={{
            color: '#000',
            lineHeight: 50,
            fontSize: FONTSIZE.NORMAL,
          }}
        />
      </View>
      <View style={style.middleContainer}>
        <TouchableOpacity
          style={[
            {
              justifyContent: 'center',
            },
          ]}
          onPress={() =>
            Router.Open(navigation, 'HabitAppModal', {
              screen: 'Detail', data: {
                habit: props.item, tracker: props.tracker, day: props.day.getTime(), id: item.id,
              }
            })
          }
        >
          <Text
            style={[
              style.title,
              {
                textDecorationLine:
                  tracker.status == 'DONE' ? 'line-through' : 'none',
              },
            ]}
          >
            {item.name || 'New Habit'}
          </Text>
          {!item.planOption ? null : (
            <View style={{ flexDirection: 'row' }}>
              <View style={{ justifyContent: 'center', height: 16 }}>
                <FontICon
                  name="clockcircleo"
                  size={FONTSIZE.SubTitle}
                  style={{ marginRight: 5, color: theme.primary }}
                />
              </View>

              <Text
                style={[
                  style.desc,
                  {
                    textDecorationLine:
                      tracker.status == 'DONE' ? 'line-through' : 'none',
                  },
                ]}
              >
                {' '}
                At {item.planOption.hour}:{item.planOption.minut}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <View style={[]}>
        {item.goalOption && tracker.status != 'DONE' ? (
          <TouchableOpacity onPress={onOpenDetail}>
            {item.goalOption.unit == 'Time' ? (
              <FontICon
                name="clockcircleo"
                style={style.right_icon_undone}
                size={FONTSIZE.SMALL}
              />
            ) : (
              <Text style={style.righ_text_title}>{item.goalOption.unit}</Text>
            )}
            <Text style={style.righ_text_subTitle}>
              {tracker.data.goal?.done || 0}
              {item.goalOption.unit == 'Time'
                ? ''
                : '/' + item.goalOption.total}
            </Text>
          </TouchableOpacity>
        ) : canTouch(props.day, allow_previous) ? (
          <TouchableOpacity
            style={[style.rightContainer]}
            onPress={() => onCompleted(props)}
          >
            {tracker.status == 'DONE' ? (
              <FontICon
                style={style.right_icon_done}
                name="check-circle"
                size={24}
              ></FontICon>
            ) : (
              <FontICon
                name="radio-button-off-outline"
                size={24}
                style={style.right_icon_undone}
              ></FontICon>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const stlyes = (theme: typeof AppStyle) =>
  StyleSheet.create({
    title: {
      fontWeight: '500',
      fontSize: FONTSIZE.Title,
    },
    desc: {
      fontSize: FONTSIZE.SubTitle,
      marginTop: -2,
      color: theme.primary,
    },

    container: {
      //borderRadius: theme.BORDER.normal,
      flex: 1,
      flexDirection: 'row',
      marginTop: 5,
      marginBottom: 5,
      borderRadius: 10,
    },
    leftContainer: {
      alignSelf: 'flex-start',
      height: 60,
      marginRight: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    rightContainer: {
      alignSelf: 'flex-end',
      paddingRight: 10,
      height: 60,
      width: 50,
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
    middleContainer: {
      alignSelf: 'stretch',
      flex: 1,
      height: 60,
      justifyContent: 'center',
    },
    right_icon_undone: {
      color: theme.secondary,
    },
    right_icon_done: {
      color: theme.success,
    },
    righ_text_title: {
      textTransform: 'lowercase',
      fontSize: FONTSIZE.SMALL,
      color: theme.tertiary,
    },
    righ_text_subTitle: {
      textTransform: 'lowercase',
      fontSize: FONTSIZE.SMALL,
      color: theme.tertiary,
    },
  });
