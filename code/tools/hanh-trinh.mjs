/**
 * Sáu tháng của 300 người có tính cách, có sự kiện đời, có phản ứng với app —
 * và 300 người đối chứng y hệt nhưng không cài app.
 *
 *   node code/tools/hanh-trinh.mjs  →  docs/du-lieu-mau/hanh-trinh.md
 *                                      docs/du-lieu-mau/hanh-trinh-tuan.csv
 *
 * Mỗi người đối chứng dùng CÙNG seed với người dùng app, nên có cùng tính cách, cùng sự
 * kiện đời, cùng nhịp nghề. Khác biệt duy nhất là `dungApp`. Nhờ vậy chênh lệch giữa hai
 * nhóm quy được về đúng một nguyên nhân — trong phạm vi mô hình.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JOBS, CITIES, stagesFor, pick, rng as rngDS } from './lib/dan-so.mjs';
import { songSauThang, WEEKS } from './lib/nguoi.mjs';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../docs/du-lieu-mau');
const N = 300;

const r0 = rngDS(424242);
const setup = [];
for (let i = 0; i < N; i += 1) {
  const job = JOBS[i % JOBS.length];
  const stage = pick(r0, stagesFor(job));
  const x = r0();
  const city = x < CITIES[0].share ? CITIES[0] : x < CITIES[0].share + CITIES[1].share ? CITIES[1] : CITIES[2];
  setup.push({ seed: 5_000_000 + i * 97, job, stage, city });
}

const app = setup.map((s) => songSauThang({ ...s, dungApp: true }));
const doiChung = setup.map((s) => songSauThang({ ...s, dungApp: false }));

// ─────────────────────────────────────────────────────── tiện ích
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const h = (phut) => phut / 60;
const n1 = (x) => x.toFixed(1).replace('.', ',');
const n2 = (x) => x.toFixed(2).replace('.', ',');
const pcf = (x) => `${(x * 100).toFixed(0)}%`;
/** Trung bình một trường qua khoảng tuần [a, b). */
const quaTuan = (p, field, a, b) => mean(p.tuan.slice(a, b).map((t) => t[field]));

// ─────────────────────────────────────────────────────── 1. giữ chân
const conDung = (p, tuan) => p.boTuan === null || p.boTuan > tuan;
const MOC = [1, 2, 4, 6, 8, 12, 16, 20, 26];
const giuChan = MOC.map((t) => ({
  tuan: t,
  tyLe: app.filter((p) => conDung(p, t)).length / N,
  // Trong số còn dùng, trung bình ghi mấy ngày mỗi tuần.
  ngayGhi: mean(app.filter((p) => conDung(p, t)).map((p) => p.tuan[Math.min(t, WEEKS - 1)]?.ngayGhi ?? 0)),
}));

const conLai = app.filter((p) => p.boTuan === null);
const daBo = app.filter((p) => p.boTuan !== null);

// ─────────────────────────────────────────────────────── 2. ai ở lại
const netTB = (xs, k) => mean(xs.map((p) => p.traits[k]));
const NET = [
  ['kyLuat', 'Kỷ luật'],
  ['toMo', 'Tò mò về số của mình'],
  ['ganKet', 'Gắn kết người thân'],
  ['bocDong', 'Bốc đồng'],
  ['loAu', 'Lo âu'],
];

// ─────────────────────────────────────────────────────── 3. hiệu quả
/** Tháng 1–2 (tuần 0–8) so với tháng 5–6 (tuần 18–26). */
function doiThay(nhom, field) {
  const dau = mean(nhom.map((p) => quaTuan(p, field, 0, 8)));
  const cuoi = mean(nhom.map((p) => quaTuan(p, field, 18, 26)));
  return { dau: h(dau), cuoi: h(cuoi), doi: dau === 0 ? 0 : (cuoi - dau) / dau };
}

const nhomSoSanh = [
  { ten: 'Còn dùng tới cuối (app)', xs: conLai },
  { ten: 'Đã bỏ giữa chừng (app)', xs: daBo },
  { ten: 'Đối chứng — không cài app', xs: doiChung },
];

