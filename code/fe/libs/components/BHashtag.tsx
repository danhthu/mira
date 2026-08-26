import {
  View,
  Text,
  ViewStyle,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextStyle,
} from 'react-native'
import { useEffect, useState } from 'react'
import { AppStyle, useTheme } from '../../theme'

export interface hashTagProp {
  data: Array<string>
  onSelected?: (item: string, index: number) => void
  style?: ViewStyle
  tagContainerStyle?: ViewStyle
  tagTextStyle?: TextStyle
  activeIndex?: number
}

export const BHashTag = (props: hashTagProp) => {
  const [activedIndex, setActivedIndex] = useState(0)
  const styles = tagStyles(useTheme())

  const tagOnPress = (tag, index) => () => {
    setActivedIndex(index)
    props.onSelected && props.onSelected(tag, index)
  }
  useEffect(()=>{setActivedIndex(props.activeIndex)

  },[props.activeIndex])
  if(props.data.length==0) return <View></View>
  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
    >
      <View style={[styles.group, props.style]}>
        {props.data.map((tag, index) => (
          <TouchableOpacity
            key={index}
            onPress={tagOnPress(tag, index)}
            style={[
              styles.container,
              index === activedIndex ? styles.container_actived : null,
              { marginLeft: index == 0 ? 0 : styles.container.marginLeft },
            ]}
          >
            <Text
              style={[
                {
                  ...styles.text,
                  ...(index === activedIndex ? styles.text_actived : null),
                },
              ]}
            >
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const tagStyles = (theme: typeof AppStyle) =>
  StyleSheet.create({
    group: {
      flexDirection: 'row',
      height: 30,
      justifyContent: 'center',
    },
    container: {
      marginLeft: theme.MARGIN.elements,
      borderRadius: theme.BORDER.normal,
      padding: theme.PADDING.small,
      borderWidth: 1,
      borderColor: theme.outlineVariant,
      backgroundColor: theme.secondary,
      minWidth: 50,
      paddingLeft: 15,
      paddingRight: 15,
    },
    text: {
      fontSize: theme.FONTSIZE.normal,
      color: theme.onSecondary,
      textAlign: 'center',
    },
    container_actived: {
      backgroundColor: theme.primary,
      borderColor: theme.outline,
    },
    text_actived: {
      color: theme.onPrimary,
    },
  })
