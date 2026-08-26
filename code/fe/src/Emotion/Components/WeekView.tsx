import moment from 'moment';
import { ReactNode } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { GRAY_COLOR, SECOND_BLACK_COLOR } from '../../../theme/Constraints';
import { FONTSIZE } from '../../Common';
import { getStartOfWeek } from '../../Common/Utils/common';
import { useText } from '../Text';

export const WeekView = (props: {
  startDay?: Date
  style?: StyleProp<ViewStyle>
  renderValue: (day: Date, actived: boolean, size: number) => ReactNode
  onDayPress?: (day: Date) => void
}) => {
  const text = useText();

  const days = [
    text.Mon || 'Mon',
    text.Tue || 'Tue',
    text.Web || 'Web',
    text.Thu || 'Thu',
    text.Fri || 'Fri',
    text.Sat || 'Sat',
    text.Sun || 'Sun',
  ];
  const styles = StyleSheet.create({
    dayComponentContainer: {
      flex: 1,
    },
    dayNameContainer: {},
    dayName: {
      fontSize: FONTSIZE.SMALL,
      color: SECOND_BLACK_COLOR,
      textAlign: 'center',
    },

    dayValueContainer: {
      marginTop: 5,
      height: 35,
      width: 35,

      alignSelf: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    dayValueDefault: {
      height: 30,
      width: 30,
      borderRadius: 15,
      alignSelf: 'center',
      justifyContent: 'center',
      backgroundColor: GRAY_COLOR,
    },
    dayValueContainerActived: {
      // backgroundColor: props.color,
    },
    dayValue: {
      fontSize: FONTSIZE.SMALL,
      textAlign: 'center',
    },
  });

  return (
    <View style={[props.style]}>
      <View style={{ flexDirection: 'row' }}>
        {days.map((d, i) => {
          const date = moment(props.startDay || getStartOfWeek(new Date())).add(
            i,
            'days',
          );
          const renderDateNumber = props.renderValue(date.toDate(), false, 30);
          return (
            <View key={i} style={[styles.dayComponentContainer]}>
              <View style={styles.dayNameContainer}>
                <Text style={styles.dayName}>{d}</Text>
              </View>
              <TouchableOpacity onPress={() => props.onDayPress(date.toDate())}>
                <View style={[styles.dayValueContainer]}>
                  {renderDateNumber != null ? (
                    renderDateNumber
                  ) : (
                    <View style={[styles.dayValueDefault]}>
                      <Text style={[styles.dayValue]}>{date.date()}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
};
