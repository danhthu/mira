import { View, TouchableWithoutFeedback, ViewStyle, TouchableOpacity, ColorValue } from 'react-native';
import { useCommonStyle } from '../Styles';
import React, {
} from 'react';

import { B, BICon } from '../../../libs/components';
import { useText } from '../Text';
import { FONTSIZE } from '../../../theme/Constraints';
import Modal from 'react-native-modal';
import { debugStyle } from '../../../libs/components/debugStyle';



const ColorFC = (
  props: {
    value: ColorValue
    onChanged: (val: ColorValue) => void
    onDismiss?: () => void
  }) => {
  props.value = props.value || '#CAE6B2';
  props.onDismiss = props.onDismiss || function () { };
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
        <B.Text style={[{ textAlign: 'center' }]}>{text.chonmau || 'Chọn màu sắc'}</B.Text>
        <View>
          <View style={[{ flexDirection: 'row',height:100,marginTop:20,paddingTop:20,paddingBottom:20 }]}>
            <ColorCircleItem style={{ flex: 1 }} value={'#CAE6B2'} onSelected={props.onChanged} selected={props.value == '#CAE6B2'} />
            <ColorCircleItem style={{ flex: 1 }} value={'#F6FAB9'} onSelected={props.onChanged} selected={props.value == '#F6FAB9'} />
            <ColorCircleItem style={{ flex: 1 }} value={'#D2649A'} onSelected={props.onChanged} selected={props.value == '#D2649A'} />
            <ColorCircleItem style={{ flex: 1 }} value={'#8E3E63'} onSelected={props.onChanged} selected={props.value == '#8E3E63'} />
            <ColorCircleItem style={{ flex: 1 }} value={'#C7B7A3'} onSelected={props.onChanged} selected={props.value == '#C7B7A3'} />
          </View>
        </View>
      </View>
    </Modal>
  );

};

const ColorCircleItem = (props: { style?: ViewStyle, value: ColorValue, selected?: boolean, onSelected: (val) => void }) => {
  return <View style={[props.style, { alignItems: 'center' }]}>
    <TouchableOpacity onPress={() => props.onSelected(props.value)} style={[props.style, {
    }]}>
      <View style={{
        width: 50, height: 50
        , borderColor: '#ddd',
        backgroundColor: props.value || 'green',
        borderRadius: 25, borderWidth: 2,
        justifyContent: 'center', alignItems: 'center',

      }}>{props.selected && <BICon name='check' style={{ fontSize: FONTSIZE.NORMAL, color: '#fff' }} />}</View>
    </TouchableOpacity>
  </View>;
};


export const ColorBottomModal = React.memo(ColorFC);
