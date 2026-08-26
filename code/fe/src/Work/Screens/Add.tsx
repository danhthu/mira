import React, { useRef, useState } from 'react';

import { ScrollView, TouchableOpacity, View } from 'react-native';
import { B, BICon, BText } from '../../../libs/components';
import { ButtonV2 } from '../../../libs/components/Buttons';
import { useTheme } from '../../../theme';
import {
  HEADER_HEIGHT,
  TBL_ROW_HEIGHT
} from '../../../theme/Constraints';
import { getLogger } from '../../Common';
import { Divider } from '../../Common/Components/Divider';
import { Header } from '../../Common/Components/Header';
import { ColorCtrl } from '../../Common/FormControls/ColorCtrl';
import { DescriptionCtrl } from '../../Common/FormControls/DescriptionCtrl';
import { ReminderCtrl } from '../../Common/FormControls/ReminderCtrl';
import { RepeatCtrl } from '../../Common/FormControls/RepeatCtrl';
import { TagCtrl } from '../../Common/FormControls/TagCtrl';
import { useAsyncAction } from '../../Common/Hooks';
import { useCommonStyle } from '../../Common/Styles';
import { LinkToGoal } from '../../Goal/Components';
import { GoalLinkToAction } from '../../Goal/Components/LinkTo';
import iconLists from '../Assets/iconLists';
import { CheckList } from '../Components/CheckList';
import { Priority } from '../Components/Priority';
import { TaskSelection } from '../Components/TaskSelection';
import { Work, workRepository } from '../Entities';
import { useText } from '../Text';
const logger = getLogger('WorkScreens_Add');
const rowHeight = TBL_ROW_HEIGHT;

