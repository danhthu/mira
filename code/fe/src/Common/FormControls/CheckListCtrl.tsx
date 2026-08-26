import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { B } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { FONTSIZE, TBL_ROW_HEIGHT } from '../../../theme/Constraints';
import { useCommonStyle } from '../Styles';

import { getLogger } from '..';
import { useText } from '../Text';

const logger = getLogger('Common_Components_ColorCtrl');
const rowHeight = TBL_ROW_HEIGHT;
export const CheckListCtrl = (props: {
  value?: string[]
  onChanged?: (val: string) => void
}) => {

  const style = useCommonStyle();
  const colors = useTheme();
  const text = useText();
  const [newRow, setNewRow] = useState(false);
  return (<View>
    <View style={[{ flexDirection: 'row' }, (props.value && props.value.length > 0 || newRow) && { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }]}>
      <View style={{ height: rowHeight, justifyContent: 'center' }}>
        <B.ICon
          size={FONTSIZE.NORMAL}
          name={'color-palette-outline'}
          style={[style.icon_wrapper, { marginRight: 10 },
            props.value && { color: colors.primary }
          ]}
        />
      </View>
      <View
        style={[
          style.full,
          { height: rowHeight, justifyContent: 'center' },
        ]}
      >  <B.Text>{text.checklistDesc || 'A list of things to be checked or done'}</B.Text>
      </View>
      <TouchableOpacity
        style={[
          style.icon_wrapper,
          style.right,
          { height: rowHeight, width: 50, alignItems: 'center' },
        ]}
        onPress={() => props.onChanged(null)}
      >
        <B.ICon
          style={[{ color: colors.primary }]}
          size={FONTSIZE.NORMAL}
          name="pluscircleo"
        />
      </TouchableOpacity>
    </View>
    {props.value && props.value.map((v, index) => <View key={index}>

    </View>)}
    {newRow && <View>

    </View>}
  </View>);
};

