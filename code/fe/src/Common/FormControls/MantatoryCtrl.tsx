import { ReactNode } from 'react';
import { useTheme } from '../../../theme';
import { useText } from '../Text';
import { TouchableOpacity, View,StyleSheet } from 'react-native';
import { B } from '../../../libs/components';
import { FONT_WEIGHT, FONTSIZE, MARGIN, PADDING, TBL_ROW_HEIGHT } from '../../../theme/Constraints';
import { useCommonStyle } from '../Styles';
import { debugStyle } from '../../../libs/components/debugStyle';

const rowHeight=TBL_ROW_HEIGHT;
export  const MantatoryCtrl=(props:{value:boolean,onChanged:(val:boolean)=>void})=>{
  const text = useText();
  return <Row icon={props.value?'check':'sunny-outline'} text={text.lamtrongngay || 'Bắt buộc trong ngày'}
    showClose={false}
    onPress={()=>props.onChanged(!props.value)}
    selected={props.value}
  />;
};


const Row = (props: {
    icon,
    selected: boolean,
    text: ReactNode | string, showClose, onClose?: () => void, onPress: () => void
  }) => {
  const style = useStyle();
  const colors = useTheme();
  return (<View style={[{ flexDirection: 'row',  }]}>
    <View style={{ height: rowHeight, justifyContent: 'center' }}>
      <B.ICon
        size={FONTSIZE.NORMAL}
        name={props.icon}
        style={[style.icon_wrapper, { marginRight: 10 },
          props.selected && { color: colors.success }
        ]}
      />
    </View>
    <TouchableOpacity
      style={[
        style.full,
        { height: rowHeight, justifyContent: 'center' },

      ]}
      onPress={props.onPress}
    >
      {typeof (props.text) === 'string' ? <B.Text style={[props.selected && {  color: colors.primary }]}>{props.text}</B.Text> : props.text}
    </TouchableOpacity>
    { props.selected&&(
      <TouchableOpacity
        style={[
          style.icon_wrapper,
          style.right,
          { height: rowHeight, width: 50, alignItems: 'flex-end', },

        ]}
        onPress={props.onPress}
      >
        <B.ICon
          style={[{ color: colors.error }]}
          size={FONTSIZE.NORMAL}
          name="close"
        />
      </TouchableOpacity>
    )}
  </View>);
};

const useStyle = () => {
  const common = useCommonStyle();
  return {
    ...common,
    ...StyleSheet.create({
      section: {
        backgroundColor: '#ffffff',

        padding: PADDING.SCREEN,
        paddingBottom: 5,
        paddingTop: 5,
        marginBottom: MARGIN.GROUP,
        marginTop: MARGIN.GROUP,
      },
      sectionTitle: {
        paddingLeft: PADDING.SCREEN,
        fontWeight: '500',
        fontSize: FONTSIZE.NORMAL,
      },
      ic_left: {
        width: 30,
        alignItems: 'center',
      },
    }),
  };
};
