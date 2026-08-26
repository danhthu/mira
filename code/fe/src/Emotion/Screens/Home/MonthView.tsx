import moment from 'moment'
import { useState } from 'react'
import { Image, StyleProp, Text, View, ViewStyle } from 'react-native'
import { Calendar } from 'react-native-calendars'
import { SECOND_BLACK_COLOR } from '../../../../theme/Constraints'
import { useAsyncAction } from '../../../Common/Hooks'
import iconifyAssets from '../../Assets/iconifyAssets'
import { emotionCheck, emotionTrackerRepository } from '../../Entities'

export const MonthView = (props: { style?: StyleProp<ViewStyle> }) => {
  const [data, setData] = useState({} as { [Key: string]: emotionCheck })
  useAsyncAction(async () => {
    let _data = await emotionTrackerRepository.groupByDate()
    setData((prev) => _data)
  }, [])
  return (
    <View style={{ flex: 1 }}>
      <Calendar
        firstDay={1}
        style={{ height: 250 }}
        dayComponent={(props) => {
          let isoDate = moment(props.date.timestamp)
            .startOf('day')
            .toDate()
            .toISOString()

          if (iconifyAssets[data[isoDate]?.status] == undefined)
            return (
              <Text
                style={[
                  {
                    lineHeight: 20,
                    height: 20,
                    textAlign: 'center',
                    fontSize: 17,
                  },
                  props.date.timestamp > new Date().getTime() && {
                    color: SECOND_BLACK_COLOR,
                  },
                ]}
              >
                {props.date.day}
              </Text>
            )
          return (
            <View style={[{ justifyContent: 'center', alignItems: 'center' }]}>
              <Image
                source={iconifyAssets[data[isoDate]?.status]}
                style={{
                  width: 20,
                  height: 20,
                }}
              />
            </View>
          )
        }}
      />
    </View>
  )
}
