import React, { useEffect, useRef, useState } from 'react';

import { ScrollView, View } from 'react-native';
import { B } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { ChallengerApp } from '../../Challenger';
import { ChallengeLinkToAction } from '../../Challenger/Components/LinkTo';
import { ColorCtrl } from '../../Common/FormControls/ColorCtrl';
import { DescriptionCtrl } from '../../Common/FormControls/DescriptionCtrl';
import { MantatoryCtrl } from '../../Common/FormControls/MantatoryCtrl';
import { ReminderCtrl } from '../../Common/FormControls/ReminderCtrl';
import { RepeatCtrl } from '../../Common/FormControls/RepeatCtrl';
import { useAsyncAction } from '../../Common/Hooks';
import { useCommonStyle } from '../../Common/Styles';
import { LinkToGoal } from '../../Goal/Components';
import { GoalLinkToAction } from '../../Goal/Components/LinkTo';
import { Work, workRepository } from '../Entities';
import { useText } from '../Text';


const rowHeight = 50;

export const Edit = ({ route, navigation }) => {
  const text = useText();
  const style = useCommonStyle();
  const theme = useTheme();

  const [data, setData] = useState(null as Work);
  useAsyncAction(async () => {
    setData(await workRepository.findOne(w => w.id == route.params.id));
  }, [route.params]);
  const dataRef = useRef(data);
  const LinkToRef = useRef<GoalLinkToAction>();
  const LinkToChallengeRef = useRef<ChallengeLinkToAction>();
  const update = (updated) => {
    setData((prevHabit) => ({ ...prevHabit, ...updated }));
  };


  useEffect(() => {
    dataRef.current = data;
  }, [data]);


  const save = async () => {
    const data = dataRef.current;
    if (!data.name) return;
    await workRepository.addOrUpdate(data);
    await LinkToRef.current.save();
    await LinkToChallengeRef.current.save();
    navigation.goBack();
  };

  useEffect(() => {
    //auto save
    return () => {
      save();
    };
  }, []);



  if (!data) return <View></View>;
  return (
    <ScrollView style={{ backgroundColor: theme.background }}>
      <View style={style.sectionContainer}>
        <B.TextBox
          label={text.name || 'Tên công việc'}
          icon="work-outline"
          // inputStyle={{ textAlign: 'center', }}
          viewStyle={{ borderBottomWidth: 0 }}
          value={data.name}
          onChanged={(val) => update({ name: val })}
        />
      </View>

      <View style={style.sectionContainer}>
        <MantatoryCtrl
          value={data.mandatory}
          onChanged={(val) => update({ mandatory: val })}
        />
      </View>

      <View style={style.sectionContainer}>
        <ColorCtrl
          value={data.color}
          onChanged={(val) => update({ color: val })}
        />
      </View>

      <View style={style.sectionContainer}>
        <B.TextBox
          label={text.name || 'Chọn ngày bắt đầu'}
          dataType="date"
          icon="calendar-start"
          value={data.startDate}
          onChanged={(val) => update({ startDate: val })}
        />
      </View>

      <View style={style.sectionContainer}>
        <B.TextBox
          label={text.name || 'Chọn ngày kết thúc'}
          icon="calendar-end"
          dataType="date"
          value={data.endDate}
          onChanged={(val) => update({ endDate: val })}
        />
      </View>

      <View style={style.sectionContainer}>
        <ReminderCtrl
          value={data.reminderOption}
          onChanged={(val) => update({ reminderOption: val })}
        />
      </View>

      <View style={style.sectionContainer}>
        <RepeatCtrl
          value={data.repeatOption}
          onChanged={(val) => update({ repeatOption: val })}
        />
      </View>
      <View style={style.sectionContainer}>
        <LinkToGoal
          rowHeight={rowHeight}
          table="Work"
          tableId={data.id}
          ref={LinkToRef}
        />
      </View>
      <View style={style.sectionContainer}>
        <ChallengerApp.Components.LinkTo
          rowHeight={rowHeight}
          table="Challenge"
          tableId={data.id}
          ref={LinkToChallengeRef}
        />
      </View>

      <View style={style.description}>
        <DescriptionCtrl
          value={data.description}
          onChanged={(val) => update({ description: val })}
        />
      </View>
    </ScrollView>
  );
};
