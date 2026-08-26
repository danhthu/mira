import { useActionSheet } from "@expo/react-native-action-sheet";
import { useNavigation } from "@react-navigation/native";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { B } from "../../../../libs/components";
import { Router } from "../../../../Router";
import { useTheme } from "../../../../theme";
import { FONT_SIZE, FONT_WEIGHT, ROUND_NORMAL } from "../../../../theme/Constraints";
import { FONTSIZE } from "../../../Common";
import { Divider } from "../../../Common/Components/Divider";
import { useAsyncAction, useDectectDataChanged } from "../../../Common/Hooks";
import { useCommonStyle } from "../../../Common/Styles";

import { useState } from "react";
import { Work, workRepository } from "../../Entities";
import { useText } from "../../Text";
// show total
// mode calendar, list.

export const TabAll = () => {
    const [path, setPath] = useState({ name: "root", params: {} as Work });
    const [data, setData] = useState([]);
    useAsyncAction(async () => {
        const tmp = await workRepository.getRootGroups();
        setData(tmp);
    }, []);
    return <View>
        {path.name == 'root' && <Groups data={data} onPress={item => {
            setPath({ name: 'detail', params: item });
        }} />}
        {path.name == 'detail' && <Detail name={path.params.name} groupId={path.params.id} onPress={item => {
            setPath({ name: 'detail', params: item });
        }} />}
    </View>;
};

const Groups = ({ data = [] as Array<Work>, onPress = (item: Work) => { } }) => {
    const styles = useStyles().group;
    const t = useText().translate;
    const [totals, setTotals] = useState({} as Record<string, { done, total }>);
    useAsyncAction(async () => {
        const result = {};
        data.forEach(async item => {
            result[item.id] = await workRepository.getChildrenCounts(item.id);
        });
        setTotals(result);
    }, []);
    return data.map((d, i) => <View key={i} style={styles.container}>
        <View style={styles.bgImage}>{/**image backgroud */}</View>
        <View style={styles.icon}>{/**icon */}</View>
        <View style={styles.task_container}>{totals[d.id].done}/{totals[d.id].total} {t('Task')}</View>
        <View style={styles.name_container}><Text style={styles.name}>
            {d.name}
        </Text></View>
    </View>);
};

const Detail = ({ name = 'untitled', groupId = 'untitled', onPress = (item: Work) => { } }) => {
    const styles = useStyles().detail;
    const [data, setData] = useState([] as Array<Work>);
    useAsyncAction(async () => {
        const tmp = await workRepository.getChildren(groupId);
        setData(tmp);
    }, []);
    if (data.length == 0) return <View />;
    if (data.filter(d => d.kind == 'group').length > 0) return <View><Groups data={data} onPress={onPress} /></View>;
    return <View >
        <Text style={styles.title}>{name}</Text>
        {data.map((d, i) => <View key={i}>
            <WorkItem {...d} />
        </View>)}
    </View>;
};


const useStyles = () => {
    const colors = useTheme();
    const group = StyleSheet.create({
        container: {
            borderRadius: ROUND_NORMAL,
            backgroundColor: '#ddd',
            borderWidth: 1,
            borderColor: colors.outline
        },
        bgImage: {
            position: 'absolute', right: 0, top: 0, bottom: 0
        },
        icon: {

        },
        task_container: {

        },
        task: {
            fontSize: FONTSIZE.NORMAL
        },
        name_container: {

        },
        name: {
            fontSize: FONTSIZE.BIG,
            fontWeight: 'bold'
        }
    });
    const detail = StyleSheet.create({
        title: {
            fontSize: FONTSIZE.BIG,
            marginBottom: 30,

        }
    });

    return { group, detail };
};

