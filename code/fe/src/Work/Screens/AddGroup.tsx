import React, { useRef, useState } from 'react';

import { ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { B, BText as Text } from '../../../libs/components';
import { BICon } from '../../../libs/components/BIcon';
import { useTheme } from '../../../theme';

import {
  FONTSIZE,
  HEADER_HEIGHT,
  TBL_ROW_HEIGHT,
} from '../../../theme/Constraints';
import { getLogger } from '../../Common';
import { Divider } from '../../Common/Components/Divider';
import { Header } from '../../Common/Components/Header';
import { useCommonStyle } from '../../Common/Styles';

import { ButtonV2 } from '../../../libs/components/Buttons';
import { debugStyle } from '../../../libs/components/debugStyle';
import { ReminderBottomModal } from '../../Common/Components';
import { TagCtrl } from '../../Common/FormControls/TagCtrl';
import { LinkToGoal } from '../../Goal/Components';
import { GoalLinkToAction } from '../../Goal/Components/LinkTo';
import iconLists from '../Assets/iconLists';
import { TaskSelection } from '../Components/TaskSelection';
import { Work, workRepository } from '../Entities';
import { useText } from '../Text';
const logger = getLogger('WorkScreens_Add');
const rowHeight = TBL_ROW_HEIGHT;

export const AddGroup = ({ route, navigation }) => {
  const text = useText();
  const t = useText().translate;
  const [title, setTitle] = useState(t('Add Task Group'));

  const style = useCommonStyle();
  const colors = useTheme();
  const [data, setData] = useState({ ...new Work(), kind: 'group' });
  const goalLinkRef = useRef<GoalLinkToAction>();

  const save = async (data) => {
    if (!data.name) return;
    await workRepository.add(data);
    await workRepository.save();
    await goalLinkRef.current.save();
    navigation.goBack();
  };
  return (
    <View style={[{ backgroundColor: '#fff' }, style.modalScreen]}>
      <Header
        title={title}
        right={
          <TouchableOpacity style={[debugStyle]} onPress={() => save(data)}>
            <Text style={{ fontSize: FONTSIZE.NORMAL }}>{t}</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView
        onScroll={(evt) => {
          if (
            title != data.name &&
            evt.nativeEvent.contentOffset.y > HEADER_HEIGHT
          ) {
            setTitle(data.name);
          }
          if (
            title == data.name &&
            evt.nativeEvent.contentOffset.y < HEADER_HEIGHT
          ) {
            setTitle(t('Add Task Group'));
          }
        }}
      >
        <View style={[]}>
          <View style={[{ marginBottom: 10 }]}>
            {!data.icon && (
              <ButtonV2
                icon={iconLists.ic_smile}
                text={t('Add icon')}
                outline
                size="small"
                onPress={() =>
                  setData({ ...data, icon: iconLists.ic_task_group })
                }
              />
            )}
          </View>
          {data.icon && (
            <TouchableOpacity style={{ flexDirection: 'row' }}>
              <BICon
                name={iconLists[data.icon || 'task'] || iconLists.ic_task_group}
                style={{ width: 30, height: 30 }}
              />
            </TouchableOpacity>
          )}
          <View style={[{ marginTop: 10 }]}>
            <TextInput
              placeholder={t('Untitled')}
              style={{ fontSize: FONTSIZE.BIG }}
              onChangeText={(val) => setData({ ...data, name: val })}
            />
          </View>

          <View style={[{ marginTop: 10 }]}>
            <TextInput
              multiline
              placeholder={t('Description')}
              style={{ fontSize: FONTSIZE.NORMAL, height: 80 }}
              onChangeText={(val) => setData({ ...data, description: val })}
            />
          </View>
          <Divider />
          <View style={{ marginTop: 10 }}>
            <B.TextBox
              label={t('Due')}
              icon="calendar-end"
              dataType="date"
              iconStyle={{ color: colors.error }}
              value={data.endDate}
              onChanged={(val) => setData({ ...data, endDate: val })}
            />
          </View>
          <View
            style={[
              {
                marginTop: 0,
                backgroundColor: '#fff',
                height: 40,
                justifyContent: 'center',
              },
            ]}
          >
            <Text>{t('Associations')}</Text>
            {/**selected parrent, display dropdown */}
            <TaskSelection
              value={data.workRef}
              onChanged={(value) => setData({ ...data, workRef: value })}
            />
          </View>
          <View style={[style.sectionContainer, { marginTop: 0 }]}>
            {/**tools: hashtag, reminder, link to challenge, link to goal */}
            <LinkToGoal ref={goalLinkRef} table="work" tableId={data.id} />
          </View>

          <Text>{t('Tools')}</Text>
          <View style={[style.sectionContainer, { marginTop: 0 }]}>
            {/**tools: hashtag, reminder, link to challenge, link to goal */}
            <TagCtrl
              values={data.tags}
              onChanged={(val) => setData({ ...data, tags: val })}
            />
          </View>
          <View style={[style.sectionContainer, { marginTop: 0 }]}>
            {/**tools: hashtag, reminder, link to challenge, link to goal */}
            <ReminderBottomModal
              value={data.reminderOption}
              onChanged={(val) => {
                setData({ ...data, reminderOption: val });
              }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
