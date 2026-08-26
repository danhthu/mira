import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import iconifyAssets from '../../../../assets/iconifyAssets';
import { BICon, BText as Text } from '../../../../libs/components';
import { Router } from '../../../../Router';
import { useTheme } from '../../../../theme';
import {
  BLACK_COLOR,
  FONTSIZE,
  ROUND_BIG,
  ROUND_NORMAL
} from '../../../../theme/Constraints';
import { AssetManagement } from '../../Assets/';
import { HabitTemplate } from '../../Entities';


export const AddableHabits = ({
  habits = [],
}: {
  habits: Array<HabitTemplate>
}) => {

  const [data, setData] = useState(habits || []);
  const nav = useNavigation();

  const habitItemStyles = StyleSheet.create({
    image_container: {
      width: 50,
      height: 50,
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: 25,
      height: 25,

    },
    title: {
      lineHeight: 50,
      height: 50,
      fontSize: FONTSIZE.NORMAL,
      color: '#000',
      flex: 1
    },
    container: {
      flexDirection: 'row'
      , marginBottom: ROUND_NORMAL
    },
  });
  useEffect(() => {
    setData(habits);
  }, [habits]);

  const colors = useTheme();
  return (
    <FlatList scrollEnabled={false} data={data}
      renderItem={({ item, index }) => {
        const h = item,
          i = index;
        return <View key={i} style={[habitItemStyles.container,]}>
          <View style={[{ flex: 1, flexDirection: 'row', borderRadius: ROUND_BIG }, { backgroundColor: h.color }]}>
            <View style={habitItemStyles.image_container}>
              <Image
                style={habitItemStyles.image}
                source={
                  !h.icon
                    ? AssetManagement.habit_default
                    : iconifyAssets[h.icon] || AssetManagement.habit_default
                }
              />
            </View>
            <Text style={[habitItemStyles.title,]}>
              {h.name || 'no name'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (!h.status) {
                Router.Open(nav, 'HabitAppModal', { screen: 'AddFromTemplate', data: h });
              }
            }}
            style={[
              {
                width: 50,
                height: 50,
                justifyContent: 'center',
                alignSelf: 'flex-end',
                alignItems: 'center',
              },
            ]}
          >
            {h.status && (
              <BICon
                name="checkcircle"
                style={{ alignSelf: 'center', color: colors.success, fontSize: 20 }}
              />
            )}
            {!h.status && (
              <BICon
                name="pluscircle"
                style={{ alignSelf: 'center', color: BLACK_COLOR, fontSize: 20 }}
              />
            )}
          </TouchableOpacity>
        </View>;
      }
      } />
  );
};