export const Add = ({ route, navigation }) => {
  const text = useText();
  const t = useText().translate;
  const style = useCommonStyle();
  const theme = useTheme();
  const colors = useTheme();
  const [data, setData] = useState({ ...new Work(), kind: 'todo' });
  const [title, setTitle] = useState(t('Add Todo'));

  //option control display


  const save = async (data) => {
    if (!data.name) return;
    await workRepository.add(data);
    await workRepository.save();
    await LinkToRef.current.save();
    navigation.goBack();
  };

  const workList = useAsyncAction(async () => await workRepository.filter(w => w.kind == 'group'), []);
  const LinkToRef = useRef<GoalLinkToAction>();

  return (
    <View style={[style.modalScreen, { backgroundColor: '#DADADA' }]}>
      <Header
        title={title}
        right={
          <ButtonV2 text={t('Save')} type='link' size='medium' customStyles={{ paddingHorizontal: 0 }} onPress={() => { save(data); }} />
        }
      />
      <ScrollView
        style={{ marginBottom: 100 }}
        onScroll={(evt) => {
          if (title != data.name && evt.nativeEvent.contentOffset.y > HEADER_HEIGHT) {
            setTitle(data.name);
          }
          if (title == data.name && evt.nativeEvent.contentOffset.y < HEADER_HEIGHT) {
            setTitle(t('Add Todo'));
          }
        }}
      >
        {/**header */}
        <Tips />
        {/**colors, icon */}
        <View style={[{ marginBottom: 10, flexDirection: 'row' }]}>
          {!data.icon && (
            <ButtonV2
              icon={'document-outline'}
              text={t('Add icon')}
              outline
              size="small"
              onPress={() =>
                setData({ ...data, icon: iconLists.ic_task })
              }
            />
          )}
        </View>
        {data.icon && (
          <TouchableOpacity style={{ flexDirection: 'row' }}>
            <BICon
              name={iconLists[data.icon || 'task'] || iconLists.ic_task}
              style={{ width: 30, height: 30 }}
            />
          </TouchableOpacity>
        )}
        <View style={[]}>
          <View style={[style.sectionContainer, { marginTop: 0 }]}>
            <B.TextBox
              label={t('Name')}
              inputStyle={[
                { textAlign: 'center', textAlignVertical: 'top', fontSize: 30 },
              ]}
              viewStyle={{ borderBottomWidth: 0 }}
              value={data.name || ''}
              onChanged={(val) =>
                setData({ ...data, name: val, startDate: data.startDate || new Date() })
              }
            />
          </View>
          <View style={{ flexDirection: 'row' }}>

            <View style={[style.form.container, { flex: 3, marginRight: 10 }]}>
              <B.TextBox
                label={t('Due Date')}
                icon="calendar-end"
                labelinfo={t('The final date that a task must be completed')}
                dataType="date"
                iconStyle={{ color: colors.error }}
                value={data.endDate}
                onChanged={(val) => setData({ ...data, endDate: val })}
              />
            </View>
            <View style={[style.form.container, { flex: 2, marginLeft: 10 }]}>
              <B.TextBox
                label={t('ETA')}
                showLabel
                labelinfo={t('Estimated time to complete task')}
                icon="hourglass"
                dataType="interger"
                iconStyle={{ color: colors.success, fontWeight: 'bold' }}
                inputStyle={{ textAlign: 'center' }}

                value={data.estimated || 52}
                onChanged={(val) => setData({ ...data, estimated: val })}
              />
            </View>
          </View>
          <View style={style.form.container}>
            <Priority value={data.priority} onChanged={val => setData({ ...data, priority: val })} />
          </View>
          <View style={style.form.container}>
            <CheckList value={data.checkList} onChanged={val => setData({ ...data, checkList: val })} />
          </View>
          <View style={style.form.container}>
            <DescriptionCtrl
              value={data.description}
              onChanged={(val) => setData({ ...data, description: val })}
            />
          </View>
          <Divider />
          {/**thuộc tính */}
          <BText style={style.form.groupTitle}>{t('Properties')}</BText>
          <View style={style.form.container}>
            {/**selected parrent, display dropdown */}
            <TaskSelection
              value={data.workRef}

              onChanged={(value) => setData({ ...data, workRef: value })}
            />
          </View>
          <View style={[style.form.container]}>
            <LinkToGoal
              rowHeight={rowHeight}
              table="Work"
              tableId={data.id}
              ref={LinkToRef}
            />
          </View>
          <View style={style.form.container}>
            <TagCtrl
              values={data.tags}
              onChanged={(val) => setData({ ...data, tags: val })}
            />
          </View>
          <Divider />
          {/**tools */}
          <BText style={style.form.groupTitle}>{t('Tools')}</BText>
          <View style={style.form.container}>
            <ColorCtrl
              value={data.color}
              onChanged={(val) => setData({ ...data, color: val })}
            />
          </View>
          <View style={style.form.container}>
            <RepeatCtrl
              value={data.repeatOption}
              onChanged={(val) => setData({ ...data, repeatOption: val })}
            />
          </View>
          <View style={style.form.container}>
            <ReminderCtrl
              value={data.reminderOption}
              onChanged={(val) => setData({ ...data, reminderOption: val })}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const Tips = () => {
  const text = useText();
  const style = useCommonStyle();
  const tips = text.tips || {
    title: 'Các bước để tạo 1 kế hoạch thành công',
    tips: [
      'Chia nhỏ công việc',
      'Thời gian làm không quá 2h, tốt nhất 1h',
      'Tập trung làm việc đến lúc xong',
    ],
  };
  return null;
  /*
    return (
      <View style={style.tips.container}>
        <View style={[style.tips.title_container]}>
          <Text style={style.tips.title}>{tips.title}</Text>
        </View>
        <View style={style.tips.checklist_container}>
          {tips.tips.map((text, i) => (
            <View key={i} style={style.tips.checklist_item_container}>
              <CheckListICon style={style.tips.checklist_icon} />
              <Text style={style.tips.checklist_text}>{text}</Text>
            </View>
          ))}
        </View>
      </View>
    )
      */
};
