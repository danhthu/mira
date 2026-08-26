import { useState } from 'react'
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native'
import { ButtonGroup } from '../../../../libs/components/BRepeatComponent'
import { useTheme } from '../../../../theme'
import { ROUND_BIG, ROUND_NORMAL } from '../../../../theme/Constraints'
import { FONTSIZE } from '../../../Common'
import { useAsyncAction } from '../../../Common/Hooks'
import iconifyAssets from '../../Assets/iconifyAssets'
import { emotionTrackerRepository } from '../../Entities'
import { EmotionStatusColor } from '../../Entities/types'
import { useText } from '../../Text'

export const StatisticBar = (props: { style: StyleProp<ViewStyle> }) => {
  const hexToRGB = useTheme().hexToRGB
  const t = useText().translate
  const range = ['3m', '6m', '1y', 'all'] //3m,6m,1y,all
  const [rangeIndex, setRangeIndex] = useState(0)
  const [data, setData] = useState(
    [] as Array<{
      value: number
      color: string
      label: string
      percentage: number
    }>,
  )
  useAsyncAction(async () => {
    const _data = await emotionTrackerRepository.groupByStatus(
      range[rangeIndex],
    )
    setData(
      _data.map((e) => ({
        value: e.total,
        label: e.status,
        percentage:
          (e.total * 100) /
          _data.map((h) => h.total).reduce((s1, s2) => s1 + s2, 0),
        color: EmotionStatusColor[e.status],
      })),
    )
  }, [rangeIndex])

  const renderItem = (item, radius = 30) => {
    return (
      <View>
        <Image
          style={[styles.img, data.indexOf(item) == 0 && styles.img_large]}
          source={iconifyAssets[item.label]}
        />
        <View
          style={[
            styles.text_wrapper,
            { backgroundColor: hexToRGB(item.color, 0.2) },
          ]}
        >
          <Text style={[styles.text]}>
            {item.value} {t('days', 'days')}
          </Text>
        </View>
      </View>
    )
  }

  if (data.length == 0) return <View />
  return (
    <View
      style={[
        {
          backgroundColor: '#fff',
          borderRadius: ROUND_NORMAL,
          padding: ROUND_BIG,
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
            marginBottom: 30,
          },
        ]}
      >
        {t('records', 'Records')}
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <View style={[{ flex: 4, justifyContent: 'center' }]}>
          {renderItem(data[0], 45)}
        </View>
        <View style={[{ flex: 3, flexDirection: 'column' }]}>
          <View style={{ marginBottom: 10 }}>{renderItem(data[1])}</View>
          <View style={{ flex: 1 }}>{renderItem(data[2])}</View>
        </View>
        <View style={{ flex: 3, flexDirection: 'column' }}>
          <View style={{ marginBottom: 10 }}>{renderItem(data[3])}</View>
          <View style={{ flex: 1 }}>{renderItem(data[4])}</View>
        </View>
      </View>
      <View>
        <View
          style={[
            {
              // borderColor: '#ddd',
              flexDirection: 'row',
              marginTop: 20,
            },
          ]}
        >
          {data
            .filter((d) => d.value > 0 && d.percentage > 2)
            .map((dd, i) => (
              <View
                key={i}
                style={[
                  {
                    height: 20,
                    backgroundColor: dd.color,
                    width: `${dd.percentage}%`,
                  },
                  i == 0 && {
                    borderTopLeftRadius: 10,
                    borderBottomLeftRadius: 10,
                  },
                  i ==
                    data.filter((d) => d.value > 0 && d.percentage > 2).length -
                      1 && {
                    borderTopRightRadius: 10,
                    borderBottomRightRadius: 10,
                  },
                ]}
              ></View>
            ))}
        </View>
      </View>
      <ButtonGroup
        size="small"
        onPress={(index) => setRangeIndex(index)}
        items={range.map((r, i) => ({ text: r, isActive: i == rangeIndex }))}
        viewStyle={[
          {
            width: 140,
            position: 'absolute',
            top: ROUND_NORMAL + 5,
            right: ROUND_BIG,
            flexDirection: 'row',
          },
        ]}
      ></ButtonGroup>
    </View>
  )
}

const styles = StyleSheet.create({
  img: {
    alignSelf: 'center',
    width: 40,
    height: 40,
  },
  img_large: {
    alignSelf: 'center',
    width: 100,
    height: 100,
  },
  text: {
    textAlign: 'center',
    lineHeight: 25,
    height: 25,
    fontSize: 13,
  },
  text_wrapper: {
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 5, //
    borderWidth: 1,
    borderRadius: 15,
    borderColor: '#ddd',
    padding: 0,
    alignSelf: 'center',
  },
})
