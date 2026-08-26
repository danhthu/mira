import { useNavigation } from '@react-navigation/native';
import { StyleProp, StyleSheet, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import { B, BText as Text } from '../../../libs/components';
import { debugStyle } from '../../../libs/components/debugStyle';
import { PercentageCircle } from '../../../libs/components/PercentageCircle';
import { Router } from '../../../Router';
import { useTheme } from '../../../theme';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/Constraints';
import { Loading } from '../../Common/Components/Loading';
import { Challenge } from '../Entities';
import { useText } from '../Text';
import { ChallengeAwatar } from './ChallengeAwatar';

export declare type ChallengeDataType = { percentage: number, total: number } & Challenge
export const RowItem = (props: { challenge: ChallengeDataType, touchToDetail?: boolean, style?: StyleProp<ViewStyle> }) => {
  const { challenge } = props;
  const colors = useTheme();
  const text = useText();
  const navigation = useNavigation();
  const style = StyleSheet.create({
    item_container: { padding: 15, borderRadius: 15, backgroundColor: '#fff' },
    item_left: {},
    item_left_image: {},
  });
  const onItemClick = () => {
    Router.Open(navigation, 'ChallengerApp', { screen: 'Detail', id: challenge.id });
  };
  if (!props.challenge) return <Loading />;
  return (<TouchableWithoutFeedback onPress={props.touchToDetail && onItemClick} style={[style.item_container, debugStyle]}>
    <View style={[{ backgroundColor: '#fff', borderColor: colors.outline, borderWidth: 1, borderRadius: 20, padding: 20, marginBottom: 20 }, props.style]}>
      <View style={{ flexDirection: 'row', borderBottomColor: colors.outline, borderBottomWidth: 1, paddingBottom: 10 }}>
        <ChallengeAwatar src={challenge.icon} size={80} style={[style.item_left, { borderRadius: 15, backgroundColor: colors.secondary },]} />
        <View style={{ flex: 1, paddingLeft: 20, height: 80, justifyContent: 'center' }}>
          <View>
            {challenge.cat && <Text >{challenge.cat}</Text>}
            <Text style={{ fontWeight: FONT_WEIGHT.SEMIBOLD, fontSize: FONT_SIZE.PageTitle }}>{challenge.name}</Text>
          </View>
        </View>
        {props.touchToDetail && <B.ICon name="right" style={{ fontSize: FONT_SIZE.ICon, fontWeight: FONT_WEIGHT.THIN }} />}
      </View>
      <View style={[{ justifyContent: 'center', flexDirection: 'row', marginTop: 5 }]}>
        <View style={[{ flexDirection: 'row', flex: 1 },]}>
          <View style={{ height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <PercentageCircle
              radius={15}
              percent={challenge.percentage}
              color={
                challenge.percentage > 80
                  ? colors.success
                  : challenge.percentage > 55
                    ? colors.warning
                    : colors.error
              }
              borderWidth={4}
            //  percentage={challenge.percentage||20}
            >
              <Text></Text>
            </PercentageCircle>
          </View>
          <Text style={{ marginLeft: 10, lineHeight: 40 }}>
            {challenge.percentage || '--'}{challenge.percentage ? '%' : ''} {text.completed || 'Completed'}
          </Text>
        </View>
        <View style={[{ alignSelf: 'flex-end', flexDirection: 'row' }]}>
          <Text style={{ fontWeight: FONT_WEIGHT.SEMIBOLD, lineHeight: 40 }}>{challenge.total} </Text>
          <Text style={{ fontWeight: FONT_WEIGHT.NORMAL, lineHeight: 40 }}>{text.day || 'days'}</Text>
        </View>
      </View>
    </View>
  </TouchableWithoutFeedback>);
};