import {
  View,
  Text,
  ViewStyle,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextStyle,
} from 'react-native'
import { useState } from 'react'
import { AppStyle, useTheme } from '../../theme'
import { useText } from '../../lang'
import { FontICon } from './Icon'

export interface BPriorityProps {
  onChanged?: (val: string,color:string) => void
  data?:string
}

export const BPriority = (props: BPriorityProps) => {
  const [actived, setActived] = useState(props.data||'normal')
  const text = useText().common.priority
  const theme = useTheme()
  const OnPress = (val,color) => () => {
    setActived(val)
    props.onChanged && props.onChanged(val,color)
  }
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        height: 40,
      }}
    >
      <TouchableOpacity
        style={style.container}
        key={'high'}
        onPress={OnPress('high','#fbfb22cc')}
      >
        <View style={{ justifyContent: 'center', width: 25, height: 40 }}>
          <FontICon
             style={[style.icon,actived == 'high' ?{color:'green'}:{}]}
            name={
              actived == 'high' ? 'checkcircleo' : 'radio-button-off-outline'
            }
          />
        </View>
        <Text style={style.text}>{text.high}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[style.container,{backgroundColor:'#7d949fcc'}]}
        key={'normal'}
        onPress={OnPress('normal','#7d949fcc')}
      >
        <View style={{ justifyContent: 'center', width: 25, height: 40 }}>
          <FontICon
            style={[style.icon,actived == 'normal' ?{color:'green'}:{}]}
            name={
              actived == 'normal' ? 'checkcircleo' : 'radio-button-off-outline'
            }
          />
        </View>
        <Text style={style.text}>{text.normal}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[style.container,{backgroundColor:'#c6acd7f2'}]}
        key={'low'}
        onPress={OnPress('low','#c6acd7f2')}
      >
        <View style={{ justifyContent: 'center', width: 25, height: 40 }}>
          <FontICon
            style={[style.icon,actived == 'low' ?{color:'green'}:{}]}
            name={
              actived == 'low' ? 'checkcircleo' : 'radio-button-off-outline'
            }
          />
        </View>
        <Text style={style.text}>{text.low}</Text>
      </TouchableOpacity>
    </View>
  )
}

const style = StyleSheet.create({
  container: {
    borderRadius: 15,
    height: 40,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: '#fbfb22cc',
    marginRight: 15,
    flexDirection: 'row',
  },
  icon: {
    color: '#353735',
    marginRight: 10,
    fontSize: 20,
  },
  text: {
    color: '#353735',
    alignSelf: 'stretch',
    fontSize: 20,
    lineHeight: 40,
  },
})
