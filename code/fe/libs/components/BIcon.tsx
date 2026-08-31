import {
  AntDesign,
  Entypo,
  FontAwesome5,
  Fontisto,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons'
import * as FileSystem from 'expo-file-system'
import { default as React, useEffect, useState } from 'react'
import { StyleProp, TextStyle, View, ViewStyle } from 'react-native'
import { SvgUri } from 'react-native-svg'
import { useTheme } from '../../theme'

const cacheDir = `${FileSystem.cacheDirectory}icons`

const fetchAndCacheIcon = async (iconName) => {
  const filePath = `${cacheDir}/${iconName}.svg`

  // Check if icon already exists in cache
  const fileInfo = await FileSystem.getInfoAsync(filePath)
  if (fileInfo.exists) {
    return filePath
  }

  // Create cache directory if it doesn't exist
  await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true })

  // Fetch icon from Iconify API
  const iconUrl = `https://api.iconify.design/${iconName}.svg`
  const response = await fetch(iconUrl)
  const iconSvg = await response.text()

  // Save the icon SVG data to the file system
  await FileSystem.writeAsStringAsync(filePath, iconSvg)

  return filePath
}

const CachedIcon = ({ icon, style = null, size = 32 }) => {
  const [iconPath, setIconPath] = useState(null)

  useEffect(() => {
    const loadIcon = async () => {
      const path = await fetchAndCacheIcon(icon)
      setIconPath(path)
    }

    loadIcon()
  }, [icon])

  // Render the icon from local file system if available
  if (iconPath) {
    return <SvgUri uri={iconPath} width={size} height={size} style={style} />
  }
  return null
  // Optionally render a placeholder or the original Iconify component while loading
  // return <Icon icon={icon} size={size} style={style} />;
}
declare type fontisto_icon = 'checkbox-passive' | 'checkbox-active'
declare type iconify_icon =
  | 'tdesign:task'
  | 'ic:baseline-group-work'
  | 'tdesign:smile'
// Bước 1: Khai báo kiểu FontAwesomeNames
declare type FontAwesomeNames =
  | 'search'
  | 'tasks'
  | 'play-circle'
  | 'pause-circle'
  | 'bell-o'
  | 'repeat'
  | 'check-circle'
  | 'leaf'
  | 'trash'
  | 'music'
  | 'person'
  | 'business-time'
  | 'list-alt'

// Khai báo kiểu MaterialIconNames
declare type MaterialIconNames =
  | 'self-improvement'
  | 'business-center'
  | 'alternate-email'
  | 'event-repeat'
  | 'timeline'
  | 'priority-high'
  | 'work'
  | 'work-outline'

// Khai báo kiểu MaterialCommunityIcons
declare type MaterialCommunityIconNames =
  | 'menu'
  | 'gift'
  | 'timetable'
  | 'calendar-clock-outline'
  | 'format-quote-open'
  | 'format-quote-close'
  | 'clock-start'
  | 'clock-end'
  | 'calendar-start'
  | 'calendar-end'
  | 'stairs-up'
  | 'target'
  | 'calendar-blank'
  | 'calendar'
  | 'calendar-today'
  | 'calendar-arrow-right'
  | 'calendar-week'
  | 'arrow-right'
  | 'arrow-left'
  | 'view-list'

// Khai báo kiểu AntDesignNames
declare type AntDesignNames =
  | 'staro'
  | 'infocirlceo'
  | 'heart'
  | 'link'
  | 'right'
  | 'left'
  | 'star'
  | 'linechart'
  | 'infocirlce'
  | 'checkcircle'
  | 'check'
  | 'edit'
  | 'setting'
  | 'close'
  | 'meh'
  | 'clockcircleo'
  | 'down'
  | 'up'
  | 'pluscircleo'
  | 'pluscircle'
  | 'minuscircleo'
  | 'minuscircle'
  | 'tag'
  | 'dashboard'
  | 'checkcircleo'
  | 'hearto'
  | 'check'
  | 'arrowup'
  | 'arrowdown'
  | 'bells' // AntDesign không có glyph 'bell', đúng tên là 'bells'
  | 'minuscircle'
  | 'hourglass'

// Khai báo kiểu Entypos
declare type Entypos =
  | 'grid'
  | 'emoji-happy'
  | 'line-graph'
  | 'light-up'
  | 'save'

// Khai báo kiểu IoniconNames
declare type IoniconNames =
  | 'person'
  | 'happy-outline'
  | 'radio-button-off-outline'
  | 'today-outline'
  | 'repeat-outline'
  | 'sunny-outline'
  | 'color-palette-outline'
  | 'return-up-back'
  | 'grid-outline'
  | 'document-outline'

// Hàm kiểm tra xem chuỗi có thuộc IoniconNames hay không
function isIoniconName(name: string): name is IoniconNames {
  return [
    'person',
    'happy-outline',
    'radio-button-off-outline',
    'today-outline',
    'repeat-outline',
    'sunny-outline',
    'color-palette-outline',
    'return-up-back',
    'grid-outline',
    'document-outline',
  ].includes(name)
}
export type ICON_LIST =
  | iconify_icon
  | Entypos
  | AntDesignNames
  | MaterialIconNames
  | MaterialCommunityIconNames
  | FontAwesomeNames
  | IoniconNames
  | fontisto_icon
