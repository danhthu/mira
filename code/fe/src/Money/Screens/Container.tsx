import { createStackNavigator } from '@react-navigation/stack';
import { MonthlyEntry } from './MonthlyEntry';
import { Overview } from './Overview';

const Stack = createStackNavigator();

/** Hai màn của trụ Tài chính: xem, và cập nhật năm ô mỗi tháng. */
export const Container = ({ route }: { readonly route: { readonly params?: { readonly screen?: string } } }) => {
  const initialRouteName = route.params && route.params.screen ? route.params.screen : 'Overview';

  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ cardStyle: { flex: 1 } }}>
      <Stack.Screen name="Overview" component={Overview} options={{ headerShown: false }} />
      <Stack.Screen
        name="MonthlyEntry"
        component={MonthlyEntry}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