export const TabAll2 = () => {
    const navigation = useNavigation();
    const t = useText().translate;
    const styles = useCommonStyle();
    const colors = useTheme();
    const { showActionSheetWithOptions } = useActionSheet();
    const onPlusClick = () => {
        const options = ["Create Group", "Add Task"];
        showActionSheetWithOptions(
            {
                options,
                message: "",
                cancelButtonIndex: options.length,
                messageTextStyle: {
                    textAlign: 'center',
                    fontSize: FONTSIZE.NORMAL,
                    alignSelf: 'center',
                },
            },
            async (selectedIndex: number) => {
                if (selectedIndex == 0) {
                    Router.Open(navigation, 'WorkAppModal', { screen: 'AddGroup' });
                }
                if (selectedIndex == 1) {
                    Router.Open(navigation, 'WorkAppModal', { screen: 'Add' });
                }
            },
        );
    };
    const data = useAsyncAction(async () => {
        return (await workRepository.list());
    }, [useDectectDataChanged(workRepository)], []);

    const emptyList = () => {

        return <View style={{ alignItems: 'center' }}>
            <TouchableOpacity onPress={onPlusClick}><Text>{t('Nhấn ')}<Text style={{ color: colors.colorLink }}>{t('+')}</Text><Text>{t(' để thêm nhiệm vụ mới.')}</Text></Text>
            </TouchableOpacity>
        </View>;
    };

    const renderItem = ({ item }) => <WorkItem {...item} />;

    return <View >
        <FlatList data={data}
            renderItem={renderItem}
            ItemSeparatorComponent={props => <Divider {...props} />}
            ListEmptyComponent={emptyList}
            nestedScrollEnabled={true}
            style={{ backgroundColor: '#fff', borderRadius: 15, marginTop: 10 }}
        />
    </View>;
};





const WorkItem = (props: { viewStyle?: ViewStyle } & Work) => {
    const nav = useNavigation();
    const colors = useTheme();
    return (
        <View
            style={[
                {
                    flexDirection: 'row',
                    //   backgroundColor: 'white',
                    //  margin: 10,
                    //    marginLeft: 20,
                    //  marginRight: 20,

                    // borderRadius: 10,
                    paddingTop: 5,
                    paddingBottom: 5,
                    paddingLeft: 16,
                },
                props.viewStyle,
            ]}
        >
            <TouchableOpacity
                onPress={() =>
                    Router.Open(nav, 'WorkApp', { screen: 'Detail', id: props.id })
                }
                style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
            >
                <View style={{ height: 25, justifyContent: 'center' }}>
                    <Text
                        style={{
                            fontWeight: FONT_WEIGHT.SEMIBOLD,
                            fontSize: FONT_SIZE.ListItem,
                            color: colors.primary,
                        }}
                    >
                        {props.name}
                    </Text>
                </View>
                {props.timeStart && <View style={{ height: 25, justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <B.ICon
                            style={{
                                marginRight: 10,
                                fontSize: FONTSIZE.SMALL,
                                fontWeight: '300',
                            }}
                            name="clockcircleo"
                        />
                        <Text
                            style={{
                                fontSize: FONTSIZE.SMALL,
                                fontWeight: '300',
                                color: colors.tertiary,
                            }}
                        >
                            {props.timeStart
                                ? props.timeStart.hour + ':' + props.timeStart.minute
                                : '--:--'}
                        </Text>
                    </View>
                </View>}
            </TouchableOpacity>
            {props.status != 'DONE' && (
                <TouchableOpacity
                    onPress={async () =>
                        props.status != 'DONE' &&
                        (await workRepository.update(
                            (w) => w.id == props.id,
                            (w) => (w.status = w.status == 'DOING' ? 'DONE' : 'DOING'),
                        ))
                    }
                    style={{
                        alignSelf: 'flex-start',
                        width: 50,
                        height: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <B.ICon
                        name={props.status == 'DOING' ? 'pause-circle' : 'play-circle'}
                        style={{
                            color:
                                props.status == 'DOING' ? colors.success : colors.secondary,
                            fontWeight: FONT_WEIGHT.THIN,
                            fontSize: 35,
                        }}
                    />
                </TouchableOpacity>
            )}
            {props.status == 'DONE' && (
                <View
                    style={{
                        alignSelf: 'flex-end',
                        width: 50,
                        height: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <B.ICon
                        style={{
                            color: props.status == 'DONE' ? colors.success : colors.secondary,
                            fontSize: 24,
                        }}
                        name={
                            props.status == 'DONE'
                                ? 'check-circle'
                                : 'radio-button-off-outline'
                        }
                        size={FONTSIZE.NORMAL}
                    />
                </View>
            )}
        </View>
    );
};