import { useNavigation } from '@react-navigation/native';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { B, BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { FONT_SIZE } from '../../../theme/Constraints';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import { useCommonStyle } from '../../Common/Styles';
import { Habit, habitRepository } from '../../HabitTracker/Entities';
import { Background } from '../Components/Background';
import { useText } from '../Text';

export const HabitSelection = ({ route }) => {
  const style = useCommonStyle();
  const text = useText();
  return (
    <Background style={style.modalScreen}>
      <SelectionHeader title={text.screen_habit_selection} />
      <Body route={route} />
    </Background>
  );
};

export const SelectionHeader = (props: { title: string }) => {
  const navigation = useNavigation();
  const style = useCommonStyle();
  return (
    <View>
      <Text style={style.header.title}>{props.title}</Text>
      <TouchableOpacity
        style={style.header.leftButton}
        onPress={navigation.goBack}
      >
        <B.ICon name="return-up-back" style={{ fontSize: FONT_SIZE.PageTitle }} />
      </TouchableOpacity>
    </View>
  );
};

const Body = ({ route }) => {
  const colors = useTheme();
  const text = useText();
  const nav = useNavigation();
  const onItemPress: (item: Habit) => void = route.params.onGoback;
  const data = useAsyncAction<Habit[]>(
    async () => {
      const chosen = (route.params.data || []) as string[];
      return habitRepository.filter((h) => chosen.indexOf(h.id) === -1);
    },
    [route, useDectectDataChanged(habitRepository)],
    [],
  );

  if (data.length === 0)
    return (
      <Text style={{ color: colors.token.textMuted, paddingTop: 20 }}>
        {text.empty_selection}
      </Text>
    );
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={{ paddingTop: 12, paddingBottom: 12 }}
          onPress={() => {
            onItemPress(item);
            nav.goBack();
          }}
        >
          <Text
            style={{
              fontSize: FONT_SIZE.ListItem,
              color: colors.token.textPrimary,
            }}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => (
        <View
          style={{ borderBottomWidth: 1, borderBottomColor: colors.token.border }}
        />
      )}
    />
  );
};
