import { useState } from 'react'
import {
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import { useTheme } from '../../theme'
import { FONTSIZE } from '../Common'

export const TabLink = (
  props: {
    style?: StyleProp<ViewStyle>
    textStyle?: StyleProp<TextStyle>
    texts: Array<string>
    onPress?: (index: number) => void
  } = { texts: [] },
) => {
  const [activeIndex, setActivedIndex] = useState(0)
  const colors = useTheme()
  return (
    <View style={[{ flexDirection: 'row' }, props.style]}>
      {props.texts.map((text, i) => (
        <TouchableOpacity
          onPress={() => {
            setActivedIndex(i)
            props.onPress && props.onPress(i)
          }}
          style={{ flex: 1, alignItems: 'center' }}
        >
          <View
            style={[
              { borderBottomWidth: 2, borderBottomColor: null },
              activeIndex == i && {
                borderBottomWidth: 2,
                borderBottomColor: colors.primary,
              },
            ]}
          >
            <Text
              style={[
                {
                  fontSize: FONTSIZE.NORMAL,
                  color: colors.primary,
                  lineHeight: 30,
                  height: 30,
                },
                props.textStyle,
              ]}
            >
              {text}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}