const hieuQua = nhomSoSanh.map((g) => ({
  ten: g.ten,
  n: g.xs.length,
  waste: doiThay(g.xs, 'waste'),
  golden: doiThay(g.xs, 'golden'),
  work: doiThay(g.xs, 'work'),
}));

// Chênh lệch sạch: người còn dùng so với CHÍNH họ ở nhánh đối chứng (cùng seed).
const capConLai = conLai.map((p) => doiChung[app.indexOf(p)]);
const wasteConLai = doiThay(conLai, 'waste');
const wasteCapDoi = doiThay(capConLai, 'waste');
const goldenConLai = doiThay(conLai, 'golden');
const goldenCapDoi = doiThay(capConLai, 'golden');

// ─────────────────────────────────────────────────────── 4. tuần có biến động
/** Giờ lãng phí tuần này so với tuần trước đổi ≥15% và ≥30 phút. */
function tyLeTuanDangNhin(nhom, field) {
  let doi = 0, tong = 0;
  for (const p of nhom) {
    for (let i = 1; i < p.tuan.length; i += 1) {
      const a = p.tuan[i - 1][field], b = p.tuan[i][field];
      const rel = a === 0 ? (b > 0 ? 1 : 0) : Math.abs(b - a) / a;
      if (rel >= 0.15 && Math.abs(b - a) >= 30) doi += 1;
      tong += 1;
    }
  }
  return doi / tong;
}

// ─────────────────────────────────────────────────────── 5. hồ sơ ví dụ
const keNet = (t) =>
  NET.map(([k, ten]) => `${ten} ${Math.round(t[k] * 100)}`).join(' · ');

function hoSo(p) {
  const thangs = [];
  for (let m = 0; m < 6; m += 1) {
    const a = m * 4, b = Math.min(WEEKS, (m + 1) * 4 + (m === 5 ? 2 : 0));
    thangs.push({
      waste: h(quaTuan(p, 'waste', a, b)),
      golden: h(quaTuan(p, 'golden', a, b)),
      work: h(quaTuan(p, 'work', a, b)),
      ghi: quaTuan(p, 'ngayGhi', a, b),
      thu: p.thang[m]?.thu ?? 0,
    });
  }
  const ev = p.events
    .slice()
    .sort((a, b) => a.batDau - b.batDau)
    .map((e) => `tuần ${Math.floor(e.batDau / 7) + 1} ${e.ten.toLowerCase()}`)
    .join(' · ');
  return { p, thangs, ev };
}

// Chọn bốn người đáng kể chuyện: một người ở lại và cải thiện nhiều nhất, một người bỏ sớm,
// một người gặp cú sốc thu nhập, một người kỷ luật cao mà vẫn bỏ.
const cuaiThien = conLai
  .map((p) => ({ p, d: quaTuan(p, 'waste', 18, 26) - quaTuan(p, 'waste', 0, 8) }))
  .sort((a, b) => a.d - b.d)[0]?.p;
const boSom = daBo.slice().sort((a, b) => a.boTuan - b.boTuan)[0];
const socThu = app
  .filter((p) => p.events.some((e) => e.key === 'mat-khach'))
  .sort((a, b) => b.traits.kyLuat - a.traits.kyLuat)[0];
const kyLuatMaBo = daBo.slice().sort((a, b) => b.traits.kyLuat - a.traits.kyLuat)[0];
const viDu = [cuaiThien, boSom, socThu, kyLuatMaBo].filter(Boolean).map(hoSo);

// ─────────────────────────────────────────────────────── CSV tuần
const rows = ['nguoi,nghe,giai_doan,dung_app,tuan,work_h,waste_h,family_h,golden_h,ngay_ghi,con_dung,cang_thang'];
for (let i = 0; i < N; i += 1) {
  for (const [nhan, p] of [['app', app[i]], ['doi_chung', doiChung[i]]]) {
    p.tuan.forEach((t, w) => {
      rows.push(
        [
          i, p.job.name, p.stage.name, nhan, w + 1,
          n2(h(t.work)), n2(h(t.waste)), n2(h(t.family)), n2(h(t.golden)),
          t.ngayGhi, t.dangDung ? 1 : 0, n2(t.cangThang),
        ].join(','),
      );
    });
  }
}
mkdirSync(OUT, { recursive: true });
writeFileSync(resolve(OUT, 'hanh-trinh-tuan.csv'), rows.join('\n'));

