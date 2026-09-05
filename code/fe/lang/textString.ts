import { translate } from './dictionary';

export const APP_NAME = 'Mira';

/**
 * Bảng chuỗi mặc định của app — tiếng Việt. `en.ts` là bản dịch ngược sang tiếng
 * Anh, giữ lại vì cấu trúc đa ngôn ngữ đã có sẵn trong `configStore.lang`.
 *
 * Giọng theo `docs/00-vision.md`: sentence case, không dấu chấm than, không dùng
 * "nên", "phải", "hãy", và không câu nào nói người dùng làm chưa đủ. Trạng thái
 * rỗng luôn là một câu trung tính cộng một hành động cụ thể.
 */
export const textString = {
  appName: APP_NAME,

  common: {
    daysOfWeek: [
      'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy', 'Chủ nhật',
    ],
    daysOfWeekShort: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    daysOfWeekShort3L: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    priority: {
      high: 'Cao',
      normal: 'Vừa',
      low: 'Thấp',
      label: 'mức ưu tiên',
    },
    work: 'Công việc',
    doing: 'đang làm',
    status: 'Trạng thái',
    statusText: ['chưa xong', 'xong'],
    habit: 'Thói quen',
    challenge: 'thử thách',
    save: 'Lưu',
    edit: 'Sửa',
    description: 'mô tả',
    color: 'màu',
    repeat: 'lặp lại',
    reminder: 'nhắc',
    tool: 'công cụ',
    newHabit: 'thói quen mới',
    error: {
      habit_day_greater: '',
    },
    addNew: 'Thêm mới',
    completed: 'Đã xong',
    basic_info: 'Thông tin cơ bản',
    tabar: {
      profile: 'Hồ sơ',
      timeTracker: 'Thời gian',
      habitTracker: 'Thói quen',
      challenge: 'Thử thách',
      home: 'Trang chính',
    },
    delete: 'xóa',
  },

  save: 'Lưu',
  add: 'Thêm',
  edit: 'Sửa',
  cancel: 'Hủy',
  done: 'Xong',
  day: 'ngày',
  week: 'tuần',
  month: 'tháng',
  year: 'năm',

  plus: '+',

  repeat: {
    title: 'Lặp lại',
    subTitle: 'Đặt nhịp lặp cho việc này',
    weekly: 'hàng tuần',
    monthly: 'hàng tháng',
    day: 'ngày',
    week: 'tuần',
    month: 'tháng',
    daily: 'hàng ngày',
    repeat: 'Lặp lại',
    every: 'Mỗi',
    endDay: 'ngày kết thúc',
  },
  goal: {
    title: 'Mục tiêu',
    subTitle: 'Đặt một mục tiêu',
    perday: 'mỗi ngày',
  },
  reminder: {
    title: 'Nhắc',
    subTitle: 'Đặt lời nhắc cho việc này',
    des: 'Nhắc tôi lúc ',
  },
  plan: {
    title: 'Lên lịch',
    subTitle: 'Thời gian dự kiến cho việc đã lên lịch',
    des: 'Làm lúc ',
  },
  tag: {
    title: 'Thẻ',
    subTitle: 'Ô nhập tự đặt',
  },
  checkList: {
    title: 'Danh sách kiểm',
    subTitle: 'Những mục cần đánh dấu khi làm xong',
  },

  for: translate,
  translate,

  profile_screen: {
    HelpAndFeedback: 'Trợ giúp và góp ý',
    StatusStat: 'Cảm xúc',
    HabitStat: 'Thói quen',
    TimeStat: 'Thời gian',
    ChallengerStat: 'Thử thách',
    ViewAll: 'Xem tất cả',
    Caption: 'Hồ sơ',
    help_center: 'Trung tâm trợ giúp',
    feedback: 'Góp ý',
    privacy: 'Chính sách riêng tư',
    term: 'Điều khoản',
  },

  welcome_Q: {
    title: 'Có điều nào dưới đây quen với bạn không',
    questions: [
      { title: 'Cuộc sống nhiều việc quá, những lúc thấy vui thì trôi qua rất nhanh', answer: true },
      { title: 'Thường xuyên thấy căng thẳng', answer: true },
      { title: 'Hết ngày, hết tuần, hết tháng mà nhìn lại không rõ mình đã làm gì', answer: true },
      { title: 'Muốn giữ một thói quen tốt nhưng khó duy trì', answer: true },
      { title: 'Khối lượng việc mỗi ngày nhiều hơn sức mình xoay', answer: true },
      { title: 'Đặt mục tiêu cho bản thân rồi để đó', answer: true },
    ],
  },

  welcome_Recomments: {
    title: 'Từ những gì bạn vừa chia sẻ, đây là vài việc có thể hợp',
    array: [
      {
        title: 'Vận động nhẹ khoảng 15 phút sau khi thức dậy để cơ thể ấm lên.', enable: true, id: 1,
        params: { repeat: { kind: 'daily', repeat: 1 }, reminder: {} },
      },
      {
        title: 'Xem và sắp xếp việc cho ngày mới lúc {$.wakeup.minut+15>60?$.wakeup.hour+1:$.wakeup.hour}: {($.wakeup.minut+15)>=60?($.wakeup.minut+15)-60:($.wakeup.minut+15)}.', enable: true, id: 1,
        params: { repeat: { kind: 'weekly', repeat: 1 }, plan: { time: '$.wakeup.minut+15' }, reminder: {} },
      },
      { title: 'Nhìn lại những quãng thời gian bạn thấy trôi đi vô ích.', enable: true, id: 1, params: { repeat: { kind: 'weekly' }, reminder: {} } },
      {
        title: 'Lúc {$.sleep.minut}, dành 15 phút thư giãn trước khi ngủ: thiền, yoga, đọc sách, nghe nhạc, hay bất cứ thứ gì bạn thích.', enable: true,
        id: 1, params: { repeat: { kind: 'daily', repeat: 1 }, reminder: {} },
      },
      { title: 'Dành 45 đến 60 phút vận động mỗi ngày.', enable: true, id: 1, params: { repeat: { kind: 'daily', repeat: 1 }, reminder: {} } },
    ],
  },

  welcome_finish: {
    title: 'Mọi thứ đã sẵn sàng',
    content:
      'Có chỗ nào trong app chưa vừa ý, bạn kể cho tụi mình nghe. Tụi mình đọc hết và sửa dần.',
  },

  smart_goal: {
    desc: `<p>Một mục tiêu dễ theo thường có đủ năm phần, gọi tắt là SMART</p>
        <ul>
        <li><b>Cụ thể:</b> nói rõ ra, không mập mờ</li>
        <li><b>Đo được:</b> có con số để biết mình đang ở đâu</li>
        <li><b>Trong tầm với:</b> vừa sức, không phải chuyện bất khả thi</li>
        <li><b>Gắn với đời mình:</b> thật sự liên quan tới thứ bạn quan tâm</li>
        <li><b>Có mốc thời gian:</b> ngày bắt đầu và ngày muốn đạt</li>
        </ul>
        `,
  },
};
