import { View, TouchableWithoutFeedback } from 'react-native';
import { useCommonStyle } from '../Styles';
import React, {

} from 'react';

import { B } from '../../../libs/components';
import { useText } from '../Text';
import { goalOption } from '../Interfaces';
import { Picker } from '@react-native-picker/picker';
import { debugStyle } from '../../../libs/components/debugStyle';
import Modal from 'react-native-modal';



const GoalFC = (
  props: {
    value: goalOption
    onChanged: (val:goalOption) => void
    onDismiss: () => void
  }) => {
  const text = useText();
  const style = useCommonStyle();
  return (
    <Modal isVisible
      animationIn="slideInUp"
      animationOut="slideOutDown"
      onModalHide={props.onDismiss}
      onBackdropPress={props.onDismiss}
      style={{ justifyContent: 'flex-end', flex: 1, }}
    >
      <View style={[{ backgroundColor: '#fff', borderRadius: 15, padding: 15 }]}>
        <View >
          <B.Text style={{ textAlign: 'center', marginBottom: 10 }}>{text.setagoal || 'Set a goal'}</B.Text>
          <View style={[{ flexDirection: 'row', paddingTop: 10, paddingBottom: 20 }]}>
            <Picker style={[{ flex:1 }]} selectedValue={ props.value? props.value.total:1} onValueChange={val=>props.onChanged({ ...props.value,total:val })}>
              {[...Array(1000).keys()].map((val, index) => (
                <Picker.Item
                  key={index}
                  label={val < 10 ? '0' + val : '' + val}
                  value={val}
                />
              ))}
            </Picker>
            <Picker style={{ flex:1 }} selectedValue={props.value? props.value.unit:'times'} onValueChange={val=>props.onChanged({ ...props.value,unit:val })}>
              <Picker.Item label={text.mins || 'mins'} value={'mins'} />
              <Picker.Item label={text.times || 'times'} value={'times'} />
              <Picker.Item label={text.glasses || 'glasses'} value={'glasses'} />
              <Picker.Item label={text.pages || 'pages'} value={'pages'} />
              <Picker.Item label={text.oz || 'oz'} value={'oz'} />
              <Picker.Item label={text.ml || 'ml'} value={'ml'} />
              <Picker.Item label={text.miles || 'miles'} value={'miles'} />
              <Picker.Item label={text.km || 'km'} value={'km'} />
              <Picker.Item label={text.m || 'm'} value={'m'} />
            </Picker>
          </View>
        </View>
      </View>
    </Modal>
  );

};


export const GoalBottomModal = React.memo(GoalFC);
