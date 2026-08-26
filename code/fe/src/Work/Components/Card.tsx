import { useNavigation } from '@react-navigation/native';
import { ImageBackground, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { B, BText as Text } from '../../../libs/components';
import { PercentageCircle } from '../../../libs/components/PercentageCircle';
import { Router } from '../../../Router';
import { useTheme } from '../../../theme';
import { FONTSIZE } from '../../../theme/Constraints';
import { useText } from '../Text';

export const Card = (props: { style?: ViewStyle | ViewStyle[] }) => {
  return <ImageBackground imageStyle={{ opacity: 0.6 }} source={require('../Assets/card.jpg')} resizeMethod="scale" resizeMode="cover" style={[props.style]}>
    <WorkTask />
  </ImageBackground>;
};




const WorkTask = () => {
  const style = useStyle();
  const text = useText();
  const colors = useTheme();
  const nav = useNavigation();
  //đếm habit by catagory
  const dotStyle = useDotStyle();
  const totals = {
    mandatory: 2,
    today: 3,
    pending: 5,
    percentage: 50
  };
  return (
    <TouchableOpacity style={style.container} onPress={() => Router.Open(nav, 'WorkApp')}>
      <View style={[style.caption_container]}>
        <View style={[style.caption_iconContainer]}>
          <B.ICon name="work-outline" style={[style.caption_icon]} />
          <Text style={style.caption_title}>{text.todo || 'Công việc'}</Text>

        </View></View>
      <View style={[style.body_container]}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <Text style={[style.box_total, { fontWeight: '500' }]}>{totals.mandatory}</Text>
            <View style={{ alignItems: 'center' }}>
              <View style={[{ flexDirection: 'row' }]}>
                <View style={[dotStyle.container]}>
                  <View style={[dotStyle.dot, dotStyle.mandatory]}></View>
                </View><Text style={[dotStyle.label]}>{text.mandatory || 'Bắt buộc'}</Text></View>
            </View>
          </View>
          <View style={[{ flex: 1, marginTop: -22 }]}>
            <View style={{ alignItems: 'center' }}>
              <PercentageCircle radius={35}
                percent={totals.percentage} color={totals.percentage > 80 ? colors.success : totals.percentage > 55 ? colors.warn : colors.error}
                borderWidth={5}>
                <View >
                  <Text style={[style.box_total, { fontSize: 18 }, { color: totals.percentage > 80 ? colors.success : totals.percentage > 55 ? colors.warn : colors.error }]}>
                    {totals.percentage}%
                  </Text>
                </View>
              </PercentageCircle>
            </View>
            <View style={{ alignItems: 'center' }}>
              <View style={[{ flexDirection: 'row' }]}>
                <View style={[dotStyle.container]}>
                  <View style={[dotStyle.dot, dotStyle.today]}></View>
                </View><Text style={[dotStyle.label]}>{text.today || 'Trong ngày'}</Text></View>
            </View>
          </View>
          <View style={{ flex: 1 }}><Text style={[style.box_total, { fontWeight: '200' }]}>{totals.pending}</Text><View style={{ alignItems: 'center' }}>
            <View style={[{ flexDirection: 'row' }]}>
              <View style={[dotStyle.container]}>
                <View style={[dotStyle.dot, dotStyle.pending]}></View>
              </View><Text style={[dotStyle.label]}>{text.pending || 'Khác'}</Text></View>
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
      fontSize: 14
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,

    },
    mandatory: {
      backgroundColor: colors.secondary,// '#FF3755',

    },
    today: {
      backgroundColor: colors.tertiary,// 'green',

    },
    pending: {
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
      marginBottom: -5

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
      borderBottomEndRadius: 20,
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
      marginTop: 10,
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

/*

export const useStyle = () => {
    const colors = useTheme()
    return {
        component: StyleSheet.create({
            container: {
                height: 110,
                width: 150,
                //backgroundColor: colors.surface,
                borderRadius: 15,
                padding: 20,
                paddingTop: 0,
                marginRight: 20,
            },
            caption_container: {
                flexDirection: 'row',
                marginLeft: -20,
            },
            caption_icon: {
                color: colors.surface,
                fontSize: 20,
            },
            caption_iconContainer: {
                borderTopLeftRadius: 20,
                borderBottomRightRadius: 20,
                backgroundColor: colors.primary,
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
            },
            caption_title: {
                color: colors.onSurface,
                textAlign: 'center',
                lineHeight: 40,
                height: 40,

                fontSize: FONTSIZE.NORMAL,
                flex: 1,
            },
            body_container: {
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 10,
                marginBottom: 10,
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
            footer_text: {},
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
        }),

    }
}
*/