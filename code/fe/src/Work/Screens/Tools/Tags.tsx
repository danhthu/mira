import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import Modal from 'react-native-modal';
import { B } from "../../../../libs/components";
import { AddButtonBottom } from "../../../../libs/components/AddButtonBottom";
import { ButtonV2 } from "../../../../libs/components/Buttons";
import { useTheme } from "../../../../theme";
import { SECOND_BLACK_COLOR } from "../../../../theme/Constraints";
import { FONTSIZE } from "../../../Common";
import { Divider } from "../../../Common/Components/Divider";
import { Header, ModalHeader } from "../../../Common/Components/Header";
import { tag } from "../../../Common/Entities/tag";
import { DescriptionCtrl } from "../../../Common/FormControls/DescriptionCtrl";
import { useAsyncAction, useDectectDataChanged } from "../../../Common/Hooks";
import { tagRespository } from "../../../Common/Repositories";
import { useCommonStyle } from "../../../Common/Styles";
import { useText } from "../../Text";
export const Tags = () => {
    const data = useAsyncAction(async () => {
        return (await tagRespository.filter(t => t.app == 'WORK'));
    }, [useDectectDataChanged(tagRespository)], []);
    const t = useText().translate;
    const styles = useCommonStyle();
    const colors = useTheme();
    const [formData, setFormData] = useState({ ...new tag, app: 'WORK' });
    const [isVisible, setIsVisible] = useState(false); //show modal add
    const renderItem = ({ item }) => {
        return <View>
            <Text style={{ fontSize: FONTSIZE.NORMAL, fontWeight: '400' }}>{item.name}</Text>
            <Text style={{ color: SECOND_BLACK_COLOR, fontSize: FONTSIZE.NORMAL }}>{item.description}</Text>
        </View>;
    };
    const emptyList = () => {
        return <View style={{ alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setIsVisible(true)}><Text>{t('Thêm tags để phân loại nhiệm vụ, nhấn ')}<Text style={{ color: colors.colorLink }}>{t('+')}</Text><Text>{t(' để thêm.')}</Text></Text>
            </TouchableOpacity>
        </View>;
    };
    return <View style={styles.modalPadding}>
        <Header title={t('Tags')} />
        <FlatList data={data}
            renderItem={renderItem}
            ItemSeparatorComponent={props => <Divider {...props} />}
            ListEmptyComponent={emptyList}
        />
        <AddButtonBottom onPlusClick={() => setIsVisible(true)} />
        <Modal isVisible={isVisible}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            onModalHide={() => setIsVisible(false)}
            onBackdropPress={() => setIsVisible(false)}
            style={styles.bottomModal.style}>
            <ModalHeader title={t('Add tag')}
                left={<ButtonV2 type="link" text={t('Hủy')} onPress={() => setIsVisible(false)} />}
                right={<ButtonV2 type="link" text={t('Xong')} onPress={() => { setIsVisible(false); tagRespository.add(formData); }} />}
            />
            <View>
                <View style={styles.form.container}>
                    <B.TextBox label={t('name')} value={formData.name} onChanged={val => setFormData({ ...formData, name: val })} />
                </View>
                <View style={styles.form.container}>
                    <DescriptionCtrl
                        value={formData.description}
                        onChanged={(val) => setFormData({ ...formData, description: val })}
                    />
                </View>
            </View>
        </Modal>
    </View>;
};


