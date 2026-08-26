import Timeline, { TimelineProps } from "react-native-timeline-flatlist"
import { useTheme } from "../../theme"


export const BTimeLine = (props: TimelineProps) => {


    const colors = useTheme()
    const circleColor = colors.primary;
    const lineColor = colors.primary;
    const dotColor = "white";

    return <Timeline
        {...{ circleColor, lineColor, dotColor, ...props }} timeStyle={{
            textAlign: 'center', backgroundColor: '#ff9797', color: '#ffffff', padding: 5, borderRadius: 13
        }}
        innerCircle="dot"
        timeContainerStyle={{ width: 70, marginTop: 5 }} />
}