import { B, BICon } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { Home } from './Home';

import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ICON_LIST } from '../../../libs/components/BIcon';
import { Background } from '../Components/Background';
import { useText } from '../Text';
import { Statistic } from './Statistic';
import { Dashboard } from './Tools/Dashboard';
import { Plan } from './Tools/Plan';
import { TabSettings as Settings } from './Tools/TabSettings';

const Drawer = createDrawerNavigator();

export function HomeContainer({ route }) {
  const t = useText().translate;
  const text = useText();
  const colors = useTheme();
  const initialRouteName =
    route.params && route.params.screen ? route.params.screen : 'wHome';
  const menu = [
    {
      name: 'wHome',
      title: text.mn_home || 'Tổng quan',
      icon: 'dashboard',
      component: Home,
    },
    {
      name: 'ListWork',
      title: text.mn_listwork || 'Danh sách công việc',
      icon: 'linechart',
      component: Statistic,
    },
    {
      name: 'Schedule',
      title: text.mn_schedule || 'Lịch làm việc',
      icon: 'calendar-blank',
      component: Statistic,
    },
    {
      name: 'Dashboard',
      title: t('mn_statistic', 'Thống kê'),
      icon: 'linechart',
      component: Dashboard,
    },
    {
      name: 'Plan',
      title: t('mn_plan', 'Lập kế hoạch'),
      icon: 'linechart',
      component: Plan,
    },
    {
      name: 'Settings',
      title: text.mn_settings || 'Thiết lập', //thiết lập danh mục,...
      icon: 'setting',
      component: Settings,
    },
  ];
  return (
    <Background>
      <Drawer.Navigator
        // drawerContent={(props) => <CustomDrawerContent {...props} />}
        initialRouteName={initialRouteName}
        screenOptions={{ headerShown: false }}
      >
        {menu.map((m, i) => (
          <Drawer.Screen
            key={i}
            options={{
              drawerLabel: ({ focused }) => (
                <B.Text
                  style={{
                    marginLeft: -20,
                    color: focused ? colors.primary : '#000',
                  }}
                >
                  {m.title}
                </B.Text>
              ),
              drawerIcon: ({ focused, size }) => (
                <BICon
                  name={m.icon as ICON_LIST}
                  size={size}
                  color={focused ? colors.primary : '#000'}
                />
              ),
            }}
            name={m.name}
            component={m.component}
            initialParams={route.params}
          />
        ))}
      </Drawer.Navigator>
    </Background>
  );
}

const CustomDrawerContent = (props) => {
  const { navigation } = props;

  return (
    <DrawerContentScrollView {...props}>
      {/* Group 1 */}
      <View style={styles.group}>
        <Text style={styles.groupTitle}>Group 1</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ScreenA')}>
          <Text style={styles.item}>Screen A</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ScreenB')}>
          <Text style={styles.item}>Screen B</Text>
        </TouchableOpacity>
      </View>

      {/* Group 2 */}
      <View style={styles.group}>
        <Text style={styles.groupTitle}>Group 2</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ScreenC')}>
          <Text style={styles.item}>Screen C</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ScreenD')}>
          <Text style={styles.item}>Screen D</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  group: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  item: {
    fontSize: 14,
    paddingVertical: 5,
    paddingLeft: 10,
    color: 'blue',
  },
});
