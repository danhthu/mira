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
    // Ba màu 'red'/'orange'/'blue' viết cứng ở đây là màu debug bỏ quên từ bản Batify —
    // dải lịch này hiện ngay đầu màn Thói quen và màn Kế hoạch, nên nền đỏ là thứ người
    // dùng nhìn thấy đầu tiên. Chuyển sang token; ràng buộc cứng #3 cũng cấm đỏ ở đây.
    return (<View style={[props.style, { backgroundColor: colors.surface }]}>
        <WeekCalendar
            theme={{
                selected: {
                    color: colors.token.textOnAccent,
                    backgroundColor: colors.token.accent
                },
                header: {
                    backgroundColor: colors.surface
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