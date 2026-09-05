import { HabitTemplate, habitTemplateRepository } from '../Entities';

/**
 * Bộ gợi ý thói quen hiện trên màn Thêm.
 *
 * Bản Batify sinh 50 bản ghi tên "Templates : 0" … "Templates : 49", mô tả
 * "Generated template sample...", nhóm và bộ sưu tập đặt tên tiếng Anh, màu bốc
 * ngẫu nhiên từ sáu mã viết cứng. Người dùng mở màn Thêm ra chỉ thấy một danh
 * sách vô nghĩa. Đây là danh sách thật, tiếng Việt, mỗi mục là một việc làm được
 * trong ngày; màu để `undefined` cho màn hình tự lấy dải nhấn từ token.
 */
const templates: Array<{
  group: string
  group_desc: string
  group_icon: string
  items: Array<{ name: string; icon: string }>
}> = [
  {
    group: 'Buổi sáng',
    group_desc: 'Vài việc nhỏ trước khi ngày bắt đầu cuốn đi',
    group_icon: 'morning',
    items: [
      { name: 'Uống một cốc nước', icon: 'material-symbols-light--water-drop-rounded' },
      { name: 'Ra ngoài mười phút', icon: 'emojione--person-running' },
      { name: 'Viết ba dòng cho hôm nay', icon: 'fluent-mdl2--learning-tools' },
    ],
  },
  {
    group: 'Cơ thể',
    group_desc: 'Nền của mọi thứ còn lại',
    group_icon: 'body-care',
    items: [
      { name: 'Vận động hai mươi phút', icon: 'token-branded--gymnet' },
      { name: 'Giãn cơ trước khi ngủ', icon: 'healthicons--exercise-yoga-outline' },
      { name: 'Ăn một bữa có rau', icon: 'emojione--smiling-face-with-sunglasses' },
    ],
  },
  {
    group: 'Nghỉ ngơi',
    group_desc: 'Giấc ngủ quyết định phần lớn ngày hôm sau',
    group_icon: 'better-sleep',
    items: [
      { name: 'Tắt màn hình trước khi ngủ', icon: 'emojione-v1--relieved-face' },
      { name: 'Lên giường trước 23 giờ', icon: 'fluent-emoji-flat--glowing-star' },
    ],
  },
  {
    group: 'Học và khám phá',
    group_desc: 'Mỗi ngày một chút, không cần nhiều',
    group_icon: 'learn-explore',
    items: [
      { name: 'Đọc mười lăm phút', icon: 'fluent-mdl2--learning-tools' },
      { name: 'Học từ mới', icon: 'emojione--astonished-face' },
    ],
  },
  {
    group: 'Người thân',
    group_desc: 'Quỹ thời gian này không đầy lại được',
    group_icon: 'clean-home',
    items: [
      { name: 'Gọi cho bố mẹ', icon: 'emojione--person-surfing' },
      { name: 'Ăn tối cùng gia đình', icon: 'emojione--fire' },
    ],
  },
];

export async function initialize() {
  await habitTemplateRepository.empty();
  for (const group of templates) {
    for (const item of group.items) {
      await habitTemplateRepository.add({
        ...new HabitTemplate(),
        name: item.name,
        icon: item.icon,
        group: group.group,
        group_desc: group.group_desc,
        group_icon: group.group_icon,
      });
    }
  }
  await habitTemplateRepository.save();
}
