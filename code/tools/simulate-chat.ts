/**
 * Mô phỏng một tháng nhập liệu BẰNG CHAT, để trả lời đúng một câu hỏi:
 *
 *   Bỏ hẳn màn nhập liệu, chỉ còn khung chat — được chưa?
 *
 * ─────────────────────────── ĐỌC PHẦN NÀY TRƯỚC ───────────────────────────
 *
 * **Bộ câu ở đây dựng từ MỘT NGÀY SỐNG, không phải từ `parse-rules.json`.**
 *
 * Nếu tôi nghĩ câu bằng cách nhìn vào danh sách từ khoá rồi đặt câu quanh chúng, thì bài
 * kiểm này tự nó bảo đảm đạt — và con số đẹp ấy không nói gì về đời thật. Nên tôi viết
 * danh sách việc trước (một người đi làm, hai con, ở thành phố), rồi mới đặt lời cho từng
 * việc, cố tình gồm cả những cách nói mà tôi BIẾT là bộ luật chưa có.
 *
 * Mỗi câu mang theo **đáp án đúng do tôi đặt**, không phải do bộ đọc sinh ra. Chấm là so
 * với đáp án đó.
 *
 * ──────────────────────────── MÔ HÌNH NÀY KHÔNG CÓ GÌ ────────────────────────────
 *
 * Nói thẳng để không ai đọc nhầm con số:
 *
 *   1. **Không có người thật.** Không ai mệt, không ai lười gõ, không ai bỏ cuộc giữa
 *      tháng. Mọi câu đều được gõ. Tỷ lệ đọc được ở đây là trần trên, không phải thực tế.
 *   2. **Không đo ma sát.** Gõ một câu mất bao lâu so với chạm ba nút ở màn Thời gian —
 *      bài này không trả lời được. Mà đó mới là lý do chính để bỏ hay giữ màn nhập.
 *   3. **Bộ câu là của TÔI nghĩ ra**, không phải câu Founder đã gõ. Bảng `chat_log` mới
 *      có vài hàng, chưa đủ để lấy làm chuẩn. Khi nào nó đủ dày thì chạy lại bằng dữ
 *      liệu thật, và lúc đó con số mới đáng tin.
 *   4. **Không mô phỏng việc sửa.** Ghi sai rồi sửa thế nào — xem phần kiểm năng lực ở
 *      cuối, phần đó không phải mô phỏng mà là soi mã nguồn.
 *
 * Chạy:  cd code/be && npx ts-node ../tools/simulate-chat.ts
 */
import { parseByRules } from '../be/src/services/parseSentence';

type Loai = 'gio' | 'tien' | 'hat' | 'nhac';

interface Mau {
  /** Câu người dùng gõ. */
  readonly cau: string;
  /** Đáp án ĐÚNG, do người viết bài kiểm đặt — không phải do bộ đọc sinh ra. */
  readonly dap: {
    readonly kind: Loai;
    readonly bucket?: string;
    readonly minutes?: number;
    readonly o?: string;
    readonly vnd?: number;
    readonly kind?: string;
    readonly gio?: string;
  };
  /** Cách gõ, để biết kiểu nào hay hỏng. */
  readonly kieu: Kieu;
}

type Kieu =
  | 'chuan' // "họp 2 tiếng"
  | 'thoiDiem' // "sáng họp 2 tiếng"
  | 'khongDau' // "hop 2 tieng"
  | 'vietTat' // "họp 2h"
  | 'nhieuViec' // "sáng họp 2 tiếng, chiều đón con 30 phút"
  | 'loiGo' // sai một dấu
  | 'noiVong' // "ngồi họp với khách mất 2 tiếng"
  | 'ngoaiDanhSach'; // cách nói tôi BIẾT là bộ luật chưa có

const KIEU_TEN: Record<Kieu, string> = {
  chuan: 'gõ chuẩn',
  thoiDiem: 'có thời điểm',
  noDiacritics: 'không dấu',
  vietTat: 'viết tắt',
  nhieuViec: 'nhiều việc một câu',
  loiGo: 'lỗi gõ',
  noiVong: 'nói vòng',
  offList: 'ngoài danh sách (cố ý)',
};

