import moment from 'moment'
import { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { B, BText as Text } from '../../../libs/components'
import { useTheme } from '../../../theme'
import {
  FONTSIZE,
  MARGIN,
  PADDING,
  TBL_ROW_HEIGHT,
} from '../../../theme/Constraints'
import { ReminderBottomModal } from '../Components/ReminderBottomModal'
import { reminderOption } from '../Interfaces'
import { useCommonStyle } from '../Styles'
import { useText } from '../Text'

const rowHeight = TBL_ROW_HEIGHT
export const ReminderCtrl = (props: {
  // Cả 2 nơi gọi (Work/Screens/Add.tsx, Edit.tsx) đều truyền reminderOption, không có Date
  value?: reminderOption
  onChanged?: (val: reminderOption) => void
}) => {
  const style = useStyle()
  const text = useText()
  const colors = useTheme()
  const [showModal, setShowModal] = useState(false)
  return (
    <View style={[{ flexDirection: 'row' }]}>
      <View style={{ height: rowHeight, justifyContent: 'center' }}>
        <B.ICon
          size={FONTSIZE.NORMAL}
          name={'bells'}
          style={[
            style.icon_wrapper,
            { marginRight: 10, color: colors.error },
            //  props.value && { color: colors.primary }
          ]}
        />
      </View>
      <TouchableOpacity
        style={[style.full, { height: rowHeight, justifyContent: 'center' }]}
        onPress={() => setShowModal(true)}
      >
        {!props.value && <Text>{text.reminder || 'Nhắc tôi'}</Text>}
        {props.value && (
          <View>
            <Text style={{ color: colors.primary }}>
              {(text.reminder || 'Nhắc tôi') +
                moment(props.value.date).format(' HH:mm')}
            </Text>
            <Text size="small" style={{ color: colors.primary }}>
              {moment(props.value.date).format('dddd, DD MMMM')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      {props.value && (
        <TouchableOpacity
          style={[
            style.icon_wrapper,
            style.right,
            { height: rowHeight, width: 50, alignItems: 'flex-end' },
          ]}
          onPress={() => props.onChanged(null)}
        >
          <B.ICon
            style={[{ color: colors.error }]}
            size={FONTSIZE.NORMAL}
            name="close"
          />
        </TouchableOpacity>
      )}
      {showModal && (
        <ReminderBottomModal
          value={props.value}
          onDismiss={() => setShowModal(false)}
          onChanged={props.onChanged}
        />
      )}
    </View>
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
        bottom: 30,
        left: 10,
        right: 10,
        borderRadius: 10,
        padding: 30,
        backgroundColor: '#fff',
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

        padding: PADDING.SCREEN,
        paddingBottom: 5,
        paddingTop: 5,
        marginBottom: MARGIN.GROUP,
        marginTop: MARGIN.GROUP,
      },
      sectionTitle: {
        paddingLeft: PADDING.SCREEN,
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
