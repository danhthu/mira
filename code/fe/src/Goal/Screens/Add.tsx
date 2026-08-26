import moment from 'moment';
import { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { B, BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { Goal, GoalAssociate, Milestone, goalAssociateRepository, goalRepository } from '../Entities';
import { useText } from '../Text';

import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native';
import { useTextStyle } from '../../../libs/components/Styles';
import { Router } from '../../../Router';
import { FONTSIZE, FONT_SIZE, FONT_WEIGHT, ICON_TOUCH_WIDTH, PADDING, TBL_ROW_HEIGHT } from '../../../theme/Constraints';
import { useStateData } from '../../Common/Hooks';
import { useCommonStyle } from '../../Common/Styles';
import Assets from '../Assets';
import { Background } from '../Components/Background';
import { ImageSelection } from '../Components/ImageSelection';




const saveData = async (data: Goal, associations: Array<GoalAssociate>) => {
  await goalRepository.addOrUpdate(data);
  await Promise.all(associations.map(async d => goalAssociateRepository.addOrUpdate(d)));
};

export const Add = ({ navigation }) => {
  const [data, setData] = useStateData(new Goal);
  const [associations, setAssociation] = useState({} as Array<GoalAssociate>);
  const text = useText();
  const style = useCommonStyle();
  const colors = useTheme();
  return <Background style={style.modalScreen}>
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
          inputStyle={{ fontSize: FONT_SIZE.PageTitle, color: colors.primary, textAlign: 'center' }} label={text.ten || 'Mục tiêu'}
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
        <B.TextBox icon="calendar-end" iconStyle={{ color: colors.error }} dataType="date" label={text.ketthuc || 'Chọn mốc thời gian đạt được'}
          value={data.end} onChanged={val => setData({ ...data, end: val })}></B.TextBox>
      </View>
      <View style={[style.sectionContainer,]}>
        <B.TextBox icon="gift" iconStyle={{ color: '#8b008b', fontWeight: 'bold', fontSize: FONT_SIZE.ICon }} label={text.gift || 'Phần thưởng'}
          value={data.gif}
          onChanged={val => setData({ ...data, gif: val })} />
      </View>
      <View style={[style.sectionContainer]}>
        <MilestoneCtrl data={data.milestones || []} onChanged={val => { setData({ ...data, milestones: val }); }}></MilestoneCtrl>
      </View>
    </ScrollView>
  </Background>;
};



const Tips = () => {
  const text = useText();
  const style = useCommonStyle();
  const tips = text.tips || {
    title: 'Tips: Cách thiết lập thử thách hợp lý ?', //hử thách là một cơ hội tuyệt vời để bạn để bứt phá giới hạn của mình.Tạo ra các thử thách cho bản thân không quá khó
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


const MilestoneCtrl = (props: { data: Array<Milestone>, onChanged: (data: Array<Milestone>) => void }) => {
  const colors = useTheme();
  const { data } = props;
  const sectionStyle = useSectionStyle();
  const style = useCommonStyle();
  const textStyle = useTextStyle();
  const navigation = useNavigation();
  const text = useText();
  const onLinkToPlusTouch = () => {
    const data = props.data;
    Router.Open(navigation, 'GoalAppModal', {
      screen: 'Milestone',
      multiple: true,
      data,
      onGoBack: (newData: Milestone) => {
        if (newData.name) {
          if (data.indexOf(newData) == -1) {
            props.onChanged && props.onChanged([...data, newData]);
          }
        } else {
          if (data.indexOf(newData) > -1) {
            props.onChanged && props.onChanged([...data.splice(data.indexOf(newData), 1)]);
          }
        }

      }
    });
  };
  if (!data) return <View />;

  return (
    <View style={[sectionStyle.container]}>
      <View style={[{ flexDirection: 'row' }]} >
        <B.ICon
          name="link"
          style={{
            marginRight: 10,
            fontSize: FONT_SIZE.InputText,
            color: colors.primary,
          }}
        />
        <View style={{ flex: 1, height: TBL_ROW_HEIGHT, justifyContent: 'center' }}>
          <Text style={{ color: colors.primary }}>{text.milestones || 'Thiết lập cột mốc'}</Text>
        </View>
        <TouchableOpacity onPress={onLinkToPlusTouch} style={{ height: TBL_ROW_HEIGHT, width: ICON_TOUCH_WIDTH, alignItems: 'flex-end', justifyContent: 'center' }}>
          <B.ICon style={{ color: colors.primary, fontSize: FONTSIZE.NORMAL }} name="pluscircle" />
        </TouchableOpacity>
      </View>

      {data.map((h, i) => <View key={i} style={[sectionStyle.row, {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 4,
        paddingLeft: 16,
        paddingRight: 16,
        marginBottom: 16,
      }]}>
        <View style={{ flexDirection: 'row', flex: 1, marginRight: 10 }}>
          <View style={{ flex: 1, height: TBL_ROW_HEIGHT, justifyContent: 'center' }}>
            <Text style={[textStyle.normal, {}]}>{h.name}</Text>
          </View>
          <View style={{ height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'flex-end' }}>
            <Text style={[textStyle.normal, {}]}>{moment(h.date).format('YYYY-MMM,DD')}</Text>
          </View>
        </View>
        <TouchableOpacity style={{ height: TBL_ROW_HEIGHT, width: ICON_TOUCH_WIDTH, alignItems: 'flex-end', justifyContent: 'center' }} onPress={() => {
          const newData = [...data];
          newData.splice(i, 1);
          props.onChanged && props.onChanged(newData);
        }}>
          <B.ICon style={{ color: colors.error, fontSize: FONTSIZE.NORMAL }} name="minuscircle" />
        </TouchableOpacity>
      </View>)}

    </View>
  );
};



const useSectionStyle = () => {
  const colors = useTheme();
  return StyleSheet.create({
    container: {

    },
    row: {
      flexDirection: 'row',
    }
  });
};