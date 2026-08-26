import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme';

export const Background = ({ children, style = null }) => {
  const colors = useTheme();
  return <LinearGradient colors={[colors.hexToRGB(colors.primaryColors[500], 0.1), colors.hexToRGB(colors.primaryColors[500], 0.03)]} style={[{ flex: 1 }, style]}>
    {children}
  </LinearGradient>;
};


export const SectionDone = ({ children }) => {
  const colors = useTheme();
  return <LinearGradient colors={[colors.success, '#eeeeee', '#ffffff']} style={{
    flex: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginTop: 16,
    padding: 5,

  }}>
    {children}
  </LinearGradient>;
};