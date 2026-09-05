import { useText as useCommonText } from '../../../lang';

export const useText = () => {
  const text = useCommonText();
  return {
    title: 'Chào bạn,',
    wish: 'Mong hôm nay của bạn nhẹ nhàng',

    app_today: 'Hôm nay',
    app_habit: 'Thói quen',
    app_work: 'Công việc',
    app_tools: 'Công cụ',
    app_discover: 'Khám phá',

    for: text.for,
    translate: text.translate,
  } as {
    [Key: string]: any;
  };
};
