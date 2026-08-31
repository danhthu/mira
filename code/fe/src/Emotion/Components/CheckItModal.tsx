import React, { useState } from 'react'
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import Modal from 'react-native-modal'
import { BICon } from '../../../libs/components'
import { ButtonV2 } from '../../../libs/components/Buttons'
import { useTheme } from '../../../theme'
import {
  FONT_WEIGHT,
  HEADER_HEIGHT,
  TBL_ROW_HEIGHT,
} from '../../../theme/Constraints'
import { BORDER_ROUND, FONTSIZE } from '../../Common'
import { Divider } from '../../Common/Components/Divider'
import { useAsyncAction } from '../../Common/Hooks'
import iconifyAssets from '../Assets/iconifyAssets'
import { emotionCheck, emotionTrackerRepository } from '../Entities'
import { emotionList, EmotionStatus } from '../Entities/types'
import { useText } from '../Text'

export const MoodTrackerView = (props: {
  day?: Date
  onDismiss?: () => void
  showRight?: boolean
  showComment?: boolean
}) => {
  const text = useText()
  const colors = useTheme()
  const [status, setStatus] = useState(null)
  const [desc, setDesc] = useState(null)

  useAsyncAction(async () => {
    setStatus(await emotionTrackerRepository.getStatusByDate(props.day))
  }, [props.day])
  const displayStatusDate = (date) => {
    return text.how_are_you_feeling || 'How are you feeling'
  }

  return (
    <View
      style={[
        {
          backgroundColor: '#fff',
          borderRadius: BORDER_ROUND.NORMAL,
          padding: 15,
          paddingTop: 5,
        },
      ]}
    >
      <View style={{ flexDirection: 'row' }}>
        <Text
          style={{
            flex: 1,
            lineHeight: HEADER_HEIGHT,
            fontWeight: FONT_WEIGHT.SEMIBOLD,
            fontSize: FONTSIZE.NORMAL,
          }}
        >
          {displayStatusDate(props.day || new Date())}
        </Text>
      </View>
      <Divider />
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        {emotionList.map((val, index) => (
          <TouchableOpacity
            key={index}
            onPress={async () => {
              setStatus(val)
            }}
            style={{ flex: 1, alignItems: 'center' }}
          >
            <View>
              <Image
                source={iconifyAssets[val]}
                style={[{ width: 50, height: 50 }]}
              />
              <BICon
                name="check-circle"
                style={[
                  {
                    position: 'absolute',
                    bottom: 0,
                    right: -14,
                    fontSize: FONTSIZE.NORMAL,
                    display: 'none',
                  },
                  (status == val || (!status && index == 2)) && {
                    color: colors.success,
                    display: 'flex',
                  },
                ]}
              />
            </View>
            <Text style={{ textAlign: 'center', lineHeight: TBL_ROW_HEIGHT }}>
              {val}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <AutoExpandingTextInput
        value={desc}
        onTextChanged={(val) => setDesc(val)}
      />
      <ButtonV2
        text={text.done || 'Done'}
        type="link"
        customStyles={{ width: 100, alignSelf: 'center' }}
        onPress={async () => {
          await emotionTrackerRepository.addOrUpdate({
            ...new emotionCheck(),
            status: status || (emotionList[2] as EmotionStatus),
            day: props.day,
            description: desc,
          })
          props.onDismiss && props.onDismiss()
        }}
      />
    </View>
  )
}

const AutoExpandingTextInput = (props: {
  value?: string
  onTextChanged?: (text) => void
}) => {
  const [inputHeight, setInputHeight] = useState(40) // Chiều cao ban đầu

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.textInput, { height: Math.max(40, inputHeight) }]} // Điều chỉnh chiều cao tối thiểu
        multiline={true}
        placeholder="Write something ..."
        placeholderTextColor="gray"
        onContentSizeChange={(event) => {
          setInputHeight(event.nativeEvent.contentSize.height + 20) // Cập nhật chiều cao dựa trên nội dung
        }}
        value={props.value}
        onChangeText={props.onTextChanged}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  textInput: {
    width: '100%',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    //borderRadius: 5,
    padding: 10,
    fontSize: FONTSIZE.NORMAL,
  },
})

export const CheckItModal = (props: {
  day?: Date
  onDismiss?: () => void
  visible?: boolean
}) => {
  return (
    <Modal
      isVisible={props.visible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      onModalHide={props.onDismiss}
      onBackdropPress={props.onDismiss}
      style={{
        justifyContent: 'flex-end',
        flex: 1,
        margin: 0,
        pointerEvents: 'auto',
      }}
      avoidKeyboard
    >
      <MoodTrackerView
        day={props.day}
        onDismiss={props.onDismiss}
        showComment
        showRight
      />
    </Modal>
  )
}
