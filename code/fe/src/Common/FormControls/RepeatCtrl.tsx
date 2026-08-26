import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { FONTSIZE, MARGIN, PADDING, TBL_ROW_HEIGHT } from '../../../theme/Constraints';
import { repeatOption } from '../Interfaces';
import { useTheme } from '../../../theme';
import { B } from '../../../libs/components';
import { useState } from 'react';
import { useCommonStyle } from '../Styles';
import { RepeatBottomModal } from '../Components/RepeatBottomModal';
import { useText } from '../Text';


const rowHeight = TBL_ROW_HEIGHT;
export const RepeatCtrl = (props: {
  value?: repeatOption
  onChanged?: (val: repeatOption) => void
}) => {
  const style = useStyle();
  const colors = useTheme();
  const text = useText();
  const repeatTitle = !props.value ? 'Lặp lại' :
    props.value.kind == 'daily'
      ? 'Hàng ngày'
      : props.value.kind == 'monthly'
        ? 'Hàng tháng'
        : 'Hàng tuần';
  const repeatBody = !props.value ? 'Thiết lặp chu kỳ' :
    props.value.kind == 'daily'
      ? ''
      : props.value.kind == 'monthly' && props.value.days.length == 0
        ? ''
        : props.value.kind == 'weekly' ? props.value.dayOfWeek.map(v =>text&&text.Common.common.daysOfWeekShort[v]).join(' , ')
          : props.value.days.join(' , ');


  const [showModal, setShowModal] = useState(false);
  return (<View style={[{ flexDirection: 'row' }]}>
    <View style={{ height: rowHeight, justifyContent: 'center' }}>
      <B.ICon
        size={FONTSIZE.NORMAL}
        name={'repeat-outline'}
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
      {!props.value && <B.Text>{text.laplai || 'Lặp lại'}</B.Text>}
      {props.value && <View>
        <B.Text style={props.value && { color: colors.primary }}>{repeatTitle}</B.Text>
        {repeatBody && <B.Text size="small" style={props.value && { color: colors.primary }}>
          {repeatBody}
        </B.Text>
        }
      </View>
      }
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
    {showModal && <RepeatBottomModal value={props.value} onDismiss={() => setShowModal(false)} onChanged={val => {

      props.onChanged(val);
      setShowModal(false);
    }} />}
  </View>);
};


const useStyle = () => {
  const common = useCommonStyle();
  const colors = useTheme();
  return {
    ...common,
    modal: StyleSheet.create({
      container: {
        margin: 0,

        alignSelf: 'flex-end',
      },
      modalContent: {
        //  alignSelf:'flex-end'
        position: 'absolute',
        bottom: 30,
        left: 10,
        right: 10,
        borderRadius: 10,
        padding: 30,
        backgroundColor: '#fff'
      },
      modalOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,


        backgroundColor: 'rgba(0,0,0,0.3)'
      },
    }),
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
      screen: {
        backgroundColor: colors.background
      },
      sectionContainer: {
        //marginTop: 15,
        marginBottom: 15,
        //paddingLeft: 20,
        backgroundColor: colors.surface
      },
      label: {
        height: 30,
        justifyContent: 'center',
        fontWeight: 'bold',
        textTransform: 'capitalize',
        marginTop: 15,
      },

    }),
  };
};