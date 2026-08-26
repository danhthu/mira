import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { View, StyleSheet, BackHandler, Platform, TouchableOpacity } from 'react-native';
import { Milestone } from '../Entities';
import { B } from '../../../libs/components';

import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme';
import { useCommonStyle } from '../../Common/Styles';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/Constraints';
import { BText as Text } from '../../../libs/components';
import { Background } from '../Components/Background';
import { useText } from '../Text';
import { useStateData } from '../../Common/Hooks';
import moment from 'moment';
export const MilestoneScreen = ({ route, navigation }) => {
  const [data, setData, dataRef] = useStateData((route.params && route.params.data ? route.params.data : {}) as Milestone);
  const style = useCommonStyle();
  const text = useText();
  const colors = useTheme();
  const onSave = useCallback(()=>{
    route.params && route.params.onGoBack && route.params.onGoBack(dataRef.current);
  },[]);
  useEffect(() => {
    //auto save goback
    return ()=>{
      route.params && route.params.onGoBack && route.params.onGoBack(dataRef.current);
    };
  }, [route.params]);
  //init
  useEffect(() => {

  }, [route.params]);

  return <Background style={style.modalScreen}>
    <Header title={text.milestone_title || 'Thiết lập cột mốc'} onSave={onSave}/>
    <View style={{ marginLeft:-style.modalPadding.padding, marginRight:-style.modalPadding.padding }}>
      <View style={[style.sectionContainer]}>
        <B.TextBox
          iconStyle={{ color: colors.primary, fontSize: FONT_SIZE.PageTitle }}
          inputStyle={{ fontSize: FONT_SIZE.PageTitle, color: colors.primary, textAlign: 'center' }} label={text.ten || 'Cột mốc'}
          value={data.name} onChanged={val => setData({
            ...data, name: val,
            date: data.date || moment(data.date || new Date).add(30, 'days').toDate()
          })}></B.TextBox>
      </View>

      {/*ghi chú */}
      <View style={[style.sectionContainer, { backgroundColor: '#fff', borderRadius: 10, padding: 5, margin: 16 }]}>
        <B.TextBox viewStyle={{ borderWidth: 0, borderBottomWidth: 0 }} mutipleline value={data.desc} label={text.ghichu || 'Ghi chú'}
          onChanged={val => setData({ ...data, desc: val })} />
      </View>
      <View style={[style.sectionContainer]}>
        <B.TextBox icon="calendar-end" iconStyle={{ color: colors.error }} dataType="date" label={text.ketthuc || 'Thời gian'}
          value={data.date} onChanged={val => setData({ ...data, date: val })}></B.TextBox>
      </View>
    </View>
  </Background>;
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

    </View>
  );
};


