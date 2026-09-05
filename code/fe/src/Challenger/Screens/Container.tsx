import { createStackNavigator } from '@react-navigation/stack';
import { Add } from './Add';
import { Detail } from './Detail';
import { Edit } from './Edit';
import { HabitSelection } from './HabitSelection';
import { Home } from './Home';
import { Selection } from './Selection';
import { WorkSelection } from './WorkSelection';

const Stack = createStackNavigator();

export const Container = ({ route }) => {
  const initialRouteName =
    route.params && route.params.screen ? route.params.screen : 'Home';

  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
      <Stack.Screen name="Add" component={Add} options={{ headerShown: false }} />
      <Stack.Screen
        name="Edit"
        component={Edit}
        options={{ headerShown: false, presentation: 'modal' }}
        initialParams={route.params}
      />
      <Stack.Screen
        name="Detail"
        component={Detail}
        options={{ headerShown: false, presentation: 'modal' }}
        initialParams={route.params}
      />
      <Stack.Screen
        name="HabitSelection"
        component={HabitSelection}
        options={{ headerShown: false, presentation: 'modal' }}
        initialParams={route.params}
      />
      <Stack.Screen
        name="WorkSelection"
        component={WorkSelection}
        options={{ headerShown: false, presentation: 'modal' }}
        initialParams={route.params}
      />
      <Stack.Screen
        name="Selection"
        component={Selection}
        options={{ headerShown: true }}
        initialParams={route.params}
      />
    </Stack.Navigator>
  );
};