// ─────────────────────────────────────────────────────────────────────────────
// MỘT NGÀY SỐNG. Viết trước, chưa nhìn vào bộ luật.
//
// Nhân vật: đi làm công ty, hai con nhỏ, ở thành phố, đi xe máy. Những việc dưới đây là
// những việc người đó LÀM, kèm ô mà việc đó thuộc về theo mô hình Mira.
// ─────────────────────────────────────────────────────────────────────────────

const g = (cau: string, bucket: string, minutes: number, kieu: Kieu): Mau => ({
  cau,
  dap: { kind: 'time', bucket, minutes },
  kieu,
});
const t = (cau: string, o: string, vnd: number, kieu: Kieu): Mau => ({
  cau,
  dap: { kind: 'money', o, vnd },
  kieu,
});
const h = (cau: string, kind: string, kieu: Kieu): Mau => ({ cau, dap: { kind: 'grain', kind }, kieu });
const n = (cau: string, gio: string, kieu: Kieu): Mau => ({ cau, dap: { kind: 'reminder', gio }, kieu });

const BO_CAU: readonly Mau[] = [
  // ── đi làm
  g('họp 2 tiếng', 'work', 120, 'chuan'),
  g('sáng họp 3 tiếng', 'work', 180, 'thoiDiem'),
  g('hop 2 tieng', 'work', 120, 'khongDau'),
  g('họp 1h30', 'work', 90, 'vietTat'),
  g('ngồi họp với khách mất 2 tiếng', 'work', 120, 'noiVong'),
  g('làm việc 8 tiếng', 'work', 480, 'chuan'),
  g('đi làm 8 tiếng', 'work', 480, 'chuan'),
  g('deadline dự án 3 tiếng', 'work', 180, 'chuan'),
  g('viết báo cáo 2 tiếng', 'work', 120, 'chuan'),
  g('trả lời email 45 phút', 'work', 45, 'chuan'),
  g('họp online với đối tác 1 tiếng', 'work', 60, 'noiVong'),
  g('chạy deadline tới 10h đêm 3 tiếng', 'work', 180, 'ngoaiDanhSach'),
  g('ngồi sửa bug 4 tiếng', 'work', 240, 'ngoaiDanhSach'),
  g('review code 90 phút', 'work', 90, 'ngoaiDanhSach'),
  g('đi gặp khách hàng 2 tiếng', 'work', 120, 'chuan'),

  // ── đi lại
  g('đi lại đi làm 2 tiếng', 'work', 120, 'chuan'),
  g('kẹt xe 45 phút', 'work', 45, 'chuan'),
  g('chạy xe đi làm 1 tiếng', 'work', 60, 'noiVong'),

  // ── gia đình
  g('chơi với con 1 tiếng', 'family', 60, 'chuan'),
  g('đón con 30 phút', 'family', 30, 'chuan'),
  g('don con 30 phut', 'family', 30, 'khongDau'),
  g('ăn tối cùng cả nhà 1 tiếng', 'family', 60, 'noiVong'),
  g('nấu ăn 40 phút', 'family', 40, 'chuan'),
  g('rửa bát 15 phút', 'family', 15, 'chuan'),
  g('dọn nhà 1 tiếng', 'family', 60, 'chuan'),
  g('tắm cho con 20 phút', 'family', 20, 'chuan'),
  g('dạy con học 45 phút', 'family', 45, 'chuan'),
  g('kể chuyện cho con 20 phút', 'family', 20, 'chuan'),
  g('đưa con đi học 30 phút', 'family', 30, 'chuan'),
  g('ngồi uống trà với bố mẹ 1 tiếng', 'family', 60, 'noiVong'),
  g('chở vợ đi siêu thị 1 tiếng', 'family', 60, 'ngoaiDanhSach'),
  g('cho con bú 20 phút', 'family', 20, 'ngoaiDanhSach'),
  g('ru con ngủ 30 phút', 'family', 30, 'ngoaiDanhSach'),
  g('đi ăn cưới họ hàng 3 tiếng', 'family', 180, 'ngoaiDanhSach'),

  // ── cá nhân
  g('ngủ 7 tiếng', 'personal', 420, 'chuan'),
  g('thể dục 30 phút', 'personal', 30, 'chuan'),
  g('thẻ dục 30 phút', 'personal', 30, 'loiGo'),
  g('chạy bộ 40 phút', 'personal', 40, 'chuan'),
  g('đạp xe 1 tiếng', 'personal', 60, 'chuan'),
  g('đọc sách 30 phút', 'personal', 30, 'chuan'),
  g('học tiếng anh 1 tiếng', 'personal', 60, 'chuan'),
  g('đi khám bệnh 2 tiếng', 'personal', 120, 'chuan'),
  g('cắt tóc 30 phút', 'personal', 30, 'chuan'),
  g('ngồi thiền 20 phút', 'personal', 20, 'noiVong'),
  g('đi cà phê với bạn 2 tiếng', 'personal', 120, 'ngoaiDanhSach'),
  g('đi nhậu với đồng nghiệp 3 tiếng', 'personal', 180, 'ngoaiDanhSach'),
  g('tập tạ 45 phút', 'personal', 45, 'ngoaiDanhSach'),
  g('đi chùa 2 tiếng', 'personal', 120, 'ngoaiDanhSach'),

  // ── lãng phí
  g('lướt điện thoại 45 phút', 'waste', 45, 'chuan'),
  g('luot dien thoai 1 tieng', 'waste', 60, 'khongDau'),
  g('xem phim 2 tiếng', 'waste', 120, 'chuan'),
  g('chơi game 1 tiếng', 'waste', 60, 'chuan'),
  g('lướt tiktok 30 phút', 'waste', 30, 'chuan'),
  g('nằm xem reels 40 phút', 'waste', 40, 'noiVong'),
  g('lướt facebook trước khi ngủ 30 phút', 'waste', 30, 'thoiDiem'),

  // ── nhiều việc một câu
  g('sáng họp 3 tiếng, chiều đón con 30 phút', 'work', 180, 'nhieuViec'),
  g('ngủ 7 tiếng, đi làm 8 tiếng', 'personal', 420, 'nhieuViec'),
  g('nấu ăn 30 phút rồi dọn nhà 20 phút', 'family', 30, 'nhieuViec'),

  // ── tiền
  t('lương tháng này 18 triệu', 'netIncome', 18_000_000, 'chuan'),
  t('rút 500k', 'monthlyExpense', 500_000, 'vietTat'),
  t('cà phê 35k', 'monthlyExpense', 35_000, 'chuan'),
  t('đổ xăng 100k', 'monthlyExpense', 100_000, 'chuan'),
  t('đi siêu thị 450k', 'monthlyExpense', 450_000, 'chuan'),
  t('tiền điện 800k', 'monthlyExpense', 800_000, 'chuan'),
  t('học phí cho con 3 triệu', 'monthlyExpense', 3_000_000, 'chuan'),
  t('trả nợ ngân hàng 5 triệu', 'debtPayment', 5_000_000, 'chuan'),
  t('dư nợ còn 200 triệu', 'debtBalance', 200_000_000, 'chuan'),
  t('tài sản ròng 1,5 tỷ', 'netWorth', 1_500_000_000, 'ngoaiDanhSach'),
  t('thưởng cuối năm 20 triệu', 'netIncome', 20_000_000, 'chuan'),
  t('tien an trua 50k', 'monthlyExpense', 50_000, 'khongDau'),
  t('mua đồ chơi cho con 200k', 'monthlyExpense', 200_000, 'chuan'),
  t('đi chợ hết 150k', 'monthlyExpense', 150_000, 'noiVong'),
  t('taxi về nhà 120k', 'monthlyExpense', 120_000, 'chuan'),

  // ── hạt
  h('hôm nay mệt quá', 'salt', 'chuan'),
  h('hôm nay vui, con tự xúc hết bát cơm', 'candy', 'chuan'),
  h('cả ngày căng thẳng với khách', 'salt', 'chuan'),
  h('hôm nay gặp khó khăn với khách hàng', 'salt', 'chuan'),
  h('công việc vất vả quá', 'salt', 'chuan'),
  h('lo lắng chuyện tiền', 'salt', 'chuan'),
  h('tự hào về con', 'candy', 'chuan'),
  h('hôm nay thoải mái', 'candy', 'chuan'),
  h('mọi thứ suôn sẻ', 'candy', 'chuan'),
  h('met qua', 'salt', 'khongDau'),
  h('hôm nay thấy trống rỗng', 'salt', 'ngoaiDanhSach'),
  h('con ôm mình, tự nhiên thấy ấm', 'candy', 'noiVong'),
  h('cãi nhau với vợ, nặng đầu', 'salt', 'chuan'),
  h('hôm nay nhẹ người hẳn', 'candy', 'chuan'),

  // ── lời nhắc
  n('tạo lịch nhắc 8h hàng ngày', '08:00', 'chuan'),
  n('nhắc tôi uống thuốc 21h hàng ngày', '21:00', 'chuan'),
  n('nhắc 20h thứ 3 thứ 5', '20:00', 'chuan'),
  n('nhắc 9h cuối tuần', '09:00', 'chuan'),
  n('nhắc 8h tối', '20:00', 'vietTat'),
  n('đặt nhắc 22h30', '22:30', 'vietTat'),
];