// Bước 2: Hàm kiểm tra xem một chuỗi có phải là FontAwesomeNames hay không
function isFontAwesomeName(name: string): name is FontAwesomeNames {
  return [
    'search',
    'tasks',
    'play-circle',
    'pause-circle',
    'bell-o',
    'repeat',
    'check-circle',
    'leaf',
    'trash',
    'music',
    'person',
    'business-time',
    'list-alt',
  ].includes(name)
}
// Hàm kiểm tra xem chuỗi có thuộc MaterialIconNames hay không
function isMaterialIconName(name: string): name is MaterialIconNames {
  return [
    'self-improvement',
    'business-center',
    'alternate-email',
    'event-repeat',
    'timeline',
    'priority-high',
    'work',
    'work-outline',
  ].includes(name)
}

// Hàm kiểm tra xem chuỗi có thuộc MaterialCommunityIcons hay không
function isMaterialCommunityIcon(
  name: string,
): name is MaterialCommunityIconNames {
  return [
    'menu',
    'gift',
    'timetable',
    'calendar-clock-outline',
    'format-quote-open',
    'format-quote-close',
    'clock-start',
    'clock-end',
    'calendar-start',
    'calendar-end',
    'stairs-up',
    'target',
    'calendar-blank',
    'calendar',
    'arrow-right',
    'arrow-left',
    'view-list',
    'calendar-today',
    'calendar-arrow-right',
    'calendar-week',
  ].includes(name)
}

// Hàm kiểm tra xem chuỗi có thuộc AntDesignNames hay không
function isAntDesignName(name: string): name is AntDesignNames {
  return [
    'staro',
    'infocirlceo',
    'heart',
    'link',
    'right',
    'left',
    'star',
    'linechart',
    'infocirlce',
    'checkcircle',
    'check',
    'edit',
    'setting',
    'close',
    'meh',
    'clockcircleo',
    'down',
    'up',
    'pluscircleo',
    'pluscircle',
    'minuscircleo',
    'minuscircle',
    'tag',
    'dashboard',
    'checkcircleo',
    'hearto',
    'check',
    'arrowup',
    'arrowdown',
    'hourglass',
    'bells',
  ].includes(name)
}

// Hàm kiểm tra xem chuỗi có thuộc Entypos hay không
function isEntypo(name: string): name is Entypos {
  return ['grid', 'emoji-happy', 'line-graph', 'light-up', 'save'].includes(
    name,
  )
}
function isIconifyIcon(icon: string): icon is iconify_icon {
  return ['tdesign:task', 'ic:baseline-group-work', 'tdesign:smile'].includes(
    icon,
  )
}
function isFontistoIcon(icon: string): icon is fontisto_icon {
  return ['checkbox-active', 'checkbox-passive'].includes(icon)
}
export const BICon = (props: {
  style?: StyleProp<TextStyle>
  size?: number
  color?: string
  viewStyle?: StyleProp<ViewStyle>
  name?: ICON_LIST
}) => {
  return (
    <View
      style={[
        { alignItems: 'center', justifyContent: 'center' },
        props.viewStyle,
      ]}
    >
      {isIconifyIcon(props.name) && <CachedIcon {...props} icon={props.name} />}
      {!isIconifyIcon(props.name) && <FontIcon {...props} />}
    </View>
  )
}

export const CheckListICon = (props: { style?: TextStyle | TextStyle[] }) => {
  const colors = useTheme()
  return (
    <FontIcon
      name="checkcircle"
      style={[
        { color: colors.primaryColors[500], marginRight: 7 },
        props.style,
      ]}
    />
  )
}

const FontIcon = (props: {
  style?: StyleProp<TextStyle> | undefined
  size?: number
  color?: string
  name?: ICON_LIST | string
}) => {
  if (isFontistoIcon(props.name)) {
    return (
      <Fontisto
        color={props.color}
        style={props.style}
        size={props.size}
        name={props.name}
      />
    )
  }
  if (isFontAwesomeName(props.name)) {
    return (
      <FontAwesome5
        color={props.color}
        style={props.style}
        size={props.size}
        name={props.name}
      />
    )
  }
  if (isAntDesignName(props.name)) {
    return (
      <AntDesign
        color={props.color}
        style={[props.style]}
        size={props.size}
        name={props.name}
      />
    )
  }
  if (isEntypo(props.name)) {
    return (
      <Entypo
        color={props.color}
        style={props.style}
        size={props.size}
        name={props.name}
      />
    )
  }
  if (isIoniconName(props.name)) {
    return (
      <Ionicons
        name={props.name}
        color={props.color}
        style={[props.style]}
        size={props.size}
      />
    )
  }
  if (isMaterialCommunityIcon(props.name)) {
    return (
      <MaterialCommunityIcons
        color={props.color}
        style={props.style}
        size={props.size}
        name={props.name}
      />
    )
  }
  if (isMaterialIconName(props.name)) {
    return (
      <MaterialIcons
        color={props.color}
        style={props.style}
        size={props.size}
        name={props.name}
      />
    )
  }
  return null
}
