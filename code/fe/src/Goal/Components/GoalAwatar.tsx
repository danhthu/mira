import { View, ViewStyle, Image, StyleProp } from 'react-native';
import Assets from '../Assets';

export const GoalAwatar = (props: {
  src: string
  style?: StyleProp<ViewStyle>
  size?
}) => {
  const size = props.size || 80;
  return (
    <View style={[{ shadowColor: '#fff' }, props.style]}>
      {!props.src && (
        <Image
          source={Assets['item-icon-default'].uri}
          style={{ width: size, height: size, alignSelf: 'center' }}
        />
      )}
      {props.src && props.src.startsWith('assets') && (
        <Image
          source={
            Assets[props.src.replace('assets/', '')]?.uri ||
            Assets['item-icon-default'].uri
          }
          style={{ width: size, height: size, alignSelf: 'center' }}
        />
      )}
      {props.src && !props.src.startsWith('assets') && (
        <Image
          source={{ uri: props.src }}
          style={{ width: size, height: size, alignSelf: 'center' }}
        />
      )}
    </View>
  );
};
