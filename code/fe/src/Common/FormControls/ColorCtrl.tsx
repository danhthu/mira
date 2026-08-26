import { useState } from 'react';
import { ColorValue, StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { B } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { FONTSIZE, TBL_ROW_HEIGHT } from '../../../theme/Constraints';
import { useCommonStyle } from '../Styles';

import { ColorBottomModal } from '../Components/ColorBottomModal';
import { useText } from '../Text';


//const logger = getLogger('Common_Components_ColorCtrl')
const rowHeight = TBL_ROW_HEIGHT;
export const ColorCtrl = (props: {
  value?: ColorValue,
  style?: StyleProp<ViewStyle>
  onChanged?: (val: ColorValue) => void
}) => {
  props.value = props.value || '#CAE6B2';
  const style = useCommonStyle();
  const colors = useTheme();
  const text = useText();
  const [showModal, setShowModal] = useState(false);
  return (<View style={[{ flexDirection: 'row' }, props.style]}>
    <View style={{ height: rowHeight, justifyContent: 'center', marginRight: 10 }}>
      {!props.value && <B.ICon
        size={FONTSIZE.NORMAL}
        name={'color-palette-outline'}
        style={[style.icon_wrapper, {},

        ]}
      />}
      {props.value && <View style={{
        width: 16, height: 16, borderRadius: 3, borderWidth: 1,
        borderColor: colors.outlineVariant,
        backgroundColor: props.value || colors.primary,
      }}></View>}
    </View>
    <TouchableOpacity
      style={[
        style.full,
        { height: rowHeight, justifyContent: 'center' },
      ]}
      onPress={() => setShowModal(true)}
    >
      {!props.value && <B.Text>{text.chonmau || 'Chọn màu'}</B.Text>}
      {props.value && <B.Text style={{ color: colors.primary }}>{text.chonmau || 'Chọn màu'}</B.Text>}

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
    {showModal && <ColorBottomModal value={props.value} onDismiss={() => setShowModal(false)} onChanged={val => props.onChanged(val)} />}
  </View>);
};

