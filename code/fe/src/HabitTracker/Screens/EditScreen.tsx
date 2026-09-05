import React, { useEffect, useRef, useState } from 'react';

import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Habit, habitRepository } from '../Entities';

import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native';
import { Router } from '../../../Router';
import usePerformance from '../../../hook/useScreenLoadTime';
import { B, BImageIConSet, RighButtonSave, BText as Text } from '../../../libs/components';
import { debugStyle } from '../../../libs/components/debugStyle';
import { copyJson } from '../../../libs/jsonUtils';
import { useTheme } from '../../../theme';
import { FONT_SIZE, FONT_WEIGHT, HEADER_HEIGHT, ICON_TOUCH_WIDTH } from '../../../theme/Constraints';
import { getLogger } from '../../Common';
import { ColorCtrl } from '../../Common/FormControls/ColorCtrl';
import { GoalCtrl } from '../../Common/FormControls/GoalCtrl';
import { RepeatCtrl } from '../../Common/FormControls/RepeatCtrl';
import { TagCtrl } from '../../Common/FormControls/TagCtrl';
import { TimeCtrl } from '../../Common/FormControls/TimeCtrl';
import { TimeReminderCtrl } from '../../Common/FormControls/TimeReminderCtrl';
import { useAsyncAction } from '../../Common/Hooks';
import { useCommonStyle } from '../../Common/Styles';
import { Background } from '../Components/Background';
import { useText } from '../Text';
const logger = getLogger('HabitTracker_Screens_Edit');
const rowHeight = 50;

export const EditScreen = ({ route, navigation }) => {
  usePerformance('HabitTracker\EditScreen');
  const text = useText();
  const style = useStyle();
  const theme = useTheme();
  const colors = useTheme();
  const [data, setData] = useState({ ...new Habit(), name: 'New Habit' });
  const habitRef = useRef(data);
  const commonStyle = useCommonStyle();
  const update = (updated) => {
    setData((prevHabit) => ({ ...prevHabit, ...updated }));
  };
  useAsyncAction(async () => {
    const tmp = await habitRepository.findOne((h) => h.id == route.params.id);
    setData(tmp);
  }, []);
  const save = async () => {
    logger.debug(habitRef.current, route.params);
    habitRepository.update(h => h.id == route.params.id, h => copyJson(h, habitRef.current));
    navigation.goBack();
  };
  useEffect(() => {
    habitRef.current = data;
  }, [data]);
  useEffect(() => {
    // Use `setOptions` to update the button that we previously specified
    // Now the button includes an `onPress` handler to update the count
    navigation.setOptions({
      headerRight: () => <RighButtonSave onPress={save} />,
    });

  }, [navigation]);

  return (
    <Background style={[commonStyle.screen, { paddingTop: 16 }]}>
      <Header title={text.chinhsua || 'Chỉnh sửa'} onSave={save} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
        >
          <View style={[{
            alignSelf: 'center', marginTop: 10, marginBottom: 10, borderRadius: 10,
          }, debugStyle]}>
            <BImageIConSet
              width={40}
              height={40}
              name="abc"
              navigation={navigation}
              onChanged={(val) => update({ icon: val })}
            ></BImageIConSet>
          </View>
          <View style={style.sectionContainer}>
            <B.TextBox label={text.habit_name || 'Tên thói quen'}
              inputStyle={{ textAlign: 'center', }}
              viewStyle={{ borderBottomWidth: 0 }}
              value={data.name}
              onChanged={val => update({ name: val })} />
          </View>

          <View style={style.sectionContainer}>
            <ColorCtrl value={data.color} onChanged={val => update({ color: val })} />
          </View>

          <View style={style.sectionContainer}>
            <TimeCtrl value={data.time} onChanged={val => update({ time: val })} />
          </View>

          <View style={style.sectionContainer}>
            <RepeatCtrl value={data.repeatOption} onChanged={val => update({ repeatOption: val })} />
          </View>

          <View style={style.sectionContainer}>
            <GoalCtrl value={data.goalOption} onChanged={val => update({ goalOption: val })} />
          </View>



          <View style={style.sectionContainer}>
            <TimeReminderCtrl value={data.reminderOption} onChanged={val => update({ reminderOption: val })} />
          </View>

          <View style={[style.sectionContainer]}>
            <B.TextBox dataType="date"
              icon={'calendar-end'}
              iconStyle={{ color: colors.error }}
              label={text.batdau || 'Chọn thời gian kết thúc'}
              value={data.endDate} onChanged={val => update({ endDate: val })} />
          </View>

          <View style={style.sectionContainer}>
            <TagCtrl values={data.tags} onChanged={val => update({ tags: val })} />
          </View>
          {/*ghi chú */}
          <View style={[style.sectionContainer]}>
            <TouchableOpacity
              style={{ minHeight: 100 }}
              onPress={() =>
                Router.Open(navigation, 'RichEditorBottomModal', {
                  data: data.description, onGoBack: val => {
                    update({ description: val });
                  }
                })
              }
            >
              <B.Text>{text.ghichu || 'Ghi chú'}</B.Text>
              {data.description && <B.Html>{data.description}</B.Html>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Background>
  );
};

const Header = (props: { title?: string, onSave?: () => void }) => {
  const navigation = useNavigation();
  const text = useText();
  const colors = useTheme();
  return (
    <View>
      <Text style={[{
        marginRight: ICON_TOUCH_WIDTH + 18,
        marginLeft: ICON_TOUCH_WIDTH + 18,
        lineHeight: HEADER_HEIGHT, textAlign: 'center', fontSize: FONT_SIZE.PageTitle
      },]}>{props.title}</Text>
      <Pressable
        style={[
          {
            width: ICON_TOUCH_WIDTH + 16,
            height: HEADER_HEIGHT,
            justifyContent: 'center',
            alignItems: 'flex-start',
            position: 'absolute',
            top: 0,
            left: -16,
            paddingLeft: 16
          },
        ]}
        onPress={() => navigation.goBack()}
      >
        <B.ICon
          name="return-up-back"
          style={{ fontSize: FONT_SIZE.PageTitle }}
        />
      </Pressable>
      <TouchableOpacity
        style={[
          {
            width: ICON_TOUCH_WIDTH + 16,
            height: HEADER_HEIGHT - 12,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: 6,
            right: 0,
            paddingLeft: 8,
            paddingRight: 8,
            backgroundColor: colors.primary,
            borderRadius: HEADER_HEIGHT / 2,
          },
        ]}
        onPress={props.onSave}
      >
        <Text style={{ fontSize: FONT_SIZE.Text, color: colors.onPrimary, fontWeight: FONT_WEIGHT.SEMIBOLD }}>{text.save || 'Lưu'}</Text>
      </TouchableOpacity>
    </View>
  );
};




const useStyle = () => {
  const common = useCommonStyle();
  const colors = useTheme();
  return {
    ...common,
    ...StyleSheet.create({

      sectionContainer: {
        padding: 8,
        paddingLeft: 0,
        paddingRight: 0,

        //paddingLeft: 20,
        //backgroundColor: '#fff'
      },

    }),
  };
};

