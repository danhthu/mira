import { Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native'
import { useTheme } from '../../theme'
import { FONTSIZE } from '../../theme/Constraints'

export const Link = (props: {
  href?: string
  children: string | JSX.Element
  viewStyle?: ViewStyle | Array<ViewStyle>
  style?: TextStyle | TextStyle[]
  onPress?: () => void
}) => {
  const colors = useTheme()
  return (
    <TouchableOpacity onPress={props.onPress} style={props.viewStyle}>
      <Text
        style={[
          { color: colors.primary, fontSize: FONTSIZE.NORMAL },
          props.style,
        ]}
      >
        {props.children}
      </Text>
    </TouchableOpacity>
  )
}
