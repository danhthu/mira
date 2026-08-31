import { createStackNavigator } from '@react-navigation/stack';
import { B } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { Add } from './Add';
import { Home } from './Home';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { Background } from '../Components/Background';
import { useText } from '../Text';
import { Settings } from './Settings';
import { StaticList } from './StaticList';
import { Statistic } from './Statistic';



const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

export function HomeContainer({ route, navigation }) {
  const text = useText();
  const colors = useTheme();
  const initialRouteName =
    route.params && route.params.screen ? route.params.screen : 'mHome';
  const menu = [{
    name: 'mHome',
    title: text.mn_home || 'Tổng quan',
    icon: 'dashboard',
    component: Home
  },
  {
    name: 'Add',
    title: text.mn_add || 'Thêm',
    icon: 'pluscircleo',
    component: Add
  },
  {
    name: 'StaticList',
    title: text.mn_staticlist || 'Danh sách cố định',
    icon: 'menu',
    component: StaticList
  },
  {
    name: 'Statistic',
    title: text.mn_statistic || 'Thống kê',
    icon: 'linechart',
    component: Statistic
  },
  {
    name: 'Settings',
    title: text.mn_settings || 'Thiết lập',
    icon: 'setting',
    component: Settings
  },
  ] as const; // giữ literal type cho `icon` để khớp ICON_LIST thay vì bị widen thành string
  return (
    <Background >
      <Drawer.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
        {menu.map((m, i) => <Drawer.Screen key={i}
          options={{
            drawerLabel: ({ focused }) => <B.Text style={{ marginLeft: -20, color: focused ? colors.primary : '#000' }}>{m.title}</B.Text>,
            drawerIcon: ({ focused, size }) => (
              <B.ICon
                name={m.icon}
                size={size}
                color={focused ? colors.primary : '#000'}
              />
            ),
          }}
          name={m.name} component={m.component} initialParams={route.params} />)}
      </Drawer.Navigator>
    </Background>
  );
}
