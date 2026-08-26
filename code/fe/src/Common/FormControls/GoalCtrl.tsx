import { TouchableOpacity, View, ColorValue } from 'react-native';
import { FONTSIZE } from '../../../theme/Constraints';
import { useTheme } from '../../../theme';
import { B } from '../../../libs/components';
import { useState } from 'react';
import { useCommonStyle } from '../Styles';

import { useText } from '../Text';
import { ColorBottomModal } from '../Components/ColorBottomModal';
import { getLogger } from '..';
import { GoalBottomModal } from '../Components/GoalBottomModal';
import { goalOption } from '../Interfaces';

const logger = getLogger('Common_Components_ColorCtrl');
const rowHeight = 50;
export const GoalCtrl = (props: {
  value?: goalOption
  onChanged?: (val: goalOption) => void
}) => {

  const style = useCommonStyle();
  const colors = useTheme();
  const text = useText();
  const [showModal, setShowModal] = useState(false);
  return (<View style={[{ flexDirection: 'row' }]}>
    <View style={{ height: rowHeight, justifyContent: 'center' }}>
      <B.ICon
        size={FONTSIZE.NORMAL}
        name={'target'}
        style={[style.icon_wrapper, { marginRight: 10 },
          props.value && { color: colors.primary }
        ]}
      />
    </View>
    <TouchableOpacity
      style={[
        style.full,
        { height: rowHeight, justifyContent: 'center' },
      ]}
      onPress={() => setShowModal(true)}
    >
      {!props.value && <B.Text style={{ fontWeight: '500' }}>{text.goal || 'Goal'}</B.Text>}
      {!props.value && <B.Text style={{ fontSize: FONTSIZE.SMALL }}>{text.setagoal || 'Set a goal'}</B.Text>}
      {props.value && <B.Text style={{ color: colors.primary }}>{props.value.total + ' ' + props.value.unit + ' ' + (text.perday || 'per day')}</B.Text>}
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
          style={[{ color: colors.primary }]}
          size={FONTSIZE.NORMAL}
          name="close"
        />
      </TouchableOpacity>
    )}
    {showModal && <GoalBottomModal value={props.value} onDismiss={() => setShowModal(false)} onChanged={props.onChanged} />}
  </View>);
};

