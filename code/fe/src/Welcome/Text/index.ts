/**
 * Toàn bộ chuỗi của onboarding. Giọng theo `docs/00-vision.md` §"Giọng của sản
 * phẩm": sentence case, không "nên/phải/hãy", không dấu chấm than, không câu nào
 * nói người dùng làm chưa đủ.
 */

const welcomeText = {
  /** Bốn câu hỏi, mỗi bước đúng một câu (`05-v1-spec.md` §Onboarding). */
  step1Question: 'Ai là người bạn muốn giữ thời gian cho?',
  step1Hint: 'chọn nhiều được',

  step2Question: 'Họ tên là gì?',
  step2Hint: 'gõ tên, để trống cũng được',
  step2AddHint: 'thêm một người nữa',
  step2Remove: 'bỏ',

  step3Question: 'Bạn muốn gặp họ bao nhiêu lần một tháng?',
  step3Hint: 'kéo thanh, mặc định theo vai',

  step4Title: 'Xong',
  step4NoneSaved: 'chưa có ai trong danh sách, thêm lúc nào cũng được',
  step4SavedPrefix: 'đã lưu',
  step4SavedSuffix: 'người',
  step4Note: 'tuổi và khoảng cách chỉ hỏi khi bạn bật đồng hồ cát trong cài đặt',

  roleChild: 'con',
  roleParent: 'bố mẹ',
  rolePartner: 'bạn đời',
  roleFriend: 'bạn thân',
  roleSelf: 'bản thân',
  roleOther: 'người khác',

  namePlaceholder: 'tên',

  cadenceDaily: 'hằng ngày',
  cadenceTimesSuffix: 'lần một tháng',

  next: 'tiếp',
  skip: 'bỏ qua',
  back: 'quay lại',
  finish: 'bắt đầu',

  stepPrefix: 'bước',
  stepSeparator: '/',
} as const;

export type WelcomeText = typeof welcomeText;

export const useText = (): WelcomeText => welcomeText;
