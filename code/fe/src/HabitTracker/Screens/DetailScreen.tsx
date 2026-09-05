import { useActionSheet } from '@expo/react-native-action-sheet';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { B, BText as Text } from '../../../libs/components';
import { ButtonV2 } from '../../../libs/components/Buttons';
import { GroupTitle } from '../../../libs/components/GroupTitle';
import { Link } from '../../../libs/components/Link';
import { getCurrentDay } from '../../../libs/dateUtils';
import { Router } from '../../../Router';
import { useTheme } from '../../../theme';
import { FONT_WEIGHT } from '../../../theme/Constraints';
import { FONTSIZE } from '../../Common';
import { useCommonStyle } from '../../Common/Styles';
import { AssetManagement } from '../Assets';
import iconifyAssets from '../Assets/iconifyAssets';
import { DataMonth } from '../Components/DataMonth';
import { Header } from '../Components/Header';
import {
  Habit,
  habitRepository,
  HabitTracker,
  habitTrackerRepository,
} from '../Entities';
import { useText } from '../Text';

export const DetailScreen = ({ route, navigation }) => {
  const { habit, tracker, day } = route.params?.data as {
    habit: Habit
    tracker: HabitTracker
    day: number
  };
  const [showTitle, setShowTitle] = useState(false);
  const text = useText();
  const colors = useTheme();
  const commonStyle = useCommonStyle();
  const { showActionSheetWithOptions } = useActionSheet();

  const styles = StyleSheet.create({
    image: { width: 40, height: 40 },
    name: {
      textAlign: 'center',
      lineHeight: 30,
      color: colors.token.textPrimary,
      fontWeight: FONT_WEIGHT.SEMIBOLD,
    },
    description: {
      textAlign: 'center',
      color: colors.token.textSecondary,
      marginBottom: 8,
    },
  });

  /**
   * Xoá là hành động không hoàn tác được, nên đây là chỗ duy nhất trong module
   * dùng token `destructive` (tím mận, không phải đỏ).
   */
  const onDeletePress = () => {
    showActionSheetWithOptions(
      {
        options: [text.keep_history, text.drop_history, text.cancel],
        message: text.delete_question,
        cancelButtonIndex: 2,
        messageTextStyle: {
          textAlign: 'center',
          fontSize: FONTSIZE.NORMAL,
          alignSelf: 'center',
        },
      },
      async (selectedIndex: number) => {
        if (selectedIndex == 0) {
          await habitRepository.update(
            (h) => h.id == habit.id,
            (h) => {
              h.deleted = true;
              h.deleted_date = new Date().getTime();
            },
          );
          navigation.goBack();
        }
        if (selectedIndex == 1) {
          await habitRepository.delete2((h) => h.id == habit.id);
          const trackers = await habitTrackerRepository.filter(
            (h) => h.hid == habit.id,
          );
          await Promise.all(
            trackers.map((h) => habitTrackerRepository.delete3(h)),
          );
          await habitTrackerRepository.save();
          navigation.goBack();
        }
      },
    );
  };

  const completed = async () => {
    if (day > getCurrentDay().getTime()) {
      showMessage({ message: text.future_day, type: 'info' });
      return;
    }
    await habitTrackerRepository.doneTracker(habit.id, new Date(day));
    navigation.goBack();
  };

  const setDid = async (val: number) => {
    if (day > getCurrentDay().getTime()) {
      showMessage({ message: text.future_day, type: 'info' });
      return;
    }
    await habitTrackerRepository.setDid(habit.id, new Date(day), {
      ...habit.goalOption,
      done: val,
    });
    if (val == habit.goalOption.total) await completed();
  };

  if (habit == null) return <View />;

  return (
    <View
      style={[commonStyle.screen, { flex: 1, backgroundColor: colors.token.background }]}
    >
      <Header
        title={!showTitle ? null : habit.name}
        right={{
          text: text.edit,
          onTouch: () =>
            Router.Open(navigation, 'HabitAppModal', {
              screen: 'Edit',
              id: habit.id,
            }),
        }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={(evt) => setShowTitle(evt.nativeEvent.contentOffset.y > 80)}
      >
        <View style={{ alignSelf: 'center', marginBottom: 10, marginTop: 20 }}>
          <Image
            style={styles.image}
            source={
              iconifyAssets[habit.icon] || AssetManagement.habit_default
            }
          />
        </View>
        <Text style={styles.name}>{habit.name}</Text>
        {habit.description ? (
          <Text style={styles.description}>{habit.description}</Text>
        ) : null}

        {habit.goalOption ? (
          <View style={{ alignItems: 'center' }}>
            <B.CircularSlider
              label={habit.goalOption.unit}
              min={0}
              max={habit.goalOption.total}
              value={tracker.data?.goal?.done || 0}
              onChanged={setDid}
            />
          </View>
        ) : null}

        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <ButtonV2
            radius={30}
            type="primary"
            text={text.today}
            onPress={completed}
          />
        </View>

        <GroupTitle
          label={text.month_view}
          actionText={text.screen_statistic}
          onPress={() =>
            Router.Open(navigation, 'HabitAppModal', {
              id: habit.id,
              screen: 'Statistic',
              sub: 'Details',
            })
          }
        />
        <DataMonth habits={[habit]} />

        <View style={{ marginTop: 30, alignItems: 'center', marginBottom: 50 }}>
          <Link
            onPress={onDeletePress}
            style={{ color: colors.token.destructive }}
          >
            {text.delete}
          </Link>
        </View>
      </ScrollView>
    </View>
  );
};
