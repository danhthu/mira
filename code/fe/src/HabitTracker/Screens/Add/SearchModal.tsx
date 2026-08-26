import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { BText as Text } from "../../../../libs/components";
import { useText } from "../../Text";
import { AddableHabits } from "./AddableHabits";
export const SearchModal = () => {
    const [search, setSearch] = useState('');
    const [data, setData] = useState([]);
    return <View>
        <Header text={search} onTextChanged={text => setSearch(text)} />
        {search.trim() == '' && <PopularSearch />}
        {search.trim() != '' && data.length == 0 && <EmptySearch />}
        {search.trim() != '' && data.length > 0 && <AddableHabits habits={data} />}
    </View>;
};

const Header = ({ text = '', onTextChanged = () => { } }: { text?: string, onTextChanged?: (text: string) => void }) => {
    return <View />;
};


const PopularSearch = () => {
    return <View />;
};

const EmptySearch = () => {
    const text = useText();
    return <View>
        <Text >{text.No_results || 'No results'}</Text>
        <Text>{text.click_create_to_add_a_custom_habit || 'Click "create" to add a custom habit'}</Text>
        <TouchableOpacity>
            <Text>{text.Add_my_own || 'Add my own'}</Text>
        </TouchableOpacity>
    </View>;
};
