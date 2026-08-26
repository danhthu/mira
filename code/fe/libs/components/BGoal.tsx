import { View, Text, StyleProp, ViewStyle, TouchableOpacity } from 'react-native'
import { ICON_LIST, FontICon } from './Icon'
import { useText } from '../../lang'
import { useReducer, useState } from 'react'
import { Grid, Col, Row } from 'react-native-easy-grid'
import { Picker } from '@react-native-picker/picker'
import { goalOption } from '../../common/interface'
import { ICONSIZE, MARGIN, PADDING } from '../../theme/Constraints'

import {
  Button,
  Divider,
  SegmentedButtons,
  Surface,
  Switch,
} from 'react-native-paper'
import { useTheme } from '../../theme'
import { BCard, CaptionRow } from './Card'
const defState = {
  enable: false,
  total: 1,
  unit: 'Hour',
} as goalOption

export type BGoalDataValue = typeof defState
export const DefaultBGoalDataValue = defState

export interface BGoalProps {
  data?: BGoalDataValue
  dispatch?: (arg: any) => void
  style?: StyleProp<ViewStyle>
}

const unitValues = 'Hours | times'.split('|')
export const BGoalComponent = (props: BGoalProps) => {
  const text = useText().goal
  const data = { ...defState, ...props.data }
  const dispatch = (val) => {
    props.dispatch && props.dispatch({ ...data, ...val })
  }
  return (
    <BCard>
      <CaptionRow
        title={text.title}
        subTitle={text.subTitle}
        iconLeft="target"
        iconRight={() => (
          <Switch
            value={data.enable}
            onValueChange={(v) => dispatch({ enable: !data.enable })}
          />
        )}
      />
      <Body {...{ ...props, data, dispatch }} />
    </BCard>
  )
}
export const Body = (props: BGoalProps) => {
  const text = useText().goal
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
            <Text>
              {data.total} {data.unit.toLocaleLowerCase()} {text.perday}
            </Text>
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
                marginRight: 5,
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
          style={{
            justifyContent: 'center',
          }}
        >
          <Divider></Divider>
          <Grid style={{ marginTop: MARGIN.GROUP }}>
            <Col style={{ flex: 1, alignItems: 'flex-end', marginRight: 10 }}>
              <Picker
                selectedValue={data.total}
                onValueChange={(value) => dispatch({ total: value })}
                style={{ width: 100 }}
              >
                {[...Array(40).keys()].map((val, index) => (
                  <Picker.Item
                    key={index}
                    label={val < 10 ? '0' + val : '' + val}
                    value={val}
                  />
                ))}
              </Picker>
            </Col>
            <Col style={{ flex: 1, alignItems: 'flex-start', marginLeft: 10 }}>
              <Picker
                selectedValue={data.unit}
                onValueChange={(value) => dispatch({ unit: value })}
                style={{
                  width: 150,
                  textTransform: 'capitalize',
                  textAlign: 'left',
                }}
              >
                {unitValues.map((val, index) => (
                  <Picker.Item key={index} label={val} value={val} />
                ))}
              </Picker>
            </Col>
          </Grid>
        </View>
      )}
    </View>
  )
}
