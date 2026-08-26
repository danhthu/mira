import { View, Text, StyleSheet, Image } from 'react-native';
import { FONTSIZE } from '../../Common';
import { useTheme } from '../../../theme';
import { useText } from '../../../lang';

import { Picker } from '@react-native-picker/picker';

import { useSettings } from '../../Common/Hooks';
import { useEffect } from 'react';
import { debugStyle } from '../../../libs/components/debugStyle';
export const Step3 = () => {
  const text = useText();
  const style = useStyle();
  const [setting, setSetting] = useSettings();
  useEffect(() => {
    if(setting&&!setting.wakeup){
      setSetting({ wakeup: { hour: 8, minut: 0 } });
    }
  }, [setting]);
  if (!setting) return <View></View>;

  return <View style={style.container}>
    <Text style={style.header}>{text.for('What time do you usually wake up')}</Text>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[{ flexDirection: 'row' }]}>
        <Picker
          selectedValue={setting.wakeup?.hour || 8}
          onValueChange={(value) => setSetting({ wakeup: { hour: value, minut: parseInt( setting.wakeup?.minut || 0) } })}
          style={{ width:100, fontSize: FONTSIZE.LARGE, textAlign: 'center' }}
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
          selectedValue={setting.wakeup?.minut || 0}
          onValueChange={(value) => setSetting({ wakeup: { hour:parseInt( setting.wakeup?.hour) || 8, minut: value } })}
          style={[{ width:100, marginLeft:10, fontSize: FONTSIZE.LARGE, textAlign: 'center' }]}
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