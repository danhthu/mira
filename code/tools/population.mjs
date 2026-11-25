/**
 * Mô phỏng ~300 người dùng, mỗi người 6 tháng, để xem Mira sinh ra tín hiệu có nghĩa cho ai.
 *
 *   node code/tools/population.mjs
 *
 * Ra: docs/du-lieu-mau/dan-so.csv    — một dòng một người, đủ số thô để tự kiểm lại
 *     docs/du-lieu-mau/thi-truong.md — bảng theo nghề, giai đoạn sống, thu nhập, thành phố
 *
 * GIỚI HẠN — đọc trước khi tin bất kỳ con số nào ở đây:
 * Đây là mô phỏng từ tham số do người viết đặt, không phải dữ liệu người thật. Nó chỉ trả lời
 * được một câu: *với nhịp sống giả định như vậy, các phép tính của Mira có ra con số đáng nhìn
 * không*. Nó KHÔNG trả lời được ai sẽ thích dùng, ai chịu ghi mỗi ngày, hay ai chịu trả tiền.
 * Mọi kết luận về thị trường rút ra từ đây đều phải đi kiểm với người thật.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'docs/du-lieu-mau');
import { JOBS, STAGES, CITIES, WEEKS, rng, pick, simulate, score, stagesFor } from './lib/dan-so.mjs';

// ─────────────────────────────────────────────────────── chạy dân số

const N = 300;
const people = [];
const r0 = rng(777);

for (let i = 0; i < N; i += 1) {
  const job = JOBS[i % JOBS.length];
  const stage = pick(r0, stagesFor(job));
  const x = r0();
  const city = x < CITIES[0].share ? CITIES[0] : x < CITIES[0].share + CITIES[1].share ? CITIES[1] : CITIES[2];
  const p = simulate(9000 + i * 37, job, stage, city);
  people.push({ ...p, ...score(p) });
}

// ─────────────────────────────────────────────────────── tổng hợp

const avg = (xs, f) => (xs.length === 0 ? 0 : xs.reduce((a, x) => a + f(x), 0) / xs.length);
const pc = (x) => `${(x * 100).toFixed(0)}%`;
const n1 = (x) => x.toFixed(1).replace('.', ',');
const trieu = (x) => `${(x / 1_000_000).toFixed(1).replace('.', ',')}tr`;

function groupBy(keyFn, labelFn) {
  const m = new Map();
  for (const p of people) {
    const k = keyFn(p);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(p);
  }
  return [...m.entries()]
    .map(([k, xs]) => ({
      label: labelFn(xs[0]),
      n: xs.length,
      diem: avg(xs, (p) => p.diem),
      roRi: avg(xs, (p) => p.roRi),
      tien: avg(xs, (p) => p.tinHieuTien),
      quanHe: avg(xs, (p) => p.tinHieuQuanHe),
      moiMe: avg(xs, (p) => p.moiMe),
      chiPhi: avg(xs, (p) => p.chiPhi),
      wasteH: avg(xs, (p) => p.wastePerWeek / 60),
      goldenH: avg(xs, (p) => p.goldenPerWeek / 60),
      free: avg(xs, (p) => p.freeEnd),
      income: avg(xs, (p) => p.income),
      key: k,
    }))
    .sort((a, b) => b.diem - a.diem);
}

const byJob = groupBy((p) => p.job.key, (p) => p.job.name);
const byStage = groupBy((p) => p.stage.key, (p) => p.stage.name);
const byCity = groupBy((p) => p.city.key, (p) => p.city.name);
const byIncome = groupBy(
  (p) => (p.income < 8e6 ? 'a' : p.income < 15e6 ? 'b' : p.income < 25e6 ? 'c' : 'd'),
  (p) => (p.income < 8e6 ? 'Dưới 8tr' : p.income < 15e6 ? '8–15tr' : p.income < 25e6 ? '15–25tr' : 'Trên 25tr'),
);
const ORDER = { 'Dưới 8tr': 0, '8–15tr': 1, '15–25tr': 2, 'Trên 25tr': 3 };

// CSV thô
const head = 'nghe,giai_doan,thanh_pho,thu_nhap,chi_tieu,co_no,lang_phi_tuan_h,gio_vang_tuan_h,von_tu_do,no_giu_thang,muc_du_tb,bien_do_muc_du,muc_ghi_moi_ngay,diem_ro_ri,diem_tien,diem_quan_he,diem_moi_me,gia_tri,chi_phi,diem';
const rows = people.map((p) =>
  [
    p.job.name, p.stage.name, p.city.name,
    Math.round(p.income), Math.round(p.expense), p.hasDebt ? 1 : 0,
    (p.wastePerWeek / 60).toFixed(2), (p.goldenPerWeek / 60).toFixed(2),
    p.freeEnd.toFixed(2), p.monthsHeldByDebt.toFixed(1),
    p.avgSurplus.toFixed(3), p.spreadSurplus.toFixed(3), p.entriesPerDay.toFixed(2),
    p.roRi.toFixed(0), p.tinHieuTien.toFixed(0), p.tinHieuQuanHe.toFixed(0), p.moiMe.toFixed(0),
    p.giaTri.toFixed(0), p.chiPhi.toFixed(0), p.diem.toFixed(0),
  ].join(','),
);
mkdirSync(OUT, { recursive: true });
writeFileSync(resolve(OUT, 'dan-so.csv'), [head, ...rows].join('\n'));

const tier = (d) => (d >= 45 ? '**hợp**' : d >= 30 ? 'tạm' : d >= 18 ? 'yếu' : 'không hợp');

const tableJob = byJob
  .map(
    (g) =>
      `| ${g.label} | ${g.n} | **${g.diem.toFixed(0)}** | ${tier(g.diem)} | ${n1(g.wasteH)}h | ${n1(g.goldenH)}h | ${n1(g.free)} | ${g.chiPhi.toFixed(0)} |`,
  )
  .join('\n');

const md = `# 300 người, 6 tháng — Mira hợp với ai

> Sinh bởi \`code/tools/population.mjs\` (seed cố định). Số thô: \`dan-so.csv\`.
> ${N} người, mỗi người ${WEEKS} tuần, ${JOBS.length} nghề × ${STAGES.length} giai đoạn sống × ${CITIES.length} vùng.

## Đọc cái này trước

Đây là **mô phỏng từ tham số do người viết đặt**, không phải dữ liệu người thật. Nó trả lời
được đúng một câu: *với nhịp sống giả định như vậy, các phép tính của Mira có ra con số đáng
nhìn không.*

Nó **không** trả lời được: ai sẽ thích dùng, ai chịu ghi mỗi ngày, ai chịu trả tiền. Những
câu đó chỉ có người thật mới trả lời. Mọi kết luận thị trường dưới đây là **giả thiết cần đi
kiểm**, không phải kết quả.

## Điểm được chấm thế nào

Bốn thành phần giá trị, mỗi cái 0–100, tính **từ chính đầu ra của Mira** — nếu một phép tính
của app không ra con số đáng nhìn cho người này thì điểm thấp:

| Thành phần | Trọng số | Ý nghĩa |
|---|---|---|
| Rò rỉ | 30% | Donut có nhóm nào đủ lớn để giật mình không (mốc: 1h lãng phí mỗi ngày) |
| Tín hiệu tiền | 26% | Vốn tự do có nghĩa (cần tài sản để chia) + nợ quy ra tháng tự do |
| Tín hiệu quan hệ | 24% | Giờ vàng có tồn tại không |
| Có gì mới | 20% | Biến động giữa các tuần. Đời quá đều thì app lặp lại chính nó và người ta bỏ (N-208) |

Trừ đi **chi phí ghi chép**: nghề khó ghi (ca kíp, chạy ngoài đường) cộng số mục phải ghi mỗi
ngày. N-208 nói đây là lý do bỏ app tự theo dõi số một.

\`điểm = giá trị − chi phí × 0,55\`

## Theo nghề

| Nghề | n | Điểm | Xếp | Lãng phí/tuần | Giờ vàng/tuần | Vốn tự do | Chi phí ghi |
|---|---|---|---|---|---|---|---|
${tableJob}

## Theo giai đoạn sống

| Giai đoạn | n | Điểm | Rò rỉ | Tiền | Quan hệ | Mới mẻ |
|---|---|---|---|---|---|---|
${byStage.map((g) => `| ${g.label} | ${g.n} | **${g.diem.toFixed(0)}** | ${g.roRi.toFixed(0)} | ${g.tien.toFixed(0)} | ${g.quanHe.toFixed(0)} | ${g.moiMe.toFixed(0)} |`).join('\n')}

## Theo thu nhập

| Mức | n | Điểm | Vốn tự do TB | Rò rỉ | Tiền |
|---|---|---|---|---|---|
${byIncome.sort((a, b) => ORDER[a.label] - ORDER[b.label]).map((g) => `| ${g.label} | ${g.n} | **${g.diem.toFixed(0)}** | ${n1(g.free)} | ${g.roRi.toFixed(0)} | ${g.tien.toFixed(0)} |`).join('\n')}

## Theo vùng

| Vùng | n | Điểm | Thu nhập TB | Vốn tự do TB |
|---|---|---|---|---|
${byCity.map((g) => `| ${g.label} | ${g.n} | **${g.diem.toFixed(0)}** | ${trieu(g.income)} | ${n1(g.free)} |`).join('\n')}

## Phân bố

| | Số người | Tỷ lệ |
|---|---|---|
| Hợp (≥45) | ${people.filter((p) => p.diem >= 45).length} | ${pc(people.filter((p) => p.diem >= 45).length / N)} |
| Tạm (30–44) | ${people.filter((p) => p.diem >= 30 && p.diem < 45).length} | ${pc(people.filter((p) => p.diem >= 30 && p.diem < 45).length / N)} |
| Yếu (18–29) | ${people.filter((p) => p.diem >= 18 && p.diem < 30).length} | ${pc(people.filter((p) => p.diem >= 18 && p.diem < 30).length / N)} |
| Không hợp (<18) | ${people.filter((p) => p.diem < 18).length} | ${pc(people.filter((p) => p.diem < 18).length / N)} |

Điểm trung bình toàn dân số: **${avg(people, (p) => p.diem).toFixed(1)}**.
Giá trị trung bình ${avg(people, (p) => p.giaTri).toFixed(1)}, chi phí ghi trung bình ${avg(people, (p) => p.chiPhi).toFixed(1)}.

## Thành phần nào kéo điểm xuống

| Thành phần | Trung bình | Số người dưới 20 điểm |
|---|---|---|
| Rò rỉ | ${avg(people, (p) => p.roRi).toFixed(0)} | ${people.filter((p) => p.roRi < 20).length} |
| Tín hiệu tiền | ${avg(people, (p) => p.tinHieuTien).toFixed(0)} | ${people.filter((p) => p.tinHieuTien < 20).length} |
| Tín hiệu quan hệ | ${avg(people, (p) => p.tinHieuQuanHe).toFixed(0)} | ${people.filter((p) => p.tinHieuQuanHe < 20).length} |
| Có gì mới | ${avg(people, (p) => p.moiMe).toFixed(0)} | ${people.filter((p) => p.moiMe < 20).length} |
`;

writeFileSync(resolve(OUT, 'thi-truong.md'), md);

console.log(`${N} người, ${WEEKS} tuần mỗi người.`);
console.log(`Điểm TB ${avg(people, (p) => p.diem).toFixed(1)} · giá trị ${avg(people, (p) => p.giaTri).toFixed(1)} · chi phí ${avg(people, (p) => p.chiPhi).toFixed(1)}`);
console.log('\nTop 5 nghề:');
byJob.slice(0, 5).forEach((g) => console.log(`  ${g.label.padEnd(24)} ${g.diem.toFixed(0)}`));
console.log('Đáy 5 nghề:');
byJob.slice(-5).forEach((g) => console.log(`  ${g.label.padEnd(24)} ${g.diem.toFixed(0)}`));
console.log(`\nĐã ghi ${OUT}/thi-truong.md + dan-so.csv`);