// ─────────────────────────────────────────────────────────────────────────────
// Dựng một tháng: 30 ngày, mỗi ngày 4–7 câu, lấy từ bộ trên.
//
// Gieo cố định để chạy lại ra cùng kết quả — một bài kiểm đổi số mỗi lần chạy thì không
// ai dùng nó để so trước/sau được.
// ─────────────────────────────────────────────────────────────────────────────

let hat = 20261125;
const ngauNhien = (): number => {
  hat = (hat * 1103515245 + 12345) & 0x7fffffff;
  return hat / 0x7fffffff;
};
const lay = <T>(ds: readonly T[]): T => ds[Math.floor(ngauNhien() * ds.length)] as T;

const THANG: { ngay: string; color: Mau }[] = [];
for (let d = 1; d <= 30; d += 1) {
  const ngay = `2026-11-${String(d).padStart(2, '0')}`;
  const soCau = 4 + Math.floor(ngauNhien() * 4);
  for (let i = 0; i < soCau; i += 1) THANG.push({ ngay, color: lay(BO_CAU) });
}

// ─────────────────────────────────────────────────────────────────────────────
// Chấm
// ─────────────────────────────────────────────────────────────────────────────

interface Diem {
  total: number;
  docDuoc: number;
  dungLoai: number;
  dungHet: number;
  doanO: number;
  chiu: number;
}

