import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme';

export const HeaderBackground=({ children })=>{
  const colors = useTheme();
  return <LinearGradient colors={[colors.hexToRGB(colors.primaryColors[500], 0.5), colors.hexToRGB(colors.primaryColors[500], 0.3)]} style={{ flex: 1 }}>
    {children}
  </LinearGradient>;
};