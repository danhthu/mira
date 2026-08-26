import { LinearGradient } from 'expo-linear-gradient';
import { ViewStyle } from 'react-native';
import { useTheme } from '../../../theme';

export const Background = ({ children = null, style = null as ViewStyle | ViewStyle[] }) => {
  const colors = useTheme();
  return <LinearGradient colors={[colors.hexToRGB(colors.primaryColors[500], 0.5), colors.hexToRGB(colors.primaryColors[500], 0.01)]} style={[{ flex: 1 }, style]}>
    {children ? children : null}
  </LinearGradient>;
};