import moment from 'moment';
import { useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { B, BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { Challenge, ChallengeAssociate, challengeAssociateRepository, challengeRepository } from '../Entities';
import { useText } from '../Text';

import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native';
import { FONT_SIZE, FONT_WEIGHT, PADDING } from '../../../theme/Constraints';
import { useCommonStyle } from '../../Common/Styles';
import Assets from '../Assets';
import { Background } from '../Components/Background';
import { ChallengeLinkTo } from '../Components/ChallengeLinkTo';
import { ImageSelection } from '../Components/ImageSelection';


const saveData = async (data: Challenge, associations: Array<ChallengeAssociate>) => {
  await challengeRepository.addOrUpdate(data);
  await Promise.all(associations.map(async d => challengeAssociateRepository.addOrUpdate(d)));
};

export const Add = ({ navigation }) => {
  const [data, setData] = useState(new Challenge);
  const [associations, setAssociation] = useState({} as Array<ChallengeAssociate>);
  const text = useText();
  const style = useCommonStyle();
  const colors = useTheme();
  return <Background style={style.screen}>
    <Header onSave={() => saveData(data, associations).then(() => navigation.goBack())} title={text.add_title || 'Thêm mới'} />
    <ScrollView automaticallyAdjustKeyboardInsets={true} style={{ marginLeft: -PADDING.LEFT, marginRight: -PADDING.RIGHT, paddingBottom: 50 }}>
      <Tips />
      <View style={{ alignItems: 'center' }}>
        {!data.icon && <Image source={Assets['item-icon-default'].uri} style={style.awatar.container} />}
        {data.icon && data.icon.startsWith('assets') && <Image source={Assets[data.icon.replace('assets/', '')]?.uri || Assets['item-icon-default'].uri}
          style={style.awatar.container} />}
        {data.icon && !data.icon.startsWith('assets') && <Image source={{ uri: data.icon }}
          style={style.awatar.container} />}
        <ImageSelection style={{ marginTop: 10 }} value={data.icon} onChanged={val => setData({ ...data, icon: val })} />
      </View>
      <View style={[style.sectionContainer]}>
        <B.TextBox
          iconStyle={{ color: colors.primary, fontSize: FONT_SIZE.PageTitle }}
          inputStyle={{ fontSize: FONT_SIZE.PageTitle, color: colors.primary, textAlign: 'center' }} label={text.ten || 'Tên thử thách'}
          value={data.name} onChanged={val => setData({
            ...data, name: val,
            start: data.start || new Date,
            end: data.end || moment(data.start || new Date).add(30, 'days').toDate()
          })}></B.TextBox>
      </View>

      {/*ghi chú */}

      <View style={[style.sectionContainer, { backgroundColor: '#fff', borderRadius: 10, padding: 5, margin: 16 }]}>
        <B.TextBox viewStyle={{ borderWidth: 0, borderBottomWidth: 0 }} mutipleline value={data.description} label={text.ghichu || 'Ghi chú'}
          onChanged={val => setData({ ...data, description: val })} />
      </View>

      <View style={[style.sectionContainer]}>
        <B.TextBox icon="calendar-start" iconStyle={{ color: colors.success }} dataType="date" label={text.batdau || 'Chọn thời gian bắt đầu'} value={data.start} onChanged={val => setData({ ...data, start: val, end: data.end != null ? data.end : moment(val).add(30, 'days').toDate() })}></B.TextBox>
      </View>
      <View style={[style.sectionContainer]}>
        <B.TextBox icon="calendar-end" iconStyle={{ color: colors.error }} dataType="date" label={text.ketthuc || 'Chọn thời gian kết thúc'}
          value={data.end} onChanged={val => setData({ ...data, end: val })}></B.TextBox>
      </View>


      <View style={[style.sectionContainer,]}>
        <B.TextBox icon="gift" iconStyle={{ color: '#8b008b', fontWeight: 'bold', fontSize: FONT_SIZE.ICon }} label={text.gift || 'Phần thưởng'}
          value={data.gif}
          onChanged={val => setData({ ...data, gif: val })} />
      </View>
      {/**liên kết */}
      <View style={[style.sectionContainer]}>
        <ChallengeLinkTo
          challenge={data}
          totalDays={data.start && data.end ? moment.duration(moment(data.end).diff(moment(data.start))).asDays() : 30}
          value={associations} onChanged={val => setAssociation(val)} />
      </View>
    </ScrollView>
  </Background>;
};


const Gif = (props: { data, onChanged }) => {
  const { data, onChanged } = props;
  const style = useCommonStyle();
  const text = useText();
  return <View style={[{ flexDirection: 'row', marginTop: 10, backgroundColor: '#fff', borderRadius: 20, padding: 10 }]}>
    <View style={{ marginRight: 10 }}>
      {!data.gif_icon && <Image source={Assets['gif-icon-default'].uri} style={style.awatar.container} />}
      {data.gif_icon && data.gif_icon.startsWith('assets') && <Image source={Assets[data.gif_icon.replace('assets/', '')]?.uri || Assets['gif-icon-default'].uri}
        style={style.awatar.container} />}
      {data.gif_icon && !data.gif_icon.startsWith('assets') && <Image source={{ uri: data.gif_icon }}
        style={style.awatar.container} />}
      <ImageSelection style={{ marginTop: 10 }} value={data.gif_icon} onChanged={props.onChanged} />
    </View>
    <View style={{ flex: 1, borderWidth: 0 }}>
      <B.TextBox mutipleline label={text.gif || 'Phần thưởng'} value={data.name} onChanged={props.onChanged}></B.TextBox>
    </View>
  </View>;
};

const Tips = () => {
  const text = useText();
  const style = useCommonStyle();
  const tips = text.tips || {
    title: 'Cách đặt một thử thách vừa sức', //hử thách là một cơ hội tuyệt vời để bạn để bứt phá giới hạn của mình.Tạo ra các thử thách cho bản thân không quá khó
  };
  return <View
    style={[style.tips.text_container]}
  >
    <TouchableOpacity onPress={() => {
      console.log('tips link');
    }} ><Text style={style.tips.text_link}>{tips.title}</Text></TouchableOpacity>
  </View>;
};

const Header = (props: { title?: string, onSave?: () => void }) => {
  const navigation = useNavigation();
  const text = useText();
  const colors = useTheme();
  const style = useCommonStyle();
  return (
    <View>
      <View >
        <Text style={style.header.title}>{props.title}</Text>
      </View>
      <TouchableOpacity
        style={[style.header.leftButton]}
        onPress={navigation.goBack}
      >
        <B.ICon
          name="return-up-back"
          style={{ fontSize: FONT_SIZE.PageTitle }}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={style.header.rightButton}
        onPress={props.onSave}
      >
        <Text style={{ fontSize: FONT_SIZE.Text, color: colors.primary, fontWeight: FONT_WEIGHT.BOLD }}>{text.save || 'Lưu'}</Text>
      </TouchableOpacity>
    </View>
  );
};