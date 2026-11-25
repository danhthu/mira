/**
 * Dựng trọn một ngày của Founder thành bộ dữ liệu Mira nhập được.
 *
 *   node code/tools/nhap-screentime.mjs                      # Xã hội tính là lãng phí
 *   node code/tools/nhap-screentime.mjs --zalo-la-viec        # Xã hội tính là công việc
 *   node code/tools/nhap-screentime.mjs --gio-lam=9           # đổi độ dài ngày làm
 *
 * HAI NGUỒN, HAI ĐỘ TIN KHÁC NHAU — đừng trộn lẫn khi đọc kết quả:
 *
 *   ĐO ĐƯỢC   Giờ màn hình, từ ảnh chụp Cài đặt → Thời gian sử dụng ngày 25/11/2026.
 *             Bốn tuần, 24 ngày. Số theo tuần là thật.
 *
 *   KHAI BÁO  Khung ngày, Founder nói ngày 25/11/2026: ngủ 23h–6h, đi lại đi làm sáng và
 *             chiều mỗi lần 1h, ăn tối 30p, nhà cửa 30p, còn lại cho gia đình.
 *
 * NGỦ KHÔNG PHẢI MỘT Ô — NÓ LÀ CÁI KHUÔN
 *   Màn Thời gian lấy **giờ tỉnh** làm mẫu số của mọi tỉ lệ. Ghi 7h ngủ vào ô `personal`
 *   thì ô đó vĩnh viễn chiếm nửa donut, và tổng không bao giờ đóng được 100%.
 *   Nên ngủ 23h–6h ở đây biến thành một con số duy nhất: ngày tỉnh 17h, tuần 119h.
 *   Đặt vào `WAKING_HOURS_PER_DAY=17` trong `code/be/.env`, không ghi thành mục giờ.
 *
 *   SUY RA    Độ dài ngày làm. Founder KHÔNG nói. Mặc định 8h; đổi bằng --gio-lam.
 *             Đây là số duy nhất script tự đặt, và nó quyết định phần gia đình.
 *
 * CHỖ QUAN TRỌNG NHẤT — giờ màn hình KHÔNG cộng thêm vào ngày, nó NẰM TRONG ngày:
 *
 *   iPhone đếm giờ nhìn màn hình bất kể lúc đó đang làm gì. Cộng 8h màn hình vào một ngày
 *   đã có ngủ 7h, làm 8h, đi lại 2h thì ra 25 tiếng — vô nghĩa. Nên script trừ phần
 *   giải trí và mạng xã hội RA KHỎI giờ rảnh buổi tối, rồi ghi phần đó là `waste`.
 *
 *   Đó là cách đọc bất lợi nhất, và cố tình: 4-5 giờ điện thoại mỗi ngày phải nằm ở đâu
 *   đó. Nếu nó nằm trong giờ tối thì giờ gia đình ít hơn ta tưởng. Nếu nó nằm trong giờ
 *   làm thì con số 8h làm việc mới là số ảo. Script chọn giả thiết thứ nhất vì nó không
 *   làm bẩn ô công việc; đổi giả thiết thì sửa `TINH_VAO_TOI` dưới đây.
 *
 *   Phần màn hình thuộc "Hiệu suất & Tài chính" và "Khác" thì KHÔNG ghi riêng — xem như
 *   nằm trong giờ làm và giờ đã khai. Ghi riêng là đếm hai lần.
 *
 * ÁNH XẠ (chỗ cần Founder xác nhận):
 *   Giải trí → lãng phí
 *   Xã hội   → lãng phí, trừ khi bật --zalo-la-viec thì xem như nằm trong giờ làm
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../docs/du-lieu-mau');
const zaloLaViec = process.argv.includes('--zalo-la-viec');

const argGioLam = process.argv.find((a) => a.startsWith('--gio-lam='));
const gioLam = argGioLam ? Number(argGioLam.split('=')[1]) : 8;
if (!Number.isFinite(gioLam) || gioLam < 0 || gioLam > 16) {
  throw new Error(`--gio-lam phải là số giờ trong khoảng 0–16, nhận được: ${argGioLam}`);
}

/** Đặt false nếu cho rằng giờ điện thoại chủ yếu tiêu trong giờ làm, không phải giờ tối. */
const TINH_VAO_TOI = true;

const phut = (g, p = 0) => g * 60 + p;

/** Ngủ 23h–6h. Không thành mục giờ; chỉ co ngày lại còn 17h tỉnh. */
const GIO_NGU = 7;
const PHUT_NGAY_TINH = (24 - GIO_NGU) * 60;

/** Khung ngày Founder khai. Tổng khối này cộng phần gia đình phải đúng số phút ngày tỉnh. */
const KHUNG = [
  { ten: 'Đi lại đi làm', bucket: 'work', phut: phut(2), golden: false },
  { ten: 'Giờ làm việc', bucket: 'work', phut: phut(gioLam), golden: false },
  { ten: 'Ăn tối', bucket: 'personal', phut: 30, golden: false },
  { ten: 'Nhà cửa', bucket: 'family', phut: 30, golden: false },
];

const phutKhung = KHUNG.reduce((t, k) => t + k.phut, 0);
const phutRanh = PHUT_NGAY_TINH - phutKhung;

/**
 * Bốn tuần đọc từ ảnh chụp màn hình Cài đặt → Thời gian sử dụng, ngày 25/11/2026.
 * `tong` là "Tổng thời gian sử dụng"; phần dôi ra so với ba danh mục là cột xám "Khác".
 */
