import { Image, StyleProp, View, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme';
import Assets from '../Assets';

export const ChallengeAwatar = (props: {
  src?: string
  style?: StyleProp<ViewStyle>
  size?: number
}) => {
  const colors = useTheme();
  const size = props.size || 80;
  const src = props.src;
  const source = !src
    ? Assets['item-icon-default'].uri
    : src.startsWith('assets')
      ? Assets[src.replace('assets/', '')]?.uri ||
        Assets['item-icon-default'].uri
      : { uri: src };

  return (
    <View
      style={[
        { backgroundColor: colors.token.surfaceMuted, overflow: 'hidden' },
        props.style,
      ]}
    >
      <Image source={source} style={{ width: size, height: size }} />
    </View>
  );
};
