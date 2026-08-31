import { useCallback, useEffect } from 'react';
import {
  FlatList,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  Image,
  TouchableOpacity
} from 'react-native';
import { B, BText as Text, BText, BICon } from '../../../libs/components';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import { Goal, goalRepository } from '../Entities';
import moment from 'moment';
import {
  FONT_SIZE,
  FONT_WEIGHT,
  HEADER_HEIGHT,
  ICON_TOUCH_WIDTH,
} from '../../../theme/Constraints';
import { Router } from '../../../Router';
import { useNavigation } from '@react-navigation/native';
import { useText } from '../Text';
import { useTheme } from '../../../theme';
import { Background } from '../Components/Background';


import { AddButtonBottom } from '../../../libs/components/AddButtonBottom';
import { useCommonStyle } from '../../Common/Styles';
import { debugStyle } from '../../../libs/components/debugStyle';
import { RowItem } from '../Components/RowItem';

export const Home = ({ navigation }) => {
  const colors = useTheme();
  const commonStyle = useCommonStyle();
  return (
    <Background style={commonStyle.screen}>
      <Header style={{ marginBottom: 10, }} />
      <ScrollView>
        <Tips style={{ marginBottom: 10, backgroundColor: colors.primary }} />
        <Body style={{ marginBottom: 10, }} />

      </ScrollView>
      <View>
        <AddButtonBottom
          onPlusClick={() => {
            Router.Open(navigation, 'GoalAppModal', { screen: 'Add' });
          }}
        ></AddButtonBottom>
      </View>
    </Background>
  );
};

const Header = (props: { style?: StyleProp<ViewStyle> }) => {
  const text = useText();
  const colors = useTheme();
  const navigation = useNavigation();
  return (
    <View style={[{ height: HEADER_HEIGHT }, props.style]}>
      <Text
        style={{
          flex: 1,
          color: colors.primary,
          fontSize: FONT_SIZE.PageTitle,
          fontWeight: FONT_WEIGHT.SEMIBOLD,
          height: HEADER_HEIGHT,
          lineHeight: HEADER_HEIGHT,
          textAlign: 'center'
        }}
      >
        {text.title || 'Your Goals'}
      </Text>
      <TouchableOpacity
        style={[
          {
            width: ICON_TOUCH_WIDTH,
            height: HEADER_HEIGHT,
            justifyContent: 'center',
            alignItems: 'flex-start',
            position: 'absolute',
            top: 0,
            left: 0
          }
        ]}
        onPress={navigation.goBack}
      >
        <B.ICon
          name="return-up-back"
          style={{ fontSize: FONT_SIZE.PageTitle }}
        />
      </TouchableOpacity>
    </View>
  );
};

const Tips = (props: { style?: StyleProp<ViewStyle> }) => {

  const text = useText();
  const tip = text.add_tips || 'Mục tiêu là một cơ hội tuyệt vời để bạn để bứt phá giới hạn của mình';
  return <View>
    <Text>{tip}</Text>
  </View>;
};

const Body = (props: { style?: StyleProp<ViewStyle> }) => {
  const text = useText();
  const style = useStyle();
  const colors = useTheme();
  const navigation = useNavigation();
  const data = useAsyncAction(
    async () => {
      return (await goalRepository.list()).map((c) => ({
        ...c,
        percentage: 0,
        total: moment(c.end).diff(c.start, 'days'),
      }));
    },
    [useDectectDataChanged(goalRepository)],
    [],
  );

  if (data.length == 0) return <EmptyData />;
  return (
    <View style={{ marginTop:20 }}>
      {data.map((Goal, index) => <RowItem touchToDetail key={index} Goal={Goal} />)}
    </View>
  );
};

const EmptyData = () => {
  const text = useText();
  const navigation = useNavigation();
  return (
    <View style={debugStyle}>
      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <Image source={require('../Assets/no_goal.png')} style={{ width: 80, height: 80 }} />
      </View>
      <TouchableOpacity

        onPress={() =>
          Router.Open(navigation, 'GoalAppModal', { screen: 'Add' })
        }
      >
        <BText style={{ textAlign: 'center' }}>
          {text.empty_row ||
            'Chưa có thử thách nào ở đây! Nhấn \'+\' để tạo ngay thử thách cho bản thân, bắt đầu hành trình chinh phục mục tiêu mới nào.'}
        </BText>
      </TouchableOpacity>
    </View>
  );
};

const useStyle = () => {
  const colors = useTheme();
  return StyleSheet.create({
    item_container: { padding: 15, borderRadius: 15, backgroundColor: '#fff' },
    item_left: {},
    item_left_image: {},
  });
};
