import { useActionSheet } from "@expo/react-native-action-sheet";
import { useNavigation } from '@react-navigation/native';
import React, { ReactNode } from "react";
import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";
import { ROUTER_NAME, Router } from "../../Router";
import { useText } from "../../lang";
import { useTheme } from "../../theme";
import { FONTSIZE } from "../../theme/Constraints";
import { BICon } from "./BIcon";
import { BText } from "./BText";
import { useButtonStyle } from "./Styles";
import { ICON_LIST } from "./common";


export interface ButtonProps {
  containerStyle?: StyleProp<ViewStyle>,
  textStyle?: StyleProp<TextStyle>,
  style?: StyleProp<ViewStyle>, //not use
  onPress?: (data?: any) => void,
  children?: string | ReactNode,
  icon?: ICON_LIST | ReactNode,
  iconStyle?: StyleProp<ViewStyle>,
  iconPosition?: 'Left' | 'Right',
  kind?: 'default' | 'primary' | 'secondary' | 'danger' | 'info' | 'warning', //variant
  type?: 'Link' | 'Solid',
  size?: 'normal' | 'small' | 'big',
  text?: string,
  disabled?: boolean,
}

export const BIconButton = (props: ButtonProps) => {
  return <BButton {...{ ...props, }} />
}

export const BButton = (props: ButtonProps) => {
  const style = useButtonStyle()

  if (props.disabled) {

    return <View style={[props.type == 'Link' ? { alignItems: 'center', justifyContent: 'center' } : style[props.kind || 'default'].container, props.containerStyle, props.style]}

    >
      {props.text || typeof (props.children) === 'string' ? (
        <Text style={[style[props.kind || 'default'].text, props.type == 'Link' ? style.link.text : {}, style[props.size || 'normal'].text, props.disabled && style.disabled.text, props.textStyle]}>{props.text || props.children}</Text>
      ) : props.children}

    </View>
  }
  return <TouchableOpacity style={[props.type == 'Link' ? { alignItems: 'center', justifyContent: 'center' } : style[props.kind || 'default'].container, props.containerStyle, props.style]}
    onPress={props.onPress}
  >
    {props.text || typeof (props.children) === 'string' ? (
      <Text style={[style[props.kind || 'default'].text, props.type == 'Link' ? style.link.text : {}, style[props.size || 'normal'].text, props.textStyle]}>{props.text || props.children}</Text>
    ) : props.children}

  </TouchableOpacity>
}




export const RighButtonSave = (props: ButtonProps) => {
  const nav = useNavigation()
  const colors = useTheme()
  const text = useText() as { [key: string]: any }
  return <TouchableOpacity
    onPress={props.onPress}
    style={[{ flexDirection: 'row', marginRight: 15, backgroundColor: colors.primary, borderRadius: 7, padding: 4, paddingLeft: 10, paddingRight: 10 }, props.style]}>
    {/** <BICon style={{fontSize:FONTSIZE.SMALL, color:colors.onSecondary, marginRight:5}} name="save" />*/}
    <BText style={[{ color: colors.onPrimary, fontSize: FONTSIZE.SMALL }, props.textStyle]}>{text.save || 'Save'}</BText>
  </TouchableOpacity>
}

export const RighButtonAdd = (props: { app: ROUTER_NAME | string } & ButtonProps) => {
  const nav = useNavigation()
  const colors = useTheme()
  const text = useText() as { [key: string]: any }
  return <TouchableOpacity
    onPress={props.onPress || (() => Router.Open(nav, props.app, { screen: 'Add' }))}
    style={[{ flexDirection: 'row', marginRight: 15, backgroundColor: colors.primary, borderRadius: 7, padding: 4, paddingLeft: 10, paddingRight: 10 }, props.style]}>
    <BICon style={{ fontSize: FONTSIZE.SMALL, color: colors.onSecondary, marginRight: 5 }} name="pluscircle" />
    <BText style={[{ color: colors.onSecondary, }, props.textStyle]}>{text.add || 'Add'}</BText>
  </TouchableOpacity>

}

export const RighButtonEdit = (props: { app: ROUTER_NAME, id: string | number | any } & ButtonProps) => {
  const nav = useNavigation()
  const colors = useTheme()
  const text = useText() as { [key: string]: any }
  return <TouchableOpacity
    onPress={props.onPress || (() => Router.Open(nav, props.app, { screen: 'Edit', id: props.id }))}
    style={[{ flexDirection: 'row', marginRight: 15, backgroundColor: colors.secondary, borderRadius: 7, padding: 4, paddingLeft: 10, paddingRight: 10 }, props.style]}>
    {/**  <BICon style={{fontSize:FONTSIZE.SMALL, color:colors.onSecondary, marginRight:5}} name="edit" /> */}
    <BText style={[{ color: colors.onSecondary, fontSize: FONTSIZE.SMALL }, props.textStyle]}>{text.edit || 'Edit'}</BText>
  </TouchableOpacity>
}




export const ButtonActionSheet = (props: { title: string, textList: Array<string> } & ButtonProps) => {
  const { showActionSheetWithOptions } = useActionSheet()
  const onPress = () => {
    const options = props.textList

    showActionSheetWithOptions(
      {
        options,
        message: props.title,
        cancelButtonIndex: props.textList.length,
        messageTextStyle: {
          textAlign: 'center',
          fontSize: FONTSIZE.NORMAL,
          alignSelf: 'center',
        },
      },
      async (selectedIndex: number) => {
        props.onPress(selectedIndex)
      },
    )
  }
  return <BButton {...{ ...props, onPress: onPress }} />
}


