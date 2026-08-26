import moment from 'moment';
import { Dispatch, useState } from 'react';
import { Calendar, DateData } from 'react-native-calendars';


import { getSegmentsFor } from '../../../libs';
import { B } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { BORDER_ROUND } from '../../Common';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import { Habit, habitRepository, habitTrackerRepository } from '../Entities';

export const DataMonth = (props: {
  habits: Habit[]
  hideTextComponent?: boolean,
  onMonthChanged?: Dispatch<DateData>
}) => {
  const colors = useTheme();
  const [markedDates, setMarkedDates] = useState({});
  const deps = [
    useDectectDataChanged(habitRepository),
    useDectectDataChanged(habitTrackerRepository),
    props.habits
  ];
  const markedStyle = {
    selected: true,
    marked: false,
    startingDay: false,
    endingDay: false,
    color: colors.primary,
    textColor: colors.onPrimary,
    selectedColor: colors.onPrimaryContainer,
    selectedContainerColor: colors.primaryContainer,
  };

  useAsyncAction(
    async () => {
      const result = {};
      const habits = props.habits || [].map(h => ({ id: h.id }));
      const trackers = (await habitTrackerRepository.filter(
        (h) => habits.filter(a => a.id == h.hid).length > 0 && h
          .status == 'DONE',
      )
      );
      const segments = getSegmentsFor(trackers);

      segments.forEach((item) => {
        if (item.startDay != item.endDay) {
          result[moment(new Date(item.startDay)).format('YYYY-MM-DD')] = { ...markedStyle, startingDay: true };
          result[moment(new Date(item.endDay)).format('YYYY-MM-DD')] = { ...markedStyle, endingDay: true };
          for (let i = item.startDay + 24 * 3600 * 1000; i < item.endDay; i += 24 * 3600 * 1000) {
            result[moment(new Date(i)).format('YYYY-MM-DD')] = { ...markedStyle, endingDay: false };
          }
        } else {
          result[moment(new Date(item.startDay)).format('YYYY-MM-DD')] = { ...markedStyle, startingDay: true, endingDay: true };
        }
      });
      setMarkedDates(result);
      //get done in mand
    },
    deps, null, 'HabitTracker\\DataMonth');

  return (

    <Calendar
      style={{
        borderWidth: 1,
        borderColor: colors.outlineVariant,
        borderRadius: BORDER_ROUND.NORMAL,
        backgroundColor: 'white'
      }}
      renderArrow={dir => dir == 'left' ? <B.ICon name='arrow-left' /> : <B.ICon name='arrow-right' />}
      marking={{ dots: null }}
      markingType={'period'}
      markedDates={markedDates}
      onMonthChange={props.onMonthChanged}
    ></Calendar>

  );
};


