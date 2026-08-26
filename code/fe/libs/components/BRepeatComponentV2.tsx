import { View, Text, StyleSheet, ViewStyle, Pressable } from 'react-native'
import { useText } from '../../lang'
import { useEffect, useReducer, useState } from 'react'
import { FontICon } from './Icon'
import React from 'react'
import { Picker } from '@react-native-picker/picker'
import { AppStyle, useTheme } from '../../theme'
import { Col, Grid } from 'react-native-easy-grid'
import { repeatOption } from '../../common/interface'
import { TouchableOpacity } from 'react-native'
import { BCard } from './Card'
import { BText } from './BText'
import { debugStyle } from './debugStyle'

const defState = {
  enable: true,
  kind: 'daily',
  repeat: 1,
  days: [0, 1, 2, 3, 4, 5, 6],
  endDate: null,
  endDateEnable: false,
  dayOfWeek: [0],
} as repeatOption





export type RepeatDataValue = typeof defState

export interface BRepeatComponentProps {
  data?: RepeatDataValue
  dispatch?: (data: any) => void
  style?: ViewStyle

  reducer?: [any, (state, action) => void]
}
export const BRepeatComponentV2 = (
  props: BRepeatComponentProps,
) => {
  return (
    <View style={{ marginTop: 20 }}>
      <Body {...props} />
    </View>
  )
}

