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


export const FontICon = (props: {
  style?: StyleProp<TextStyle>|undefined,
  size?:number,
  color?:string,
  name?: ICON_LIST|string
}) => {

  const FontAwesomeNames = ['play-circle','pause-circle','bell-o','repeat','check-circle','leaf','trash','music','person']
  const MaterialIconNames=['calendar-today','priority-high','work','work-outline']
  const AntDesignNames=['meh', 'clockcircleo','down','up','pluscircleo','minuscircleo','tag','dashboard','checkcircleo','hearto','check','arrowup','arrowdown']
  if(props.name=='person' || props.name=='happy-outline'|| props.name=='radio-button-off-outline'||props.name=='today-outline'){
    return (<Ionicons  name={props.name} color={props.color} style={props.style} size={props.size} />)
  }
  if(props.name=='target'||props.name=='bell'){
    return (<Feather name={props.name} color={props.color} style={props.style} size={props.size}  />)
  }
  if(props.name=='list-alt'){
    return (<FontAwesome5  name={props.name} color={props.color} style={props.style} size={props.size}  />)
  }
  if(AntDesignNames.indexOf(props.name)>-1 ){
    return <AntDesign color={props.color}  style={props.style} size={props.size} name={props.name} />
  }
  if(MaterialIconNames.indexOf(props.name)>-1 ){
    return <MaterialIcons color={props.color} style={props.style} size={props.size} name={props.name}/>
  }
  if(FontAwesomeNames.indexOf(props.name)>-1 ){
    return <FontAwesome color={props.color} style={props.style} size={props.size} name={props.name}/>
  }

  return <Fontisto color={props.color} style={ props.style}  name={props.name||'circle-o-notch'}></Fontisto>
}

export const ImageICon = FontICon