/**
 * Phím tắt ghi nhanh: những việc người dùng hay ghi nhất, rút từ chính nhật ký của họ.
 *
 * VÌ SAO KHÔNG PHẢI MỘT DANH SÁCH GÕ CỨNG
 * Mẫu giao diện tham khảo có khay "Danh mục nhanh" với tám ô cố định (Vận động, Ăn uống,
 * Đọc sách, Uống nước…). Đẹp trong ảnh chụp, nhưng đó là danh mục của người thiết kế,
 * không phải của người dùng. Người ngồi trước màn hình này có 144 mục giờ rồi: họ đi làm
 * 8 tiếng, đi lại 2 tiếng, ăn tối 30 phút. Đó mới là tám ô đúng.
 *
 * Và danh mục tự đặt thì tài khoản này đang có **không**. Dựng khay từ danh mục thôi là
 * khay rỗng — tức là thêm một chỗ trống nữa trên màn hình.
 *
 * MỘT CHẠM, KHÔNG PHẢI MỘT CÂU
 * Giả lập persona chỉ ra giảm ma sát ghi là đòn bẩy +39%. Gõ "ăn tối 30 phút" là mười ba
 * ký tự cho một việc lặp lại mỗi ngày. Nếu đã biết "Ăn tối" luôn là 30 phút thì chạm một
 * cái là xong — và nút Hoàn tác bên cạnh gánh phần rủi ro chạm nhầm.
 *
 * SỐ PHÚT LẤY MODE, KHÔNG LẤY TRUNG BÌNH
 * "Ăn tối" ghi 30 phút suốt, một hôm 45. Trung bình ra 31 phút — một con số chưa từng
 * xảy ra, và chạm vào là ghi sai mỗi lần. Mode trả về 30, đúng cái người ta định ghi.
 */
import type { TimeEntry, TimeBucket } from '@mira/contract';

export interface QuickLog {
  /** Khoá ổn định để React không dựng lại hàng phím khi số liệu đổi. */
  readonly khoa: string;
  readonly label: string;
  readonly minutes: number;
  readonly bucket: TimeBucket;
  readonly golden: boolean;
  readonly categoryId: string | null;
  /** Số lần đã ghi trong khoảng xét. Dùng để xếp hạng, và để kiểm. */
  readonly times: number;
}

/**
 * Tối đa bao nhiêu phím.
 *
 * Sáu là hết một hàng cuộn ngang trên màn điện thoại. Nhiều hơn thì phải cuộn mới thấy,
 * mà một phím tắt phải cuộn mới tìm được thì không còn là phím tắt.
 */
export const MAX_SUGGESTIONS = 6;

/** Dưới ngần này lần thì chưa phải thói quen, chỉ là một lần ghi lẻ. */
const MIN_TIMES = 2;

const rateKey = (e: TimeEntry): string =>
  e.categoryId !== null
    ? `dm:${e.categoryId}`
    : `${e.bucket}|${(e.note ?? '').trim().toLowerCase()}|${e.golden ? 'v' : ''}`;

/** Chữ in lên phím: ghi chú nếu có, không thì tên danh mục, không nữa thì rỗng (bỏ phím). */
function nhanCua(e: TimeEntry, tenDanhMuc: ReadonlyMap<string, string>): string {
  const ghiChu = (e.note ?? '').trim();
  if (ghiChu !== '') return ghiChu;
  return e.categoryId === null ? '' : (tenDanhMuc.get(e.categoryId) ?? '').trim();
}

/** Số phút hay gặp nhất. Hoà thì lấy số lớn hơn, vì bỏ sót giờ tệ hơn ghi dư. */
function commonMinutes(ds: readonly number[]): number {
  const dem = new Map<number, number>();
  for (const p of ds) dem.set(p, (dem.get(p) ?? 0) + 1);
  let tot = ds[0] ?? 0;
  let nhieu = 0;
  for (const [phut, lan] of dem) {
    if (lan > nhieu || (lan === nhieu && phut > tot)) {
      tot = phut;
      nhieu = lan;
    }
  }
  return tot;
}

/**
 * Rút phím tắt từ các mục giờ gần đây.
 *
 * `entries` nên là một khoảng vừa phải (hai tuần). Lấy cả đời thì phím tắt đóng băng
 * theo thói quen năm ngoái, mà việc của màn này là ghi chuyện hôm nay.
 */
export function quickSuggestion(
  entries: readonly TimeEntry[],
  toiDa: number = MAX_SUGGESTIONS,
  /**
   * Tên danh mục theo id. Mục ghi qua một phím nhanh, hay câu chat khớp một danh mục, lưu
   * `categoryId` và để ghi chú TRỐNG. Lấy nhãn từ ghi chú thôi thì phím chỉ còn "2h",
   * "8h", "30m" — bắt được trên tài khoản thật ngày 26/11/2026.
   */
  tenDanhMuc: ReadonlyMap<string, string> = new Map(),
): readonly QuickLog[] {
  const group = new Map<string, { color: TimeEntry; phut: number[]; latestDate: string }>();

  for (const e of entries) {
    // Mục không tên và không danh mục thì không có gì để in lên phím.
    const ten = nhanCua(e, tenDanhMuc);
    if (ten === '') continue;

    const k = rateKey(e);
    const co = group.get(k);
    if (co === undefined) {
      group.set(k, { color: e, phut: [e.minutes], latestDate: e.date });
    } else {
      co.phut.push(e.minutes);
      if (e.date > co.latestDate) co.latestDate = e.date;
    }
  }

  return (
    [...group.entries()]
      .filter(([, v]) => v.phut.length >= MIN_TIMES)
      .map(([khoa, v]) => ({
        khoa,
        label: nhanCua(v.color, tenDanhMuc),
        minutes: commonMinutes(v.phut),
        bucket: v.color.bucket,
        golden: v.color.golden,
        categoryId: v.color.categoryId,
        times: v.phut.length,
        latestDate: v.latestDate,
      }))
      // Hay ghi nhất lên trước; hoà thì cái vừa ghi gần đây hơn lên trước, vì thói quen
      // mới phản ánh đời sống hiện tại sát hơn thói quen đã nguội.
      .sort((a, b) => b.times - a.times || (a.latestDate < b.latestDate ? 1 : -1))
      .slice(0, toiDa)
      .map(({ latestDate: _bo, ...g }) => g)
  );
}
