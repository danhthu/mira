import { useNavigation } from '@react-navigation/native';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { FONT_SIZE } from '../../../theme/Constraints';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import { useCommonStyle } from '../../Common/Styles';
import { Work, workRepository } from '../../Work/Entities';
import { Background } from '../Components/Background';
import { useText } from '../Text';
import { SelectionHeader } from './HabitSelection';

export const WorkSelection = ({ route }) => {
  const style = useCommonStyle();
  const text = useText();
  return (
    <Background style={style.modalScreen}>
      <SelectionHeader title={text.screen_work_selection} />
      <Body route={route} />
    </Background>
  );
};

const Body = ({ route }) => {
  const colors = useTheme();
  const text = useText();
  const nav = useNavigation();
  const onItemPress: (item: Work) => void = route.params.onGoback;
  const data = useAsyncAction<Work[]>(
    async () => {
      const chosen = (route.params.data || []) as string[];
      return workRepository.filter((w) => chosen.indexOf(w.id) === -1);
    },
    [route, useDectectDataChanged(workRepository)],
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
