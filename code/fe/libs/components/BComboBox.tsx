import { View } from "react-native"
import { ButtonActionSheet } from "./BButton"
import { BText as Text } from "./BText"
import { TouchableOpacity } from "react-native-gesture-handler"
import { B } from "."
import { TBL_ROW_HEIGHT } from "../../theme/Constraints"

export interface BComboBoxProps{
    label:string,
    data: Array<{value,display}>,
    value?:any,
    onChanged: (val)=>void
}
export const BComboBox=(props:BComboBoxProps)=>{
    const onPress = ()=>{

    }

    if(!props.data) return <View />
    return <View>
        <TouchableOpacity onPress={onPress} style={{flexDirection:'row'}}>
            <Text style={{lineHeight:TBL_ROW_HEIGHT, flex:1}}>{props.value||props.label}</Text>
            <TouchableOpacity
            onPress={()=>props.onChanged(null)}
            style={{width:50, height:TBL_ROW_HEIGHT,alignItems:'flex-end',justifyContent:'center',alignSelf:'flex-end'}}>
                <B.ICon name="close" />
            </TouchableOpacity>
        </TouchableOpacity>
    </View>
}