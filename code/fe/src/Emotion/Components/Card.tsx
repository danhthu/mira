import {
  Image,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import { BICon, BText as Text } from '../../../libs/components'
import { useTheme } from '../../../theme'
import { FONTSIZE, SPACING, TBL_ROW_HEIGHT } from '../../../theme/Constraints'
import { useText } from '../Text'

import { useNavigation } from '@react-navigation/native'
import { useState } from 'react'
import { getCurrentDay, getDay } from '../../../libs/dateUtils'
import { Router } from '../../../Router'
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks'
import { ButtonLink } from '../../Controls/Buttons'
import iconifyAssets from '../Assets/iconifyAssets'
import { emotionTrackerRepository } from '../Entities'
import { EmotionStatus } from '../Entities/types'
import { CheckItModal, MoodTrackerView } from './CheckItModal'
import { WeekView } from './WeekView'

export const Card = (props: { style: StyleProp<ViewStyle> }) => {
  const text = useText()
  const colors = useTheme()
  const nav = useNavigation()
  const [dayEmotion, setDayEmotion] = useState(null)
  const currentStatus = useAsyncAction(async () => {
    return await emotionTrackerRepository.getStatusByDate(new Date())
  }, [useDectectDataChanged(emotionTrackerRepository)])
  if (!currentStatus) return <MoodTrackerView day={getCurrentDay()} />
  return (
    <View style={[props.style]}>
      <TouchableOpacity
        onPress={() => Router.Open(nav, 'EmotionApp', {})}
        style={[{ flexDirection: 'row', marginTop: -7, marginBottom: 10 }]}
      >
        <BICon
          name="emoji-happy"
          style={{
            fontSize: FONTSIZE.HOME_SECTION_TITLE,
            color: '#FFA500',
            marginRight: SPACING,
          }}
        />
        <Text
          style={{
            fontSize: FONTSIZE.HOME_SECTION_TITLE,
            fontWeight: 'semibold',
            lineHeight: TBL_ROW_HEIGHT,
            flex: 1,
          }}
        >
          {text.mood_pulse || 'Mood pulse'}
        </Text>
        <BICon
          name="right"
          style={{
            fontSize: FONTSIZE.NORMAL,
            color: colors.primary,
            alignSelf: 'flex-end',
          }}
        />
      </TouchableOpacity>
      <CurrentWeekView onDayPress={(day) => setDayEmotion(day)} />
      {dayEmotion && (
        <CheckItModal
          day={dayEmotion}
          visible={dayEmotion != null}
          onDismiss={() => setDayEmotion(null)}
        />
      )}
    </View>
  )
}

export const CurrentWeekView = (props: { onDayPress: (day) => void }) => {
  const statusList = useAsyncAction(async () => {
    const data = await emotionTrackerRepository.groupByDate()
    return data
  }, [useDectectDataChanged(emotionTrackerRepository)])
  const getStatus = (date: Date, statusList): EmotionStatus => {
    const day = getDay(date || new Date()).toISOString()
    return statusList && statusList[day] ? statusList[day]?.status : null
  }
  const t = useText().translate

  return (
    <>
      <WeekView
        style={{ marginRight: -8, marginLeft: -8 }}
        renderValue={(date, actived, size) =>
          getStatus(date, statusList) ? (
            <Image
              source={
                actived
                  ? iconifyAssets[getStatus(date, statusList)]
                  : iconifyAssets[getStatus(date, statusList) + '_inactived']
              }
              style={{ width: size, height: size, alignSelf: 'center' }}
              resizeMethod="scale"
            />
          ) : null
        }
        onDayPress={() => {}}
      />
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
          <ButtonLink
            textStyle={{ textAlign: 'center', lineHeight: 30 }}
            onPress={() => {
              props.onDayPress(new Date())
            }}
          >
            {t('check it now')}
          </ButtonLink>
        </View>
      </View>
    </>
  )
}
