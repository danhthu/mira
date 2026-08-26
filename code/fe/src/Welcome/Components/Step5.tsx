import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useText } from '../../../lang';
import { useTheme } from '../../../theme';
import { FONTSIZE } from '../../Common';

import { useEffect } from 'react';
import { useSettings } from '../../Common/Hooks';


export const Step5 = () => {
  const text = useText();
  const style = useStyle();
  const [setting, setSetting] = useSettings();
  //const [setting,setSetting]= useState({dayOfWeek:[1,2,3,4,5]})
  const theme = useTheme();

  useEffect(() => {
    if (setting && !setting.dayOfWeek) {
      setSetting({ dayOfWeek: [1, 2, 3, 4, 5] });
    }
  }, [setting]);
  if (!setting) return <View></View>;

  return <View style={style.container}>
    <Text style={style.header}>{text.for('How many working days per week?')}</Text>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          alignSelf: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          height: 50,
        }}
      >
        {[...Array(7).keys()].map((val, index) => (
          <TouchableOpacity
            onPress={() => setSetting({ dayOfWeek: setting.dayOfWeek && setting.dayOfWeek.indexOf(val) > -1 ? [...setting.dayOfWeek.filter(d => d != val)] : [...setting.dayOfWeek, val] })}
            key={index}
            style={{
              height: 32,
              width: 32,
              margin: 5,
              borderRadius: 16,
              //opacity: 0.7,
              backgroundColor: setting.dayOfWeek && setting.dayOfWeek.indexOf(val) > -1 ? theme.primary : '#000',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: setting.dayOfWeek && setting.dayOfWeek.indexOf(val) > -1 ? theme.onPrimary : theme.onSecondary, textAlign: 'center' }}>
              {text.common.daysOfWeekShort[val]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

    </View>

  </View>;
};

const useStyle = () => {
  const colors = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      fontSize: FONTSIZE.BIG,
      //  fontWeight:'bold',
      color: colors.onBackground,
      textAlign: 'center',
    },

  });
};