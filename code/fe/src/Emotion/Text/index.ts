import { useText as useCommonText } from '../../../lang'

const moodLabel: Record<string, string> = {
  great: 'rất ổn',
  good: 'ổn',
  okay: 'tạm',
  notgreat: 'hơi chùng',
  bad: 'nặng nề',
}

export const useText = () => {
  const text = useCommonText()
  return {
    emotion_status: moodLabel,

    mood_pulse: 'Nhịp cảm xúc',
    how_are_you_feeling: 'Hôm nay bạn thấy thế nào',
    dailyMovitation: 'Câu nói hàng ngày',
    nhapnoidung: 'Nhập nội dung',
    ngaunhien: 'Ngẫu nhiên',
    tuantu: 'Tuần tự',
    chedohienthi: 'Chọn chế độ hiển thị',
    chonchedohienthi: 'Chọn chế độ hiển thị',
    done: 'Xong',

    Mon: 'T2',
    Tue: 'T3',
    Web: 'T4',
    Thu: 'T5',
    Fri: 'T6',
    Sat: 'T7',
    Sun: 'CN',

    for: text.for,
    translate: (name: string, def?: string) => moodLabel[name] ?? text.translate(name, def),
  } as {
    [Key: string]: any
  }
}
