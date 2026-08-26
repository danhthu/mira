import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme';
import { StyleProp, ViewStyle } from 'react-native';
import { debugStyle } from '../../../libs/components/debugStyle';

export const Background=({ children=null,style=null as StyleProp<ViewStyle> })=>{
  const colors = useTheme();
  return <LinearGradient colors={[colors.hexToRGB(colors.primaryColors[500], 0.1), colors.hexToRGB(colors.primaryColors[500], 0.01)]} style={[{ flex: 1 },style]}>
    {children}
  </LinearGradient>;
};