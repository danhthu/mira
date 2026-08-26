import { Image, StyleSheet, Text, View } from 'react-native';
import { useText } from '../../../lang';
import { useTheme } from '../../../theme';
import { FONTSIZE } from '../../Common';

import { TextBold } from '../../../libs/components';
import { useSettings } from '../../Common/Hooks';
const B = (props) => <Text style={{ fontWeight: 'bold' }}>{props.children}</Text>;
export const Step1 = () => {
  const text = useText();
  const style = useStyle();
  const [settings] = useSettings();
  const app_name = settings.app_name;
  return <View style={style.container}>
    <Text style={style.header}>{text.for('Welcome to')}</Text>
    <Text style={style.app_name}>{app_name}</Text>
    <Image style={style.image_bg} source={require('../../../assets/welcome/first.png')} />
    <View>
      <TextBold style={style.description}>{text.for('You\'re about to take the first step in **make your life happier!** Let us guide you through it.')}</TextBold>
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
      fontSize: FONTSIZE.LARGE,
      fontWeight: 'bold',
      color: colors.onBackground,
      textAlign: 'center',
    },
    app_name: {
      fontSize: FONTSIZE.LARGE,
      fontWeight: 'bold',
      textAlign: 'center',
      color: colors.primary
    },
    image_bg: {
      width: 374,
      height: 377,
      flex: 1,
      alignSelf: 'center',

      marginTop: 20,
      marginBottom: 20,
    },
    description: {
      fontSize: FONTSIZE.BIG,
      textAlign: 'center'
    },
  });
};