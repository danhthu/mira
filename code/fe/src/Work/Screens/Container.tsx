import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../../../theme';
import { Add } from './Add';
import { Assign } from './Assign';
import { Detail } from './Detail';
import { Home } from './Home';
import { Statistic } from './Statistic';

const Stack = createStackNavigator();

/**
 * Năm màn, không tầng drawer. Bản Batify đặt `HomeContainer` — một drawer khai
 * sáu mục mà ba trong số đó trỏ về cùng một màn — giữa navigator này và màn danh
 * sách; hệ quả là màn thống kê chỉ tới được qua hai chạm trong ngăn kéo.
 */
export const Container = ({ route }) => {
  const colors = useTheme();
  const initialRouteName =
    route.params && route.params.screen ? route.params.screen : 'Home';
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        cardStyle: { flex: 1, backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Add" component={Add} initialParams={route.params} />
      <Stack.Screen name="Detail" component={Detail} initialParams={route.params} />
      <Stack.Screen name="Assign" component={Assign} initialParams={route.params} />
      <Stack.Screen name="Statistic" component={Statistic} initialParams={route.params} />
    </Stack.Navigator>
  );
};
