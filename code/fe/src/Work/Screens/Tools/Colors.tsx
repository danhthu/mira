import { useState } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { B } from "../../../../libs/components";
import { FONTSIZE } from "../../../Common";
import { Divider } from "../../../Common/Components/Divider";
import { Header } from "../../../Common/Components/Header";
import { color } from "../../../Common/Entities/color";
import { useAsyncAction, useDectectDataChanged } from "../../../Common/Hooks";
import { colorRespository } from "../../../Common/Repositories";
import { useCommonStyle } from "../../../Common/Styles";
import { useText } from "../../Text";
export const Colors = () => {
    const data = useAsyncAction(async () => {
        return (await colorRespository.list());
    }, [useDectectDataChanged(colorRespository)], []);
    const t = useText().translate;
    const styles = useCommonStyle();
    const RenderItem = ({ item = new color }) => {
        const [mode, setMode] = useState('view' as 'view' | 'edit');
        const [name, setName] = useState(item.name);
        return <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: item.code, width: 50, height: 40 }} />
            {mode == 'view' && <Text style={{ flex: 1, lineHeight: 40, height: 40 }}>{item.name}</Text>}
            {mode == 'edit' && <TextInput value={item.name}
                onChangeText={val => setName(val)} style={{ flex: 1, lineHeight: 40, height: 40, fontSize: FONTSIZE.NORMAL }} />
            }
            {mode == 'view' && <TouchableOpacity style={{ height: 40 }} onPress={() => setMode('edit')}><B.ICon name="edit" style={{ fontSize: FONTSIZE.NORMAL }} /></TouchableOpacity>}
            {mode == 'edit' && <TouchableOpacity style={{ height: 40 }} onPress={async () => {
                await colorRespository.update(item.id, e => {
                    e.name == name;
                });
            }}><B.ICon name="save" style={{ fontSize: FONTSIZE.NORMAL }} /></TouchableOpacity>}
        </View>;
    };

    return <View style={styles.modalPadding}>
        <Header title={t('Tags')} />
        <FlatList data={data}
            renderItem={({ item }) => <View style={{ paddingTop: 5, paddingBottom: 5 }}>
                <RenderItem item={item} />
            </View>}
            ItemSeparatorComponent={props => <Divider {...props} />}
        />
    </View>;
};


