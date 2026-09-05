/**
 * Bảng tra chuỗi nguồn → tiếng Việt.
 *
 * Batify gọi `text.for('...')` và `t('...')` với chuỗi tiếng Anh viết thẳng trong
 * JSX, hàm `for` cũ trả lại nguyên chuỗi nên màn hình ra tiếng Anh. Thay vì sửa
 * hơn 100 file .tsx, ở đây tra chuỗi nguồn ra tiếng Việt — chỗ gọi giữ nguyên,
 * chữ trên màn hình đổi hết.
 *
 * Giọng theo `docs/00-vision.md`: sentence case, không dấu chấm than, không
 * "nên/phải/hãy", không câu nào ám chỉ người dùng làm chưa đủ.
 */
export const dictionary: Record<string, string> = {
  ' and': ' và ',
  ' để thêm nhiệm vụ mới.': ' để thêm việc mới.',
  ' để thêm.': ' để thêm.',
  'Add Task Group': 'Thêm nhóm việc',
  'Add Todo': 'Thêm việc',
  'Add checklist': 'Thêm danh sách kiểm',
  'Add icon': 'Thêm biểu tượng',
  'Add tag': 'Thêm thẻ',
  'Add to': 'Thêm vào',
  All: 'Tất cả',
  Associations: 'Liên kết',
  'Basic info': 'Thông tin cơ bản',
  'By continuing, you agree to our ': 'Tiếp tục nghĩa là bạn đồng ý với ',
  'Choose priority': 'Chọn mức ưu tiên',
  'Chọn task': 'Chọn việc',
  Completion: 'Hoàn thành',
  Continue: 'Tiếp tục',
  'Daily tasks': 'Việc trong ngày',
  'Data in month': 'Dữ liệu trong tháng',
  Description: 'Mô tả',
  Detail: 'Chi tiết',
  Done: 'Xong',
  Due: 'Hạn',
  'Due Date': 'Hạn',
  ETA: 'Dự kiến',
  Edit: 'Sửa',
  Empty: 'Chưa có gì ở đây',
  'Estimated time to complete task': 'Thời gian dự kiến cho việc này',
  Finish: 'Xong',
  'Habit Tracker': 'Thói quen',
  'Happiness index': 'Chỉ số hạnh phúc',
  'How are you feeling? ': 'Hôm nay bạn thấy thế nào? ',
  'How many working days per week?': 'Một tuần bạn làm việc mấy ngày',
  'Inititalize...': 'Đang chuẩn bị...',
  "Let's do it": 'Bắt đầu',
  "Let's focus on your today's habit": 'Thói quen của hôm nay đang ở đây',
  'Link your goal': 'Nối với mục tiêu',
  'Loading...': 'Đang tải...',
  'Look back on your': 'Nhìn lại',
  Mandatory: 'Bắt buộc',
  Miss: 'Chưa làm',
  'Mood Pulse': 'Nhịp cảm xúc',
  'Mood pulse': 'Nhịp cảm xúc',
  Name: 'Tên',
  'No data': 'Chưa có dữ liệu',
  'No plan': 'Chưa lên lịch',
  Plan: 'Lên lịch',
  Priority: 'Ưu tiên',
  'Privacy policy': 'Chính sách riêng tư',
  Profile: 'Hồ sơ',
  Properties: 'Thuộc tính',
  'Recommend activies necessary to simple life and get happier':
    'Vài việc nhỏ hợp với nhịp sống bạn vừa kể',
  Record: 'Ghi lại',
  Save: 'Lưu',
  Scheduled: 'Đã lên lịch',
  Tags: 'Thẻ',
  Task: 'Việc',
  Terms: 'Điều khoản',
  'The final date that a task must be completed': 'Ngày cuối cùng của việc này',
  'This week': 'Tuần này',
  'Thêm tags để phân loại nhiệm vụ, nhấn ': 'Thêm thẻ để phân loại việc, nhấn ',
  'Time Effective': 'Thời gian hiệu quả',
  Today: 'Hôm nay',
  Todo: 'Việc cần làm',
  Tools: 'Công cụ',
  UnPlan: 'Chưa lên lịch',
  Untitled: 'Chưa đặt tên',
  'View all': 'Xem tất cả',
  'Welcome to': 'Chào bạn, đây là Mira',
  'What time do you sleep': 'Bạn thường ngủ lúc mấy giờ',
  'What time do you usually wake up': 'Bạn thường dậy lúc mấy giờ',
  'Work Completed': 'Việc đã xong',
  "You're about to take the first step in **make your life happier!** Let us guide you through it.":
    'Mira ghi lại hai thứ: thời gian bạn dành cho người quan trọng, và quãng tự do bạn đã mua được. Vài câu hỏi ngắn để bắt đầu.',
  'check it now': 'xem ngay',
  days: 'ngày',
  habit: 'thói quen',
  name: 'Tên',
  records: 'Bản ghi',
  'tasks has done': 'việc đã xong',
  year: 'Năm',
};

/**
 * Tra `name` trước, rồi tra `def` — nhiều chỗ gọi `t('mn_plan', 'Lập kế hoạch')`
 * với `name` là mã còn `def` mới là chuỗi người đọc thấy.
 */
export const translate = (name: string, def?: string): string => {
  if (dictionary[name]) return dictionary[name];
  if (def && dictionary[def]) return dictionary[def];
  return def ?? name;
};
