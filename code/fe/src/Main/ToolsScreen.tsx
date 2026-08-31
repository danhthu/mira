import { useNavigation } from '@react-navigation/native';
import React, { ReactNode, useState } from 'react';
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Col, Row } from 'react-native-easy-grid';
import { PercentageCircle } from '../../libs/components/PercentageCircle';
import { Router } from '../../Router';
import { useTheme } from '../../theme';
import { FONTSIZE } from '../Common';

import { debugStyle } from '../../libs/components/debugStyle';
import { useText } from './Text';

export const ToolsScreen = () => {
  const colors = useTheme();
  return <ImageBackground source={require('../../assets/bg_selfkit.jpg')} style={[debugStyle, { flex: 1 }]} >
    <Row style={{ borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, flexDirection: 'row' }}>
      <Col>
        <Caption />
      </Col>
    </Row>
    <Row style={[{ borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, flexDirection: 'row' }, debugStyle]}>
      <Col>
        <AppWidget name="HabitApp" icon='028-self-improvement.png' title="Habit" />
      </Col>
      <Col>
        <AppWidget name="WorkApp" icon='018-planning.png' title="Work" />

      </Col>
      <Col>
        <AppWidget name="TimeApp" icon='029-time-management.png' title="Time" />
      </Col>
      <Col>
        <AppWidget name="GoalApp" icon='048-confidence-1.png' title="Goal" />
      </Col>
    </Row>
    <Row style={{ borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, flexDirection: 'row' }}>
      <Col >
        <AppWidget name="ChallengerApp" icon='034-challenge.png' title="Challenge" />
      </Col>
      <Col>
        <AppWidget name="WorkApp" icon='019-emotions.png' title="Emotion" />

      </Col>

    </Row>
    {/**
        <Calendar dayComponent={ ({date})=><View>
            <B.Awatar name={moment(date).format("DD")}  width={30} height={30}/>
        </View>}>

        </Calendar>
         */}
  </ImageBackground>;
};

const Caption = () => {
  const [emotionPercentage, setEmotionPercentage] = useState(80);
  const [workPercentage, setWorkPercentage] = useState(90);
  const [habitPercentage, setHabitPercentage] = useState(80);
  const [timePercentage, setTimePercentage] = useState(80);
  const style = useStyles();
  const text = useText();
  return <View style={{ marginTop: 10 }}>

    <Text style={{ marginBottom: 10, textAlign: 'center', fontSize: 24 }}>{text.title}</Text>
    <Text style={{ marginBottom: 10, textAlign: 'center', fontStyle: 'italic', fontSize: 20 }}>{text.wish}</Text>
    <View style={style.caption.row}>
      <View style={style.caption.col}>
        <PercentageWidget label={text.for('Happiness index')}
          description={text.for('H')}
          icon={'018-planning.png'}
          percentage={emotionPercentage} />
      </View>

      <View style={style.caption.col}>
        <PercentageWidget label={text.for('Time Effective')}
          description={text.for('H')}
          icon={'018-planning.png'}
          percentage={timePercentage} />
      </View>

      <View style={style.caption.col}>
        <PercentageWidget label={text.for('Work Completed')}
          description={text.for('H')}
          icon={'018-planning.png'}
          percentage={workPercentage} />
      </View>

      <View style={style.caption.col}>
        <PercentageWidget label={text.for('Habit Tracker')}
          description={text.for('H')}
          icon={'018-planning.png'}
          percentage={habitPercentage} />
      </View>



    </View>
  </View>;

};

const PercentageWidget = ({ label, description, percentage }: { label: string, description: string, icon?: string, percentage: number }) => {
  const colors = {
    success: 'green',
    warning: 'orange',
    danger: 'red'
  };
  const borderWith = 5;

  const style = useStyles();
  return <View>
    <View style={{ alignItems: 'center' }}>
      <PercentageCircle radius={30}

        percent={percentage} color={percentage > 80 ? colors.success : percentage > 55 ? colors.warning : colors.danger}
        borderWidth={borderWith}>

        <View >
          {/*
            <View style={{ alignItems: 'center' }}>
                <Image
                    style={{ width: 20, height: 20 }}
                    source={require('../../assets/lifeskill/018-planning.png')}
                /></View>
                * */}
          <Text style={style.caption.percentage}>
            {percentage}%
          </Text>
        </View>
      </PercentageCircle>
    </View>
    <Text style={style.caption.label}>{label}</Text>
    <Text style={style.caption.description}>{description}</Text>
  </View>;
};

const AppWidget = (props: { title, name, icon: string | ReactNode }) => {
  const nav = useNavigation();
  const style = useStyles();
  return <TouchableOpacity style={{
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff', height: 70, borderRadius: 5, margin: 5
  }} onPress={() => Router.Open(nav, props.name)}>
    <View style={[debugStyle]}>
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Image
          style={style.body.icon}
          source={require('../../assets/lifeskill/018-planning.png')}
        />
      </View>
      <Text style={{ fontSize: FONTSIZE.SMALL, textAlign: 'center', height: 30, lineHeight: 30 }}>{props.title}</Text>
    </View>
  </TouchableOpacity>;
};

const useStyles = () => {
  return {
    caption: StyleSheet.create({
      row: {
        flexDirection: 'row',
        marginBottom: 10
      },
      col: {
        flex: 1,
        alignItems: 'center'
      },
      container: {

      },
      imageContainer: {

      },
      image: {

      },
      percentage: {
        fontSize: FONTSIZE.NORMAL,

      },
      label: {
        flex: 1,
        textAlign: 'center'
      },
      description: {
        textAlign: 'center',
        fontSize: FONTSIZE.SMALL,
        fontStyle: 'italic',
        color: 'gray'
      },
      success: {
        color: 'green'
      },
      danger: {

      },
      warning: {

      }
    }),
    body: StyleSheet.create({
      icon: {
        width: 25,
        height: 25
      }
    })
  };
};

