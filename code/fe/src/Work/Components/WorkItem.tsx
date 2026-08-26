import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { FontICon } from '../../../libs/components/Icon';
import { Router } from '../../../Router';
import { AppStyle, useTheme } from '../../../theme';


import { useNavigation } from '@react-navigation/native';
import { B } from '../../../libs/components';
import { configStore } from '../../../store';
import { FONTSIZE } from '../../Common';
import { Work, workRepository } from '../Entities';
export const WorkItem = (props: {
  item: Work
  day: Date
  styles?: StyleProp<ViewStyle>
}) => {

  const item = props.item;
  const theme = useTheme();
  const style = stlyes(theme);

  const navigation = useNavigation();
  const allow_previous = configStore.useState((s) => s.habit_day_previous_allow);
  //const styles = segmentStyles(useTheme())
  const onOpenDetail = () => {
    //if (props.canPress()) {
    Router.Open(navigation, 'WorkApp', {
      id: item.id,
      day: props.day,
      screen: 'Detail'
    });
  };
  const onCompleted = async () => {
    await workRepository.done(props.item);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const canTouch = (day, allow) => {
    return true;
  };

  return (
    <View style={[style.container, props.styles,]} key={item.id}>
      <View style={style.leftContainer}>
        <B.ImageFor name={item.icon || item.name} height={40} width={40} />
      </View>
      <View style={style.middleContainer}>
        <TouchableOpacity
          style={{
            justifyContent: 'center',
          }}
          onPress={onOpenDetail}
        >
          <Text style={[style.title, { textDecorationLine: item.status ? 'line-through' : 'none' }]}>{item.name || 'New Habit'}</Text>
          {!item.planOption ? null : (
            <View style={{ flexDirection: 'row' }}>
              <View style={{ justifyContent: 'center', height: 16 }}>
                <FontICon
                  name="clockcircleo"
                  size={FONTSIZE.SubTitle}
                  style={{ marginRight: 5, color: theme.primary }}
                />
              </View>

              <Text style={[style.desc, { textDecorationLine: item.status ? 'line-through' : 'none' }]}>
                {' '}
                At {item.planOption.hour}:{item.planOption.minut}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <View style={[style.rightContainer]}>
        {item.goalOption && !item.status ? (
          <TouchableOpacity onPress={onOpenDetail} >
            {item.goalOption.unit == 'Time' ? (
              <FontICon
                name="clockcircleo"
                style={style.right_icon_undone}
                size={FONTSIZE.SMALL}
              />
            ) : (
              <Text style={style.righ_text_title}>{item.goalOption.unit}</Text>
            )}

          </TouchableOpacity>
        ) : canTouch(props.day, allow_previous) ? (
          <TouchableOpacity style={style.rightContainer} onPress={onCompleted}>
            {item.status ? (
              <FontICon
                style={style.right_icon_done}
                name="check-circle"
                size={24}
              ></FontICon>
            ) : (
              <FontICon
                name="radio-button-off-outline"
                size={24}
                style={style.right_icon_undone}
              ></FontICon>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const stlyes = (theme: typeof AppStyle) =>
  StyleSheet.create({
    title: {
      fontWeight: '500',
      fontSize: FONTSIZE.Title,
    },
    desc: {
      fontSize: FONTSIZE.SubTitle,
      marginTop: -2,
      color: theme.primary,
    },

    container: {
      //borderRadius: theme.BORDER.normal,
      flex: 1,
      flexDirection: 'row',
      backgroundColor: theme.onPrimary,
      marginTop: 5,
      marginBottom: 5,
      borderRadius: 10,
    },
    leftContainer: {
      alignSelf: 'flex-start',
      height: 60,
      width: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    rightContainer: {
      alignSelf: 'flex-end',
      height: 60,
      width: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    middleContainer: {
      alignSelf: 'stretch',
      flex: 1,
      height: 60,
      justifyContent: 'center',
    },
    right_icon_undone: {
      color: theme.secondary,
    },
    right_icon_done: {
      color: theme.success,
    },
    righ_text_title: {
      textTransform: 'lowercase',
      fontSize: FONTSIZE.SMALL,
      color: theme.tertiary,
    },
    righ_text_subTitle: {
      textTransform: 'lowercase',
      fontSize: FONTSIZE.SMALL,
      color: theme.tertiary,
    },
  });