const moi = (): Diem => ({ total: 0, docDuoc: 0, dungLoai: 0, dungHet: 0, bucketGuessed: 0, chiu: 0 });
const chung = moi();
const byType = new Map<Kieu, Diem>();
const byKind = new Map<Loai, Diem>();
const hong: { cau: string; kieu: Kieu; cho: string; ra: string }[] = [];
const seen = new Set<string>();

for (const { ngay, color } of THANG) {
  // Mỗi câu chỉ chấm một lần, dù nó xuất hiện nhiều ngày: lặp lại chỉ làm phồng mẫu số.
  if (seen.has(color.cau)) continue;
  seen.add(color.cau);

  const ghi = (d: Diem, f: (x: Diem) => void): void => f(d);
  const cac = [chung, byType.get(color.kieu) ?? moi(), byKind.get(color.dap.kind) ?? moi()];
  byType.set(color.kieu, cac[1] as Diem);
  byKind.set(color.dap.kind, cac[2] as Diem);
  for (const d of cac) ghi(d, (x) => (x.total += 1));

  const kq = parseByRules(color.cau, { homNay: ngay, categories: [] });
  const y = kq.yChi[0];

  if (kq.source === 'unparsed' || y === undefined) {
    for (const d of cac) ghi(d, (x) => (x.chiu += 1));
    hong.push({ cau: color.cau, kieu: color.kieu, cho: color.dap.kind, ra: 'chịu — không đọc được' });
    continue;
  }

  for (const d of cac) ghi(d, (x) => (x.docDuoc += 1));

  if (y.kind !== color.dap.kind) {
    hong.push({ cau: color.cau, kieu: color.kieu, cho: color.dap.kind, ra: `đọc thành ${y.kind}` });
    continue;
  }
  for (const d of cac) ghi(d, (x) => (x.dungLoai += 1));

  let sai: string | null = null;
  if (y.kind === 'time') {
    if (y.bucketGuessed) for (const d of cac) ghi(d, (x) => (x.bucketGuessed += 1));
    if (y.bucket !== color.dap.bucket) sai = `ô ${y.bucket}, chờ ${color.dap.bucket}`;
    else if (y.minutes !== color.dap.minutes) sai = `${y.minutes}m, chờ ${color.dap.minutes}m`;
  } else if (y.kind === 'money') {
    if (y.cell !== color.dap.cell) sai = `ô ${y.cell}, chờ ${color.dap.cell}`;
    else if (y.vnd !== color.dap.vnd) sai = `${y.vnd}đ, chờ ${color.dap.vnd}đ`;
  } else if (y.kind === 'grain') {
    if (y.kind !== color.dap.kind) sai = `${y.kind}, chờ ${color.dap.kind}`;
  } else if (y.kind === 'reminder') {
    if (y.at !== color.dap.gio) sai = `${y.at}, chờ ${color.dap.gio}`;
  }

  if (sai === null) for (const d of cac) ghi(d, (x) => (x.dungHet += 1));
  else hong.push({ cau: color.cau, kieu: color.kieu, cho: color.dap.kind, ra: sai });
}

