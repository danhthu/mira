import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';

import moment from 'moment';

import { useText } from '../../../lang';
import { Router,ROUTER_NAME } from '../../../Router';
import { B } from '../../../libs/components';
import { ICON_LIST } from '../../../libs/components/BIcon';
import { AppStyle, useTheme } from '../../../theme';
import { Card as TimeTrackerWidget } from '../../TimeTracker/Components/Card';
import { FONTSIZE, MARGIN } from '../../../theme/Constraints';
import { HabitTrackerModel2 as HabitTrackerModel } from '../../HabitTracker/Models/HabitTrackerModel';
import { ChallengerTrackerModel } from '../../Challenger/Models/ChallengerTrackerModel';

export const Profile = ({ navigation }) => {
  return (
    <ScrollView>
      <CaptionRow />
      <TimeSection navigation={navigation} />
      <HabitSection navigation={navigation} />
      <ChallengeSection navigation={navigation} />
      <StatusSection navigation={navigation} />
      <SettingSection navigation={navigation} />
      <HelpAndFeedbackSection navigation={navigation} />
    </ScrollView>
  );
};


const CaptionRow = () => {
  const styles = Styles(useTheme());
  const text = useText();
  return (
    <Text style={styles.caption}>
      {text.profile_screen.Caption}
    </Text>
  );
};

const HabitSection = (props: { navigation }) => {
  const styles = Styles(useTheme());
  const text = useText();
  const colors = useTheme();
  const OnViewAllPress = () => { Router.Open(props.navigation, 'HabitStatScreen' as ROUTER_NAME); };
  const data = HabitTrackerModel.useCalendarData();
  const markedDates = {};
  data.forEach(item => {
    markedDates[moment(new Date(item.day)).format('YYYY-MM-DD')] = {
      // 'CREATED' là trạng thái "chưa làm" thật của HabitTracker (không có 'NOTWORK' —
      // xem type STATUS ở Common/Interfaces/interface.ts), status_0 tương ứng ý đó.
      selected: true, marked: true, selectedColor:
                item.status == 'CREATED' ? styles.status_0_text : item.status == 'DONE' ? styles.status_1_text : styles.status_2_text,
      selectedContainerColor:
                item.status == 'CREATED' ? styles.status_0 : item.status == 'DONE' ? styles.status_1 : styles.status_2,
    };
  });



  return (
    <View style={styles.section}>
      <SessionTitle title={text.profile_screen.HabitStat} onView={OnViewAllPress}/>
      <Calendar
        style={{
          borderWidth: 1,
          borderColor: colors.outlineVariant,
          borderRadius:5,
          height: 350,
          backgroundColor: colors.background,

        }}

        markedDates={markedDates}
      ></Calendar>
    </View>
  );
};

const TimeSection = (props: { navigation }) => {
  const styles = Styles(useTheme());
  const text = useText();
  const OnViewAllPress = () => { Router.Open(props.navigation, 'TimeTrackerStat' as ROUTER_NAME); };


  return (
    <View style={styles.section}>
      <SessionTitle title={text.profile_screen.TimeStat} onView={OnViewAllPress}/>
      <TimeTrackerWidget />
    </View>
  );
};


const ChallengeSection = (props: { navigation }) => {
  const styles = Styles(useTheme());
  const text = useText();
  const OnViewAllPress = () => { Router.Open(props.navigation, 'ChallengerStat' as ROUTER_NAME); };
  const data = ChallengerTrackerModel.useCalendarData();
  const markedDates = {};
  data.forEach(item => {
    markedDates[moment(new Date(item.date)).format('YYYY-MM-DD')] = {
      selected: true, marked: true, selectedColor:
                item.status == 0 ? styles.status_0_text : item.status == 1 ? styles.status_1_text : styles.status_2_text,
      selectedContainerColor:
                item.status == 0 ? styles.status_0 : item.status == 1 ? styles.status_1 : styles.status_2,
    };
  });

  return (
    <View style={styles.section}>

      <SessionTitle title={text.profile_screen.ChallengerStat} onView={OnViewAllPress}/>
      <Calendar
        style={{
          borderWidth: 1,
          borderColor: 'gray',
          height: 350,
        }}

        markedDates={markedDates}
      ></Calendar>
    </View>
  );
};


