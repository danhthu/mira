import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Divider } from 'react-native-paper';
import usePerformance from '../../../hook/useScreenLoadTime';
import { FontICon } from '../../../libs/components/Icon';
import { AppStyle, useTheme } from '../../../theme';
import { FONTSIZE } from '../../Common';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import { habitTemplateRepository } from '../Entities';

export const TemplateScreen = ({ route, navigation }) => {
  usePerformance('HabitTracker\TemplateScreen');
  const deps = [useDectectDataChanged(habitTemplateRepository)];
  const data = useAsyncAction(async () => {
    return habitTemplateRepository.list();
  }, deps, [], 'HabitTracker\TemplateScreen');
  const style = styles(useTheme());
  return (
    <View style={style.screen}>
      <FlatList
        style={style.list}
        data={data}
        keyExtractor={(h) => h.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={style.container}
            onPress={() => {
              navigation.pop();
              route.params.onGoBack && route.params.onGoBack(item);
            }}
          >
            <View style={style.iconContainer}>
              <FontICon style={style.icon} name={item.icon} />
            </View>
            <View style={style.textContainer}>
              <Text style={style.textTitle}>{item.name}</Text>
              <Text style={style.textDescription}>{item.description}</Text>
            </View>
            <View style={style.iconRightContainer}>
              <FontICon style={[style.iconRight]} name="arrow-right" />
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <Divider />}
      />
    </View>
  );
};

const styles = (color: typeof AppStyle) =>
  StyleSheet.create({
    screen: {
      backgroundColor: '#fff',
      paddingLeft: 20,
      paddingRight: 20,
      flex: 1,
    },
    list: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    container: {
      flexDirection: 'row',
      flex: 1,
      marginBottom: 5,
      marginTop: 5,
    },
    textContainer: {
      alignSelf: 'stretch',
      height: 50,
      flex: 1,
    },
    text: {
      fontSize: FONTSIZE.NORMAL,
      height: 50,
      lineHeight: 50,
      textAlign: 'left',
    },
    textTitle: {
      fontSize: FONTSIZE.NORMAL,

      textAlign: 'left',
    },
    textDescription: {
      fontSize: FONTSIZE.NORMAL,

      textAlign: 'left',
    },
    iconContainer: {
      width: 40,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'flex-start',
    },
    icon: {
      fontSize: 18,
      marginLeft: 3,
    },
    iconRightContainer: {
      width: 40,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'flex-end',
    },
    iconRight: {
      fontSize: 18,
      marginRight: 3,
    },
  });
