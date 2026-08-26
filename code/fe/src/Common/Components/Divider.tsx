import { View } from 'react-native';
import { useTheme } from '../../../theme';

export const Divider = ()=>{
  const colors = useTheme();
  return <View style={{ height:1, backgroundColor:'#ddd' }}></View>;
};