const TUAN = [
  { batDau: '2026-11-02', ngay: 7, xaHoi: phut(31, 19), hieuSuat: phut(14, 20), giaiTri: phut(5, 47), tong: phut(61, 30) },
  { batDau: '2026-11-09', ngay: 7, xaHoi: phut(22, 19), hieuSuat: phut(14, 6), giaiTri: phut(9, 46), tong: phut(56, 56) },
  { batDau: '2026-11-16', ngay: 7, xaHoi: phut(24, 31), hieuSuat: phut(15, 18), giaiTri: phut(11, 9), tong: phut(59, 58) },
  // Tuần đang dở: ảnh chụp sáng 25/11 nên mới có T2, T3 và một phần T4.
  { batDau: '2026-11-23', ngay: 3, xaHoi: phut(6, 30), hieuSuat: phut(5, 21), giaiTri: phut(2, 48), tong: phut(17, 4) },
];

const addDays = (date, n) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const timeEntries = [];
const theoTuan = [];
let tongNgay = 0;
let soNgayTran = 0;

for (const t of TUAN) {
  const langPhiTuan = t.giaiTri + (zaloLaViec ? 0 : t.xaHoi);
  const langPhiNgay = TINH_VAO_TOI ? Math.round(langPhiTuan / t.ngay) : 0;

  // Giờ rảnh buổi tối trừ đi giờ điện thoại. Âm nghĩa là ngày không đóng được —
  // báo ra, đừng kẹp im lặng.
  const giaDinhNgay = phutRanh - langPhiNgay;
  const tran = giaDinhNgay < 0 ? -giaDinhNgay : 0;
  if (tran > 0) soNgayTran += t.ngay;

  for (let i = 0; i < t.ngay; i += 1) {
    const date = addDays(t.batDau, i);
    const them = (bucket, minutes, note, golden = false) => {
      if (minutes <= 0) return;
      timeEntries.push({ date, minutes, bucket, golden, note });
    };

    for (const k of KHUNG) them(k.bucket, k.phut, k.ten, k.golden);
    them('waste', langPhiNgay, 'Điện thoại: giải trí và mạng xã hội');
    // Phần còn lại là giờ gia đình thật, và đó là giờ vàng: tối, cả nhà có mặt.
    them('family', Math.max(0, giaDinhNgay), 'Gia đình, phần còn lại của tối', true);
  }

  theoTuan.push({ batDau: t.batDau, ngay: t.ngay, langPhiNgay, giaDinhNgay, tran });
  tongNgay += t.ngay;
}

const bo = {
  timeEntries,
  moments: [],
  money: {},
  goals: [],
  habits: [],
  habitChecks: [],
};

const ten = zaloLaViec ? 'screentime-zalo-la-viec.json' : 'screentime.json';
writeFileSync(resolve(OUT, ten), JSON.stringify(bo));

const h = (p) => `${p < 0 ? '-' : ''}${Math.floor(Math.abs(p) / 60)}h${String(Math.abs(p) % 60).padStart(2, '0')}`;

console.log(`Ánh xạ: Xã hội → ${zaloLaViec ? 'nằm trong GIỜ LÀM' : 'lãng phí'}`);
console.log(`Giờ làm giả định: ${gioLam}h/ngày (sửa bằng --gio-lam=)`);
console.log(`Đã ghi ${OUT}\\${ten}  (${timeEntries.length} mục giờ, ${tongNgay} ngày)\n`);

console.log(`Ngủ ${GIO_NGU}h → ngày tỉnh ${24 - GIO_NGU}h, tuần ${(24 - GIO_NGU) * 7}h.`);
console.log(`  (đặt WAKING_HOURS_PER_DAY=${24 - GIO_NGU} trong code/be/.env, không thì tỉ lệ sai)\n`);
console.log(`Khung ngày khai báo, cố định mọi ngày:`);
for (const k of KHUNG) console.log(`  ${k.ten.padEnd(16)} ${h(k.phut)}  → ${k.bucket}`);
console.log(`  ${'Giờ rảnh còn lại'.padEnd(16)} ${h(phutRanh)}\n`);

console.log(`Giờ rảnh đó bị điện thoại ăn bao nhiêu, theo từng tuần:`);
for (const w of theoTuan) {
  const canhBao = w.tran > 0 ? `  ⚠ TRÀN ${h(w.tran)}` : '';
  console.log(
    `  ${w.batDau} (${w.ngay}n)  điện thoại ${h(w.langPhiNgay)}/ngày` +
      `  →  gia đình ${h(Math.max(0, w.giaDinhNgay))}/ngày${canhBao}`,
  );
}

if (soNgayTran > 0) {
  console.log(
    `\n⚠ ${soNgayTran} ngày KHÔNG ĐÓNG ĐƯỢC: giờ điện thoại nhiều hơn giờ rảnh.`,
  );
  console.log(
    `  Nghĩa là điện thoại đang tiêu trong giờ làm hoặc giờ đi lại, không chỉ buổi tối.`,
  );
  console.log(`  Phần tràn đã bị kẹp về 0 cho ô gia đình — số gia đình là sàn, không phải thật.`);
}

const tongTheoBucket = {};
for (const e of timeEntries) tongTheoBucket[e.bucket] = (tongTheoBucket[e.bucket] ?? 0) + e.minutes;
console.log(`\nDonut sẽ hiện (trung bình ${tongNgay} ngày):`);
const tongTatCa = Object.values(tongTheoBucket).reduce((a, b) => a + b, 0);
for (const [b, p] of Object.entries(tongTheoBucket).sort((x, y) => y[1] - x[1])) {
  const pct = ((p / tongTatCa) * 100).toFixed(0);
  console.log(`  ${b.padEnd(9)} ${h(Math.round(p / tongNgay))}/ngày   ${pct.padStart(2)}%`);
}
console.log(`  (tổng ${h(Math.round(tongTatCa / tongNgay))}/ngày — phải là ${24 - GIO_NGU}h00)`);
