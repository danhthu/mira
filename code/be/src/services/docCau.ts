/**
 * Đọc một câu tiếng Việt thành ý định có cấu trúc — bằng luật, không gọi mạng.
 *
 * VÌ SAO CÓ TẦNG LUẬT TRƯỚC KHI GỌI LLM
 *
 * Vốn từ của Mira rất hẹp: bốn ô, năm ô tiền, kẹo hoặc muối, và danh mục do chính người
 * dùng đặt. Phần lớn câu người ta gõ là một con số cộng một đơn vị cộng một từ khoá. Gọi
 * LLM cho những câu đó là trả tiền và trả độ trễ cho một việc `RegExp` làm xong trong
 * một mili giây.
 *
 * Quan trọng hơn: tầng luật **chạy được khi chưa có khoá API**. Nếu cả tính năng chỉ sống
 * nhờ LLM thì nó chết ngay lúc chưa cấu hình, và Mira đã có một tính năng như vậy rồi
 * (đăng nhập Google). Hai cái thì quá nhiều.
 *
 * LUẬT CỨNG: HÀM NÀY KHÔNG BAO GIỜ GHI GÌ CẢ.
 * Nó chỉ đọc câu và trả về **đề xuất**. Người dùng duyệt rồi mới ghi. Bài học từ nếp còn
 * nguyên: đây là chỗ máy viết vào nhật ký của người, và một dòng bịa làm hỏng niềm tin
 * vào cả trăm dòng thật.
 */
import type { TimeBucket } from '../shared/types/enums';

export type YChi =
  | { readonly loai: 'gio'; readonly bucket: TimeBucket; readonly minutes: number; readonly ten: string; readonly golden: boolean }
  | { readonly loai: 'hat'; readonly kind: 'candy' | 'salt'; readonly text: string }
  | { readonly loai: 'tien'; readonly o: OTien; readonly vnd: number }
  | { readonly loai: 'khongGhi'; readonly viSao: string };

export type OTien = 'netIncome' | 'monthlyExpense' | 'debtPayment' | 'debtBalance' | 'netWorth';

export interface KetQuaDoc {
  readonly yChi: readonly YChi[];
  /** 'luat' đọc được bằng luật, 'ai' phải nhờ LLM, 'chiu' không ai đọc được. */
  readonly nguon: 'luat' | 'ai' | 'chiu';
}

/** Bỏ dấu để so khớp, vì người ta gõ "ngu" lẫn "ngủ". */
const boDau = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase();

/**
 * Từ khoá → ô. Xếp theo thứ tự ưu tiên: cái cụ thể trước cái chung.
 *
 * Danh sách này **cố tình ngắn**. Nhồi hai trăm từ vào đây thì nó bắt đầu đoán sai một
 * cách tự tin, mà đoán sai là thứ đắt nhất ở đây. Câu nào luật không chắc thì đẩy sang
 * LLM, và LLM còn biết nói "tôi không hiểu".
 */
const TU_KHOA: ReadonlyArray<readonly [RegExp, TimeBucket, boolean]> = [
  [/\b(hop|lam viec|di lam|cong ty|cong viec|deadline|du an|khach hang|email|bao cao)\b/, 'work', false],
  [/\b(choi voi con|dua con|don con|voi con|voi vo|voi chong|an com cung|ca nha|gia dinh|bo me|ong ba)\b/, 'family', true],
  [/\b(an toi|an trua|an sang|nau com|don nha|nha cua|cham con|cho con)\b/, 'family', false],
  [/\b(dien thoai|facebook|tiktok|youtube|luot|xem phim|game|choi game|mang xa hoi)\b/, 'waste', false],
  [/\b(ngu|tap gym|tap the duc|chay bo|doc sach|hoc|thien|tam|di bo)\b/, 'personal', false],
  [/\b(di xe|di lai|ket xe|tau xe|lai xe)\b/, 'work', false],
];

const VUI = /\b(vui|hanh phuc|tuyet|thich|cuoi|am|de chiu|nhe nhom|thanh cong|dc viec|duoc viec)\b/;
const BUON = /\b(met|buon|te|chan|cang|stress|ap luc|cai nhau|gian|lo|that vong|kiet suc)\b/;

const O_TIEN: ReadonlyArray<readonly [RegExp, OTien]> = [
  [/\b(thu nhap|luong|nhan luong|ve tay)\b/, 'netIncome'],
  [/\b(chi tieu|tieu|chi phi|xai)\b/, 'monthlyExpense'],
  [/\b(tra no|tra gop|tra ngan hang)\b/, 'debtPayment'],
  [/\b(du no|con no|no con|khoan no)\b/, 'debtBalance'],
  [/\b(tai san|tai san rong|tong tai san|net worth)\b/, 'netWorth'],
];

/**
 * Việc **không làm đổi gì** mà người ta vẫn hay gõ.
 *
 * Rút tiền ở ATM không làm đổi tài sản ròng: tiền đi từ tài khoản sang ví, tổng không
 * đổi. Chuyển khoản giữa hai tài khoản của chính mình cũng vậy. Mira không phải sổ thu
 * chi, nên câu trả lời đúng là nói thẳng chứ không nhét bừa vào một ô nào đó.
 */
