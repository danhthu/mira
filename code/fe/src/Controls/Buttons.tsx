import { useState } from 'react'
import {
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native'
import { BICon, ICON_LIST } from '../../libs/components/BIcon'
import { useTheme } from '../../theme'
import { FONTSIZE } from '../Common'

export const ButtonSwitcher = (props: {
  activeIndex?: number
  icons: Array<ICON_LIST>
  style?: StyleProp<ViewStyle>
  iconStyle?: StyleProp<TextStyle>
  onPress?: (index: number) => void
}) => {
  const [activeIndex, setActiveIndex] = useState(props.activeIndex)
  return (
    <TouchableOpacity
      style={[
        {
          justifyContent: 'center',
          alignItems: 'flex-end',
        },
        props.style,
      ]}
      onPress={() => {
        let index = activeIndex == 0 ? 1 : 0
        setActiveIndex(index)
        props.onPress && props.onPress(index)
      }}
    >
      <BICon
        name={!props.icons ? 'linechart' : props.icons[activeIndex]}
        style={[props.iconStyle]}
      />
    </TouchableOpacity>
  )
}

export const ButtonLink = (props: {
  style?: StyleProp<ViewStyle>
  onPress?: () => void
  children: string
  textStyle?: StyleProp<TextStyle>
}) => {
  const colors = useTheme()
  return (
    <TouchableOpacity onPress={props.onPress} style={[props.style]}>
      <Text
        style={[
          {
            textAlign: 'center',
            fontSize: FONTSIZE.NORMAL,
            color: colors.primary,
          },
          props.textStyle,
        ]}
      >
        {props.children}
      </Text>
    </TouchableOpacity>
  )
}
