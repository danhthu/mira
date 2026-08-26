import {
  View,
  Text,
  StyleProp,
  ViewStyle,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { tagOption } from '../../common/interface'
import { Button, Divider, Surface, Switch } from 'react-native-paper'
import { FONTSIZE, ICONSIZE, PADDING } from '../../src/Common'
import { useTheme } from '../../theme'
import { useText } from '../../lang'
import { Grid, Col, Row } from 'react-native-easy-grid'
import { ICON_LIST, FontICon } from './Icon'
import { useRef, useState } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { BCard, CaptionRow } from './Card'
import { debugStyle } from './debugStyle'


export interface BLinkToChallengeProp {
  data?:any
  dispatch?: (newData: tagOption) => void
  style?: StyleProp<ViewStyle>
}


export const BLinkToChallenge = (props: BLinkToChallengeProp) => {
  const text = useText()
  const data = { ...{ data: [], ...props.data } }
  const dispatch = (val) => {
    console.log(data, val)
    props.dispatch && props.dispatch({ ...data, ...val })
  }
  return (
    <BCard>
      {/**title */}
      <CaptionRow
        title={text.tag.title}
        subTitle={text.tag.subTitle}
        iconLeft={'tag'}
        iconRight={() => <View></View>}
      />
      <Body {...{ ...props, data, dispatch }} />
    </BCard>
  )
}



const Body = (props: BLinkToChallengeProp) => {
  const text = useText()
  const theme = useTheme()
  const data = props.data
  const dispatch = props.dispatch
  const [addRow, setAddRow] = useState(false)
  const [valText, setValText] = useState('')
  return (
    <View>
      {data.data && data.data.length > 0 || addRow ? (<Divider style={{ margin: 5 }}></Divider>) : null}
      <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
        {data.data &&
          data.data.map((s, i) => (
            <TouchableOpacity
              onPress={() => {
                data.data.filter(
                  (ss) => ss.text == s.text,
                )[0].selected = !s.selected
                dispatch({
                  data: data.data,
                })
              }}
              key={i}
              style={[
                {
                  backgroundColor: s.selected ? theme.primary : theme.tertiary,
                  borderColor: theme.outline,
                  justifyContent: 'center',
                  borderRadius: 10,
                  paddingLeft: 10,
                  paddingRight: 10,
                  borderWidth: 1,
                  marginRight: 10,
                  marginBottom: 10,
                  marginTop: 10,
                },
              ]}
            >
              <Text
                style={[
                  {
                    color: s.selected ? theme.onPrimary : theme.onTertiary,
                    fontSize: FONTSIZE.SMALLER,
                    textAlign: 'center',
                  },
                ]}
              >
                {s.text}
              </Text>
            </TouchableOpacity>
          ))}
        {addRow ? (
          <View
            style={[
              {
                backgroundColor: theme.primary,
                borderColor: theme.outline,
                justifyContent: 'center',
                borderRadius: 10,
                paddingLeft: 10,
                paddingRight: 10,
                borderWidth: 1,
                marginRight: 10,
                marginBottom: 10,
                marginTop: 10,
                height:27,

              },
              debugStyle,
            ]}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{  }}
            >
              <TextInput
                key={'textInput'}
                autoFocus={true}
                style={{ color: theme.onPrimary,flex:null }}
                value={valText}
                onChangeText={(e) => setValText(e)}
                onSubmitEditing={() => {
                  dispatch({
                    data: [...data.data, { text: valText, selected: true }],
                  })
                  setValText('')
                  setAddRow(false)
                }}
              ></TextInput>
            </KeyboardAvoidingView>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => {
              setAddRow(true)
            }}
            style={[
              {
                backgroundColor: theme.primary,
                borderColor: theme.outline,
                justifyContent: 'center',
                borderRadius: 10,
                paddingLeft: 10,
                paddingRight: 10,
                borderWidth: 1,
                marginRight: 10,
                marginBottom: 10,
                marginTop: 10,
                height:28
              },
              debugStyle,
            ]}

          >
            <Text  style={{ color: theme.onPrimary }}>{text.common.addNew}</Text>

          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}
