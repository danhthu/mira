import { createStackNavigator } from '@react-navigation/stack';

import { Home as AddHome, AddModal } from './Add';
import { DetailScreen as Detail } from './DetailScreen';
import { EditScreen as Edit } from './EditScreen';
import { HomeScreen } from './HomeScreen';
import { Selection } from './Selection';
import { StatisticScreen } from './Statistic';

const Stack = createStackNavigator();

/**
 * Bản trước đặt `HomeContainer` (một drawer navigator) giữa stack này và
 * `HomeScreen`. Drawer đó khai sáu mục menu nhưng chỉ render `[menu[0]]`, nên nút
 * hamburger mở ra một ngăn kéo có đúng một dòng, và màn Thống kê — tuy đã đăng ký
 * ở stack — không có đường nào bấm tới. Bỏ hẳn tầng drawer: `HomeScreen` là màn
 * gốc, và nút trái trên header dẫn thẳng sang Thống kê.
 *
 * Ba màn `SearchModal`, `HomeDetailModal`, `Template` cũng đã gỡ khỏi đây: cả ba
 * trả về khung rỗng hoặc không có đường điều hướng nào trỏ tới.
 */
export const Container = ({ route }) => {
  const initialRouteName =
    route.params && route.params.screen ? route.params.screen : 'Home';

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ cardStyle: { flex: 1 } }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Add"
        component={AddHome}
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="AddModal"
        initialParams={route.params}
        component={AddModal}
        options={{ headerShown: false, presentation: 'modal' }}
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
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
