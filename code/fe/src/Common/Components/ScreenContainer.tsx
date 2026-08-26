import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme';
import { ViewStyle } from 'react-native';
import { useCommonStyle } from '../Styles';

export const ScreenContainer=({ children=null })=>{
  const colors = useTheme();
  const style = useCommonStyle().screen;
  return <LinearGradient  colors={[colors.hexToRGB(colors.primaryColors[500], 0.3), colors.hexToRGB(colors.primaryColors[500], 0.01)]} style={[{ flex: 1 },style]}>
    {children?children:null}
  </LinearGradient>;
};