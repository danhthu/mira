import { StyleProp, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import { PercentageCircle } from '../../../libs/components/PercentageCircle';
import { FONT_WEIGHT, FONT_SIZE } from '../../../theme/Constraints';
import { GoalAwatar } from './GoalAwatar';
import { Goal } from '../Entities';
import { B, BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { useText } from '../Text';
import { Loading } from '../../Common/Components/Loading';
import { Router } from '../../../Router';
import { useNavigation } from '@react-navigation/native';
import { debugStyle } from '../../../libs/components/debugStyle';

export declare type GoalDataType = { percentage: number, total: number } & Goal
export const RowItem = (props: { Goal: GoalDataType, touchToDetail?: boolean, style?:StyleProp<ViewStyle> }) => {
  const { Goal } = props;
  const colors = useTheme();
  const text = useText();
  const navigation = useNavigation();
  const style = StyleSheet.create({
    item_container: { padding: 15, borderRadius: 15, backgroundColor: '#fff' },
    item_left: {},
    item_left_image: {},
  });
  const onItemClick = () => {
    Router.Open(navigation, 'GoalrApp', { screen: 'Detail', id: Goal.id });
  };
  if (!props.Goal) return <Loading />;
  return (<TouchableWithoutFeedback onPress={props.touchToDetail && onItemClick} style={[style.item_container,debugStyle]}>
    <View style={[{ backgroundColor:'#fff', borderColor:colors.outline,borderWidth:1, borderRadius:20,padding:20,marginBottom:20 },props.style]}>
      <View style={{ flexDirection: 'row', borderBottomColor:colors.outline,borderBottomWidth:1,paddingBottom:10 }}>
        <GoalAwatar src={Goal.icon} size={80} style={[style.item_left, { borderRadius: 15, backgroundColor: colors.secondary },]} />
        <View style={{ flex: 1, paddingLeft: 20, height: 80, justifyContent: 'center' }}>
          <View>
            <Text style={{ fontWeight: FONT_WEIGHT.SEMIBOLD, fontSize: FONT_SIZE.PageTitle }}>{Goal.name}</Text>
          </View>
        </View>
        {props.touchToDetail&&<B.ICon name="right" style={{ fontSize:FONT_SIZE.ICon,fontWeight:FONT_WEIGHT.THIN }} />}
      </View>
      <View style={[{ justifyContent: 'center', flexDirection: 'row', marginTop: 5 }]}>
        <View style={[{ flexDirection: 'row', flex: 1 },]}>
          <View style={{ height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <PercentageCircle
              radius={15}
              percent={Goal.percentage}
              color={
                Goal.percentage > 80
                  ? colors.success
                  : Goal.percentage > 55
                    ? colors.warning
                    : colors.error
              }
              borderWidth={4}
              //  percentage={Goal.percentage||20}
            >
              <Text></Text>
            </PercentageCircle>
          </View>
          <Text style={{ marginLeft: 10, lineHeight: 40 }}>
            {Goal.percentage || '--'}{Goal.percentage ? '%' : ''} {text.completed || 'Completed'}
          </Text>
        </View>
        <View style={[{ alignSelf: 'flex-end', flexDirection: 'row' }]}>
          <Text style={{ fontWeight: FONT_WEIGHT.SEMIBOLD, lineHeight: 40 }}>{Goal.total} </Text>
          <Text style={{ fontWeight: FONT_WEIGHT.NORMAL, lineHeight: 40 }}>{text.day || 'days'}</Text>
        </View>
      </View>
    </View>
  </TouchableWithoutFeedback>);
};