import moment from 'moment'
import { useEffect, useState } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { sortBy } from 'sort-by-typescript'
import { BICon } from '../../../libs/components'
import { FONTSIZE, HEADER_HEIGHT, SPACING } from '../../../theme/Constraints'
import { Header } from '../../Common/Components/Header'
import { useAsyncAction } from '../../Common/Hooks'
import { useCommonStyle } from '../../Common/Styles'
import { EmotionsInDay } from '../Components/EmotionsInDay'
import { emotionCheck, emotionTrackerRepository } from '../Entities'
import { useText } from '../Text'
const translate_date = (date) => {
  return moment(date).isSame(moment())
    ? 'Today'
    : moment(date).isBefore(moment().startOf('isoWeek')) &&
      moment(date).isAfter(moment().endOf('isoWeek'))
    ? moment(date).format('dddd')
    : moment(date).format('MMM, DD')
}
export const Detail = ({ route, navigation }) => {
  const commonStyle = useCommonStyle()
  const [showTitle, setShowTitle] = useState(false)
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false)
  const t = useText().translate
  const [data, setData] = useState([] as emotionCheck[])
  const [date, setDate] = useState(new Date())
  useAsyncAction(async () => {
    const _data = await emotionTrackerRepository.getEmotionsByDate(date)
    _data.sort(sortBy('-created_date'))
    setData(_data)
  }, [date])
  useEffect(() => {
    if (route.params.date) {
      setDate(new Date(route.params.date))
    }
  }, [route.params])
  return (
    <View style={[commonStyle.screen]}>
      <Header title={showTitle ? t('Detail') : ''} />
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity
          style={{ flexDirection: 'row', width: 120 }}
          onPress={() => setIsDatePickerVisible(true)}
        >
          <Text
            style={{
              fontWeight: 'bold',
              textAlign: 'right',
              height: 30,
              lineHeight: 30,
              marginRight: SPACING,
              flex: 1,
              fontSize: FONTSIZE.NORMAL,
            }}
          >
            {translate_date(date)}
          </Text>
          <BICon
            style={{
              fontWeight: 'bold',
              textAlign: 'right',
              height: 30,
              lineHeight: 30,
              marginRight: SPACING,
              fontSize: FONTSIZE.NORMAL,
            }}
            name="down"
          />
        </TouchableOpacity>
      </View>
      <FlatList
        style={{ marginTop: 20 }}
        onScroll={(evt) => {
          if (!showTitle && evt.nativeEvent.contentOffset.y > HEADER_HEIGHT) {
            setShowTitle(true)
          }
          if (showTitle && evt.nativeEvent.contentOffset.y < HEADER_HEIGHT) {
            setShowTitle(false)
          }
        }}
        data={data}
        renderItem={({ item, index }) => <EmotionsInDay data={item} />}
      ></FlatList>
      <DateTimePickerModal
        date={date}
        isVisible={isDatePickerVisible}
        mode={'date'}
        onConfirm={(v) => {
          setDate((prev) => v)
          setIsDatePickerVisible(false)
        }}
        onCancel={() => {
          setIsDatePickerVisible(false)
        }}
      />
    </View>
  )
}