const KHONG_GHI: ReadonlyArray<readonly [RegExp, string]> = [
  [
    /\b(rut tien|rut atm|rut o atm|rut the)\b/,
    'Rút tiền không làm đổi tài sản ròng của bạn: tiền đi từ tài khoản sang ví, tổng vẫn thế. Mira không ghi từng giao dịch. Nếu tháng này bạn tiêu nhiều hơn dự tính thì sửa ô Chi tiêu tháng.',
  ],
  [
    /\b(chuyen khoan|chuyen tien|nap tien|gui tiet kiem)\b/,
    'Chuyển tiền giữa các tài khoản của bạn không làm đổi tổng tài sản. Mira chỉ cần năm con số mỗi tháng, không cần từng lần chuyển.',
  ],
];

/** "2 triệu" → 2000000, "350k" → 350000, "1,5tr" → 1500000. */
function docTien(cau: string): number | null {
  const m = /(\d+(?:[.,]\d+)?)\s*(trieu|tr|nghin|ngan|k|dong|d)\b/.exec(cau);
  if (m === null) return null;
  const so = Number((m[1] ?? '0').replace(',', '.'));
  const donVi = m[2] ?? '';
  if (!Number.isFinite(so)) return null;
  const nhan = donVi === 'trieu' || donVi === 'tr' ? 1_000_000 : donVi === 'dong' || donVi === 'd' ? 1 : 1_000;
  return Math.round(so * nhan);
}

/** "3 tiếng" → 180, "30 phút" → 30, "1h30" → 90, "1,5h" → 90. */
function docPhut(cau: string): number | null {
  const gioPhut = /(\d+)\s*(?:tieng|gio|h)\s*(\d{1,2})\b/.exec(cau);
  if (gioPhut !== null) {
    return Number(gioPhut[1]) * 60 + Number(gioPhut[2]);
  }
  const gio = /(\d+(?:[.,]\d+)?)\s*(?:tieng|gio|h)\b/.exec(cau);
  if (gio !== null) {
    const so = Number((gio[1] ?? '0').replace(',', '.'));
    return Number.isFinite(so) ? Math.round(so * 60) : null;
  }
  const phut = /(\d+)\s*(?:phut|p)\b/.exec(cau);
  if (phut !== null) return Number(phut[1]);
  return null;
}

/**
 * Cắt phần số và đơn vị ra khỏi câu để lấy tên việc.
 *
 * Mỗi lớp ký tự phải chứa cả dạng **không dấu**. Người ta gõ "2 tieng" nhiều ngang gõ
 * "2 tiếng", và thiếu chữ `e` trần trong `ti[ếêe]ng` thì tên việc ra "Hop 2 tieng" —
 * thẻ hiện "Hop 2 tieng · 2h · Công việc", lặp lại chính nó.
 */
function tenViec(goc: string): string {
  const sach = goc
    .replace(/\d+(?:[.,]\d+)?\s*(?:ti[ếêe]ng|gi[ờo]|h|ph[úu]t|p)\b/gi, ' ')
    .replace(/\b(h[ôo]m nay|s[áa]ng nay|chi[ềe]u nay|t[ốo]i nay|s[áa]ng|chi[ềe]u|t[ốo]i|nay)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (sach === '') return 'Ghi tay';
  return sach.charAt(0).toUpperCase() + sach.slice(1);
}

/**
 * Đọc một câu. Trả `nguon: 'chiu'` khi luật không chắc — lúc đó tầng trên gọi LLM.
 */
export function docBangLuat(cauGoc: string): KetQuaDoc {
  const cau = boDau(cauGoc.trim());
  if (cau === '') return { yChi: [], nguon: 'chiu' };

  // Việc không ghi được phải chặn TRƯỚC mọi thứ khác: "rút atm 2 triệu" có số tiền, và
  // nếu không chặn thì luật tiền bên dưới sẽ nhét nó vào một ô nào đó.
  for (const [re, viSao] of KHONG_GHI) {
    if (re.test(cau)) return { yChi: [{ loai: 'khongGhi', viSao }], nguon: 'luat' };
  }

  // Tiền: cần cả từ khoá ô lẫn số tiền. Thiếu một trong hai thì không đoán.
  const tien = docTien(cau);
  if (tien !== null) {
    for (const [re, o] of O_TIEN) {
      if (re.test(cau)) return { yChi: [{ loai: 'tien', o, vnd: tien }], nguon: 'luat' };
    }
  }

  // Giờ: cần cả thời lượng lẫn từ khoá ô.
  const phut = docPhut(cau);
  if (phut !== null && phut > 0 && phut <= 1440) {
    for (const [re, bucket, vang] of TU_KHOA) {
      if (re.test(cau)) {
        return {
          yChi: [{ loai: 'gio', bucket, minutes: phut, ten: tenViec(cauGoc), golden: vang }],
          nguon: 'luat',
        };
      }
    }
  }

  // Hạt: chỉ nhận khi KHÔNG có số giờ. "mệt quá, họp 3 tiếng" nói về giờ, không phải
  // một hạt muối — và đoán sai chiều đó là bỏ mất mục giờ người ta định ghi.
  if (phut === null && tien === null) {
    if (VUI.test(cau)) return { yChi: [{ loai: 'hat', kind: 'candy', text: cauGoc.trim() }], nguon: 'luat' };
    if (BUON.test(cau)) return { yChi: [{ loai: 'hat', kind: 'salt', text: cauGoc.trim() }], nguon: 'luat' };
  }

  return { yChi: [], nguon: 'chiu' };
}
