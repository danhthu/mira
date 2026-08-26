import CircularSlider from './react-native-circular-slider/CircularSlider';
import { useTheme } from "../../theme"
import { useState } from 'react'
import { View } from 'react-native';
export interface BCircularSliderProp {
    label: string;
    max: number;
    min: number;
    value?: number;
    onChanged?: (val: number) => void
}
export const BCircularSlider = (props: BCircularSliderProp) => {


    //return <View></View>
    return <CircularSlider
    max={props.max}
    min={props.min}
    value={props.value}/>


}