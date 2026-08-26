import { View, Text, StyleSheet, Switch, ActivityIndicator } from 'react-native';
import { FONTSIZE } from '../../Common';
import { useTheme } from '../../../theme';
import { useText } from '../../../lang';
import { useEffect, useState } from 'react';
import { useSettings } from '../../Common/Hooks';
import { Habit } from '../../HabitTracker/Entities';

const tranform =(str, vars)=> {



  return str.replace(/{([^}]+)}/g, function(match, p1) {
    const $=vars;
    try{
      const func = new Function('$','return ' + p1);
      if($){return func($);}
    }catch{
      console.error('error',vars);
      return p1;
    }

  });
};
export const Step6 = (props:{on_Completed:()=>void}) => {
  const text = useText();
  const style = useStyle();

  const [setting,setSetting] = useSettings();
  const [loading,setLoading] = useState(true);
  const initHabit=(data:Array<{title:string,enable:boolean}>)=>{
    setSetting({ A:data.filter(e=>e.enable)
      .map(item=>({ ...item,title:tranform(item.title,setting) }))
      .map(item=>{
        const habit = new Habit();
        habit.name= item.title;
        return { ...item,...habit };
      }) });
  };

  const [A, setA] = useState(text.welcome_Recomments.array);


  useEffect(()=>{
    setTimeout(()=>{
      if(setting&&!setting.A){
        initHabit([...A]);
      }
      setLoading(false);
      props.on_Completed&&props.on_Completed();
    },1000);
  },[setting]);
  if(!setting) return <View></View>;
  return <View style={style.container}>
    <Text style={style.header}>{text.welcome_Recomments.title}</Text>
    {loading ?
      <View style={{ marginTop:100,flex:1,alignContent:'center' }}>
        <View style={{ flex:1 }}>
          <ActivityIndicator ></ActivityIndicator>
          <Text style={{ fontSize:FONTSIZE.NORMAL, textAlign:'center' }}>{text.for('Recommend activies necessary to simple life and get happier')}</Text>
        </View>
      </View>
      : (
        <View style={{ marginTop: 20 }}>
          {A
            .map(item=>({ ...item,title:tranform(item.title,setting) }))
            .map((q, i) => <View key={i} style={style.Q_container}>
              <Text style={style.Q_title}>{ q.title}</Text>
              <View style={style.Q_switch}>
                <Switch value={q.enable} onValueChange={val => {  const newA=[...A]; newA[i].enable = val; newA[i].title=q.title; setA(newA);initHabit(newA); }}></Switch>
              </View>
            </View>)}
        </View>
      )}
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
    Q_container: {
      padding: 10,
      marginBottom: 10,
      borderRadius: 10,
      borderColor: colors.outline,
      borderWidth: 1,
      //  backgroundColor: colors.background,
      flexDirection: 'row',
      justifyContent: 'center'
    },

    Q_title: {
      flex: 1,
      fontSize: FONTSIZE.NORMAL,
      justifyContent: 'center',
      verticalAlign: 'middle',
      paddingRight: 10,

    },
    Q_switch: {
      alignSelf: 'flex-end',
      justifyContent: 'center',
      // height: '100%'
    }
  });
};