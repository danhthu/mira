import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../../../theme';
import { Add } from './Add';
import { AddGroup } from './AddGroup';
import { Choose } from './Choose';
import { ChooseSelector } from './ChooseSelector';
import { Detail } from './Detail';
import { Edit } from './Edit';
import { HomeContainer } from './HomeContainer';
import { MandatorySelector } from './MandatorySelector';
import { Selection } from './Selection';
import { Statistic } from './Statistic';
import { TabCalendar } from './Tools/TabCalendar';
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

          // headerTitle : props=>null
        }}
      />
      <Stack.Screen
        name="AddGroup"
        component={AddGroup}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Home"
        component={HomeContainer}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Scheduler"
        component={TabCalendar}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Selection"
        component={Selection}
        options={{ headerShown: true }}
        initialParams={route.params}
      />
      <Stack.Screen
        name="MandatorySelector"
        component={MandatorySelector}
        options={{
          headerShown: true,
        }}
        initialParams={route.params}
      />
      <Stack.Screen
        name="ChooseSelector"
        component={ChooseSelector}
        options={{ headerShown: true }}
        initialParams={route.params}
      />
      <Stack.Screen
        name="Statistic"
        component={Statistic}
        options={{ headerShown: false }}
        initialParams={route.params}
      />
      <Stack.Screen
        name="Choose"
        component={Choose}
        options={{ headerShown: true }}
        initialParams={route.params}
      />
      <Stack.Screen
        name="Edit"
        component={Edit}
        initialParams={route.params}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Detail"
        component={Detail}
        initialParams={route.params}
        options={{
          headerShown: true,
        }}
      />
    </Stack.Navigator>

  );
};