const StatusSection = (props: { navigation }) => {
  const styles = Styles(useTheme());
  const text = useText();
  const OnViewAllPress = () => { Router.Open(props.navigation, 'StatusStat' as ROUTER_NAME); };
  const data = ChallengerTrackerModel.useCalendarData();
  const markedDates = {};
  data.forEach(item => {
    markedDates[moment(new Date(item.date)).format('YYYY-MM-DD')] = {
      selected: true, marked: true, selectedColor:
                item.status == 0 ? styles.status_0_text : item.status == 1 ? styles.status_1_text : styles.status_2_text,
      selectedContainerColor:
                item.status == 0 ? styles.status_0 : item.status == 1 ? styles.status_1 : styles.status_2,
    };
  });

  return (
    <View style={styles.section}>
      <SessionTitle title={text.profile_screen.ViewAll} onView={OnViewAllPress}/>
      <Calendar
        style={{
          borderWidth: 1,
          borderColor: 'gray',
          height: 350,
        }}

        markedDates={markedDates}
      ></Calendar>
    </View>
  );
};

const SessionTitle=(props:{onView:()=>void,title:string})=>{
  const styles = Styles(useTheme());
  const text = useText();
  return (
    <View style={styles.row_container}>
      <View style={[styles.row_center,{ height:50,justifyContent:'center' }]}><Text style={[styles.title,{ marginBottom:0 }]}>
        {props.title}</Text></View>

      <TouchableOpacity onPress={props.onView} style={[styles.row_right,{ justifyContent:'center',flexDirection:'row',height:50 }]} >

        <Text style={[ styles.subTitle]}>{text.profile_screen.ViewAll}</Text>
        <View style={[styles.row_right,{ justifyContent:'center',height:50 }]}><B.ICon name="arrow-right" style={{ marginLeft:-20 }}></B.ICon></View>
      </TouchableOpacity>


    </View>
  );
};

const SettingSection = (props: { navigation }) => {
  const styles = Styles(useTheme());
  const text = useText();
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{text.profile_screen.HelpAndFeedback}</Text>
      <View style={styles.section_container}>
        <RowItem icon_left="bell-o" text="Langague" onPress={() => { Router.Open(props.navigation, 'SettingScreen' as ROUTER_NAME); }} />
      </View>
    </View>
  );
};

const HelpAndFeedbackSection = (props: { navigation }) => {
  const styles = Styles(useTheme());
  const text = useText();
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{text.profile_screen.HelpAndFeedback}</Text>
      <View style={styles.section_container}>
        <RowItem icon_left="bell-o" text="Langague" onPress={() => { Router.Open(props.navigation, 'Language' as ROUTER_NAME); }} />
      </View>
    </View>
  );
};

const RowItem = (props: { icon_left?: ICON_LIST, text: string, onPress: () => void }) => {
  const styles = Styles(useTheme());
  return (
    <TouchableOpacity style={styles.row_container} onPress={props.onPress}>
      <View style={styles.row_left}>
        <B.ICon name={props.icon_left}></B.ICon>
      </View>
      <View style={styles.row_center}>
        <Text>{props.text}</Text>
      </View>
      <View style={styles.row_right}>
        <B.ICon name="arrow-right" ></B.ICon>
      </View>
    </TouchableOpacity>
  );
};

const Styles = (theme: typeof AppStyle) => StyleSheet.create({
  status_0: {

  },
  status_0_text: {

  },
  status_1: {

  },
  status_1_text: {

  },
  status_2: {

  },
  status_2_text: {

  },
  caption: {
    fontSize: FONTSIZE.BIG,
    marginLeft:MARGIN.SCREEN,
    marginTop:20
  },
  section: {
    margin: 10
  },
  title: {
    fontSize:FONTSIZE.NORMAL,
    marginBottom:15,
    fontWeight:'bold'
  },
  subTitle: {
    margin:0,
    padding:0
  },
  section_container: {
    backgroundColor:'white',
    borderRadius:10
  },
  row_container: {
    flex: 1,
    flexDirection:'row'
  },
  row_left: {
    alignSelf: 'flex-start',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },

  row_right: {
    alignSelf: 'flex-end',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  row_center: {
    flex: 1,
    height: 50,
    justifyContent:'center'
  },


});