import { FlatList, ScrollView, TouchableOpacity, View,StyleSheet, Image } from 'react-native';
import { Background } from '../Components/Background';
import { useCommonStyle } from '../../Common/Styles';
import { useNavigation } from '@react-navigation/native';
import { useText } from '../Text';
import { useTheme } from '../../../theme';
import { FONTSIZE, FONT_SIZE } from '../../../theme/Constraints';
import { B, BText as Text } from '../../../libs/components';
import { useState } from 'react';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import { habitRepository } from '../../HabitTracker/Entities';
import { workRepository } from '../../Work/Entities';
export const WorkSelection = ({ route, navigation }) => {
  const style = useCommonStyle();
  return (
    <Background style={style.modalScreen}>
      <Header route={route} />
      <Body route={route}/>
    </Background>
  );
};

const Header = ( { route }) => {
  const navigation = useNavigation();
  const text = useText();
  const colors = useTheme();
  const style = useCommonStyle();
  return (
    <View>
      <View >
        <Text style={style.header.title}>{text.habitSelectionTitle||'Chọn thói quen'}</Text>
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

const Body = ({ route }) => {
  const onItemPress =  route.params.onGoback|| (item=>{});
  const nav = useNavigation();
  const colors = useTheme();
  const data = useAsyncAction(async()=>{
    const hids = (route.params.data||[])  as Array<string>;
    return workRepository.filter(h=>hids.length==0|| hids.indexOf(h.id)==-1);
  },[route,useDectectDataChanged(workRepository)]);
  return <FlatList
    data={data}
    renderItem={({ item,index })=><TouchableOpacity style={{ paddingTop:10,paddingBottom:10 }} onPress={()=>{onItemPress(item); nav.goBack();}}>
      <Text style={{ fontSize:FONT_SIZE.ListItem }}>{item.name}</Text>
    </TouchableOpacity>}
    ItemSeparatorComponent={()=><View style={{ borderBottomWidth:1, borderBottomColor:colors.outline }}></View>}
  />;
};

