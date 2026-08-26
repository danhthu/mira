import { useActionSheet } from "@expo/react-native-action-sheet";
import moment from "moment";
import { useState } from "react";
import { FlatList, Switch, Text, TouchableOpacity, View } from "react-native";
import { CheckBox } from "../../../../libs/components/Input";
import { Router } from "../../../../Router";
import { useTheme } from "../../../../theme";
import { FONTSIZE } from "../../../Common";
import { CCalendarStrip } from "../../../Common/Components/CCalendarStrip";
import { Divider } from "../../../Common/Components/Divider";
import { Header } from "../../../Common/Components/Header";
import { useAsyncAction, useDectectDataChanged } from "../../../Common/Hooks";
import { useCommonStyle } from "../../../Common/Styles";
import { Work, workRepository } from "../../Entities";
import { useText } from "../../Text";

export const Plan = ({ navigation }) => {
    const t = useText().translate;
    const colors = useTheme();
    const styles = useStyles();
    const [date, setDate] = useState(new Date);
    const data = useAsyncAction(async () => {
        return await workRepository.filter(w => w.status != 'DONE');
    }, [useDectectDataChanged(workRepository)], []);
    const { showActionSheetWithOptions } = useActionSheet();
    const renderItem = ({ item }: { item: Work }) => <View >
        <View style={{ flexDirection: 'row', paddingTop: 4, paddingBottom: 4, justifyContent: 'center' }}>
            <CheckBox
                label=""
                value={moment(item.startDate).isSame(moment(date))}
                onChanged={async val => {
                    await workRepository.update(w => w.id == item.id, updated => {
                        if (val) {
                            updated.startDate = date;
                        } else {
                            updated.startDate = null;
                        }

                    });
                }}
            />
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={{ fontSize: FONTSIZE.NORMAL, }}>{item.name}</Text>
            </View>
            <Switch value={moment(item.startDate).isSame(moment(date)) && item.mandatory} onValueChange={async val => {
                if (moment(item.startDate).isSame(moment(date))) {
                    await workRepository.update(w => w.id == item.id, updated => {
                        updated.startDate = date;
                        updated.mandatory = val;
                    });
                }
            }} />
        </View>
    </View>;
    const emptyList = () => {
        return <View style={{ alignItems: 'center' }}>
            <TouchableOpacity onPress={() => Router.Open(navigation, 'WorkAppModal', { screen: 'Add' })}><Text>{t('Thêm tags để phân loại nhiệm vụ, nhấn ')}<Text style={{ color: colors.colorLink }}>{t('+')}</Text><Text>{t(' để thêm.')}</Text></Text>
            </TouchableOpacity>
        </View>;
    };

    return <View style={[styles.screen, { paddingLeft: 0, paddingRight: 0 }]}>
        <Header title={t('Chọn task')} />
        <CCalendarStrip
            selectedDay={date}
            onDateSelected={() => setDate(date)}
        />

        <FlatList
            style={{ backgroundColor: '#fff', padding: 20 }}
            data={data} renderItem={renderItem}
            ItemSeparatorComponent={props => <Divider />}
            ListEmptyComponent={emptyList}
        />
    </View>;
};

const useStyles = () => useCommonStyle();