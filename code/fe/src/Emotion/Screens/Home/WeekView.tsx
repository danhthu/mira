import moment from 'moment'
import { useState } from 'react'
import {
  Image,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import { BICon } from '../../../../libs/components'
import { useTheme } from '../../../../theme'
import { FONTSIZE, SECOND_BLACK_COLOR } from '../../../../theme/Constraints'
import { useAsyncAction } from '../../../Common/Hooks'
import iconifyAssets from '../../Assets/iconifyAssets'
import { emotionTrackerRepository } from '../../Entities'
import { emotionList, EmotionStatusColor } from '../../Entities/types'
import { useText } from '../../Text'

export const WeekView = (props: { style?: StyleProp<ViewStyle> }) => {
  const daysOfWeek: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const t = useText().translate
  const hexToRGB = useTheme().hexToRGB
  const [currentWeek, setCurrentWeek] = useState({
    start: moment().startOf('isoWeek'),
    end: moment().endOf('isoWeek'),
  })
  const [data, setData] = useState([])
  const high_unit = 40
  const width = 30
  useAsyncAction(async () => {
    setData(await emotionTrackerRepository.groupByWeek(currentWeek.start))
  }, [currentWeek])
  return (
    <View style={[{ paddingTop: 20, justifyContent: 'flex-end' }, props.style]}>
      <View
        style={[
          {
            flexDirection: 'row',
            justifyContent: 'flex-end',
          },
        ]}
      >
        {daysOfWeek.map((d, i) => (
          <View
            key={i}
            style={[
              {
                flex: 1,
                alignItems: 'center',
              },
              // debugStyle,
            ]}
          >
            <View
              style={[
                {
                  height: high_unit * emotionList.length,
                  justifyContent: 'flex-end',
                  backgroundColor: hexToRGB('#eeeeee', 0.35),
                  width: width,
                },
              ]}
            >
              <View style={{ flexDirection: 'column', position: 'relative' }}>
                {emotionList.indexOf(data[i]) > -1 &&
                  emotionList.length - emotionList.indexOf(data[i]) > 1 && (
                    <View
                      style={[
                        {
                          width: width,
                          height:
                            high_unit *
                            (emotionList.length - emotionList.indexOf(data[i])),
                        },
                        {
                          backgroundColor:
                            data.length < i
                              ? null
                              : EmotionStatusColor[data[i]] || '#ddd',
                        },
                        {
                          opacity: 0.15,
                          borderTopLeftRadius: width,
                          borderTopRightRadius: width,
                        },
                      ]}
                    ></View>
                  )}
                {emotionList.indexOf(data[i]) > -1 && (
                  <Image
                    style={[
                      {
                        width: width,
                        height: width,
                        position: 'absolute',
                        top:
                          emotionList.length - emotionList.indexOf(data[i]) > 1
                            ? 0
                            : -width,
                      },
                    ]}
                    source={
                      data.length > i
                        ? iconifyAssets[data[i]] || iconifyAssets.good
                        : iconifyAssets.good
                    }
                  />
                )}
              </View>
            </View>
            <Text
              style={[
                {
                  width: width,
                  lineHeight: width,
                  height: width,
                  textAlign: 'center',
                  color: SECOND_BLACK_COLOR,
                },
              ]}
            >
              {d}
            </Text>
          </View>
        ))}
      </View>
      <View>
        <View style={{ flexDirection: 'row', height: 30, alignSelf: 'center' }}>
          <TouchableOpacity
            style={{
              height: 30,
              paddingRight: 10,
              paddingLeft: 10,
              justifyContent: 'center',
            }}
            onPress={() =>
              setCurrentWeek((prev) => ({
                start: prev.start.add(-7, 'days'),
                end: prev.end.add(-7, 'days'),
              }))
            }
          >
            <BICon
              style={{ fontSize: FONTSIZE.SMALL, lineHeight: 30 }}
              name="left"
            />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: FONTSIZE.SMALL,
              textAlign: 'center',
              fontWeight: '500',
              lineHeight: 30,
            }}
          >
            {currentWeek.start.isSame(moment().startOf('isoWeek'))
              ? t('This week')
              : currentWeek.start.format('MMM, DD') +
                ' - ' +
                currentWeek.end.format('MMM, DD')}
          </Text>
          <TouchableOpacity
            onPress={() =>
              setCurrentWeek((prev) => ({
                start: prev.start.add(7, 'days'),
                end: prev.end.add(7, 'days'),
              }))
            }
            style={[
              {
                height: 30,
                paddingLeft: 10,
                paddingRight: 10,
                justifyContent: 'center',
              },
            ]}
          >
            <BICon
              name="right"
              style={{ fontSize: FONTSIZE.SMALL, lineHeight: 30 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
