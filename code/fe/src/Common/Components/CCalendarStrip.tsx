import React, { MutableRefObject, ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { WeekCalendar } from 'react-native-scrollable-calendars';

import moment, { Moment } from "moment";
import { useTheme } from "../../../theme";

export interface CalendarRef {
    currentWeek: string;
    scrollToDate: (m: any, animated?: boolean, fireCallback?: boolean, forceScrollTo?: boolean) => void;
    scrollToWeek: (m: any, animated?: boolean, autoSelect?: boolean, fireCallback?: boolean, forceScrollTo?: boolean) => void;
    scrollToNextWeek: (animated?: boolean, fireCallback?: boolean, forceScrollTo?: boolean) => void;
    scrollToPrevWeek: (animated?: boolean, fireCallback?: boolean, forceScrollTo?: boolean) => void;
}

export const CCalendarStrip = React.forwardRef((props: {
    onDateSelected?: (date: Moment) => void
    selectedDay: Date
    style?: StyleProp<ViewStyle>,
    renderHeader?: () => ReactNode,
    onWeekScrollStartChanged?: (start: Moment) => void,
}, ref?: MutableRefObject<CalendarRef>) => {
    const colors = useTheme();
    //console.log('calendarstrip selected', props.selectedDay);
    //marked
    return (<View style={[props.style, { backgroundColor: 'red' }]}>
        <WeekCalendar
            theme={{
                selected: {
                    color: 'blue',
                    backgroundColor: 'orange'
                },
                header: {
                    backgroundColor: 'red'
                },
                dayName: {

                }
            }}
            ref={ref}
            //autoSelect="firstday"
            selected={props.selectedDay}
            onSelectDate={(value, source) => {
                console.log(['calendarstrip', value, source, source === 'dayPress']);
                if (source === 'dayPress') {
                    console.log(['calendarstrip', 'onDateSelected', value, source]);
                    props.onDateSelected(moment(value, 'YYYY-MM-DD'));
                }
                if (source == 'pageScroll') {
                    props.onWeekScrollStartChanged(moment(value, 'YYYY-MM-DD'));
                }
                if (!source) {
                    props.onWeekScrollStartChanged(moment(value).startOf('isoWeek'));
                }
            }}
        />

    </View>
    );
});