import { TextProps, Text, View, ViewStyle, Dimensions, useWindowDimensions, TextStyle } from "react-native";
import { useHtmlStyle, useTextStyle } from "./Styles";
import HTMLRender from "react-native-render-html";
import { FONTSIZE, FONT_WEIGHT } from "../../theme/Constraints";
import React from "react";

export interface BTextProps extends TextProps {
    kind?: 'default' | 'primary' | 'secondary',
    size?: 'normal' | 'small' | 'big',
    style?:TextStyle|TextStyle[],
    onPress?:()=>void
}
export const BText = (props: BTextProps) => {
    const style = useTextStyle()
    return <Text children={props.children} onPress={props.onPress} style={[ { fontWeight:FONT_WEIGHT.NORMAL, fontSize: style[props.size || 'normal'].fontSize, color: style[props.kind || 'default'].color},props.style]} ></Text>
}

export const BBHtml = (props: { viewStyle?: ViewStyle | Array<ViewStyle>, children?: any }) => {
    const {width} = useWindowDimensions();
    const style = useHtmlStyle()
    return <View style={props.viewStyle}><HTMLRender
    contentWidth={width}
     source ={{ html: props.children||'' }} tagsStyles={style} baseStyle={{ fontSize: FONTSIZE.NORMAL }} ></HTMLRender >
    </View>
}
export const BHtml = React.memo(BBHtml)