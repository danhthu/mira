import { createStackNavigator } from '@react-navigation/stack';
import { Overview } from './Overview';

const Stack = createStackNavigator();

/** Một màn duy nhất ở V1; stack riêng để module cắm vào navigator gốc như các module khác. */
export const Container = ({
  route,
}: {
  readonly route: { readonly params?: { readonly screen?: string } };
}) => {
  const initialRouteName =
    route.params && route.params.screen ? route.params.screen : 'Overview';
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ cardStyle: { flex: 1 } }}
    >
      <Stack.Screen name="Overview" component={Overview} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};
