import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { groupBy } from '../../../../libs/arrayUtils';
import { BICon, BText, BText as Text } from '../../../../libs/components';
import { useTheme } from '../../../../theme';
import {
  BLACK_COLOR,
  CAPTION_HEIGHT,
  FONTSIZE,
  GRAY_COLOR,
  GRID_GUTTER,
  GROUP_MARGIN,
  ROUND_NORMAL,
  ROUND_SMALL,
  SECOND_BLACK_COLOR,
} from '../../../../theme/Constraints';
import { useAsyncAction } from '../../../Common/Hooks';
import { getDay } from '../../../Common/Utils/common';
import { Habit, habitRepository, habitTrackerRepository } from '../../Entities';
import { useColors } from '../../Styles/HomeStyle';
import { useText } from '../../Text';
import { repeateToString } from '../../Utils';
export const OverallTab = () => {
  return (
    <View>
      <Summary />
      <Years />
    </View>
  );
};

const Summary = () => {
  const text = useText();
  const [data, setData] = useState({
    successRate: 92,
    total: 0,
    perfect: 0,
    completedHabits: 7,
  });
  const styles = StyleSheet.create({
    label: { color: BLACK_COLOR, fontSize: FONTSIZE.SMALL },
    value: { fontWeight: 'bold', lineHeight: 40, fontSize: FONTSIZE.NORMAL },
    container: {
      borderRadius: GRID_GUTTER / 2,
      backgroundColor: '#fff',
      paddingLeft: GRID_GUTTER,
      paddingRight: GRID_GUTTER,
      paddingTop: GRID_GUTTER / 2,
      paddingBottom: GRID_GUTTER / 2,
    },
  });
  useAsyncAction(async () => {
    setData(
      await habitTrackerRepository.getRecord(
        [],
        new Date().getMonth(),
        new Date().getFullYear(),
      ),
    );
  }, []);
  return (
    <View style={[{ marginBottom: GRID_GUTTER }]}>
      <Text style={{ fontSize: FONTSIZE.NORMAL, fontWeight: 'bold' }}>
        {text.Summary || 'Summary:'}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          marginTop: GRID_GUTTER / 2,
          marginBottom: GRID_GUTTER,
        }}
      >
        <View style={[{ marginRight: GRID_GUTTER / 2, flex: 1 }]}>
          <View style={styles.container}>
            <BText style={styles.label}>
              {text.totalDaysDone || 'Total days done'}
            </BText>
            <BText style={styles.value}>{data.total} days</BText>
          </View>
        </View>
        <View style={[{ marginLeft: GRID_GUTTER / 2, flex: 1 }]}>
          <View style={styles.container}>
            <BText style={styles.label}>
              {text.successRate || 'Success Rate'}
            </BText>
            <BText style={styles.value}>{Math.ceil(data.successRate)} %</BText>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={[{ marginRight: GRID_GUTTER / 2, flex: 1 }]}>
          <View style={styles.container}>
            <BText style={styles.label}>
              {text.perfectDays || 'Perfect days'}
            </BText>
            <BText style={styles.value}>{data.perfect} days</BText>
          </View>
        </View>
        <View style={[{ marginLeft: GRID_GUTTER / 2, flex: 1 }]}>
          <View style={styles.container}>
            <BText style={styles.label}>
              {text.completedHabits || 'Completed habits'}
            </BText>
            <BText style={styles.value}>{data.completedHabits}</BText>
          </View>
        </View>
      </View>
    </View>
  );
};

const Years = () => {
  const [data, setData] = useState([] as Array<Habit>);
  const habitColors = useColors().habitColors;
  useAsyncAction(async () => {
    setData(await habitRepository.list());
  }, []);
  return (
    <FlatList
      scrollEnabled={false}
      data={data}
      renderItem={({ item, index }) => (
        <YearItem key={index}
          habit={item}
          color={habitColors[index % habitColors.length]}
        />
      )}
    ></FlatList>
  );
};

