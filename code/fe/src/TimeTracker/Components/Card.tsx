//waste, work, family, personal

import { ImageBackground, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme';
import { FONTSIZE } from '../../../theme/Constraints';
import { useText } from '../Text';

import { useEffect, useState } from 'react';
import { B, BText as Text } from '../../../libs/components';
import { PercentageCircle } from '../../../libs/components/PercentageCircle';
export const Card = (props: { style?: ViewStyle | ViewStyle[] }) => {
  const [t, setT] = useState(new Date().getTime());
  useEffect(() => {
    setT(new Date().getTime());
  }, []);
  return <ImageBackground imageStyle={{ opacity: 0.1 }} source={require('../Assets/card.jpg')} style={[props.style]}>
    <TimeTask />
  </ImageBackground>;
};

const TimeTask = () => {
  const style = useStyle();
  const text = useText();
  const colors = useTheme();
  //đếm habit by catagory
  const dotStyle = useDotStyle();
  const totals = {
    waste: 26,
    work: 56,
    personal: 70,
    family: 90
  };
  //console.log(data)
  return (
    <View style={style.container}>
      <View style={style.caption_container}>
        <View style={style.caption_iconContainer}>
          <B.ICon name="clockcircleo" style={[style.caption_icon]} />
          <Text style={style.caption_title}>{text.card_time || 'Thời gian'}</Text>
        </View></View>
      <View style={[style.body_container]}>
        <View style={{ flexDirection: 'row' }}>
          <View style={[{ flex: 1 },]}>
            <View style={{ alignItems: 'center' }}>
              <PercentageCircle radius={32} percent={totals.work} borderWidth={10} bgcolor={'white'} color={colors.primary} innerColor={dotStyle.work.backgroundColor}>
                <B.ICon name="business-time" style={{ color: 'white', fontSize: 20 }}></B.ICon>
              </PercentageCircle>
            </View>
            <Text style={[{ textAlign: 'center', fontSize: FONTSIZE.NORMAL, marginTop: 7, fontWeight: '600' }]}>
              {totals.work}%
            </Text>
            <View style={{ marginTop: -4, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row' }}>
                <View style={[dotStyle.container]}>
                  <View style={[dotStyle.dot, dotStyle.work]}></View>
                </View><Text style={[dotStyle.label]}>{text.work || 'Công việc'}</Text>
              </View>
            </View>
          </View>

          <View style={[{ flex: 1 },]}>
            <View style={{ alignItems: 'center' }}>
              <PercentageCircle radius={32} percent={totals.personal} borderWidth={10} bgcolor={'white'} color={colors.primary} innerColor={dotStyle.personal.backgroundColor}>
                <B.ICon name="person" style={{ color: 'white', fontSize: 20 }}></B.ICon>
              </PercentageCircle>
            </View>
            <Text style={[{ textAlign: 'center', fontSize: FONTSIZE.NORMAL, marginTop: 7, fontWeight: '400' }]}>
              {totals.personal}%
            </Text>
            <View style={{ marginTop: -4, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row' }}>
                <View style={[dotStyle.container]}>
                  <View style={[dotStyle.dot, dotStyle.personal]}></View>
                </View><Text style={[dotStyle.label]}>{text.personal || 'Cá nhân'}</Text>
              </View>
            </View>
          </View>


          <View style={{ flex: 1, display: 'none' }}>
            <View style={{ alignItems: 'center' }}>
              <PercentageCircle radius={32} percent={totals.family} borderWidth={10} bgcolor={'white'} color={colors.primary} innerColor={dotStyle.family.backgroundColor}>
                <B.ICon name="business-time" style={{ color: 'white', fontSize: 20 }}></B.ICon>
              </PercentageCircle>
            </View>
            <Text style={[{ textAlign: 'center', fontSize: FONTSIZE.NORMAL, marginTop: 7, fontWeight: '400' }]}>
              {totals.family}%
            </Text>
            <View style={{ marginTop: -4, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row' }}>
                <View style={[dotStyle.container]}>
                  <View style={[dotStyle.dot, dotStyle.family]}></View>
                </View><Text style={[dotStyle.label]}>{text.family || 'Gia đình'}</Text>
              </View>
            </View>
          </View>

          <View style={[{ flex: 1 },]}>
            <View style={{ alignItems: 'center' }}>
              <PercentageCircle radius={32} percent={totals.waste} borderWidth={10} bgcolor={'white'} color={colors.primary} innerColor={dotStyle.waste.backgroundColor}>
                <B.ICon name="trash" style={{ color: 'white', fontSize: 20 }}></B.ICon>
              </PercentageCircle>
            </View>
            <Text style={[{ textAlign: 'center', fontSize: FONTSIZE.NORMAL, marginTop: 7, fontWeight: '400' }]}>
              {totals.waste}%
            </Text>
            <View style={{ marginTop: -4, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row' }}>
                <View style={[dotStyle.container]}>
                  <View style={[dotStyle.dot, dotStyle.waste]}></View>
                </View><Text style={[dotStyle.label]}>{text.waste || 'Lãng phí'}</Text>
              </View>
            </View>
          </View>

        </View>
      </View >
    </View >
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
      width: 6,
      height: 6,
      borderRadius: 3,

    },
    work: {
      backgroundColor: colors.secondary,// '#FF3755',

    },
    personal: {
      backgroundColor: colors.success,// 'green',

    },
    family: {
      backgroundColor: '#FF2EFF',// 'green',

    },
    waste: {
      backgroundColor: 'black',

    },
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

