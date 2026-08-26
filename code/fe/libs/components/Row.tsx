import { View, ViewStyle } from "react-native"
import { useTheme } from "../../theme"
import { TBL_ROW_HEIGHT } from "../../theme/Constraints"

export const Row=(props:{children,style?:ViewStyle|ViewStyle[]})=>{
    const colors = useTheme()
    return <View style={[{borderBottomWidth:1, borderBottomColor:colors.outlineVariant, flexDirection:'row'},props.style]}>{props.children}</View>
}

export const Cel=(props:{children,style?:ViewStyle|ViewStyle[]})=>{
    return <View style={[{paddingTop:12,paddingBottom:12},props.style]}>{props.children}</View>
}