export const Body = (
  props: BRepeatComponentProps,
) => {

  const dispatch = props.dispatch || ((val) => { })
  const data = { ...defState, ...props.data || {} }

  const theme = useTheme()
  const text = useText().repeat
  const common = useText().common
  const [repeate_picker_show, setRepeate_picker_show] = useState(false)
  const styles = Styles(useTheme())
  function On_KindButtonSelected(index) {
    dispatch({ kind: index == 0 ? 'daily' : index == 1 ? 'weekly' : 'monthly' })
  }

  return (
    <View>
      <View style={{}}>
        {/**button group */}
        <View style={debugStyle}>
        <ButtonGroup items={[
          {
            text: text.daily, isActive: data.kind == 'daily',
          },
          {
            text: text.weekly, isActive: data.kind == 'weekly',
          },
          {
            text: text.monthly, isActive: data.kind == 'monthly',
          },

        ]}

          size='small'
          onPress={On_KindButtonSelected}
        />
        </View>
        <View>
          <View>
            {data.kind == 'weekly' && (
              <View
                style={{
                  alignSelf: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  height: 50,
                }}
              >
                {[...Array(7).keys()].map((val, index) => (
                  <TouchableOpacity
                    onPress={() => dispatch({ dayOfWeek: data.dayOfWeek && data.dayOfWeek.indexOf(val) > -1 ? [...data.dayOfWeek.filter(d => d != val)] : [...data.dayOfWeek, val] })}
                    key={index}
                    style={[styles.circleButton, {
                      backgroundColor: data.dayOfWeek && data.dayOfWeek.indexOf(val) > -1 ? theme.primary : theme.secondary,
                    }]}
                  >
                    <Text style={{ color: data.dayOfWeek && data.dayOfWeek.indexOf(val) > -1 ? theme.onPrimary : theme.onSecondary, textAlign: 'center' }}>
                      {common.daysOfWeekShort[val]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {data.kind == 'monthly' && (
              <View >
                {/** */}
                {[...Array(5).keys()].map((row, rowIndex) => <>
                  <View key={row} style={{ flex: 1, flexDirection: 'row', height: 50, justifyContent: 'center' }}>
                    {[...Array(7).keys()].map(val => rowIndex * 7 + val + 1).map((val, index) => (
                      <View
                        key={row+'|'+ val}
                        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                      >
                        {val <= 31 && <TouchableOpacity

                          onPress={() => dispatch({ days: data.days && data.days.indexOf(val) > -1 ? [...data.days.filter(d => d != val)] : [...data.days, val] })}
                          style={[styles.circleButton, {
                            backgroundColor: data.days && data.days.indexOf(val) > -1 ? theme.primary : null,
                          }]}>
                          <Text
                            style={{
                              textAlign: 'center',
                              color: data.days && data.days.indexOf(val) > -1 ? theme.onPrimary : null,
                            }}
                          >
                            {val}
                          </Text>
                        </TouchableOpacity>
                        }
                      </View>
                    ))}
                  </View>
                </>)}
              </View>
            )}
            <Divider ></Divider>
          </View>


          <View>
            <View style={{ flex: 1 }}>
              {/*row 1*/}
              <View style={{ height: 50, }}>
                <Grid style={{}}>
                  <Col style={{ justifyContent: 'center' }}>
                    <Text> {text.title}</Text>
                  </Col>
                  <Col
                    style={{
                      justifyContent: 'center',
                      alignItems: 'flex-end'
                    }}
                  >
                    <TouchableOpacity
                      style={{ flexDirection: 'row' }}
                      onPress={() => {
                        setRepeate_picker_show(!repeate_picker_show)
                      }}
                    >
                      <Text style={{ paddingRight: 5 }}>{text.every} {data.repeat} {data.kind == "daily" ? text.day || "day" : data.kind == "weekly" ? text.week || "week" : text.month || "month"}</Text>
                      <FontICon
                        name={!repeate_picker_show ? 'down' : 'up'}
                        style={{ marginRight: 0, marginTop: 3 }}
                      ></FontICon>
                    </TouchableOpacity>

                  </Col>
                </Grid>
              </View>
              {/**Picker */}
              {repeate_picker_show ? (
                <View
                  style={{
                    justifyContent: 'center',
                  }}
                >
                  <Grid>
                    <Col
                      style={{
                        flex: 1,
                        alignItems: 'flex-end',
                        alignSelf: 'center',
                        marginRight: 10,
                      }}
                    >
                      <Text>{text.every}</Text>
                    </Col>
                    <Col style={{ flex: 1 }}>
                      <Picker
                        selectedValue={data.repeat}
                        onValueChange={(value) => dispatch({ repeat: value })}
                      >
                        {[...Array(5).keys()].map((val, index) => (
                          <Picker.Item
                            key={index}
                            label={'' + (val + 1)}
                            value={val + 1}
                          />
                        ))}
                      </Picker>
                    </Col>
                    <Col
                      style={{
                        flex: 1,
                        alignItems: 'flex-start',
                        alignSelf: 'center',
                        marginLeft: 10,
                      }}
                    >
                      <Text>{data.kind == "daily" ? text.day || "day" : data.kind == "weekly" ? text.week || "week" : text.month || "month"}</Text>
                    </Col>
                  </Grid>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}



const Styles = (theme: typeof AppStyle) =>
  StyleSheet.create({
    buttonGroup: {
      backgroundColor: theme.surface,
      borderColor: theme.outlineVariant,
      borderWidth: 1,
      borderRadius: 20,
    },
    buttonActived: {
      backgroundColor: theme.primary,
      color: theme.onPrimary,
      borderRadius: 20,
    },
    textActived: {

    },
    button: {
      borderRightColor: theme.outlineVariant,
      borderRightWidth: 1,
      flex: 1,

    },
    circleButton: {
      height: 32,
      width: 32,
      borderRadius: 16,
      opacity: 0.7,
      justifyContent: 'center',
      margin: 5
    }
  })

const useStyles = () => Styles(useTheme())

export const Divider = () => {
  const colors = useTheme()
  return <View style={{ borderBottomColor: colors.outlineVariant, borderBottomWidth: 1 }} />
}

export const ButtonGroup = (props: { items: Array<{ text: string, isActive?: boolean }>, size: 'big' | 'small' | 'normal', onPress: (index: number) => void, viewStyle?: ViewStyle }) => {
  console.log(props.items)
  const [activedIndex, setActivedIndex] = useState(0)
  const colors = useTheme()
  const style = useStyles()
  useEffect(() => {
    var activedItem = props.items.filter(i => i.isActive).length == 0 ? props.items[0] : props.items.filter(i => i.isActive)[0]
    setActivedIndex(props.items.indexOf(activedItem))
  }, [props])
  return <View style={[style.buttonGroup, { flexDirection: 'row' }, props.viewStyle,debugStyle]}>
    {props.items.map((item, index) => <TouchableOpacity key={index} onPress={() => {
      props.onPress(index)}}
      style={[style.button, { padding: 0, margin: 0 }, index == activedIndex && style.buttonActived,
      (index == activedIndex - 1 || index == props.items.length - 1) && { borderRightWidth: 0 }]}
    ><BText size={props.size} style={[{ textAlign: 'center', lineHeight: 20 }, index == activedIndex && { color: colors.onPrimary }]}>{item.text}</BText>
    </TouchableOpacity>)}
  </View>
}
