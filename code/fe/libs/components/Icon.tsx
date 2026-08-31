import { Fontisto,FontAwesome ,MaterialIcons,AntDesign} from '@expo/vector-icons'
import React from 'react'
import { StyleProp, Text, ViewStyle ,TextStyle} from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { debugStyle } from './debugStyle';
export type ICON_LIST='checkbox-active' | 'checkbox-passive' |'play-circle'|'pause-circle'
|'priority-high' |'bell-o' |'clockcircleo' |'repeat' |'arrow-left'| 'arrow-right' |'down'|'up'|'pluscircleo'|'minuscircleo'|'tag'|'target'|'bell'|'list-alt'|'person'|'dashboard'|'happy-outline'
|'radio-button-off-outline'|'checkcircleo'|'check-circle'|'leaft'|'trash'|'work'|'music'|'person'|'hearto'|'check'|'arrowup'|'arrowdown'|'meh'|'today-outline'


// FontAwesome không có glyph 'person' (dùng 'user'); nhánh 'person' đã được xử lý
// riêng bằng Ionicons ở trên nên bỏ khỏi danh sách FontAwesome cho khớp glyphmap thật.
const FontAwesomeNames = ['play-circle','pause-circle','bell-o','repeat','check-circle','leaf','trash','music'] as const
const MaterialIconNames = ['calendar-today','priority-high','work','work-outline'] as const
const AntDesignNames = ['meh', 'clockcircleo','down','up','pluscircleo','minuscircleo','tag','dashboard','checkcircleo','hearto','check','arrowup','arrowdown'] as const

function isFontAwesomeName(name: string): name is (typeof FontAwesomeNames)[number] {
  return (FontAwesomeNames as readonly string[]).indexOf(name) > -1
}
function isMaterialIconName(name: string): name is (typeof MaterialIconNames)[number] {
  return (MaterialIconNames as readonly string[]).indexOf(name) > -1
}
function isAntDesignName(name: string): name is (typeof AntDesignNames)[number] {
  return (AntDesignNames as readonly string[]).indexOf(name) > -1
}

export const FontICon = (props: {
  style?: StyleProp<TextStyle>|undefined,
  size?:number,
  color?:string,
  name?: ICON_LIST|string
}) => {

  if(props.name=='person' || props.name=='happy-outline'|| props.name=='radio-button-off-outline'||props.name=='today-outline'){
    return (<Ionicons  name={props.name} color={props.color} style={props.style} size={props.size} />)
  }
  if(props.name=='target'||props.name=='bell'){
    return (<Feather name={props.name} color={props.color} style={props.style} size={props.size}  />)
  }
  if(props.name=='list-alt'){
    return (<FontAwesome5  name={props.name} color={props.color} style={props.style} size={props.size}  />)
  }
  if(props.name && isAntDesignName(props.name)){
    return <AntDesign color={props.color}  style={props.style} size={props.size} name={props.name} />
  }
  if(props.name && isMaterialIconName(props.name)){
    return <MaterialIcons color={props.color} style={props.style} size={props.size} name={props.name}/>
  }
  if(props.name && isFontAwesomeName(props.name)){
    return <FontAwesome color={props.color} style={props.style} size={props.size} name={props.name}/>
  }

  // Các icon còn lại (checkbox-active/passive, arrow-left/right, ...) đều thuộc bộ Fontisto.
  // Không thể narrow tĩnh từ ICON_LIST|string sang glyph name thật của Fontisto nên cast có kiểm tra runtime ở trên.
  return <Fontisto color={props.color} style={ props.style}  name={(props.name || 'circle-o-notch') as React.ComponentProps<typeof Fontisto>['name']}></Fontisto>
}

export const ImageICon = FontICon