import moment from 'moment'
import { useState } from 'react'
import {
  Dimensions,
  ScrollView,
  SectionList,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native'
import {
  FONTSIZE,
  HEADER_HEIGHT,
  MARGIN_SECTION,
  ROUND_NORMAL,
} from '../../../../theme/Constraints'
import { Header } from '../../../Common/Components/Header'
import { useAsyncAction } from '../../../Common/Hooks'
import { useCommonStyle } from '../../../Common/Styles'
import { ButtonSwitcher } from '../../../Controls/Buttons'
import { EmotionsInDay } from '../../Components/EmotionsInDay'
import { emotionCheck, emotionTrackerRepository } from '../../Entities'
import { useText } from '../../Text'
import { DayView } from './DayView'
import { MonthView } from './MonthView'
import { StatisticBar } from './StatisticBar'
import { WeekView } from './WeekView'
import { YearView } from './YearView'

export const Home = () => {
  const commonStyle = useCommonStyle().screen
  const t = useText().translate
  const [showTitle, setShowTitle] = useState(false)
  const [mode, setMode] = useState(0) //0:dashboard, 1: list
  const onScroll = (evt) => {
    if (!showTitle && evt.nativeEvent.contentOffset.y > HEADER_HEIGHT) {
      setShowTitle(true)
    }
    if (showTitle && evt.nativeEvent.contentOffset.y < HEADER_HEIGHT) {
      setShowTitle(false)
    }
  }
  return (
    <View style={[commonStyle]}>
      <Header
        title={showTitle ? t('Mood pulse') : null}
        right={
          <ButtonSwitcher
            activeIndex={mode}
            icons={['dashboard', 'list-alt']}
            style={[{ width: 50, height: HEADER_HEIGHT }]}
            iconStyle={[
              {
                fontSize: FONTSIZE.PAGE_HEADER_TITLE,
              },
            ]}
            onPress={(index) => setMode(index)}
          />
        }
      />
      {mode == 0 && (
        <ScrollView onScroll={onScroll} showsVerticalScrollIndicator={false}>
          {!showTitle && (
            <Text
              style={[
                {
                  fontSize: FONTSIZE.PAGE_TITLE,
                },
              ]}
            >
              {t('Mood pulse')}
            </Text>
          )}
          <DayView style={{ marginTop: 20 }} />
          <SectionWeekMonth
            style={{ marginBottom: MARGIN_SECTION, marginTop: MARGIN_SECTION }}
          />
          <StatisticBar style={{ marginBottom: MARGIN_SECTION }} />
          <YearView style={[{ marginBottom: 70 }]} />
        </ScrollView>
      )}
      {mode == 1 && (
        <View>
          {!showTitle && (
            <Text
              style={[
                {
                  fontSize: FONTSIZE.PAGE_TITLE,
                },
              ]}
            >
              {t('Mood Pulse')}
            </Text>
          )}
          <ViewList onScroll={onScroll} />
        </View>
      )}
    </View>
  )
}
const translate_date = (date) => {
  return moment(date).isSame(moment().startOf('day'), 'day')
    ? 'Today'
    : moment(date).isBefore(moment().startOf('isoWeek')) &&
      moment(date).isAfter(moment().endOf('isoWeek'))
    ? moment(date).format('dddd DD MM')
    : moment(date).format('MMM DD')
}

const ViewList = (props: { onScroll }) => {
  const [data, setData] = useState([] as Array<{ title; data: emotionCheck[] }>)
  const [mode, setMode] = useState()
  useAsyncAction(async () => {
    const _data = await emotionTrackerRepository.groupsByDate()
    const sections = Object.keys(_data).map((key) => ({
      title: translate_date(moment(key).toDate()),
      data: _data[key],
    }))
    setData(sections)
  }, [])
  return (
    <View>
      {/**tab index */}
      {/**filter by index */}
      <SectionList
        sections={data}
        stickySectionHeadersEnabled={false}
        keyExtractor={(item, index) => item.id + index} // Sử dụng một thuộc tính duy nhất làm key
        onScroll={props.onScroll}
        renderItem={({ item, index }) => (
          <EmotionsInDay data={item} style={{ marginBottom: 10 }} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View>
            <Text
              style={{
                fontSize: FONTSIZE.NORMAL,
                fontWeight: 'bold',
                lineHeight: 40,
                height: 40,
              }}
            >
              {title}
            </Text>
          </View>
        )}
      ></SectionList>
    </View>
  )
}

const SectionWeekMonth = (props: { style?: StyleProp<ViewStyle> }) => {
  const [activedIndex, setActivedIndex] = useState(0)
  const t = useText().translate
  const width = Dimensions.get('window').width
  return (
    <ScrollView
      horizontal
      style={[props.style]}
      showsHorizontalScrollIndicator={false}
    >
      <View style={{ flexDirection: 'row' }}>
        <View
          style={[
            { width: width - 50, marginRight: 8 },
            {
              borderRadius: ROUND_NORMAL,
              padding: ROUND_NORMAL,
              backgroundColor: '#fff',
            },
          ]}
        >
          <WeekView />
        </View>
        <View
          style={[
            { width: width - 50 },
            {
              borderRadius: ROUND_NORMAL,
              padding: ROUND_NORMAL,
              backgroundColor: '#fff',
            },
          ]}
        >
          <MonthView />
        </View>
      </View>
    </ScrollView>
  )
}
