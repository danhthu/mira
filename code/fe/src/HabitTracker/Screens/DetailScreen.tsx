import React, { useState } from 'react';

import { Image, StyleSheet, TextStyle, View } from 'react-native';

import { useActionSheet } from '@expo/react-native-action-sheet';
import { ScrollView } from 'react-native';
import { Col, Grid } from 'react-native-easy-grid';
import { showMessage } from 'react-native-flash-message';
import { B, BText as Text } from '../../../libs/components';
import { ButtonV2 } from '../../../libs/components/Buttons';
import { GroupTitle } from '../../../libs/components/GroupTitle';
import { FontICon, ICON_LIST } from '../../../libs/components/Icon';
import { Link } from '../../../libs/components/Link';
import { getCurrentDay } from '../../../libs/dateUtils';
import { Router } from '../../../Router';
import { useTheme } from '../../../theme';
import { BLACK_COLOR, FONT_WEIGHT, ROUND_NORMAL, SECOND_BLACK_COLOR } from '../../../theme/Constraints';
import { FONTSIZE, getLogger } from '../../Common';
import { useCommonStyle } from '../../Common/Styles';
import { AssetManagement } from '../Assets';
import iconifyAssets from '../Assets/iconifyAssets';
import { Background } from '../Components/Background';
import { DataMonth } from '../Components/DataMonth';
import { Header } from '../Components/Header';
import { Habit, habitRepository, HabitTracker, habitTrackerRepository } from '../Entities';
import { useText } from '../Text';

