import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme';
import { ViewStyle } from 'react-native';
import { useCommonStyle } from '../Styles';

export const ModalScreenContainer=({ children=null })=>{
  const colors = useTheme();
  const style = useCommonStyle().modalScreen;
  return <LinearGradient colors={[colors.hexToRGB(colors.primaryColors[500], 0.5), colors.hexToRGB(colors.primaryColors[500], 0.01)]} style={[{ flex: 1 },style]}>
    {children?children:null}
  </LinearGradient>;
};