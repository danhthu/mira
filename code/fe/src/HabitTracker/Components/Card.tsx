import { View, StyleSheet, TouchableOpacity, ViewStyle, ImageBackground } from 'react-native';
import { useTheme } from '../../../theme';
import { useText } from '../Text';
import { FONTSIZE } from '../../../theme/Constraints';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';

import { B, BICon, BText as Text } from '../../../libs/components';
import { habitRepository, habitTrackerRepository } from '../Entities';
import { HabitTrackerModel } from '../Models/HabitTrackerModel';
import { getDay } from '../../../libs/dateUtils';
import { debugStyle } from '../../../libs/components/debugStyle';
import { useNavigation } from '@react-navigation/native';
import { Router } from '../../../Router';
export const Card = (props: { style?: ViewStyle | ViewStyle[] }) => {

  return <ImageBackground imageStyle={{ opacity: 0.6 }} source={require('../Assets/card.jpg')} style={[props.style]}>
    <HabitTask />
  </ImageBackground>;
};



const HabitTask = () => {
  const nav = useNavigation();
  const style = useStyle();
  const text = useText();
  const colors = useTheme();
  //đếm habit by catagory
  const dotStyle = useDotStyle();
  const totals = {
    health: 2,
    happyness: 3,
    others: 5
  };
    
  return (
    <TouchableOpacity style={style.container}
      onPress={()=>Router.Open(nav,'HabitApp')}
    >
      <View style={style.caption_container}>
        <View style={style.caption_iconContainer}>
          <B.ICon name="meh" style={[style.caption_icon]} />
          <Text style={style.caption_title}>{text.for('habit')}</Text>
        </View></View>
      <View style={[style.body_container]}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}><Text style={[style.box_total,{ fontWeight:'500' }]}>{totals.health}</Text>
            <View style={{ alignItems: 'center' }}>
              <View style={[{ flexDirection: 'row' }]}>
                <View style={[dotStyle.container]}>
                  <View style={[dotStyle.dot, dotStyle.healthy]}></View>
                </View><Text style={[dotStyle.label]}>{text.healthy || 'Sức khỏe'}</Text></View>
            </View>
          </View>
          <View style={{ flex: 1 }}><Text style={[style.box_total,{ fontWeight:'300' }]}>{totals.happyness}</Text>
            <View style={{ alignItems: 'center' }}>
              <View style={[{ flexDirection: 'row' }]}>
                <View style={[dotStyle.container]}>
                  <View style={[dotStyle.dot, dotStyle.happyness]}></View>
                </View><Text style={[dotStyle.label]}>{text.healthy || 'Hạnh phúc'}</Text></View>
            </View>
          </View>
          <View style={{ flex: 1 }}><Text style={[style.box_total,{ fontWeight:'200' }]}>{totals.others}</Text><View style={{ alignItems: 'center' }}>
            <View style={[{ flexDirection: 'row' }]}>
              <View style={[dotStyle.container]}>
                <View style={[dotStyle.dot, dotStyle.others]}></View>
              </View><Text style={[dotStyle.label]}>{text.healthy || 'Khác'}</Text></View>
          </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const useDotStyle = () => {
  const colors = useTheme();
  return StyleSheet.create({
    container: {
      height: 30,
      marginRight: 5,
      justifyContent: 'center',
      alignItems: 'center'
    },
    label: {
      height: 30,
      lineHeight: 30,
      fontSize:14
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,

    },
    healthy: {
      backgroundColor: colors.secondary,// '#FF3755',

    },
    happyness: {
      backgroundColor: colors.tertiary,// 'green',

    },
    others: {
      backgroundColor: 'gray',

    }
  });
};

export const useStyle = () => {
  const colors = useTheme();
  return StyleSheet.create({
    box: {

    },
    box_label: {

    },
    box_total: {
      textAlign: 'center',
      fontSize: 45,
      marginBottom:-5

    },

    container: {

    },
    caption_container: {
      flexDirection: 'row',
      marginLeft: -20,
      marginTop: -20,

    },
    caption_icon: {
      fontSize: 20,
      color: '#000',
    },
    caption_iconContainer: {
      borderTopLeftRadius: 20,
      borderBottomRightRadius: 20,
      backgroundColor: 'white',
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      paddingLeft: 20,
      paddingRight: 20,
    },
    caption_title: {
      color: '#000',
      textAlign: 'center',
      lineHeight: 40,
      height: 40,
      fontSize: FONTSIZE.NORMAL,
      marginLeft: 5
    },
    body_container: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop:10,
    },
    arrowup: {
      color: colors.success,
      fontWeight: 'bold'
    },
    arrowdown: {
      color: colors.error,
      fontWeight: 'bold'
    },

    normal: {
      color: colors.onBackground,
      fontSize: FONTSIZE.NORMAL
    },

    label: {
      color: colors.getColor(colors.onSurface, 500),
      textAlign: 'center',
      flex: 1,
    },

    textDone: {
      color: colors.onSurface,
      fontSize: FONTSIZE.LARGE,
      fontWeight: 'bold',
      paddingRight: 5,
      marginBottom: -5,
    },
    timeDone: {
      color: colors.success,
    },
    textTotal: {
      color: colors.onSurface,
      fontSize: FONTSIZE.BIG,
      fontWeight: 'bold',
    },

    footer_container: {
      flexDirection: 'column',
    },
    footer_text: {
      textAlign: 'right'
    },
    progress_container: {
      flexDirection: 'row',
      backgroundColor: colors.background,
    },
    progress: {
      flex: 1,
      borderWidth: 3,
      borderRadius: 3,
      borderColor: colors.success,
    },
  });


};

