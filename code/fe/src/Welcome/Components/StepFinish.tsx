import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useText } from '../../../lang';
import { useTheme } from '../../../theme';
import { FONTSIZE } from '../../Common';
import { useSettings } from '../../Common/Hooks';
import { Habit, habitRepository } from '../../HabitTracker/Entities';




export const StepFinish = (props: { on_Completed: () => void }) => {
  const text = useText();
  const style = useStyle();
  const [setting, setSetting] = useSettings();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setting && setting.A && await Promise.all(setting.A.map(async item => {

        if (item.enable) {
          const habit = new Habit();
          habit.name = item.title;

          if (item.params && item.params.repeat) {
            if (item.params.repeat.kind == 'daily') {
              habit.repeatOption = {
                enable: true,
                kind: 'daily',
                repeat: 1,

              };
            }
            if (item.params.repeat.kind == 'weekly') {

              habit.repeatOption = {
                enable: true,
                kind: 'weekly',
                dayOfWeek: setting.dayOfWeek,
                repeat: 1
              };
            }
          }
          await habitRepository.add(habit);
          await habitRepository.save();
          return 1;
        }
        return 0;
      }));
      setLoading(false);
      props.on_Completed && props.on_Completed();
    };
    init();
  }, [setting]);
  if (!setting) return <View></View>;

  return (<View style={style.container}>
    <Text style={style.header}>{text.welcome_finish.title}</Text>
    {loading ?
      <View style={{ marginTop: 100 }}>
        <ActivityIndicator></ActivityIndicator>
        <Text style={{ fontSize: FONTSIZE.NORMAL, textAlign: 'center' }}>{text.for('Inititalize...')}</Text>
      </View> : <Text style={style.content}>{text.welcome_finish.content}</Text>
    }
  </View>);
};

const useStyle = () => {
  const colors = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      fontSize: FONTSIZE.BIG,
      // fontWeight: 'bold',
      color: colors.onBackground,
      textAlign: 'center',
    },
    content: {
      marginTop: 50,
      fontSize: FONTSIZE.NORMAL,
      textAlign: 'justify'
    }
  });
};