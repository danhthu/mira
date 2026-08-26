import { View, Text, StyleSheet, Switch } from 'react-native';
import { FONTSIZE } from '../../Common';
import { useTheme } from '../../../theme';
import { useText } from '../../../lang';
import { useEffect, useState } from 'react';
import { useSettings } from '../../Common/Hooks';
import { debugStyle } from '../../../libs/components/debugStyle';


export const Step2 = () => {
  const text = useText();
  const style = useStyle();
  const [setting,setSetting] = useSettings();
  const [Q,setQ] = useState(text.welcome_Q.questions);
  useEffect(()=>{
    if(setting&&!setting.Q){
      setSetting({ Q:[...Q] });
    }

  },[setting]);
  return <View style={style.container}>
    <Text style={style.header}>{text.welcome_Q.title}</Text>
    <View style={{ marginTop:20 }}>
      {Q.map((q,i)=><View key={i} style={style.Q_container}>
        <Text style={style.Q_title}>{q.title}</Text>
        <View style={[style.Q_switch]}>
          <Switch   value={q.answer} onValueChange={val=>{Q[i].answer=val; setQ([...Q]);setSetting({ Q:[...Q] });}}></Switch>
        </View>
      </View>)}
    </View>
  </View>;
};

const useStyle = () => {
  const colors = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      fontSize: FONTSIZE.BIG,
      //fontWeight: 'bold',
      color: colors.onBackground,
      textAlign: 'center',
    },
    Q_container:{
      padding:10,
      marginBottom:10,
      borderRadius:10,
      borderColor: colors.outline,
      borderWidth:1,
      //  backgroundColor: colors.background,
      flexDirection:'row',
      justifyContent:'center',

    },

    Q_title:{
      flex:1,
      fontSize:FONTSIZE.NORMAL,
      justifyContent:'center',
      verticalAlign:'middle',
      paddingRight:10,

    },
    Q_switch:{
      alignSelf: 'flex-end',


    }
  });
};