export type SolarTermId =
  | 'tieuHan'
  | 'daiHan'
  | 'lapXuan'
  | 'vuThuy'
  | 'kinhTrap'
  | 'xuanPhan'
  | 'thanhMinh'
  | 'cocVu'
  | 'lapHa'
  | 'tieuMan'
  | 'mangChung'
  | 'haChi'
  | 'tieuThu'
  | 'daiThu'
  | 'lapThu'
  | 'xuThu'
  | 'bachLo'
  | 'thuPhan'
  | 'hanLo'
  | 'suongGiang'
  | 'lapDong'
  | 'tieuTuyet'
  | 'daiTuyet'
  | 'dongChi';

interface SolarTermStart {
  readonly id: SolarTermId;
  readonly month: number;
  readonly day: number;
}

/**
 * Ngày bắt đầu 24 tiết khí theo dương lịch, xếp theo thứ tự trong năm.
 *
 * Đây là bảng xấp xỉ, sai số ±1 ngày tuỳ năm nhuận: mốc thật là lúc kinh độ mặt
 * trời qua bội số 15°, tính đúng cần lịch thiên văn. Mira dùng tiết khí để gợi
 * một việc ngoài trời, không để tính toán gì, nên lệch một ngày không đổi kết
 * quả nào.
 */
export const SOLAR_TERMS: readonly SolarTermStart[] = [
  { id: 'tieuHan', month: 1, day: 6 },
  { id: 'daiHan', month: 1, day: 20 },
  { id: 'lapXuan', month: 2, day: 4 },
  { id: 'vuThuy', month: 2, day: 19 },
  { id: 'kinhTrap', month: 3, day: 6 },
  { id: 'xuanPhan', month: 3, day: 21 },
  { id: 'thanhMinh', month: 4, day: 5 },
  { id: 'cocVu', month: 4, day: 20 },
  { id: 'lapHa', month: 5, day: 6 },
  { id: 'tieuMan', month: 5, day: 21 },
  { id: 'mangChung', month: 6, day: 6 },
  { id: 'haChi', month: 6, day: 21 },
  { id: 'tieuThu', month: 7, day: 7 },
  { id: 'daiThu', month: 7, day: 23 },
  { id: 'lapThu', month: 8, day: 8 },
  { id: 'xuThu', month: 8, day: 23 },
  { id: 'bachLo', month: 9, day: 8 },
  { id: 'thuPhan', month: 9, day: 23 },
  { id: 'hanLo', month: 10, day: 8 },
  { id: 'suongGiang', month: 10, day: 24 },
  { id: 'lapDong', month: 11, day: 8 },
  { id: 'tieuTuyet', month: 11, day: 22 },
  { id: 'daiTuyet', month: 12, day: 7 },
  { id: 'dongChi', month: 12, day: 22 },
];

export function getSolarTermAt(date: Date): SolarTermId {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  // Năm ngày đầu tháng 1 nằm trước Tiểu hàn, tức vẫn thuộc Đông chí năm trước.
  let current: SolarTermId = 'dongChi';
  for (const term of SOLAR_TERMS) {
    if (term.month > month || (term.month === month && term.day > day)) break;
    current = term.id;
  }
  return current;
}
