import { useState } from "react";
import { View } from "react-native";
import { BText as Text } from "../../../../libs/components";
import { Header } from "../../Components/Header";
import { AddableHabits } from "./AddableHabits";
export const HomeDetailModal = ({ route, navigation }) => {

    return <View >
        <Header title={route.params?.cat.text} />
        <SubHeader text={route.params?.cat.text} desc={route.params?.cat.desc} />
        <ListHabits group={route.params?.cat} collection={route.params?.cat} />
    </View>;
};

const SubHeader = ({ text = '', desc = '' }: { text?: string, desc?: string }) => {
    return <View>
        <Text>{text}</Text>
        <Text>{desc}</Text>
    </View>;
};

const ListHabits = ({ collection = '', group = '' }: { collection: string, group: '' }) => {
    const [data, setData] = useState([]);
    return <AddableHabits habits={data} />;
};