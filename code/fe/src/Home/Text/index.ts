import { useText as useCommonText } from '../../../lang';

export const useText = () => {
  const text = useCommonText();
  return {
    Name: 'Tên',
    Description: 'Mô tả',
    DoDate: 'Ngày bắt đầu',
    EndDate: 'Ngày kết thúc',
    IsMandatory: 'Bắt buộc',
    Estimated: 'Dự kiến',
    Reminder: 'Nhắc',

    app_habit: 'Thói quen',
    app_work: 'Công việc',
    app_challenge: 'Thử thách',
    app_personProfile: 'Tôi',

    dailyTask_habit: 'Thói quen',
    dailyTask_habit_dsc: ' thói quen ',
    dailyTask_work: 'Việc',
    dailyTask_work_dsc: ' việc hôm nay',
    habit_done: 'Đã làm',
    mandatory: 'Bắt buộc',
    khampha: 'Khám phá',

    for: text.for,
    translate: text.translate,
  } as {
    [Key: string]: any;
  };
};
