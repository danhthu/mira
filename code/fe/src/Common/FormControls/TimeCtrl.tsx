import { TouchableOpacity, View, ColorValue } from 'react-native';
import { FONTSIZE, TBL_ROW_HEIGHT } from '../../../theme/Constraints';
import { useTheme } from '../../../theme';
import { B } from '../../../libs/components';
import { useState } from 'react';
import { useCommonStyle } from '../Styles';

import { useText } from '../Text';
import { ColorBottomModal } from '../Components/ColorBottomModal';
import { getLogger } from '..';
import { GoalBottomModal } from '../Components/GoalBottomModal';

const logger = getLogger('Common_Components_ColorCtrl');
const rowHeight = TBL_ROW_HEIGHT;
export const TimeCtrl = (props: {
  value?: any
  onChanged?: (val: Date) => void
}) => {
  const text = useText();
  return <B.TextBox dataType="time"
    icon={'clockcircleo'}
    label={text.batdau || 'Chọn thời gian'}
    value={props.value} onChanged={props.onChanged} />;
};

