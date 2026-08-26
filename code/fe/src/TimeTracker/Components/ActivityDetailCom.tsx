import moment from 'moment';
import { useEffect } from 'react';
import { View } from 'react-native';
import Modal from 'react-native-modal';
import { B, BText as Text } from '../../../libs/components';
import { FONT_SIZE, TBL_ROW_HEIGHT } from '../../../theme/Constraints';
import { getLogger } from '../../Common';
import { useAsyncAction, useSettings } from '../../Common/Hooks';
import { HabitTracker, habitTrackerRepository } from '../../HabitTracker/Entities';
import { workRepository } from '../../Work/Entities';
import { Work } from '../../Work/Entities/Work';
import { DailyActivity } from '../Entities/DailyActivity';
import { dailyActivityRepository, timeDataRepository } from '../Entities/repositories';
import { TimeData } from '../Entities/TimeData';
import { useText } from '../Text';
//modal
export const ActivityDetailCom = ({ id, onHide }) => {
  const logger = getLogger('ActivityDetail');

  const detail = useAsyncAction(async () => {
    if (id) {
      return await timeDataRepository.findOne(t => t.id == id);
    }
  }, [id], null);
  if (!detail) return <View />;
  return <Modal isVisible
    animationIn="slideInUp"
    animationOut="slideOutDown"
    onModalHide={onHide}
    onBackdropPress={onHide}
    avoidKeyboard={true}
    style={{ justifyContent: 'flex-end', flex: 1, }}
  >
    <View style={[{ backgroundColor: '#fff', borderRadius: 15, padding: 15 }]}>
      {detail.refTable == 'Work' && <WorkDetail timeData={detail} />}
      {detail.refTable == 'HabitTracker' && <HabitDetail timeData={detail} />}
      {detail.refTable == 'DailyActivity' && <DailyActivityDetail timeData={detail} />}
      {detail.refTable == 'CustomActivity' && <CustomActivityDetail timeData={detail} />}
    </View>
  </Modal>;

};

//
const WorkDetail = (props: { timeData: TimeData }) => {
  const logger = getLogger('WorkDetail');
  useEffect(() => {
    logger.info('enter', props.timeData);
    return () => logger.info('exit');
  }, [props.timeData]);
  const text = useText();
  const [setting] = useSettings();
  const data = useAsyncAction(async () => {
    if (props.timeData) {
      return workRepository.findOne(w => w.id == props.timeData.refId);
    }
  }, [props.timeData], null as Work);
  if (!data) return <View />;
  return <View>
    <View>
      <Text style={{ textAlign: 'center' }}>{text.congviec || 'Công việc'}</Text>
    </View>
    <View>
      <Text>{data.name}</Text>
    </View>
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ flex: 1 }}>{text.ngay || 'Ngày'}</Text>
      <Text style={{ alignSelf: 'flex-end' }}>{moment(props.timeData.day).format(setting.dateFormat)}</Text>
    </View>
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ flex: 1 }}>{text.complete || 'Hoàn thành'}</Text>
      <Text style={{ alignSelf: 'flex-end' }}>{moment(data.finishDate).format('HH:mm')}</Text>
    </View>
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ flex: 1 }}>{text.thoiluong || 'Thời lượng'}</Text>
      <View style={{ alignSelf: 'flex-end' }}>
        <B.TextBox label="thoiluong" value={props.timeData.minut} dataType="number" onChanged={val => {
          timeDataRepository.addOrUpdate({ ...props.timeData, minut: val });
        }} />
      </View>
    </View>
  </View>;
};

const HabitDetail = (props: { timeData: TimeData }) => {
  const logger = getLogger('HabitDetail');

  const text = useText();
  const [setting] = useSettings();
  const data = useAsyncAction(async () => {
    if (props.timeData) {
      return habitTrackerRepository.findOne(w => w.id == props.timeData.refId);
    }
  }, [props.timeData], null as HabitTracker);

  if (!data) return <View />;
  return <View>
    <View>
      <Text style={{ lineHeight: TBL_ROW_HEIGHT, fontSize: FONT_SIZE.PageTitle, textAlign: 'center' }}>{text.thoiquen || 'Thói quen'}</Text>
    </View>
    <View>
      <Text style={{ lineHeight: TBL_ROW_HEIGHT }}>{data.label}</Text>
    </View>
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ lineHeight: TBL_ROW_HEIGHT, flex: 1 }}>{text.ngay || 'Ngày'}</Text>
      <Text style={{ lineHeight: TBL_ROW_HEIGHT, alignSelf: 'flex-end' }}>{moment(props.timeData.day).format(setting.dateFormat)}</Text>
    </View>
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ lineHeight: TBL_ROW_HEIGHT, flex: 1 }}>{text.thoiluong || 'Thời lượng'}</Text>
      <View style={{ alignSelf: 'flex-end' }}>
        <Text style={{ lineHeight: TBL_ROW_HEIGHT, flex: 1 }}>{data.minut || 5}</Text>
      </View>
    </View>
  </View>;
};

const DailyActivityDetail = (props: { timeData: TimeData }) => {
  const text = useText();
  const [setting] = useSettings();
  const data = useAsyncAction(async () => {
    if (props.timeData) {
      return dailyActivityRepository.findOne(w => w.id == props.timeData.refId);
    }
  }, [props.timeData], null as DailyActivity);
  if (!data) return <View />;
  return <View>
    <View>
      <Text style={{ textAlign: 'center' }}>{text.hoatdonghangngay || 'Hoạt động hàng ngày'}</Text>
    </View>
    <View>
      <Text>{data.name}</Text>
    </View>
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ flex: 1 }}>{text.ngay || 'Ngày'}</Text>
      <Text style={{ alignSelf: 'flex-end' }}>{moment(props.timeData.day).format(setting.dateFormat)}</Text>
    </View>
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ flex: 1 }}>{text.thoiluong || 'Thời lượng'}</Text>
      <View style={{ alignSelf: 'flex-end' }}>
        <B.TextBox label="thoiluong" value={props.timeData.minut} dataType="number" onChanged={val => {
          timeDataRepository.addOrUpdate({ ...props.timeData, minut: val });
        }} />
      </View>
    </View>
  </View>;
};

const CustomActivityDetail = (props: { timeData: TimeData }) => {
  const text = useText();
  const [setting] = useSettings();
  const data = useAsyncAction(async () => {
    if (props.timeData) {
      return dailyActivityRepository.findOne(w => w.id == props.timeData.refId);
    }
  }, [props.timeData], null as DailyActivity);
  if (!data) return <View />;
  return <View>
    <View>
      <Text style={{ textAlign: 'center' }}>{text.hoatdonghangngay || 'Hoạt động hàng ngày'}</Text>
    </View>
    <View>
      <Text>{data.name}</Text>
    </View>
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ flex: 1 }}>{text.ngay || 'Ngày'}</Text>
      <Text style={{ alignSelf: 'flex-end' }}>{moment(props.timeData.day).format(setting.dateFormat)}</Text>
    </View>
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ flex: 1 }}>{text.thoiluong || 'Thời lượng'}</Text>
      <View style={{ alignSelf: 'flex-end' }}>
        <B.TextBox label="thoiluong" value={props.timeData.minut} dataType="number" onChanged={val => {
          timeDataRepository.addOrUpdate({ ...props.timeData, minut: val });
        }} />
      </View>
    </View>
  </View>;
};