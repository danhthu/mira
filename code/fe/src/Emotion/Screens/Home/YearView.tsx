import { useState } from 'react'
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import { BICon } from '../../../../libs/components'
import { ROUND_BIG, ROUND_NORMAL } from '../../../../theme/Constraints'
import { FONTSIZE } from '../../../Common'
import { useAsyncAction } from '../../../Common/Hooks'
import { emotionCheck, emotionTrackerRepository } from '../../Entities'
import { EmotionStatusColor } from '../../Entities/types'
import { useText } from '../../Text'

export const YearView = (props: { style: StyleProp<ViewStyle> }) => {
  const shortMonthLabel = Array.from({ length: 12 }, (_, i) => i + 1)
  const dayLabel = Array.from({ length: 31 }, (_, i) => i + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [data, setData] = useState({} as { [Key: string]: emotionCheck })
  const [rectSize, setRectSize] = useState(30)
  const t = useText().translate
  const stylyes = StyleSheet.create({
    rect_cap: {
      flex: 1,
    },
    cap: { fontWeight: 'semibold', fontSize: 14, textAlign: 'center' },
    rect: {
      flex: 1,
      height: rectSize,
      width: rectSize,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dot: {
      width: rectSize - 12,
      height: rectSize - 12,
      borderRadius: rectSize / 2 - 6,
      backgroundColor: '#eee',
    },
  })

  useAsyncAction(async () => {
    let _data = await emotionTrackerRepository.groupByDate()
    setData((prev) => _data)
  }, [year])

  return (
    <View
      style={[
        {
          borderRadius: ROUND_NORMAL,
          padding: ROUND_BIG,
          backgroundColor: '#fff',
        },
        props.style,
      ]}
    >
      <Text
        style={[
          {
            fontSize: FONTSIZE.NORMAL,
            fontWeight: 'bold',
            marginTop: -5,
            marginBottom: 10,
            height: 25,
            lineHeight: 25,
          },
          // debugStyle,
        ]}
      >
        {t('year', 'Year')}
      </Text>
      <View
        style={[
          {
            flexDirection: 'row',
            width: 80,
            position: 'absolute',
            right: ROUND_BIG,
            top: ROUND_BIG - 5,
            height: 25,
          },
          // debugStyle,
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => setYear((prev) => year - 1)}
        >
          <BICon
            name="left"
            style={{
              fontSize: FONTSIZE.NORMAL,
              textAlign: 'left',
              lineHeight: 25,
              height: 25,
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[{ flex: 1 }]}
          onPress={() => {
            setYear((prev) => year + 1)
          }}
        >
          <BICon
            name="right"
            style={{
              fontSize: FONTSIZE.NORMAL,
              textAlign: 'right',
              lineHeight: 25,
              height: 25,
            }}
          />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <Text
          style={[
            {
              fontSize: FONTSIZE.SMALL,

              //   alignItems: 'baseline', // Căn dòng theo baseline
              //aflexDirection: 'row',
              lineHeight: 30,
              height: 30,
            },
          ]}
        >
          {t('Look back on your')}{' '}
        </Text>
        <TouchableOpacity
          style={[
            {
              justifyContent: 'center',
              height: 30,
            },
          ]}
        >
          {
            <Text
              style={{
                fontWeight: 'bold',
                lineHeight: 30,
                height: 30,
                fontSize: FONTSIZE.SMALL,
              }}
            >
              {year}
            </Text>
          }
        </TouchableOpacity>
      </View>
      {/**header */}
      <View
        style={[
          {
            flexDirection: 'row',
            borderBottomColor: '#ddd',
            borderBottomWidth: 1,
          },
        ]}
      >
        <View
          style={[
            stylyes.rect_cap,
            { borderRightColor: '#ddd', borderRightWidth: 1 },
          ]}
        >
          <Text style={stylyes.cap}></Text>
        </View>
        {shortMonthLabel.map((m, i) => (
          <View key={i} style={stylyes.rect_cap}>
            <Text style={stylyes.cap}>{m}</Text>
          </View>
        ))}
      </View>
      {dayLabel.map((d, i) => (
        <View key={i} style={[{ flexDirection: 'row' }]}>
          <View
            style={[
              stylyes.rect,
              { borderRightColor: '#ddd', borderRightWidth: 1 },
            ]}
          >
            <Text style={stylyes.cap}>{d}</Text>
          </View>
          {shortMonthLabel.map((m, j) => (
            <View key={i + '_' + j} style={[stylyes.rect]}>
              <View
                style={[
                  d <= new Date(year, m, 0).getDate() && stylyes.dot,
                  d <= new Date(year, m, 0).getDate() &&
                    data[new Date(year, m - 1, d).toISOString()] && {
                      backgroundColor:
                        EmotionStatusColor[
                          data[new Date(year, m - 1, d).toISOString()].status
                        ] || '#eee',
                    },
                ]}
              ></View>
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}
