/**
 * Quyết định lời nhắc nào đang tới hạn.
 *
 * TẤT CẢ NẰM Ở CLIENT, VÀ ĐÓ LÀ CHỦ Ý
 *
 * "21:00" nghĩa là chín giờ tối **chỗ người dùng đang ngồi**. Máy chủ không biết họ ở múi
 * giờ nào, nên nó chỉ giữ chuỗi "21:00" và danh sách ngày đã bỏ qua. Nếu máy chủ trả lời
 * được câu "lời nhắc nào tới hạn" thì nó đã đoán múi giờ, và đoán sai thì lời nhắc chín
 * giờ tối nhảy ra lúc hai giờ chiều.
 *
 * MIRA KHÔNG GỬI THÔNG BÁO ĐẨY, VÀ KHÔNG HỨA LÀ CÓ
 *
 * Đẩy thật đòi service worker, Push API, khoá VAPID và một máy chủ luôn bật — mà máy chủ
 * Mira đang nằm trên laptop. Hứa "nhắc" rồi im lặng là cách nhanh nhất làm hỏng niềm tin
 * vào mọi con số khác trong app.
 *
 * Nên lời nhắc ở đây xuất hiện **trong khung chat**: mở Mira ra thì nó nằm sẵn trong dòng
 * trò chuyện. Một việc, làm được thật.
 *
 * ĐÃ GHI RỒI THÌ KHÔNG NHẮC
 *
 * Lời nhắc tồn tại để gợi người ta ghi. Ghi xong mà vẫn nhắc thì nó thành lời trách, và
 * thứ người ta làm với lời trách là tắt hẳn — mất luôn cả lời nhắc đáng giá. Mục do nếp
 * sinh ra **không tính**: đó là máy tự điền, không phải người dùng ngồi xuống với ngày
 * của mình.
 */
import type { TimeEntry } from '@mira/contract';

export interface Nhac {
  readonly id: string;
  /** HH:MM theo đồng hồ người dùng. */
  readonly gio: string;
  /** Thứ trong tuần theo ISO: 1 là thứ hai, 7 là chủ nhật. */
  readonly days: string;
  readonly loi: string | null;
  readonly bat: boolean;
}

export interface BoQua {
  readonly nhacId: string;
  readonly date: string;
}

/** Thứ theo ISO của một ngày YYYY-MM-DD. Thứ hai là 1, chủ nhật là 7. */
export const thuIso = (ngay: string): number => {
  const d = new Date(`${ngay}T00:00:00Z`);
  return ((d.getUTCDay() + 6) % 7) + 1;
};

/** "21:05" → 1265. Chuỗi sai dạng trả về null chứ không trả NaN đi tiếp. */
export function phutCuaGio(gio: string): number | null {
  const m = /^([01][0-9]|2[0-3]):([0-5][0-9])$/.exec(gio);
  if (m === null) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Người dùng đã tự tay ghi gì cho ngày này chưa. Mục do nếp sinh không tính. */
export const daGhiTay = (entries: readonly TimeEntry[], ngay: string): boolean =>
  entries.some((e) => e.date === ngay && e.source !== 'nep');

export interface BoiCanhNhac {
  readonly ngay: string;
  /** Số phút đã trôi qua kể từ 0h theo đồng hồ người dùng. */
  readonly phutHienTai: number;
  readonly daGhi: boolean;
}

/**
 * Lọc ra những lời nhắc đã tới giờ mà chưa được đáp.
 *
 * Trả về theo thứ tự giờ tăng dần: nếu hai lời nhắc cùng quá hạn thì cái sớm hơn nằm
 * trên, đúng như thứ tự chúng đã trôi qua.
 */
export function nhacToiHan(
  ds: readonly Nhac[],
  boQua: readonly BoQua[],
  bc: BoiCanhNhac,
): readonly Nhac[] {
  if (bc.daGhi) return [];

  const thu = thuIso(bc.ngay);
  const daBo = new Set(boQua.filter((b) => b.date === bc.ngay).map((b) => b.nhacId));

  return ds
    .filter((n) => {
      if (!n.bat || daBo.has(n.id)) return false;
      if (!n.days.includes(String(thu))) return false;
      const phut = phutCuaGio(n.gio);
      return phut !== null && phut <= bc.phutHienTai;
    })
    .slice()
    .sort((a, b) => (phutCuaGio(a.gio) ?? 0) - (phutCuaGio(b.gio) ?? 0));
}

const THU_VI = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

/**
 * Đọc chuỗi thứ thành câu người đọc được.
 *
 * Gộp các trường hợp hay gặp thành tên gọi thay vì liệt kê bảy thứ: "Mỗi ngày" đọc nhanh
 * hơn "Thứ 2, Thứ 3, Thứ 4, Thứ 5, Thứ 6, Thứ 7, Chủ nhật" rất nhiều, và màn thiết lập
 * là chỗ người ta liếc chứ không đọc.
 */
export function doiThu(days: string): string {
  const sap = [...new Set(days.split(''))].sort().join('');
  if (sap === '1234567') return 'Mỗi ngày';
  if (sap === '12345') return 'Thứ 2 → Thứ 6';
  if (sap === '67') return 'Cuối tuần';
  return sap
    .split('')
    .map((d) => THU_VI[Number(d)] ?? '')
    .join(', ');
}
