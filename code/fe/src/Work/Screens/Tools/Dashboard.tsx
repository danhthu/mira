import moment from "moment";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { BICon } from "../../../../libs/components";
import { HEADER_HEIGHT } from "../../../../theme/Constraints";
import { FONTSIZE } from "../../../Common";
import { Header } from "../../../Common/Components/Header";
import { useAsyncAction } from "../../../Common/Hooks";
import { useCommonStyle } from "../../../Common/Styles";
import { workRepository } from "../../Entities";
import { useText } from "../../Text";

//tab: home
//tab: this week (numer)
//tab: calendar (number)
//tab: unplan (number)
export const Dashboard = () => {
    //diem so: point, level, huy hiệu
    //work list: done, miss, plan, unplan
    const t = useText().translate;
    const [showTitle, setShowTitle] = useState(false);
    const styles = useStyles();
    const data = useAsyncAction(async () => {
        return {
            point: 10, level: 1,

        };
    }, [], {
        point: 10,
        level: 1
    });
    return <View style={[styles.screen]}>
        <Header title={''} />
        <Text style={{ fontWeight: '500', fontSize: FONTSIZE.PAGE_TITLE }}>
            {t('Profile')}
        </Text>
        <ScrollView onScroll={(evt) => {
            if (!showTitle && evt.nativeEvent.contentOffset.y > HEADER_HEIGHT) {
                setShowTitle(true);
            }
            if (showTitle && evt.nativeEvent.contentOffset.y < HEADER_HEIGHT) {
                setShowTitle(false);
            }
        }}>
            <Point point={data.point} />
            <Level level={data.level} />
            <Collection />
            <Summary />
        </ScrollView>
    </View>;
};

const Point = ({ point = 0 }) => {
    const maxPoint = 1000;
    const pointLevel = point >= maxPoint * 0.8 ? 3 :
        point >= maxPoint * 0.5 ? 2 :
            point >= 0 ? 1 : 0;


    return <View>
        <Text style={{ fontSize: FONTSIZE.LARGE }}>{point}</Text>
        <View>
            <View style={{ flexDirection: 'row' }}>
                <BICon name="star" style={{ color: pointLevel > 0 ? 'yellow' : 'gray' }} />
                <BICon name="star" style={{ color: pointLevel > 1 ? 'yellow' : 'gray' }} />
                <BICon name="star" style={{ color: pointLevel > 2 ? 'yellow' : 'gray' }} />
            </View>
        </View>
    </View>;
};

const Level = ({ level = 1 }) => {
    return <View></View>;
};

const Collection = ({ data = [{}] }) => {
    return <View></View>;
};

const Summary = () => {
    const totals = useAsyncAction(async () => {
        const data = await workRepository.list();
        return {
            done: data.filter(d => d.status == 'DONE').length,
            plan: data.filter(d => d.status != 'DONE' && d.startDate).length,
            unPlan: data.filter(d => d.status != 'DONE' && !d.startDate).length,
            miss: data.filter(d => d.status != 'DONE' && moment(d.endDate).isAfter(moment(new Date))).length,
        };
    }, [], { done: 0, plan: 0, unPlan: 0, miss: 0 });
    const t = useText().translate;
    return <View>
        <View style={{ flexDirection: 'row' }}>
            <View>
                <Text>{t('Done')}</Text>
                <Text>{totals.done}</Text>
            </View>
            <View>
                <Text>{t('Plan')}</Text>
                <Text>{totals.plan}</Text>
            </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
            <View>
                <Text>{t('Miss')}</Text>
                <Text>{totals.miss}</Text>
            </View>
            <View>
                <Text>{t('UnPlan')}</Text>
                <Text>{totals.unPlan}</Text>
            </View>
        </View>
    </View>;
};

const useStyles = () => useCommonStyle();