const YearItem = (props: { habit: Habit; color: string }) => {
  const size = 15;
  const text = useText();
  const colors = useTheme();
  const styles = StyleSheet.create({
    container: {
      height: 20,
      borderRadius: ROUND_SMALL / 2,
      margin: 1,
      backgroundColor: 'red',
    },
    normal: {
      backgroundColor: colors.hexToRGB(props.color, 0.3),
    },
    completed: {
      backgroundColor: colors.hexToRGB(props.color || '#ffffff', 0.99),
    },
    make: {
      backgroundColor: colors.hexToRGB(props.color || '#ffffff', 0.5),
    },
    label: {
      color: SECOND_BLACK_COLOR,
      fontSize: FONTSIZE.SSSMALL,
      textAlign: 'center',
      lineHeight: 20,
      width: 20,
    },
    secondLabel: {
      color: '#eee',
    },
  });
  const [styleIndexs, setStyleIndexs] = useState(
    Array.from({ length: size * 7 }, (i) => i).map((i) => ({
      ...styles.normal,
    })),
  );
  const days = [
    text.M || 'M',
    text.T || 'T',
    text.W || 'W',
    text.T || 'T',
    text.F || 'F',
    text.S || 'S',
    text.S || 'S',
  ];

  const navigation = useNavigation<any>();
  useAsyncAction(async () => {
    if (props.habit) {
      const arr = Array.from({ length: size * 7 }, (i) => i).map((i) => ({
        ...styles.normal,
      }));
      const startIndex =
        size * 7 -
        1 -
        (6 - (new Date().getDay() == 0 ? 6 : new Date().getDay() - 1)); //0-6

      const trackers = groupBy(
        await habitTrackerRepository.filter((t) => t.hid == props.habit.id),
        (tr) => tr.day,
      );
      //144  --> now
      for (let i = startIndex; i >= 0; i--) {
        const iToDate = getDay(
          moment(new Date())
            .add(i - startIndex, 'days')
            .toDate(),
        ).getTime();

        const tracker = trackers.findLast((tr) => tr.key == iToDate);
        if (tracker) {
          arr[i] = styles.completed;
        }
      }
      //console.log('arr len', arr.length)
      setStyleIndexs(arr);
    }
  }, [props.habit]);

  return (
    <View
      style={{
        backgroundColor: GRAY_COLOR,
        borderRadius: ROUND_NORMAL,
        padding: ROUND_NORMAL,
        paddingLeft: ROUND_NORMAL * 1.5,
        paddingRight: ROUND_NORMAL * 1.5,
        marginBottom: GROUP_MARGIN,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: BLACK_COLOR,
          marginBottom: GRID_GUTTER / 2,
          marginLeft: 20,
        }}
      >
        <Text
          style={{ flex: 1, lineHeight: CAPTION_HEIGHT, fontWeight: 'bold' }}
        >
          {props.habit?.name}
        </Text>
        <TouchableOpacity
          style={{ alignSelf: 'flex-end', flexDirection: 'row' }}
          onPress={() =>
            navigation.navigate('Statistic.Details', { id: props.habit.id })
          }
        >
          <Text
            style={{
              lineHeight: CAPTION_HEIGHT,
              color: SECOND_BLACK_COLOR,
              marginRight: 5,
              fontSize: FONTSIZE.NORMAL,
            }}
          >
            {repeateToString(props.habit.repeatOption)}
          </Text>
          <BICon
            name="right"
            style={{
              lineHeight: CAPTION_HEIGHT,
              color: SECOND_BLACK_COLOR,
              fontSize: FONTSIZE.NORMAL,
            }}
          />
        </TouchableOpacity>
      </View>
      {/*days.map((d, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            marginBottom: 1,
            justifyContent: 'center',
          }}
        >
          <BText style={styles.label}>{d}</BText>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            {Array.from({ length: size }, (_, ii) => ii).map((k, j) => {
              let key = i * size + j
              return (
                <View
                  style={[styles.container, styleIndexs[key]]}
                  key={key + '_' + j}
                ></View>
              )
            })}
          </View>
        </View>
      ))*/}
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          {days.map((d, i) => (
            <View
              key={i}
              style={{
                marginBottom: 1,
                justifyContent: 'center',
              }}
            >
              <BText style={styles.label}>{d}</BText>
            </View>
          ))}
        </View>
        {Array.from({ length: size }, (_, ii) => ii).map((_, j) => {
          return (
            <View key={j} style={[{ flex: 1 }]}>
              {days.map((__, i) => {
                return (
                  <View
                    style={[styles.container, styleIndexs[j * 7 + i]]}
                    key={j * size + i + '_' + j}
                  ></View>
                );
              })}
            </View>
          );
        })}
      </View>
      { }
    </View>
  );
};
