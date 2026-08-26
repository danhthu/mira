import { useActionSheet } from "@expo/react-native-action-sheet";
import { useNavigation } from "@react-navigation/native";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { AddButtonBottom } from "../../../../libs/components/AddButtonBottom";
import { ButtonV2 } from "../../../../libs/components/Buttons";
import { Router } from "../../../../Router";
import { useTheme } from "../../../../theme";
import { SECOND_BLACK_COLOR } from "../../../../theme/Constraints";
import { FONTSIZE } from "../../../Common";
import { Divider } from "../../../Common/Components/Divider";
import { Header } from "../../../Common/Components/Header";
import { useAsyncAction, useDectectDataChanged } from "../../../Common/Hooks";
import { useCommonStyle } from "../../../Common/Styles";
import { workRepository } from "../../Entities";
import { useText } from "../../Text";
// show total
// mode calendar, list.
export const TabList = () => {
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

    const renderItem = ({ item }) => <View>
        <Text style={{ fontSize: FONTSIZE.NORMAL, fontWeight: '400' }}>{item.name}</Text>
        <Text style={{ color: SECOND_BLACK_COLOR, fontSize: FONTSIZE.NORMAL }}>{item.description}</Text>
    </View>;

    return <View style={styles.modalPadding}>
        <Header title={t('Tags')} />
        <View>
            <ButtonV2 onPress={() => { }} text="plan" />
        </View>
        <FlatList data={data}
            renderItem={renderItem}
            ItemSeparatorComponent={props => <Divider {...props} />}
            ListEmptyComponent={emptyList}
        />
        <AddButtonBottom onPlusClick={onPlusClick} />
    </View>;
};


