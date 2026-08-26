import { B } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { HomeScreen as Home } from './HomeScreen';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { ICON_LIST } from '../../../libs/components/BIcon';
import { Background } from '../Components/Background';
import { useText } from '../Text';
import { Settings } from './Settings';
import { StatisticDetailScreen as Statistic } from './Statistic/StatisticDetail';


const Drawer = createDrawerNavigator();

export function HomeContainer({ route, navigation }) {
  console.log('Habit Home Container');
  const text = useText();
  const colors = useTheme();
  const initialRouteName =
    route.params && route.params.screen ? route.params.screen : 'HabitHome';
  console.log('HomeContainer', initialRouteName);
  const menu = [{
    name: 'HabitHome',
    title: text.mn_home || 'Tổng quan',
    icon: 'dashboard',
    component: Home
  },
  {
    name: 'ListWork',
    title: text.mn_listwork || 'Danh sách công việc',
    icon: 'linechart',
    component: Statistic
  },
  {
    name: 'Schedule',
    title: text.mn_schedule || 'Lịch làm việc',
    icon: 'calandar',
    component: Statistic
  },
  {
    name: 'Statistic',
    title: text.mn_statistic || 'Thống kê',
    icon: 'linechart',
    component: Statistic
  },
  {
    name: 'List',
    title: text.mn_listwork || 'Danh sách công việc',
    icon: 'linechart',
    component: Statistic
  },
  {
    name: 'Settings',
    title: text.mn_settings || 'Thiết lập', //thiết lập danh mục,...
    icon: 'setting',
    component: Settings
  },
  ];
  return (
    <Background >
      <Drawer.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false, lazy: false, drawerPosition: 'left' }}    >
        {[menu[0]].map((m, i) => <Drawer.Screen key={i}
          options={{
            drawerLabel: ({ focused }) => <B.Text style={{ marginLeft: -20, color: focused ? colors.primary : '#000' }}>{m.title}</B.Text>,
            drawerIcon: ({ focused, size }) => (
              <B.ICon
                name={m.icon as ICON_LIST}
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