// ─────────────────────────────────────────────────────────────────────────────
// In
// ─────────────────────────────────────────────────────────────────────────────

const pc = (a: number, b: number): string => (b === 0 ? '—' : `${Math.round((a * 100) / b)}%`);
const dong = (ten: string, d: Diem): string =>
  `${ten.padEnd(24)} ${String(d.total).padStart(4)}  ${pc(d.docDuoc, d.total).padStart(5)}  ${pc(d.dungHet, d.total).padStart(5)}  ${String(d.bucketGuessed).padStart(5)}`;

console.log('\n═══ MÔ PHỎNG MỘT THÁNG NHẬP LIỆU BẰNG CHAT ═══\n');
console.log(`Bộ câu: ${BO_CAU.length} cách nói khác nhau, rải trên ${THANG.length} lượt gõ trong 30 ngày.`);
console.log('Đáp án do người viết bài kiểm đặt, không phải do bộ đọc sinh ra.\n');

console.log('                           câu   đọc đc  đúng hết  đoán ô');
console.log('─'.repeat(62));
console.log(dong('TOÀN BỘ', chung));
console.log('');
for (const [k, d] of [...byKind].sort((a, b) => b[1].total - a[1].total)) console.log(dong(k, d));
console.log('');
for (const [k, d] of [...byType].sort((a, b) => b[1].total - a[1].total)) console.log(dong(KIEU_TEN[k], d));

if (hong.length > 0) {
  console.log(`\n─── ${hong.length} câu hỏng ───\n`);
  for (const x of hong) {
    console.log(`  "${x.cau}"`);
    console.log(`     ${KIEU_TEN[x.kieu]} · chờ ${x.cho} · ${x.ra}`);
  }
}

console.log('\n⚠ Mô hình này không có người thật, không đo ma sát gõ, và bộ câu do tôi nghĩ ra.');
console.log('  Xem chú thích đầu file trước khi dùng con số này để quyết định.\n');