const logger = getLogger('DetailScreen');
export const DetailScreen = ({ route, navigation }) => {
  //validate route params
  const { habit, tracker, day } = route.params?.data as { habit: Habit, tracker: HabitTracker, day: number };
  const [showTitle, setShowTitle] = useState(false);
  const text = useText();
  const colors = useTheme();
  const commonStyle = useCommonStyle();

  const { showActionSheetWithOptions } = useActionSheet();

  const habitItemStyles = StyleSheet.create({
    image_container: {
      width: 50,
      height: 50,
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: 40,
      height: 40,

    },
    title: {
      lineHeight: 50,
      height: 50,
      fontSize: FONTSIZE.NORMAL,
      color: '#000',
      flex: 1
    },
    container: {
      flexDirection: 'row'
      , marginBottom: ROUND_NORMAL
    },
  });
  const onDeletePress = () => {
    const options = ['Yes, keep it.', 'No, clear history', 'Cancel'];

    showActionSheetWithOptions(
      {
        options,
        message: 'Do you want to keep statistics on this habit?',
        cancelButtonIndex: 2,
        messageTextStyle: {
          textAlign: 'center',
          fontSize: FONTSIZE.NORMAL,
          alignSelf: 'center',
        },
        titleTextStyle: {
          fontSize: FONTSIZE.NORMAL
        }
      },
      async (selectedIndex: number) => {
        switch (selectedIndex) {
          case 0:
            await habitRepository.update(
              (h) => h.id == habit.id,
              (h) => {
                h.deleted = true;
                h.deleted_date = new Date().getTime();
              },
            );
            navigation.goBack();
            break;
          case 1:
            await habitRepository.delete2((h) => h.id == habit.id);
            await Promise.all(
              (
                await habitTrackerRepository.filter(
                  (h) => h.hid == habit.id,
                )
              ).map(async (h) => await habitTrackerRepository.delete3(h)),
            );
            await habitTrackerRepository.save();
            navigation.goBack();
            break;
          case 2: //cancel
            break;
        }
      },
    );
  };
  const completed = async () => {
    if (day > getCurrentDay().getTime()) {
      showMessage({
        message: text.Ohno || 'Oh no!!!',
        type: 'warning',
        description: text.error_completed_habit || 'Let\'s focus on your today\'s habit',
      });
    } else {
      await habitTrackerRepository.doneTracker(
        habit.id,
        new Date(day),
      );
      showMessage({ message: habit.name + ' done', type: 'success' });
      navigation.goBack();
    }
  };
  const setDid = async (val) => {
    if (day > getCurrentDay().getTime()) {
      showMessage({
        message: text.Ohno || 'Oh no!!!',
        type: 'warning',
        description: text.error_completed_habit || 'Let\'s focus on your today\'s habit',
      });
    } else {
      await habitTrackerRepository.setDid(habit.id, new Date(day), {
        ...habit.goalOption,
        done: val,
      });
      if (val == habit.goalOption.total) await completed();
    }
  };

  if (habit == null) return <View></View>;
  return (
    <Background style={[commonStyle.screen, { backgroundColor: habit.color }]}>
      <Header title={!showTitle ? null : habit.name} right={{
        text: text.edit || 'Edit',
        onTouch: () => Router.Open(navigation, 'HabitAppModal', { screen: 'Edit', id: habit.id })
      }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={evt => {
          if (!showTitle && evt.nativeEvent.contentOffset.y > 80) {
            setShowTitle(true);
          }
          if (evt.nativeEvent.contentOffset.y < 80 && showTitle) {
            setShowTitle(false);
          }
        }}
      >
        <View style={{ alignSelf: 'center', marginBottom: 10, marginTop: 20 }}>
          <Image
            style={habitItemStyles.image}
            source={
              !habit.icon
                ? AssetManagement.habit_default
                : iconifyAssets[habit.icon] || AssetManagement.habit_default
            }
          />
        </View>
        <Text style={{ textAlign: 'center', flex: 1, lineHeight: 30, height: 30, color: BLACK_COLOR, fontWeight: FONT_WEIGHT.SEMIBOLD }}>
          {habit.name}
        </Text>
        <Text style={{ textAlign: 'center', flex: 1, color: SECOND_BLACK_COLOR }}>
          {habit.description}
        </Text>

        {habit.goalOption ? (
          <View style={{ alignItems: 'center' }}>
            <B.CircularSlider
              label={habit.goalOption.unit}
              min={0}
              max={habit.goalOption.total}
              value={
                tracker.data.goal ? tracker.data.goal.done || 0 : 0
              }
              onChanged={setDid}
            />
          </View>
        ) : null}



        <View style={{ alignItems: 'center', marginTop: 30 }}>
          <ButtonV2 radius={30} type='black' text={text.completed || 'Completed'} onPress={() => completed()}></ButtonV2>
        </View>

        <GroupTitle
          label={text.for('Completion')}
          actionText={text.for('View all')}
          onPress={() => Router.Open(navigation, 'HabitAppModal', { id: habit.id, screen: 'Statistic', sub: 'Detail' })}
        />

        <DataMonth habits={[habit]} />
        <View style={{ marginTop: 10 }}>
          <GroupTitle
            label={text.for('Basic info')}
            actionText={text.for('Edit')}
            onPress={() => Router.Open(navigation, 'HabitApp', { ...route.params, screen: 'Edit' })}
          />
        </View>
        <Row icon="repeat" iconStyle={{ color: colors.primary, fontWeight: '400', fontSize: 17 }} text={'Test'} />
        <Row icon="bell" iconStyle={{ color: 'orange', fontWeight: '400', fontSize: 17 }} text={'You not set alarm'} />
        <View style={{ marginTop: 30, alignItems: 'center', marginBottom: 50 }}>
          <Link onPress={onDeletePress} style={{ color: colors.error }}>
            {text.deleted || 'Deleted'}
          </Link>
        </View>
      </ScrollView>
    </Background>
  );
};

const Row = (props: { icon: ICON_LIST; iconStyle?: TextStyle, text: string }) => {
  const colors = useTheme();
  return (
    <View
      style={{
        height: 40,
        backgroundColor: 'white',
        marginBottom: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.outlineVariant,
      }}
    >
      <Grid>
        <Col
          style={{
            width: 40,
            flex: null,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FontICon name={props.icon} style={props.iconStyle} />
        </Col>
        <Col style={{ justifyContent: 'center' }}>
          <Text >{props.text}</Text>
        </Col>
      </Grid>
    </View>
  );
};
