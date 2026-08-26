import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../../theme';
import { TouchableOpacity } from 'react-native';
import { B } from '../../../libs/components';
import { useCommonStyle } from '../Styles';
import { debugStyle } from '../../../libs/components/debugStyle';
// 5  - 2 ==> 3;  1/5 ==> 20*index
export const SegmentPercentage = (props: {
  value: number
  segment: number
  onChanged: (val: number) => void
}) => {
  const colors = useTheme();
  const style = useStyle();
  return (
    <View style={{ flexDirection: 'row' }}>

      <View style={[{ flex: 1 },{ height:4 },style.segment_inactive,props.value>0&&style.segment_active]}>
        <TouchableOpacity
          style={[
            style.segment_btn,
            { left: -2 },
            (!props.value || props.value > 0) && style.segment_btn_actived,
          ]}
          onPress={() => props.onChanged(0)}
        ></TouchableOpacity>
      </View>
      {[...Array(props.segment - 2).keys()].map((val, index) => (
        <View key={index} style={[{ flex: 1 },{ height:4 },style.segment_inactive, props.value > (100 * (val + 1)) / (props.segment || 1)&&style.segment_active]}>
          <TouchableOpacity
            style={[
              style.segment_btn,
              { left: -10 },
              props.value >= (100 * (val + 1)) / (props.segment || 1) &&
                style.segment_btn_actived,
            ]}
            onPress={() =>{
              props.onChanged((100 * (val + 1)) / (props.segment || 1));
            }

            }
          ></TouchableOpacity>
          <B.Text style={[style.segment_text,{ fontSize:12, }]} size='small'>
            {Math.round((100 * (val + 1)) / (props.segment || 1))}%
          </B.Text>
          {val == props.segment - 2 - 1 && (
            <>
              <TouchableOpacity
                style={[
                  style.segment_btn,
                  { right: -10, zIndex:1000 },
                  props.value == (100 * (val + 2)) / (props.segment || 1) &&
                    style.segment_btn_actived,
                ]}
                onPress={() =>
                  props.onChanged((100 * (val + 2)) / (props.segment || 1))
                }
              >
              </TouchableOpacity>
              <B.Text  style={[style.segment_text, { fontSize:12, left:'auto',right:-30 }]}>
                {Math.round((100 * (val + 2)) / (props.segment || 1))}%
              </B.Text>
            </>
          )}
        </View>
      ))}
      <View style={[{ flex: 1 , zIndex:-1 },{ height:4 },style.segment_inactive, props.value==100&&style.segment_active]}>

      </View>
      <TouchableOpacity
        style={[
          style.segment_btn,
          { right: -2,zIndex:1000 },
          props.value == 100 && style.segment_btn_actived,
        ]}
        onPress={() => props.onChanged(100)}
      ></TouchableOpacity>
    </View>
  );
};

const useStyle = () => {
  const colors = useTheme();
  return {
    ...useCommonStyle(),
    ...StyleSheet.create({
      segment_inactive:{
        backgroundColor:'gray',
        borderColor:'gray'
      },
      segment_active:{
        backgroundColor:colors.primary,
      },
      segment_btn: {
        position: 'absolute',
        backgroundColor: '#fff',
        width: 20,
        height: 20,
        borderRadius: 10,
        top: -8,
        borderColor: 'gray',
        borderWidth: 2,
      },
      segment_btn_actived: {
        borderColor: colors.primary,
      },
      segment_text: {
        position: 'absolute',
        top: -25,
        left: -30,
        width: 60,
        textAlign: 'center',
      },
    }),
  };
};
