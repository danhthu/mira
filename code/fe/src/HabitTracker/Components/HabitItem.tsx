import { useNavigation } from '@react-navigation/native';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { B } from '../../../libs/components';
import { FontICon } from '../../../libs/components/Icon';
import { getCurrentDay, getDay } from '../../../libs/dateUtils';
import { Router } from '../../../Router';
import { AppStyle, useTheme } from '../../../theme';
import { FONTSIZE } from '../../Common';
import { Habit, HabitTracker, habitTrackerRepository } from '../Entities';

/**
 * Một dòng thói quen trong danh sách ngày.
 *
 * Đây là chỗ tốn thao tác nhất trong ngày, nên chạm vào vòng tròn bên phải là
 * ghi xong — một chạm, không hộp thoại xác nhận, chạm lại thì bỏ ghi. Ngày trong
 * tương lai không cho ghi (vòng tròn mờ đi) thay vì cho chạm rồi mới báo lỗi.
 */
export const HabitItem = (props: {
  color?: string
  item: Habit
  tracker: HabitTracker
  day: Date
  styles?: StyleProp<ViewStyle>
  onChanged?: (done: boolean) => void
}) => {
  const { item, tracker, day } = props;
  const theme = useTheme();
  const style = styles(theme);
  const navigation = useNavigation();
  const isFuture = getDay(day) > getCurrentDay();
  const isDone = tracker.status == 'DONE';

  const toggle = async () => {
    if (isFuture) return;
    if (isDone) {
      await habitTrackerRepository.unDoneTracker(item.id, day);
      props.onChanged(false);
    } else {
      await habitTrackerRepository.doneTracker(item.id, day);
      props.onChanged(true);
    }
  };

  const openDetail = () =>
    Router.Open(navigation, 'HabitAppModal', {
      screen: 'Detail',
      data: { habit: item, tracker, day: day.getTime(), id: item.id },
    });

  return (
    <View style={[style.container, props.styles, item.style]} key={item.id}>
      <View style={style.leftContainer}>
        <B.ImageFor
          name={item.icon || item.name}
          height={54}
          width={54}
          style={[item.icon && { backgroundColor: 'transparent' }]}
          textStyle={{
            color: theme.token.textPrimary,
            lineHeight: 50,
            fontSize: FONTSIZE.NORMAL,
          }}
        />
      </View>
      <View style={style.middleContainer}>
        <TouchableOpacity
          style={{ justifyContent: 'center' }}
          onPress={openDetail}
        >
          <Text
            style={[
              style.title,
              { textDecorationLine: isDone ? 'line-through' : 'none' },
            ]}
          >
            {item.name}
          </Text>
          {item.planOption ? (
            <View style={{ flexDirection: 'row' }}>
              <FontICon
                name="clockcircleo"
                size={FONTSIZE.SubTitle}
                style={{ marginRight: 5, color: theme.token.textSecondary }}
              />
              <Text style={style.desc}>
                {item.planOption.hour}:{item.planOption.minut}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>
      <View>
        {item.goalOption && !isDone ? (
          <TouchableOpacity style={style.rightContainer} onPress={openDetail}>
            <Text style={style.goalUnit}>{item.goalOption.unit}</Text>
            <Text style={style.goalValue}>
              {tracker.data?.goal?.done || 0}/{item.goalOption.total}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={style.rightContainer}
            disabled={isFuture}
            onPress={toggle}
          >
            <FontICon
              name={isDone ? 'check-circle' : 'radio-button-off-outline'}
              size={24}
              style={{
                color: isDone
                  ? theme.token.positive
                  : isFuture
                    ? theme.token.border
                    : theme.token.borderStrong,
              }}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = (theme: typeof AppStyle) =>
  StyleSheet.create({
    title: {
      fontWeight: '500',
      fontSize: FONTSIZE.Title,
      color: theme.token.textPrimary,
    },
    desc: {
      fontSize: FONTSIZE.SubTitle,
      marginTop: -2,
      color: theme.token.textSecondary,
    },
    container: {
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
    goalUnit: {
      textTransform: 'lowercase',
      fontSize: FONTSIZE.SMALL,
      color: theme.token.textSecondary,
    },
    goalValue: {
      fontSize: FONTSIZE.SMALL,
      color: theme.token.textSecondary,
    },
  });
