import moment from 'moment';
import { useState, useEffect, useCallback } from 'react';
import { DateData, CalendarList } from 'react-native-calendars';
import { useCommonStyle } from '../Styles';
import { useTheme } from '../../../theme';
import { View } from 'react-native';
import { B } from '../../../libs/components';
import { Link } from '../../../libs/components/Link';
import { useText } from '../../Work/Text';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { debugStyle } from '../../../libs/components/debugStyle';

export const CustomCalendarView = (props: {
  minValue?: Date
  value?: Date
  onBack: () => void
  onSet: (date: Date) => void
}) => {
  const [value, setValue] = useState(props.value);
  const [selectedDate, setSelectedDate]=useState(null);
  const [monthText,setMonthText] = useState(null);
  const commonStyle = useCommonStyle();
  const text = useText();
  const colors = useTheme();
  useEffect(() => {
    setValue(props.value);
    setMonthText(moment(value||new Date).format('MMM'));
    setSelectedDate({
      [moment(value || new Date()).format('YYYY-MM-dd')]: { selected: true },
    });
  }, [props.value]);
  const handleDayPress = useCallback(
    (d) => {
      setValue(moment(d).toDate());
      const dateString = d.dateString;
      setSelectedDate({ [dateString]: { selected: true } });

    },
    [setSelectedDate],
  );
  return (
    <View>
      {/** navigation */}
      <View style={{ flexDirection: 'row' }}>

        <Link
          viewStyle={[commonStyle.left, { flex: 1 }]}
          style={{ color: colors.error }}
          onPress={props.onBack}
        >
          {text.quaylai || 'Quay lại'}
        </Link>
        <B.Text style={[commonStyle.full, { textAlign: 'center', flex: 1 }]}>
          {monthText}
        </B.Text>

        <Link
          viewStyle={[commonStyle.right, { flex: 1, alignItems: 'flex-end' }]}
          style={{ color: colors.primary }}
          onPress={() => {
            props.onSet(value);
          }}
        >
          {text.xong || 'Xong'}
        </Link>
      </View>
      <CalendarList
        style={{ height:270 }}
        horizontal
        renderHeader={() => null}
        showSixWeeks
        minDate={
          props.minValue ? moment(props.minValue).format('YYYY-MM-DD') : null
        }
        onMonthChange={(m) =>  setMonthText(moment(m).format('MMM'))}
        markedDates={selectedDate}
        onDayPress={handleDayPress}
      ></CalendarList>
    </View>
  );
};
