import moment from 'moment'
import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useCommonStyle } from '../Styles'

import { Picker } from '@react-native-picker/picker'
import { CalendarList, DateData } from 'react-native-calendars'
import { StepNavigation, StepView } from 'react-native-step-view-navigation'
import { FONTSIZE } from '..'
import { B } from '../../../libs/components'
import { debugStyle } from '../../../libs/components/debugStyle'
import { Link } from '../../../libs/components/Link'
import { useTheme } from '../../../theme'
import { useText } from '../../Work/Text'
import { getCurrentDay } from '../Utils/common'

import Modal from 'react-native-modal'
import { FONT_WEIGHT } from '../../../theme/Constraints'
import { useSettings } from '../Hooks'
import { reminderOption } from '../Interfaces'
import { CustomCalendarView } from './CustomCalendarView'

export const ReminderBottomModal = (props: {
  value: Date | reminderOption
  testId?: string
  onChanged: (val) => void
  onDismiss?: () => void
}) => {
  props.onDismiss = props.onDismiss || function () {}
  const [profile] = useSettings()
  const text = useText()
  const colors = useTheme()
  const commonStyle = useCommonStyle()
  //state
  const [state, updateState] = useReducer(
    (state, data) => {
      return { ...state, ...data }
    },
    {
      step: 1,
      value: props.value,
      calendarMonth: '',
      data: [],
    },
  )

  const data = [
    {
      icon: 'calendar-today',
      value: moment(getCurrentDay())
        .add(profile.sleep?.hour || 21, 'hour')
        .add(profile.sleep?.minut || 0, 'minute')
        .toDate(),
      right: '',
      selected: (value) =>
        value &&
        value.getTime() ==
          moment(getCurrentDay())
            .add(profile.sleep?.hour || 21, 'hour')
            .add(profile.sleep?.minut || 0, 'minute')
            .toDate()
            .getTime(),
      text: text.cuoingay || 'Cuối ngày',
    },
    {
      icon: 'calendar-arrow-right',
      value: moment(getCurrentDay())
        .add(1, 'day')
        .add(profile.wakeup?.hour || 8, 'hour')
        .add(profile.wakeup?.minut || 0, 'minute')
        .toDate(),
      right: '',

      selected: (value) =>
        value &&
        value.getTime() ==
          moment(getCurrentDay())
            .add(1, 'day')
            .add(profile.wakeup?.hour || 8, 'hour')
            .add(profile.wakeup?.minut || 0, 'minute')
            .toDate()
            .getTime(),
      text: text.ngaymai || 'Ngày mai',
    },
    {
      icon: 'calendar-week',
      value: moment(getCurrentDay())
        .add(7, 'day')
        .add(profile.wakeup?.hour || 8, 'hour')
        .add(profile.wakeup?.minut || 0, 'minute')
        .toDate(),
      right: '',
      selected: (value) =>
        value &&
        value.getTime() ==
          moment(getCurrentDay())
            .add(7, 'day')
            .add(profile.wakeup?.hour || 8, 'hour')
            .add(profile.wakeup?.minut || 0, 'minute')
            .toDate()
            .getTime(),
      text: text.tuantoi || 'Tuần tới',
    },
  ]

  useEffect(() => {
    updateState({
      calendarMonth: moment(props.value || new Date()).format('MMM-YYYY'),
      value: props.value,
    })
  }, [props.value])

  const style = useStyle()
  return (
    <Modal
      isVisible
      animationIn="slideInUp"
      animationOut="slideOutDown"
      onModalHide={props.onDismiss}
      onBackdropPress={props.onDismiss}
      style={[{ justifyContent: 'flex-end', flex: 1, margin: 0 }]}
    >
      <View
        style={[
          { backgroundColor: '#fff', borderRadius: 15, overflow: 'hidden' },
        ]}
      >
        <StepNavigation step={state.step} dots={null}>
          <StepView>
            <View style={{ flex: 1, padding: 20 }}>
              <View
                style={{
                  flexDirection: 'row',
                  borderBottomColor: colors.outlineVariant,
                  borderBottomWidth: 1,
                  paddingBottom: 10,
                }}
              >
                <Link
                  viewStyle={[commonStyle.left, { flex: 1 }]}
                  style={{ color: colors.error }}
                  onPress={() => {
                    props.onChanged(null)
                  }}
                >
                  {text.loaibo || 'Loại bỏ'}
                </Link>
                <B.Text
                  style={[commonStyle.full, { textAlign: 'center', flex: 1 }]}
                >
                  {text.ngaylam || 'Ngày làm'}
                </B.Text>

                <Link
                  viewStyle={[
                    commonStyle.right,
                    { flex: 1, alignItems: 'flex-end' },
                  ]}
                  style={{ color: colors.primary }}
                  onPress={props.onDismiss}
                >
                  {text.hoanthanh || 'Xong'}
                </Link>
              </View>

              <View style={[{ marginTop: 20 }]}>
                {data.map((d, i) => (
                  <TouchableOpacity
                    key={i + 1}
                    onPress={() => {
                      props.onChanged(d.value)
                    }}
                    style={[
                      {
                        height: 50,
                        justifyContent: 'center',
                      },
                    ]}
                  >
                    <View style={{ flexDirection: 'row' }}>
                      <B.ICon
                        style={[
                          commonStyle.left,
                          d.selected(state.value) && {
                            color: colors.primary,
                            fontWeight: FONT_WEIGHT.SEMIBOLD,
                          },
                          { fontSize: FONTSIZE.NORMAL, marginRight: 10 },
                        ]}
                        name={d.icon}
                      ></B.ICon>
                      <B.Text
                        style={[
                          commonStyle.full,
                          { verticalAlign: 'middle' },
                          d.selected(state.value) && {
                            color: colors.primary,
                            fontWeight: FONT_WEIGHT.SEMIBOLD,
                          },
                        ]}
                      >
                        {d.text}
                      </B.Text>
                      <B.Text
                        style={[
                          commonStyle.right,
                          d.selected(state.value) && {
                            color: colors.primary,
                            fontWeight: FONT_WEIGHT.SEMIBOLD,
                          },
                        ]}
                      >
                        {moment(d.value).format('dddd, DD')}
                      </B.Text>
                    </View>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[
                    {
                      height: 50,
                      justifyContent: 'center',
                    },
                  ]}
                  onPress={() => {
                    updateState({ step: 2 })
                  }}
                >
                  <View style={{ flexDirection: 'row' }}>
                    <B.ICon
                      style={[
                        commonStyle.left,
                        data.filter((d) => d.selected(state.value)).length ==
                          0 && {
                          color: colors.primary,
                          fontWeight: FONT_WEIGHT.SEMIBOLD,
                        },
                        { fontSize: FONTSIZE.NORMAL, marginRight: 10 },
                      ]}
                      name={'calendar-clock-outline'}
                    ></B.ICon>
                    <B.Text
                      style={[
                        commonStyle.full,
                        { verticalAlign: 'middle' },
                        data.filter((d) => d.selected(state.value)).length ==
                          0 && {
                          color: colors.primary,
                          fontWeight: FONT_WEIGHT.SEMIBOLD,
                        },
                      ]}
                    >
                      {text.chonngaygio || 'Chọn ngày & giờ'}
                    </B.Text>
                    <B.ICon
                      style={[
                        commonStyle.right,
                        data.filter((d) => d.selected(state.value)).length ==
                          0 && {
                          color: colors.primary,
                          fontWeight: FONT_WEIGHT.SEMIBOLD,
                        },
                      ]}
                      name={'arrow-right'}
                    ></B.ICon>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </StepView>
          <StepView>
            {
              <View style={{ padding: 15 }}>
                <CustomCalendarView
                  onBack={() => updateState({ step: 1 })}
                  value={state.value}
                  onSet={(d) => {
                    props.onChanged(moment(d).toDate())
                  }}
                />
                <TouchableOpacity
                  style={[
                    {
                      height: 50,
                      justifyContent: 'center',
                    },
                    debugStyle,
                  ]}
                  onPress={() => updateState({ step: 3 })}
                >
                  <View style={{ flexDirection: 'row' }}>
                    <B.Text style={[commonStyle.full]}>
                      {text.chongio || 'Chọn giờ gian'}
                    </B.Text>
                    <B.Text
                      style={[commonStyle.right, { color: colors.primary }]}
                    >
                      {moment(state.value).format('HH:mm')}
                    </B.Text>
                    <B.ICon
                      style={[commonStyle.right, { marginLeft: 10 }]}
                      name={'arrow-left'}
                    ></B.ICon>
                  </View>
                </TouchableOpacity>
              </View>
            }
          </StepView>
          <StepView>
            {state.step == 3 && (
              <View style={{ padding: 20 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    borderBottomColor: colors.outlineVariant,
                    borderBottomWidth: 1,
                    paddingBottom: 10,
                  }}
                >
                  <Link
                    viewStyle={[commonStyle.left, { flex: 1 }]}
                    style={{ color: colors.error }}
                    onPress={() => {
                      updateState({ step: 2 })
                    }}
                  >
                    {text.quaylai || 'Quay lại'}
                  </Link>
                  <B.Text
                    style={[commonStyle.full, { textAlign: 'center', flex: 1 }]}
                  >
                    {text.chonthoigian || 'Chọn thời gian'}
                  </B.Text>

                  <Link
                    viewStyle={[
                      commonStyle.right,
                      { flex: 1, alignItems: 'flex-end' },
                    ]}
                    style={{ color: colors.primary }}
                    onPress={props.onDismiss}
                  >
                    {text.hoanthanh || 'Xong'}
                  </Link>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Picker
                    selectedValue={moment(state.value).get('minute')}
                    onValueChange={(value) => {
                      const d = moment(state.value).set('hour', value).toDate()
                      updateState({ value: d })
                    }}
                    style={[
                      {
                        flex: 1,
                        fontSize: FONTSIZE.LARGE,
                        textAlign: 'center',
                      },
                    ]}
                  >
                    {[...Array(24).keys()].map((val, index) => (
                      <Picker.Item
                        key={index}
                        label={val < 10 ? '0' + val : '' + val}
                        value={val}
                      />
                    ))}
                  </Picker>
                  <Picker
                    selectedValue={moment(state.value).get('minute')}
                    onValueChange={(value) => {
                      const d = moment(state.value)
                        .set('minute', value)
                        .toDate()
                      updateState({ value: d })
                    }}
                    itemStyle={[debugStyle, { padding: 0, margin: 0 }]}
                    style={[
                      {
                        flex: 1,
                        fontSize: FONTSIZE.LARGE,
                        textAlign: 'center',
                      },
                    ]}
                  >
                    {[...Array(60).keys()].map((val, index) => (
                      <Picker.Item
                        key={index}
                        label={val < 10 ? '0' + val : '' + val}
                        value={val}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
          </StepView>
        </StepNavigation>
      </View>
    </Modal>
  )
}

export const CustomerDayList = (props: {
  minValue: Date
  selected?: Date
  onMonthChanged?: (val: DateData) => void
  onDayChanged?: (date: DateData) => void
}) => {
  const [value, setValue] = useState(props.selected)
  const [selectedDate, setSelectedDate] = useState<any>()
  useEffect(() => {
    setValue(props.selected)
    setSelectedDate({
      [moment(value || new Date()).format('YYYY-MM-dd')]: { selected: true },
    })
  }, [props.selected])
  const handleDayPress = useCallback(
    (d) => {
      const dateString = d.dateString
      setSelectedDate({ [dateString]: { selected: true } })
      props.onDayChanged && props.onDayChanged(d)
    },
    [setSelectedDate],
  )
  return (
    <CalendarList
      horizontal
      renderHeader={() => null}
      showSixWeeks
      minDate={moment(props.minValue).format('YYYY-MM-DD')}
      onMonthChange={(m) => props.onMonthChanged && props.onMonthChanged(m)}
      markedDates={selectedDate}
      onDayPress={handleDayPress}
    ></CalendarList>
  )
}

const useStyle = () => {
  const common = useCommonStyle()
  const colors = useTheme()
  return {
    ...common,
    modal: StyleSheet.create({
      container: {
        margin: 0,

        alignSelf: 'flex-end',
      },
      modalContent: {
        //  alignSelf:'flex-end'
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderRadius: 10,
        margin: 20,
        backgroundColor: '#fff',
        overflow: 'hidden',
      },
      modalOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,

        backgroundColor: 'rgba(0,0,0,0.3)',
      },
    }),
    ...StyleSheet.create({
      section: {
        backgroundColor: '#ffffff',

        padding: 20,
        paddingBottom: 5,
        paddingTop: 5,
        marginBottom: 20,
        marginTop: 20,
      },
      sectionTitle: {
        paddingLeft: 20,
        fontWeight: '500',
        fontSize: FONTSIZE.NORMAL,
      },
      ic_left: {
        width: 30,
        alignItems: 'center',
      },
      screen: {
        backgroundColor: colors.background,
      },
      sectionContainer: {
        //marginTop: 15,
        marginBottom: 15,
        //paddingLeft: 20,
        backgroundColor: colors.surface,
      },
      label: {
        height: 30,
        justifyContent: 'center',
        fontWeight: 'bold',
        textTransform: 'capitalize',
        marginTop: 15,
      },
    }),
  }
}
