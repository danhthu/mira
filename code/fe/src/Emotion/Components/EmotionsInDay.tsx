import moment from 'moment'
import { Image, StyleProp, Text, View, ViewStyle } from 'react-native'
import {
  ROUND_NORMAL,
  ROUND_PADDING_NORMAL,
  SECOND_BLACK_COLOR,
} from '../../../theme/Constraints'
import { FONTSIZE } from '../../Common'
import iconifyAssets from '../Assets/iconifyAssets'
import { emotionCheck } from '../Entities'
import { useText } from '../Text'

export const EmotionsInDay = ({
  data = new emotionCheck(),
  style = null as StyleProp<ViewStyle>,
}) => {
  const t = useText().translate
  return (
    <View
      style={[
        {
          borderRadius: ROUND_NORMAL,
          backgroundColor: '#fff',
          padding: ROUND_PADDING_NORMAL,
          marginBottom: ROUND_NORMAL,
        },
        style,
      ]}
    >
      {!data && <View></View>}
      {data && (
        <View style={{ flexDirection: 'row' }}>
          <View
            style={{
              height: 70,
              width: 70,
              //   marginRight: 10,
              alignItems: 'center',
              justifyContent: 'flex-start',
              borderRightColor: '#ddd',
              paddingRight: 10,
              borderRightWidth: 1,
            }}
          >
            <Image
              source={iconifyAssets[data.status]}
              style={{ width: 40, height: 40, marginBottom: 10 }}
            />
            <View
              style={{
                height: 20,
                borderRadius: 5,
                backgroundColor: '#eee',
                paddingLeft: 5,
                paddingRight: 5,
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: FONTSIZE.SSSMALL,
                  color: SECOND_BLACK_COLOR,
                  fontWeight: '600',
                }}
              >
                {moment(new Date(data.created_date)).format('HH:mm')}
              </Text>
            </View>
          </View>
          <View
            style={[
              {
                flex: 1,
                justifyContent: 'flex-start',
                //height: 70,
                paddingLeft: 10,
              },
              // debugStyle,
            ]}
          >
            <Text
              style={{
                fontSize: FONTSIZE.NORMAL,
                fontWeight: '500',
              }}
            >
              {t(data.status)}
            </Text>
            <View
              style={
                {
                  //  backgroundColor: '#F5F5F5',
                  // padding: ROUND_SMALL,
                  // borderRadius: ROUND_SMALL,
                }
              }
            >
              <Text
                style={{
                  fontSize: FONTSIZE.SMALL,
                }}
              >
                {data.description}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
