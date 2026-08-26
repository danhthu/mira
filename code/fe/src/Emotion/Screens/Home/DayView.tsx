import { useNavigation } from '@react-navigation/native'
import moment from 'moment'
import { useState } from 'react'
import { StyleProp, Text, View, ViewStyle } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { BICon } from '../../../../libs/components'
import { Link } from '../../../../libs/components/Link'
import { Router } from '../../../../Router'
import {
  FONT_WEIGHT,
  FONTSIZE,
  ROUND_NORMAL,
  ROUND_PADDING_NORMAL,
  SECOND_BLACK_COLOR,
  SPACING,
} from '../../../../theme/Constraints'
import { useAsyncAction, useDectectDataChanged } from '../../../Common/Hooks'
import { CheckItModal } from '../../Components/CheckItModal'
import { EmotionsInDay } from '../../Components/EmotionsInDay'
import { emotionCheck, emotionTrackerRepository } from '../../Entities'
import { useText } from '../../Text'

export const DayView = (props: { style?: StyleProp<ViewStyle> }) => {
  const nav = useNavigation()
  const t = useText().translate
  const [data, setData] = useState(null as emotionCheck)
  const [visibleCheckItModal, setVisibleCheckItModal] = useState(false)
  useAsyncAction(async () => {
    const currentDay = moment().toDate().toISOString()
    const _data = await emotionTrackerRepository.getEmotionByDate(currentDay)
    setData(_data)
  }, [useDectectDataChanged(emotionTrackerRepository)])

  return (
    <View style={[props.style]}>
      <View style={[{ flexDirection: 'row', marginBottom: 10 }]}>
        <Text
          style={{
            fontSize: FONTSIZE.NORMAL,
            fontWeight: FONT_WEIGHT.SEMIBOLD,
            lineHeight: 30,
            height: 30,
            flex: 1,
          }}
        >
          {t('Today')}
        </Text>
        <TouchableOpacity
          style={[
            {
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingRight: 5,
              flexDirection: 'row',
            },
            // debugStyle,
          ]}
          onPress={() =>
            Router.Open(nav, 'EmotionApp', {
              screen: 'Detail',
              day: new Date().getTime(),
            })
          }
        >
          <Text
            style={{
              fontSize: FONTSIZE.NORMAL,
              lineHeight: 30,
              height: 30,
              marginRight: 3,
              color: SECOND_BLACK_COLOR,
            }}
          >
            {t('Detail')}
          </Text>
          <BICon
            name="right"
            style={{
              fontSize: FONTSIZE.NORMAL,
              color: SECOND_BLACK_COLOR,
              //  fontWeight: FONT_WEIGHT.SEMIBOLD,
              lineHeight: 30,
              height: 30,
            }}
          />
        </TouchableOpacity>
      </View>

      <View
        style={{
          borderRadius: ROUND_NORMAL,
          backgroundColor: '#fff',
          padding: ROUND_PADDING_NORMAL,
        }}
      >
        {!data && <View></View>}
        {data && (
          <EmotionsInDay
            data={data}
            style={{
              borderRadius: null,
              backgroundColor: '#fff',
              padding: null,
              marginBottom: null,
            }}
          />
        )}
        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <View style={{ flexDirection: 'row' }}>
            <Text
              style={{
                lineHeight: 30,
                fontSize: FONTSIZE.NORMAL,
                marginRight: SPACING,
              }}
            >
              {t('How are you feeling? ')}
            </Text>
            <Link
              style={{ textAlign: 'center', lineHeight: 30 }}
              onPress={() => {
                setVisibleCheckItModal(true)
              }}
            >
              {t('check it now')}
            </Link>
          </View>
        </View>
      </View>
      <CheckItModal
        day={new Date()}
        visible={visibleCheckItModal}
        onDismiss={() => {
          setVisibleCheckItModal(false)
        }}
      />
    </View>
  )
}
