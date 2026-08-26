import { createStackNavigator } from '@react-navigation/stack'
import { DailyMovitationString } from './DailyMovitationString'
import { Detail } from './Detail'
import { Home } from './Home/Home'
const Stack = createStackNavigator()
//emotionApp
export const Container = ({ route, navigation }) => {
  const initialRouteName =
    route.params && route.params.screen ? route.params.screen : 'Home'

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ cardStyle: { flex: 1 } }}
    >
      <Stack.Screen
        name="Home"
        component={Home}
        initialParams={route.params}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Detail"
        component={Detail}
        initialParams={route.params}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DailyMovitationString"
        component={DailyMovitationString}
        initialParams={route.params}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )
}
