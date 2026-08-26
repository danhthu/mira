import {
  View,
  ViewProps,
  Image,
  Text,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { TouchableOpacity } from 'react-native'
import { useState, useEffect, useImperativeHandle } from 'react'
import { Router } from '../../Router'
import { assets as imageSets } from '../../assets'
import { Avatar } from 'react-native-paper'
import { debugStyle } from './debugStyle'
import React from 'react'
export interface BImageIConSetProps {
  name: string
  width?: number
  height?: number
  style?: ViewStyle
  navigation: any
  onChanged?: (arg: string) => void
}

export const ImageIconSets = Object.keys(imageSets).map((key) => {
  return { name: key, src: imageSets[key] }
})

export const BImageIConSet = (props: BImageIConSetProps) => {
  const [source, setSource] = useState(ImageIconSets[0].src)
  const [name, setName] = useState(props.name)
  const width  = props.width||100
  const height=props.height||100
  useEffect(() => {
    let tmp = ImageIconSets.filter((s) => s.name == name)
    if (tmp.length > 0) {
      setSource(tmp[0].src)
    } else {
      setSource(ImageIconSets[0].src)
    }
  }, [name])
  return (
    <TouchableOpacity
      onPress={() =>
        Router.OpenImageSelectorDialog(props.navigation, (val) => {
          setName(val)
          props.onChanged && props.onChanged(val)
        })
      }
    >
      <Avatar.Image size={width} source={source} />
    </TouchableOpacity>
  )
}

export const BImageIConDisplay = React.forwardRef(
  (
    props: {
      name: string
      width?: number
      height?: number,
      style?:ViewStyle|ViewStyle[],
      textStyle?:TextStyle
    },
    ref,
  ) => {
    const [source, setSource] = useState(
      ImageIconSets.filter((i) => i.name == props.name).length == 0
        ? null
        : ImageIconSets.filter((i) => i.name == props.name)[0].src,
    )
    const width = props.width||100
    const height =props.height||100

    if (source==null)
    {
      return <View style={[{ borderRadius:(height),height:height,width:width},props.style]}>
        <Text style={[{fontSize:(height)/5,lineHeight:height,textAlign:'center',flex:1, color:'white'},props.textStyle]}>{(props.name||'A').toUpperCase().substring(0,2)}</Text>
      </View>
    }

    return (
      <Image
        style={[
          {
            width: props.width || 100,
            height: props.height || 100,
            resizeMode: 'cover',
            borderRadius: (width)/2,
          },
        ]}
        source={source}
      />
    )
  },
)
