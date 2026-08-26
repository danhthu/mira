import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import { Add } from './Add';
import { Edit } from './Edit';
import { Detail } from './Detail';
import { Selection } from './Selection';
import { Home } from './Home';
import { MilestoneScreen } from './Milestone';
const Stack = createStackNavigator();

export const Container = ({ route,navigation })=>{
  const initialRouteName = route.params&& route.params.screen? route.params.screen:'Home';

  return (
    <Stack.Navigator initialRouteName={initialRouteName}  >
      <Stack.Screen
        name="Add"
        component={Add}
        options={{ headerShown: false,  }}

      />
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false }}

      />
      <Stack.Screen
        name="Edit"
        component={Edit}
        options={{ headerShown: false }}
        initialParams={route.params}
      />
      <Stack.Screen
        name="Detail"
        component={Detail}
        options={{ headerShown: false }}
        initialParams={route.params}
      />
      <Stack.Screen
        name="Selection"
        component={Selection}
        options={{ headerShown: false }}
        initialParams={route.params}
      />
      <Stack.Screen
        name="Milestone"
        component={MilestoneScreen}
        options={{ headerShown: false ,
          //presentation:'modal',
          //   animationEnabled:true, animationTypeForReplace:'push',
          //  ...TransitionPresets.ModalSlideFromBottomIOS
        }}

        initialParams={route.params}

      />
    </Stack.Navigator>
  );
};