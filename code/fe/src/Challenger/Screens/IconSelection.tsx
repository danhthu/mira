import { useNavigation } from '@react-navigation/native';
import { FlatList, Image, StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Router } from '../../../Router';
import { B, BText, BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { FONT_SIZE, HEADER_HEIGHT, ICON_TOUCH_WIDTH } from '../../../theme/Constraints';
import Assets from '../Assets';
import { ChallengeAwatar } from '../Components';
import { Background } from '../Components/Background';
import { useText } from '../Text';
export const IconSelection = ({ route, navigation }) => {
  return (
    <Background>
      <Header />
      <Body route={route} />
    </Background>
  );
};


const Header = (props: { style?: StyleProp<ViewStyle> }) => {
  const text = useText();
  const navigation = useNavigation();
  const colors = useTheme();
  return (
    <View style={[props.style]}>
      <TouchableOpacity
        style={[
          {
            width: ICON_TOUCH_WIDTH,
            height: HEADER_HEIGHT,
            justifyContent: 'center',
            left: -16,
            bottom: 0,
            position: 'absolute',
            alignItems: 'flex-start',
          },
        ]}
        onPress={() => navigation.goBack()}
      >
        <B.ICon
          name="return-up-back"
          style={{ fontSize: FONT_SIZE.PageTitle }}
        />
      </TouchableOpacity>
      <Text style={{ textAlign: 'center', fontSize: FONT_SIZE.PageTitle, lineHeight: HEADER_HEIGHT }}>{text.title_icon_selection || 'Chọn hình ảnh'}</Text>
    </View>
  );
};

const Body = ({ route }) => {
  const assets = Object.keys(Assets).map(a => ({ ...Assets[a], key: a }));
  const cats = [...new Set(assets.map(a => a.cat))];
  const nav = useNavigation();
  const onIconSelected = (icon: string) => {
    route.params && route.params.onGoBack && route.params.onGoBack(icon);
    nav.goBack();
  };
  return (
    <View>
      <FlatList data={cats} renderItem={({ item, index }) => <View>
        <Text></Text>
        {assets.filter(a => a.cat == item).map((a, i) => <TouchableOpacity
          onPress={() => onIconSelected(a.key)}
          key={index + '$' + i}>
          <ChallengeAwatar src={a.key} />
        </TouchableOpacity>)}
      </View>} />
    </View>
  );
};

const TabAsset = (props: { asset: string }) => {

};


const EmptyData = () => {
  const text = useText();
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() =>
        Router.Open(navigation, 'ChallengerAppModal', { screen: 'Add' })
      }
    >
      <View style={{ flex: 1, alignItems: 'center', marginBottom: 10 }}>
        <Image source={require('../Assets/no_challenge.png')} style={{ width: 80, height: 80 }} />
      </View>
      <BText>
        {text.empty_row ||
          'Chưa có thử thách nào ở đây! Nhấn \'+\' để tạo ngay thử thách cho bản thân, bắt đầu hành trình chinh phục mục tiêu mới nào.'}
      </BText>
    </TouchableOpacity>
  );
};
