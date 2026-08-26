import { createStackNavigator } from '@react-navigation/stack';
import { Add } from './Add';

import { useTheme } from '../../../theme';

import { TouchableOpacity } from 'react-native';
import { B } from '../../../libs/components';
import { FONT_SIZE } from '../../../theme/Constraints';

import { HomeContainer } from './HomeContainer';
import { TimeUsedDetail } from './TimeUsedDetail';

const Stack = createStackNavigator();

export const Container = ({ route, navigation }) => {
  const initialRouteName =
    route.params && route.params.screen ? route.params.screen : 'Home';
  const colors = useTheme();
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        cardStyle: { flex: 1, backgroundColor: colors.background, borderWidth: 0 }, headerStyle: {
          backgroundColor: colors.background,
          elevation: 0, //convers android
          shadowColor: 'transparent', // this covers iOS

        }
      }

      }

    >
      <Stack.Screen
        name="Add"
        component={Add}
        options={{
          headerShown: false,
          title: 'Tạo mới kế hoạch',
          headerStyle: { backgroundColor: colors.hexToRGB(colors.primary, 0.08) },
          headerLeft: props => <TouchableOpacity style={{ marginLeft: 16 }} onPress={() => navigation.goBack()}><B.ICon name='return-up-back' style={{ fontSize: FONT_SIZE.PageTitle }} /></TouchableOpacity>,
          // headerTitle : props=>null
        }}
      />
      <Stack.Screen
        name="Home"
        component={HomeContainer}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TimeUsedDetail"
        component={TimeUsedDetail}
        options={{ headerShown: false, presentation: 'modal' }}
        initialParams={route.params}
      />



    </Stack.Navigator>

  );
};
