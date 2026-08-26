import { View, Text, StyleProp, ViewStyle } from "react-native"
import { FontICon } from "./Icon"
import { useText } from "../../lang"
import { Grid, Col } from "react-native-easy-grid"
import { Divider, IconButton } from "react-native-paper"
import { useRef, useState } from "react"
import { checkListOption } from "../../common/interface"
import { TextInput as NativeTextInput } from 'react-native'
import { BCard, CaptionRow } from "./Card"
export interface BCheckListProp {
  data?: checkListOption,
  dispatch?: (newData: checkListOption) => void,
  style?: StyleProp<ViewStyle>
}
export const BCheckList = (props: BCheckListProp) => {
  const text = useText().checkList
  const [newRow, setNewRow] = useState(false)
  return (<BCard>
    <CaptionRow {...props} title={text.title} subTitle={text.subTitle} iconLeft="list-alt" iconRight={() => <IconButton icon={props => (<FontICon name={!newRow ? 'pluscircleo' : 'minuscircleo'} size={props.size} color={props.color} />)}
      onPress={() => { setNewRow(!newRow) }} style={{ alignItems: 'flex-end', justifyContent: 'center' }} />}></CaptionRow>
    <Body newRow={newRow} {...props}/>
  </BCard>)
}
interface BodyProp extends BCheckListProp {
  newRow?: boolean
}
const Body = (props: BodyProp) => {
  const textRef = useRef<NativeTextInput>()
  const { dispatch } = props
  const data = { ...{ data: [], ...props.data } }.data;
  const newRow = props.newRow
  const [newRowText, setNewRowText] = useState('')
  const submit = (val) => {
    {
      data.push({ text: newRowText }); dispatch({ data })
      setNewRowText('')
      setTimeout(() => {
        textRef.current.focus()
      }, 100)

    }
  }
  return (<View>

    {data.length > 0 ||newRow ? <Divider style={{ margin:5 }}></Divider> : null}
    {data.map((item, index) => (<View key={index} style={{ marginLeft: 5 }}>
      <Grid style={{ height: 40 }}>
        <Col style={{ height: 40, justifyContent: 'center' }}><Text>{item.text}</Text></Col>
        <Col style={{ height: 40, width: 50, justifyContent: 'center', alignItems: 'flex-end', flex: null }}>
          <IconButton icon={props => (<FontICon name='minuscircleo' size={props.size} color={props.color} />)}
            onPress={() => { data.splice(data.indexOf(item), 1); dispatch({ data }) }} style={{ alignItems: 'flex-end', borderRadius: 3, height: 30, justifyContent: 'center' }} />
        </Col>
      </Grid>
    </View>))}
    {newRow ? (<View style={{ flex: 1 }}>
      <Grid >
        <Col style={{ flex: 1 }}>

          <NativeTextInput ref={textRef} autoFocus={true} onChangeText={val => setNewRowText(val)} value={newRowText} onSubmitEditing={submit} style={{ height: 30, flex: null, paddingLeft: 10, borderBottomColor: 'gray', borderBottomWidth: 1 }}></NativeTextInput>
        </Col>
        <Col style={{ height: 40, width: 50, justifyContent: 'center', }}>

        </Col>

      </Grid>

    </View>) : null}
  </View>)
}


