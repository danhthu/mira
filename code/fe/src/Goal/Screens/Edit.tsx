import moment from 'moment';
import { useCallback } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { B, BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { Goal, GoalAssociate, Milestone, goalAssociateRepository, goalRepository } from '../Entities';
import { useText } from '../Text';

import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native';
import { useTextStyle } from '../../../libs/components/Styles';
import { Router } from '../../../Router';
import { FONTSIZE, FONT_SIZE, FONT_WEIGHT, PADDING } from '../../../theme/Constraints';
import { useAsyncAction, useStateData } from '../../Common/Hooks';
import { useCommonStyle } from '../../Common/Styles';
import Assets from '../Assets';
import { Background } from '../Components/Background';
import { ImageSelection } from '../Components/ImageSelection';




const saveData = async (data: Goal, associations: Array<GoalAssociate>) => {
  await goalRepository.addOrUpdate(data);
  await Promise.all(associations.map(async d => goalAssociateRepository.addOrUpdate(d)));
};

export const Edit = ({ route, navigation }) => {
  const [data, setData, dataRef] = useStateData(null as Goal);
  const [associations, setAssociation, associationRef] = useStateData([] as Array<GoalAssociate>);
  const text = useText();
  const style = useCommonStyle();
  const colors = useTheme();
  const onSave = useCallback(() => {
    saveData(dataRef.current, associationRef.current).then(() => navigation.goBack());
  }, []);
  //load edit item
  useAsyncAction(async () => {
    const id = route.params.id;
    setData(await goalRepository.findOne(d => d.id == id));
    setAssociation(await goalAssociateRepository.filter(d => d.goalId == id));
  }, [route]);
  if (!data) return <View />;
  return <Background style={style.screen}>
    <Header onSave={onSave} title={text.add_title || 'Thêm mới'} />
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
      <MilestoneCtrl data={data.milestones} onChanged={val => { data.milestones = val; }}></MilestoneCtrl>
    </ScrollView>
  </Background>;
};



const Tips = () => {
  const text = useText();
  const style = useCommonStyle();
  const tips = text.tips || {
    title: 'Cách viết một mục tiêu rõ ràng', //hử thách là một cơ hội tuyệt vời để bạn để bứt phá giới hạn của mình.Tạo ra các thử thách cho bản thân không quá khó
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
  const textStyle = useTextStyle();
  const navigation = useNavigation();
  const text = useText();
  const onLinkToPlusTouch = () => {
    const data = props.data;
    Router.Open(navigation, 'GoalApp', {
      screen: 'Milestone', multiple: true,
      data,
      onGoBack: (newData: Milestone) => {
        if (newData.name) {
          if (data.indexOf(newData) == -1) {
            data.push(newData);
          }
        } else {
          if (data.indexOf(newData) > -1) {
            data.splice(data.indexOf(newData), 1);
          }
        }
        props.onChanged && props.onChanged([...data, newData]);
      }
    });
  };
  return (
    <View style={sectionStyle.container}>
      <TouchableOpacity style={[{ flexDirection: 'row' }]} onPress={onLinkToPlusTouch}>
        <View style={{ flex: 1, height: 40, justifyContent: 'center' }}>
          <Text style={[textStyle.normal]}>{text.milestones || 'Mile Stone'}</Text>
        </View>
        <View style={{ height: 40, justifyContent: 'center' }}>
          <B.ICon style={{ color: colors.success, fontSize: FONTSIZE.NORMAL }} name="pluscircle" />
        </View>
      </TouchableOpacity>
      {!data && data.length > 0 && data.map((h, i) => <View key={i} style={sectionStyle.row}>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <View style={{ flex: 1, height: 40, justifyContent: 'center' }}>
            <Text style={[textStyle.normal, {}]}>{h.name}</Text>
          </View>
          <View style={{ height: 40, justifyContent: 'center', alignItems: 'flex-end' }}>
            <Text style={[textStyle.normal, {}]}>{moment(h.date).format('YYYY-MMM,DD')}</Text>
          </View>
        </View>
        <TouchableOpacity style={{ height: 40, justifyContent: 'center' }} onPress={() => {
          const newData = [...data];
          newData.splice(i, 1);
          props.onChanged && props.onChanged(newData);
        }}>
          <B.ICon style={{ color: colors.error, fontSize: FONTSIZE.NORMAL, marginRight: 10 }} name="minuscircle" />
        </TouchableOpacity>
      </View>)}
    </View>
  );
};


const useSectionStyle = () => {
  const colors = useTheme();
  return StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      marginBottom: 20,
      paddingLeft: 10,

    },
    row: {
      flexDirection: 'row',
      borderTopColor: colors.outlineVariant,
      borderTopWidth: 1
    }
  });
};