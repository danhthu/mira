import { Picker } from '@react-native-picker/picker'
import moment from 'moment'
import React, { useEffect, useReducer, useState } from 'react'
import {
  StyleProp,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import { Calendar } from 'react-native-calendars'
import { Col, Grid } from 'react-native-easy-grid'
import { ThemeProp } from 'react-native-paper/lib/typescript/types'
import { repeatOption } from '../../common/interface'
import { useText } from '../../lang'
import { AppStyle, useTheme } from '../../theme'
import { FONTSIZE } from '../../theme/Constraints'
import { getCurrentDay } from '../dateUtils'
import { BICon, ICON_LIST } from './BIcon'
import { BText } from './BText'
import { BCard, CaptionRow } from './Card'
import { FontICon } from './Icon'

const defState = {
  enable: false,
  kind: 'daily',
  repeat: 1,
  days: [0, 1, 2, 3, 4, 5, 6],
  endDate: null,
  endDateEnable: false,
  dayOfWeek: [0],
} as repeatOption

export const DefaultRepeatDataValue = defState

export type RepeatDataValue = typeof defState

export interface BRepeatComponentProps {
  data?: RepeatDataValue
  dispatch?: (data: any) => void
  style?: ViewStyle
  theme?: ThemeProp
  reducer?: [any, (state, action) => void]
}
export const BRepeatComponent = (
  props: BRepeatComponentProps = { data: defState },
) => {
  const text = useText().repeat
  const data = { ...defState, ...props.data }
  const dispatch = (val) => {
    props.dispatch && props.dispatch({ ...data, ...val })
  }

  return (
    <BCard style={props.style}>
      {/**title */}
      <CaptionRow
        title={text.title}
        subTitle={text.subTitle}
        iconLeft={'tag'}
        value={data.enable}
        onChanged={() => dispatch({ enable: !data.enable })}
      />
      <Body {...{ ...props, data, dispatch }} />
    </BCard>
  )
}

export const Body = (props: BRepeatComponentProps = { data: defState }) => {
  const [data, dispatch] = useReducer((state, action) => {
    console.log(state, action)
    return { ...state, ...action }
  }, props.data || defState)
  //props.dispatch
  const theme = useTheme()
  const text = useText().repeat
  const common = useText().common
  const [repeate_picker_show, setRepeate_picker_show] = useState(false)
  useEffect(() => {
    dispatch(props.data)
  }, [props])

  const styles = Styles(useTheme())
  //if (!data.enable) return <View></View>
  return (
    <View>
      <View style={{ flex: 1, marginTop: 5 }}>
        <Divider></Divider>
        {/**button group */}
        <ButtonGroup
          items={[
            {
              text: text.daily,
              isActive: data.kind == 'daily',
            },
            {
              text: text.weekly,
              isActive: data.kind == 'weekly',
            },
            {
              text: text.monthly,
              isActive: data.kind == 'monthly',
            },
          ]}
          viewStyle={{
            margin: 20,
          }}
          size="small"
          onPress={(index) => {
            dispatch({
              kind: index == 0 ? 'daily' : index == 1 ? 'weekly' : 'monthly',
            })
          }}
        />

        {data.kind == 'weekly' ? (
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
                onPress={() =>
                  dispatch({
                    dayOfWeek:
                      data.dayOfWeek && data.dayOfWeek.indexOf(val) > -1
                        ? [...data.dayOfWeek.filter((d) => d != val)]
                        : [...data.dayOfWeek, val],
                  })
                }
                key={index}
                style={[
                  styles.circleButton,
                  {
                    backgroundColor:
                      data.dayOfWeek && data.dayOfWeek.indexOf(val) > -1
                        ? theme.primary
                        : theme.secondary,
                  },
                ]}
              >
                <Text
                  style={{
                    color:
                      data.dayOfWeek && data.dayOfWeek.indexOf(val) > -1
                        ? theme.onPrimary
                        : theme.onSecondary,
                    textAlign: 'center',
                  }}
                >
                  {common.daysOfWeekShort[val]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : data.kind == 'monthly' ? (
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                height: 50,
                justifyContent: 'center',
              }}
            >
              {[...Array(7).keys()]
                .map((val) => val + 1)
                .map((val, index) => (
                  <View
                    key={index}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        dispatch({
                          days:
                            data.days && data.days.indexOf(val) > -1
                              ? [...data.days.filter((d) => d != val)]
                              : [...data.days, val],
                        })
                      }
                      style={[
                        styles.circleButton,
                        {
                          backgroundColor:
                            data.days && data.days.indexOf(val) > -1
                              ? theme.primary
                              : null,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          textAlign: 'center',
                          color:
                            data.days && data.days.indexOf(val) > -1
                              ? theme.onPrimary
                              : null,
                        }}
                      >
                        {val}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
            <View style={{ flexDirection: 'row', height: 50 }}>
              {[...Array(7).keys()]
                .map((val) => val + 8)
                .map((val, index) => (
                  <View
                    key={index}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        dispatch({
                          days:
                            data.days && data.days.indexOf(val) > -1
                              ? [...data.days.filter((d) => d != val)]
                              : [...data.days, val],
                        })
                      }
                      style={[
                        styles.circleButton,
                        data.days &&
                          data.days.indexOf(val) > -1 && {
                            backgroundColor: theme.primary,
                          },
                      ]}
                    >
                      <Text
                        style={[
                          {
                            textAlign: 'center',
                          },
                          data.days &&
                            data.days.indexOf(val) > -1 && {
                              color: theme.onPrimary,
                            },
                        ]}
                      >
                        {val}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
            <View style={{ flexDirection: 'row', height: 50 }}>
              {[...Array(7).keys()]
                .map((val) => val + 15)
                .map((val, index) => (
                  <View
                    key={index}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        dispatch({
                          days:
                            data.days && data.days.indexOf(val) > -1
                              ? [...data.days.filter((d) => d != val)]
                              : [...data.days, val],
                        })
                      }
                      style={[
                        styles.circleButton,
                        data.days &&
                          data.days.indexOf(val) > -1 && {
                            backgroundColor: theme.primary,
                          },
                      ]}
                    >
                      <Text
                        style={[
                          {
                            textAlign: 'center',
                          },
                          data.days &&
                            data.days.indexOf(val) > -1 && {
                              color: theme.onPrimary,
                            },
                        ]}
                      >
                        {val}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
            <View style={{ flexDirection: 'row', height: 50 }}>
              {[...Array(7).keys()]
                .map((val) => val + 22)
                .map((val, index) => (
                  <View
                    key={index}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        dispatch({
                          days:
                            data.days && data.days.indexOf(val) > -1
                              ? [...data.days.filter((d) => d != val)]
                              : [...data.days, val],
                        })
                      }
                      style={[
                        styles.circleButton,
                        data.days &&
                          data.days.indexOf(val) > -1 && {
                            backgroundColor: theme.primary,
                          },
                      ]}
                    >
                      <Text
                        style={[
                          {
                            textAlign: 'center',
                          },
                          data.days &&
                            data.days.indexOf(val) > -1 && {
                              color: theme.onPrimary,
                            },
                        ]}
                      >
                        {val}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
            <View style={{ flexDirection: 'row', height: 50 }}>
              {[...Array(7).keys()]
                .map((val) => val + 28)
                .map((val, index) => (
                  <View
                    key={index}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {val > 32 ? null : (
                      <TouchableOpacity
                        onPress={() =>
                          dispatch({
                            days:
                              data.days && data.days.indexOf(val) > -1
                                ? [...data.days.filter((d) => d != val)]
                                : [...data.days, val],
                          })
                        }
                        style={[
                          styles.circleButton,
                          {
                            backgroundColor:
                              data.days && data.days.indexOf(val) > -1
                                ? theme.primary
                                : null,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            textAlign: 'center',
                            color:
                              data.days && data.days.indexOf(val) > -1
                                ? theme.onPrimary
                                : null,
                          }}
                        >
                          {val}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
            </View>
          </View>
        ) : null}
        <Divider></Divider>
      </View>

      <View>
        <View style={{ flex: 1 }}>
          {/*row 1*/}
          <View style={{ height: 50 }}>
            <Grid style={{}}>
              <Col style={{ justifyContent: 'center' }}>
                <Text> {text.title}</Text>
              </Col>
              <Col
                style={{
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                }}
              >
                <TouchableOpacity
                  style={{ flexDirection: 'row' }}
                  onPress={() => {
                    setRepeate_picker_show(!repeate_picker_show)
                  }}
                >
                  <Text style={{ paddingRight: 5 }}>
                    {text.every} {data.repeat} {text.day}
                  </Text>
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
                  <Text>{text.day}</Text>
                </Col>
              </Grid>
            </View>
          ) : null}
        </View>
        {data.enable ? <Divider></Divider> : null}
      </View>

      <View>
        <View>
          <Grid style={{ height: 50 }}>
            <Col style={{ justifyContent: 'center' }}>
              <Text>{text.endDay}</Text>
            </Col>
            <Col
              style={{
                flex: null,
                height: 50,
                width: 50,
                justifyContent: 'center',
                alignItems: 'flex-end',
              }}
            >
              <Switch
                value={data.endDateEnable}
                onValueChange={(val) =>
                  dispatch({
                    endDateEnable: val,
                    endDate: getCurrentDay().getTime(),
                  })
                }
              ></Switch>
            </Col>
          </Grid>
        </View>

        {data.endDateEnable ? (
          <View>
            <Divider></Divider>
            <Calendar
              markedDates={{
                [moment(new Date(data.endDate)).format('YYYY-MM-DD')]: {
                  selected: true,
                  selectedColor: theme.primary,
                  selectedTextColor: theme.onPrimary,
                },
              }}
              minDate={moment(getCurrentDay()).format('YYYY-MM-DD')}
              theme={{ backgroundColor: null, calendarBackground: null }}
              onDayPress={(d) => {
                console.log('calendar click', d)
                d.timestamp > getCurrentDay().getTime() &&
                  dispatch({ endDate: d.timestamp })
              }}
              renderArrow={(direction) => {
                if (direction == 'left')
                  return <FontICon name="arrow-left"></FontICon>
                if (direction == 'right')
                  return <FontICon name="arrow-right"></FontICon>
              }}
            ></Calendar>
          </View>
        ) : null}
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
    textActived: {},
    button: {
      borderRightColor: theme.outlineVariant,
      borderRightWidth: 1,
      flex: 1,
      paddingTop: 5,
      paddingBottom: 5,
    },
    circleButton: {
      height: 32,
      width: 32,
      borderRadius: 16,
      opacity: 0.7,
      justifyContent: 'center',
      margin: 5,
    },
  })

const useStyles = () => Styles(useTheme())

export const Divider = () => {
  const colors = useTheme()
  return (
    <View
      style={{ borderBottomColor: colors.outlineVariant, borderBottomWidth: 1 }}
    />
  )
}

export const ButtonGroup = (props: {
  items: Array<{ text?: string; icon?: ICON_LIST; isActive?: boolean }>
  size: 'big' | 'small' | 'normal'
  onPress: (index: number) => void
  viewStyle?: StyleProp<ViewStyle>
}) => {
  const [activedIndex, setActivedIndex] = useState(0)
  const style = useStyles()
  const fontSize = {
    big: FONTSIZE.BIG,
    normal: FONTSIZE.NORMAL,
    small: FONTSIZE.SMALL,
  }
  useEffect(() => {
    var activedItem =
      props.items.filter((i) => i.isActive).length == 0
        ? props.items[0]
        : props.items.filter((i) => i.isActive)[0]
    setActivedIndex(props.items.indexOf(activedItem))
  }, [props])
  return (
    <View
      style={[
        style.buttonGroup,
        { flexDirection: 'row', borderRadius: 0 },
        props.viewStyle,
      ]}
    >
      {props.items.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            setActivedIndex((prev) => index)
            props.onPress(index)
          }}
          style={[
            style.button,
            {
              flex: 1,
              paddingLeft: 5,
              paddingRight: 5,
              paddingTop: 2,
              paddingBottom: 2,
              justifyContent: 'center',
              alignItems: 'center',
            },
            index == activedIndex && style.buttonActived,
            (index == activedIndex - 1 || index == props.items.length - 1) && {
              borderRightWidth: 0,
            },
            {
              flexDirection: 'row',
              alignItems: 'center',
              padding: 1,
              borderRadius: 0,
            },
          ]}
        >
          {item.icon && (
            <BICon
              name={item.icon}
              size={fontSize[props.size]}
              style={[
                item.text && { marginRight: 5 },
                index == activedIndex && { color: '#fff' },
              ]}
            />
          )}
          {item.text && (
            <BText
              size={props.size}
              style={[
                { textAlign: 'center' },
                index == activedIndex && { color: '#fff' },
              ]}
            >
              {item.text}
            </BText>
          )}
        </TouchableOpacity>
      ))}
    </View>
  )
}
