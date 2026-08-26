import { createStackNavigator } from '@react-navigation/stack';
//import { AddScreen as Add } from "./AddScreen";

import { Home as AddHome, AddModal, HomeDetailModal, SearchModal } from './Add';
import { AddFromTemplate } from './Add/AddFromTemplate';
import { DetailScreen as Detail } from './DetailScreen';
import { EditScreen as Edit } from './EditScreen';
import { HomeContainer } from './HomeContainer';
import { Selection } from './Selection';
import { StatisticScreen } from './Statistic/';
import { TemplateScreen } from './TemplateScreen';
const Stack = createStackNavigator();

export const Container = ({ route, navigation }) => {
  const initialRouteName =
    route.params && route.params.screen ? route.params.screen : 'Home';

  return (

    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ cardStyle: { flex: 1 } }}
    >
      <Stack.Screen
        name="Add"
        component={AddHome}
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="AddDetail"
        initialParams={route.params}
        component={HomeDetailModal}
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="AddModal"
        initialParams={route.params}
        component={AddModal}
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="AddFromTemplate"
        initialParams={route.params}
        component={AddFromTemplate}
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="SearchModal"
        component={SearchModal}
        options={{ headerShown: false, presentation: 'modal' }}
      />

      <Stack.Screen
        name="Home"
        component={HomeContainer}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Selection"
        component={Selection}
        initialParams={route.params}
        options={{ headerShown: true, presentation: 'modal' }}
      />
      <Stack.Screen
        name="Statistic"
        component={StatisticScreen}
        initialParams={route.params}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Edit"
        component={Edit}
        initialParams={route.params}
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="Detail"
        component={Detail}
        initialParams={route.params}
        options={{
          headerShown: false,
          //animationEnabled:true,
          // presentation: 'modal'
        }}
      />

      <Stack.Screen
        name="Template"
        component={TemplateScreen}
        initialParams={route.params}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>

  );
};