// ─────────────────────────────────────────────────────── báo cáo
const md = `# Sáu tháng của 300 người — có tính cách, có biến cố, có bỏ cuộc

> Sinh bởi \`code/tools/hanh-trinh.mjs\`. Số thô theo tuần: \`hanh-trinh-tuan.csv\`
> (${(rows.length - 1).toLocaleString('vi-VN')} dòng — 300 người × 26 tuần × 2 nhánh).

## Mô hình này khác bản trước ở đâu

Bản trước (\`thi-truong.md\`) rút giờ mỗi ngày từ một phân phối cố định suốt 26 tuần. Không
có tính cách, không có trạng thái mang sang hôm sau, không có biến cố, không ai bỏ cuộc.
Cuộc đời phẳng lì — và đó là lý do nó kết luận giờ lãng phí hầu như không đổi theo tuần.

Bản này thêm bốn thứ:

1. **Tính cách** — năm nét rút một lần, ảnh hưởng suốt sáu tháng: kỷ luật, bốc đồng, lo âu,
   gắn kết người thân, tò mò về số của mình.
2. **Trạng thái ngày** — năng lượng và căng thẳng kéo sang hôm sau, không rút lại từ đầu.
   Một tuần xấu kéo theo tuần sau.
3. **Biến cố đời** — dự án gấp, ốm, con ốm, người thân ốm, đi chơi xa, được thưởng, mất
   khách, căng thẳng trong nhà. Có thời lượng, có dư âm, có ảnh hưởng tới thu nhập.
4. **Vòng lặp với app** — ghi hay không ghi mỗi ngày, bỏ hẳn sau 12 ngày liền không ghi,
   và nếu còn ghi thì hành vi đổi dần.

**Hệ số tác động của app lấy từ tài liệu đã rà, không bịa:** theo dõi tiến độ d ≈ 0,40
(Harkin 2016, N-202) và kế hoạch nếu–thì d ≈ 0,65 (Gollwitzer & Sheeran 2006, N-201), quy
sang phần trăm qua độ lệch chuẩn trong một người. Nghĩa là mô phỏng trả lời: *nếu các hệ số
trong tài liệu đúng thì sáu tháng trông thế nào* — **không** chứng minh app có tác dụng.

**300 người đối chứng dùng cùng seed**: cùng tính cách, cùng biến cố, cùng nghề. Khác duy
nhất là không cài app.

---

## 1 · Bao nhiêu người còn ghi

| Tuần | Còn dùng | Ngày ghi / tuần (người còn dùng) |
|---|---|---|
${giuChan.map((g) => `| ${g.tuan} | **${pcf(g.tyLe)}** | ${n1(g.ngayGhi)} |`).join('\n')}

Sau 26 tuần còn **${conLai.length}/${N}** người (${pcf(conLai.length / N)}).
Người bỏ giữa chừng bỏ ở tuần thứ **${n1(mean(daBo.map((p) => p.boTuan)))}** tính trung bình.

## 2 · Ai ở lại, ai bỏ

| Nét tính cách | Người ở lại | Người bỏ | Chênh |
|---|---|---|---|
${NET.map(([k, ten]) => {
  const a = netTB(conLai, k), b = netTB(daBo, k);
  return `| ${ten} | ${n2(a)} | ${n2(b)} | ${a - b >= 0 ? '+' : ''}${n2(a - b)} |`;
}).join('\n')}

## 3 · Sáu tháng thay đổi được gì

Giờ trung bình mỗi tuần, tháng 1–2 so với tháng 5–6.

| Nhóm | n | Lãng phí đầu | Lãng phí cuối | Đổi | Giờ vàng đầu | Giờ vàng cuối | Đổi |
|---|---|---|---|---|---|---|---|
${hieuQua
  .map(
    (g) =>
      `| ${g.ten} | ${g.n} | ${n1(g.waste.dau)}h | ${n1(g.waste.cuoi)}h | **${g.waste.doi >= 0 ? '+' : ''}${pcf(g.waste.doi)}** | ` +
      `${n1(g.golden.dau)}h | ${n1(g.golden.cuoi)}h | **${g.golden.doi >= 0 ? '+' : ''}${pcf(g.golden.doi)}** |`,
  )
  .join('\n')}

### So sánh sạch: người ở lại với chính họ ở nhánh không cài app

Cùng ${conLai.length} người, cùng tính cách, cùng biến cố — chỉ khác có app hay không.

| | Có app | Không app | Chênh lệch |
|---|---|---|---|
| Giờ lãng phí, đổi sau 6 tháng | **${wasteConLai.doi >= 0 ? '+' : ''}${pcf(wasteConLai.doi)}** | ${wasteCapDoi.doi >= 0 ? '+' : ''}${pcf(wasteCapDoi.doi)} | ${pcf(wasteConLai.doi - wasteCapDoi.doi)} |
| Giờ vàng, đổi sau 6 tháng | **${goldenConLai.doi >= 0 ? '+' : ''}${pcf(goldenConLai.doi)}** | ${goldenCapDoi.doi >= 0 ? '+' : ''}${pcf(goldenCapDoi.doi)} | ${pcf(goldenConLai.doi - goldenCapDoi.doi)} |

## 4 · Tuần có đủ biến động để đáng mở app không

Tỷ lệ tuần mà con số đổi ít nhất 15% và nửa giờ so với tuần trước.

| Số | Mô hình phẳng (bản trước) | Mô hình có biến cố (bản này) |
|---|---|---|
| Giờ lãng phí | 12% | **${pcf(tyLeTuanDangNhin(doiChung, 'waste'))}** |
| Giờ gia đình | 41% | **${pcf(tyLeTuanDangNhin(doiChung, 'family'))}** |
| Giờ vàng | 42% | **${pcf(tyLeTuanDangNhin(doiChung, 'golden'))}** |
| Giờ công việc | 14% | **${pcf(tyLeTuanDangNhin(doiChung, 'work'))}** |

---

## 5 · Bốn hồ sơ

${viDu
  .map(({ p, thangs, ev }) => {
    const bo = p.boTuan === null ? 'còn dùng tới cuối' : `**bỏ ở tuần ${p.boTuan}**`;
    return `### ${p.job.name} · ${p.stage.name} · ${p.city.name}

