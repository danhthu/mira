import { Picker } from '@react-native-picker/picker';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useText } from '../../../lang';
import { useTheme } from '../../../theme';
import { FONTSIZE } from '../../Common';
import { useSettings } from '../../Common/Hooks';

export const Step4 = () => {
  const text = useText();
  const style = useStyle();
  const [setting, setSetting] = useSettings();
  useEffect(() => {
    if (setting && !setting.sleep) {
      setSetting({ sleep: { hour: 22, minut: 0 } });
    }
  }, [setting]);
  if (!setting || !setting.sleep) return <View></View>;

  return <View style={style.container}>
    <Text style={style.header}>{text.for('What time do you sleep')}</Text>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ flexDirection: 'row' }}>
        <Picker
          selectedValue={setting.sleep.hour}
          onValueChange={(value) => setSetting({ sleep: { hour: value, minut: setting.sleep.minut } })}
          style={{ padding: 0, width: 100, fontSize: FONTSIZE.LARGE, textAlign: 'center' }}
        >
          {[...Array(24).keys()].map((val, index) => (
            <Picker.Item
              key={index}
              label={val < 10 ? '0' + val : '' + val}
              value={val}
            />
          ))}
        </Picker>
        <Picker
          selectedValue={setting.sleep.minut}
          onValueChange={(value) => setSetting({ sleep: { hour: setting.sleep.hour, minut: value } })}
          style={{ width: 100, marginLeft: 10, fontSize: FONTSIZE.LARGE, textAlign: 'center' }}
        >
          {[...Array(60).keys()].map((val, index) => (
            <Picker.Item
              key={index}
              label={val < 10 ? '0' + val : '' + val}
              value={val}
            />
          ))}
        </Picker>
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