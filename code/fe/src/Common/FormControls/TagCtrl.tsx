import { TouchableOpacity, View, ColorValue, TextInput } from 'react-native';
import { FONTSIZE, TBL_ROW_HEIGHT } from '../../../theme/Constraints';
import { useTheme } from '../../../theme';
import { B } from '../../../libs/components';
import { BText as Text } from '../../../libs/components';
import { useRef, useState } from 'react';
import { useCommonStyle } from '../Styles';

import { useText } from '../Text';
import { ColorBottomModal } from '../Components/ColorBottomModal';
import { getLogger } from '..';
import { GoalBottomModal } from '../Components/GoalBottomModal';
import { debugStyle } from '../../../libs/components/debugStyle';

const logger = getLogger('Common_Components_ColorCtrl');
const rowHeight = TBL_ROW_HEIGHT;
export const TagCtrl = (props: {
  values?: string[]
  onChanged?: (tags: string[]) => void
}) => {
  const [tagList, setTagList] = useState([] as string[]);
  const style = useCommonStyle();
  const colors = useTheme();
  const text = useText();
  const inputRef=useRef<TextInput>();
  const [addRow, setAddRow] = useState(false);
  return (<View style={{ paddingBottom:10 }}>
    {/**header */}
    <View style={{ height: rowHeight, justifyContent: 'center', flexDirection: 'row', borderBottomColor: colors.outlineVariant, borderBottomWidth: 1 }}>
      <B.ICon
        size={FONTSIZE.NORMAL}
        name={'tag'}
        style={[style.icon_wrapper, { lineHeight: rowHeight, marginRight: 10 },
        ]}
      />
      <Text style={{ flex: 1, lineHeight: rowHeight }}>{text.tag || 'Tag'}</Text>
    </View>
    {/**body */}
    <View style={{ flexWrap: 'wrap', flexDirection: 'row', flex: 1,paddingTop:5,marginLeft:-5 }}>
      {tagList.length>0 && tagList.map((tag,index) => <TagItem key={index} text={tag} onChanged={val => props.onChanged(val ? [...props.values, tag] : props.values.filter(v => v != tag))} selected={props.values && props.values.indexOf(tag) > -1} />)}
      <View style={[{
        borderRadius: 15, paddingLeft: 15, paddingRight: 15, margin: 5, justifyContent: 'center',
        height: 30,
        borderColor: colors.outline,
        borderWidth:1

      },!addRow&&{ backgroundColor: colors.secondary, }]}>
        {addRow && <TextInput ref={inputRef} style={{ textAlign:'center', fontSize: FONTSIZE.SMALL }}
          onSubmitEditing={val=>{  setTagList([...tagList.filter(h=>h!=val.nativeEvent.text), val.nativeEvent.text]);setAddRow(false);}}
          placeholder={text.them || 'Thêm'} />}
        {!addRow && <TouchableOpacity style={{
          height: 30, justifyContent: 'center',
        }}
        onPress={() => {setAddRow(true);setTimeout(()=> inputRef.current.focus(),200);}}
        >
          <View style={{ flexDirection: 'row' }}>
            <B.ICon name="pluscircle" size={FONTSIZE.SMALL} style={{ color: 'white', marginRight: 3 }} />
            <Text size="small" style={{ color: 'white' }} >{text.them || 'Thêm'}</Text>
          </View>
        </TouchableOpacity>}

      </View>

    </View>
  </View>);
};

const TagItem = (props: { text: string, onChanged: (val: boolean) => void, selected: boolean }) => {
  const colors = useTheme();
  return   <View style={[{
    borderRadius: 15, paddingLeft: 15, paddingRight: 15, margin: 5, justifyContent: 'center',
    height: 30,
    borderColor: colors.outline,
    borderWidth:1
  },props.selected&&{ backgroundColor:colors.secondary }]}><Text>{props.text}</Text></View>;
};