**Tính cách:** ${keNet(p.traits)}
**App:** ${bo}${p.coMucTieu ? ' · có đặt mục tiêu kèm khai nguồn' : ' · không đặt mục tiêu'} · ghi ${p.soNgayGhi} ngày
**Biến cố:** ${ev || 'không có gì đáng kể'}

| Tháng | Lãng phí/tuần | Giờ vàng/tuần | Công việc/tuần | Ngày ghi/tuần | Thu nhập |
|---|---|---|---|---|---|
${thangs
  .map(
    (t, i) =>
      `| ${i + 1} | ${n1(t.waste)}h | ${n1(t.golden)}h | ${n1(t.work)}h | ${n1(t.ghi)} | ${n1(t.thu / 1e6)}tr |`,
  )
  .join('\n')}`;
  })
  .join('\n\n')}
`;

writeFileSync(resolve(OUT, 'hanh-trinh.md'), md);

console.log(`Giu chan: tuan 4 ${pcf(giuChan[2].tyLe)} · tuan 12 ${pcf(giuChan[5].tyLe)} · tuan 26 ${pcf(giuChan[8].tyLe)}`);
console.log(`Con lai ${conLai.length}/${N}, bo trung binh o tuan ${n1(mean(daBo.map((p) => p.boTuan)))}`);
console.log(`\nLang phi sau 6 thang:`);
hieuQua.forEach((g) => console.log(`  ${g.ten.padEnd(30)} ${n1(g.waste.dau)}h -> ${n1(g.waste.cuoi)}h  (${pcf(g.waste.doi)})`));
console.log(`\nTuan dang nhin (lang phi): mo hinh phang 12% -> co bien co ${pcf(tyLeTuanDangNhin(doiChung, 'waste'))}`);
console.log(`\nDa ghi ${OUT}/hanh-trinh.md + hanh-trinh-tuan.csv`);
