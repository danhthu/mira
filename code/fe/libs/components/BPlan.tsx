import { View, Text, StyleProp, ViewStyle, TouchableOpacity } from "react-native"
import { FontICon } from "./Icon"
import { useText } from "../../lang"
import { useState } from "react"
import { Grid, Col } from "react-native-easy-grid"
import { Picker } from "@react-native-picker/picker"
import { planOption } from "../../common/interface"
import { Divider } from "react-native-paper"
import { useTheme } from "../../theme"
import { BCard, CaptionRow } from "./Card"
import { debugStyle } from "./debugStyle"
import {Switch} from 'react-native-paper'
import { MARGIN } from "../../theme/Constraints"
export const defState = {
  enable: false,
  hour: 0,
  minut: 0
} as planOption
export type PlanDataValue = typeof defState
export const DefaultPlanDataValue = defState
export interface BPlanProps {
  data?: PlanDataValue,
  style?: StyleProp<ViewStyle>
  dispatch?: (arg: any) => void

}


export const BPlan = (props: BPlanProps) => {
  const text = useText().plan
  const data = { ...defState,  hour:new Date().getHours(), minut:new Date().getMinutes(),...props.data, };
  const dispatch = (val) => {
    props.dispatch && props.dispatch({ ...data, ...val })
  }
  console.log(data,props.data)
  return (
    <BCard>
      <CaptionRow title={text.title} subTitle={text.subTitle} iconLeft="clockcircleo" iconRight={() => <Switch value={data.enable} onValueChange={v => dispatch({ enable: !data.enable })} />} />
      <Body {...{ ...props, data, dispatch }} />
    </BCard>
  )
}


const Body = (props: BPlanProps) => {
  const text = useText().plan
  const theme = useTheme()
  const data = props.data
  const dispatch = props.dispatch
  const [picker_show, setPicker_show] = useState(false)
  if (!data.enable) return <View></View>
  return (
    <View>
      <Divider style={{ margin: 5 }}></Divider>
      <View style={{ height: 50 }}>
        <Grid style={{ flex: 1 }}>
          <Col style={{ justifyContent: 'center', flex: 3 }}>
            <Text>{text.des} {data.hour < 10 ? "0" + data.hour : "" + data.hour}:{data.minut < 10 ? "0" + data.minut : "" + data.minut}</Text>
          </Col>
          <Col
            style={{
              justifyContent: 'center',
              flex: 1,
              alignItems: 'flex-end',
              padding: 0,
            }}
          >
            <TouchableOpacity

              onPress={() => {
                setPicker_show(!picker_show)
              }}
              style={{
                alignSelf: 'flex-end',
                height: 30,
                justifyContent: 'center',
                marginRight:5,
              }}
            >
              <FontICon
                name={!picker_show ? 'down' : 'up'}
                style={{ marginRight: 0, flexDirection: 'row-reverse' }}
              ></FontICon>
            </TouchableOpacity>
          </Col>
        </Grid>
      </View>
      {!picker_show ? null : (


        <View
          style={[{
            justifyContent: 'center',

          }, debugStyle]}
        >
          <Divider></Divider>
          <Grid style={[{ marginTop: MARGIN.GROUP, flex: 1 }]}>
            <Col style={[{ flex: 1, alignItems: 'flex-end', marginRight: 5 }]}>
              <Picker
                selectedValue={data.hour}
                onValueChange={(value) => dispatch({ hour: value })}
                style={{ width: 100 }}
              >
                {[...Array(24).keys()].map((val, index) => (
                  <Picker.Item
                    key={index}
                    label={val < 10 ? "0" + val : "" + val}
                    value={val}
                  />
                ))}
              </Picker>

            </Col>
            <Col style={{ flex: 1, alignItems: 'flex-start', marginLeft: 5 }}>
              <Picker
                selectedValue={data.minut}
                onValueChange={(value) => dispatch({ minut: value })}
                style={{ width: 100 }}
              >
                {[...Array(60).keys()].map((val, index) => (
                  <Picker.Item
                    key={index}
                    label={val < 10 ? "0" + val : "" + val}
                    value={val}
                  />
                ))}
              </Picker>
            </Col>

          </Grid>
        </View>
      )}
    </View>)



}