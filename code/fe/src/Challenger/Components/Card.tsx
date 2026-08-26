import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../../theme';
import { FONTSIZE } from '../../../theme/Constraints';
import { useText } from '../Text';

import { B, BText as Text } from '../../../libs/components';

import { useNavigation } from '@react-navigation/native';
import { Router } from '../../../Router';
export const Card = (props: { style?: ViewStyle | ViewStyle[] }) => {
  return (
    <ImageBackground
      imageStyle={{ opacity: 0.6 }}
      source={require('../Assets/card.jpg')}
      style={[props.style]}
    >
      <Comp />
    </ImageBackground>
  );
};

const Comp = () => {
  const style = useStyle();
  const text = useText();

  const nav = useNavigation();
  //đếm habit by catagory
  const dotStyle = useDotStyle();
  const totals = {
    success: 2,
    failure: 3,
    running: 3
  };
  //console.log(data)
  return (
    <TouchableOpacity style={style.container} onPress={() => Router.Open(nav, 'ChallengerApp')} >
      <View style={style.caption_container}>
        <View style={style.caption_iconContainer}>
          <B.ICon name="stairs-up" style={[style.caption_icon]} />
          <Text style={style.caption_title}>{text.thuthach || 'Thử thách'}</Text>
        </View>
      </View>
      <View style={[style.body_container]}>
        <View style={{ flexDirection: 'row' }}>
          <Item label={text.thanhcong || 'Thành công'} count={totals.success} color={dotStyle.success.backgroundColor} style={{ flex: 1 }} />
          <Item label={text.running || 'Đang chạy'} count={totals.running} color={dotStyle.running.backgroundColor} style={{ flex: 1 }} />
          <Item label={text.thatbai || 'Thất bại'} count={totals.failure} color={dotStyle.success.backgroundColor} style={{ flex: 1 }} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Item = (props: { label, count, color, style: ViewStyle | Array<ViewStyle> }) => {
  const { label, count, color } = props;
  const style = useStyle();
  const dotStyle = useDotStyle();
  return (<View style={[props.style]}>
    <Text style={[style.box_total, { fontWeight: '500' }]}>
      {count}
    </Text>
    <View style={{ alignItems: 'center' }}>
      <View style={[{ flexDirection: 'row' }]}>
        <View style={[dotStyle.container]}>
          <View style={[dotStyle.dot, { backgroundColor: color }]}></View>
        </View>
        <Text style={[dotStyle.label]}>
          {label}
        </Text>
      </View>
    </View>
  </View>);
};

const useDotStyle = () => {
  const colors = useTheme();
  return StyleSheet.create({
    container: {
      height: 30,
      marginRight: 5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    label: {
      height: 30,
      lineHeight: 30,
      fontSize: 14,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    falure: {
      backgroundColor: colors.secondary, // '#FF3755',
    },
    success: {
      backgroundColor: colors.tertiary, // 'green',
    },
    running: {
      backgroundColor: 'gray',
    },
  });
};

export const useStyle = () => {
  const colors = useTheme();
  return StyleSheet.create({
    box: {},
    box_label: {},
    box_total: {
      textAlign: 'center',
      fontSize: 45,
      marginBottom: -5,
    },

    container: {},
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
      //shadowOpacity:0.7,
      //shadowColor:'#000',
      backgroundColor: '#fff',
      //opacity:0.3,
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
      marginLeft: 5,

    },
    body_container: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
    },
    arrowup: {
      color: colors.success,
      fontWeight: 'bold',
    },
    arrowdown: {
      color: colors.error,
      fontWeight: 'bold',
    },

    normal: {
      color: colors.onBackground,
      fontSize: FONTSIZE.NORMAL,
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
      textAlign: 'right',
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
