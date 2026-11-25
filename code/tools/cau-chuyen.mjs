/**
 * Mira có kể được chuyện không — và có giúp người ta tốt hơn không.
 *
 *   node code/tools/cau-chuyen.mjs  →  docs/du-lieu-mau/cau-chuyen.md
 *
 * Hai câu hỏi, hai phép đo:
 *
 * 1. KỂ ĐƯỢC CHUYỆN KHÔNG
 *    Bộ dò dưới đây chỉ được nhìn thứ Mira thật sự lưu: giờ theo nhóm việc mỗi tuần, giờ
 *    vàng, số hạt muối, năm ô tiền, thói quen. Nó KHÔNG được nhìn tính cách hay biến cố —
 *    đúng như app ngoài đời. Rồi đối chiếu những tuần nó đánh dấu với biến cố thật để xem
 *    Mira nhìn thấy bao nhiêu phần đời người dùng.
 *
 * 2. GIÚP TỐT HƠN KHÔNG
 *    Không xem trung bình, xem từng người: bao nhiêu người thật sự khá hơn bản sao không
 *    cài app của chính mình, bao nhiêu người tệ đi, bao nhiêu người không đổi gì.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JOBS, CITIES, stagesFor, pick, rng } from './lib/dan-so.mjs';
import { songSauThang, WEEKS } from './lib/nguoi.mjs';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../docs/du-lieu-mau');
const N = 300;

const r0 = rng(424242);
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

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const median = (xs) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};
const h = (p) => p / 60;
const n1 = (x) => x.toFixed(1).replace('.', ',');
const pcf = (x) => `${(x * 100).toFixed(0)}%`;

// ─────────────────────────────────────────────────────── 1. bộ dò
const NHOM = [
  ['work', 'giờ công việc'],
  ['waste', 'giờ lãng phí'],
  ['family', 'giờ gia đình'],
  ['golden', 'giờ vàng'],
];

/**
 * Chỉ nhìn dữ liệu Mira lưu. Tuần nào có ít hơn 3 ngày ghi thì coi như mù — app không
 * biết gì về tuần đó, và đó là một phần của câu trả lời.
 */
function doBatThuong(p) {
  const nhinThay = p.tuan.map((t, w) => ({ ...t, w })).filter((t) => t.ngayGhi >= 3);
  if (nhinThay.length < 6) return { mu: true, danhDau: [], tuanNhinThay: nhinThay.length };

  const nen = {};
  for (const [k] of NHOM) nen[k] = median(nhinThay.map((t) => t[k]));

  const hatTheoTuan = {};
  for (const m of p.moments) if (m.muoi) hatTheoTuan[m.tuan] = (hatTheoTuan[m.tuan] ?? 0) + 1;

  const danhDau = [];
  for (const t of nhinThay) {
    const lyDo = [];
    for (const [k, ten] of NHOM) {
      if (nen[k] <= 0) continue;
      const lech = (t[k] - nen[k]) / nen[k];
      // Lệch ít nhất 40% và ít nhất 2 giờ so với mức thường của chính người đó.
      if (Math.abs(lech) >= 0.4 && Math.abs(t[k] - nen[k]) >= 120) {
        lyDo.push({ k, ten, lech, gio: h(t[k]), nen: h(nen[k]) });
      }
    }
    const muoi = hatTheoTuan[t.w] ?? 0;
    if (muoi >= 2) lyDo.push({ k: 'muoi', ten: `${muoi} hạt muối`, muoi });
    if (lyDo.length) danhDau.push({ w: t.w, lyDo });
  }
  return { mu: false, danhDau, tuanNhinThay: nhinThay.length, nen };
}

/** Biến cố thật rơi vào tuần nào. */
const tuanCuaBienCo = (e) => {
  const a = Math.floor(e.batDau / 7);
  const b = Math.floor((e.batDau + e.ngay - 1) / 7);
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
};

let tongBienCo = 0, batDuoc = 0, tongDanhDau = 0, danhDauDung = 0, soMu = 0;
const theoLoai = {};

for (const p of app) {
  const d = doBatThuong(p);
  if (d.mu) { soMu += 1; continue; }
  const tuanDanhDau = new Set(d.danhDau.map((x) => x.w));

  for (const e of p.events) {
    // Chỉ tính biến cố rơi vào lúc người ta còn dùng app.
    if (p.boTuan !== null && Math.floor(e.batDau / 7) >= p.boTuan) continue;
    tongBienCo += 1;
    const trung = tuanCuaBienCo(e).some((w) => tuanDanhDau.has(w));
    if (trung) batDuoc += 1;
    (theoLoai[e.ten] ??= { tong: 0, bat: 0 }).tong += 1;
    if (trung) theoLoai[e.ten].bat += 1;
  }

  for (const x of d.danhDau) {
    tongDanhDau += 1;
    const coThat = p.events.some((e) => tuanCuaBienCo(e).includes(x.w));
    if (coThat) danhDauDung += 1;
  }
}

// ─────────────────────────────────────────────────────── 2. giúp tốt hơn không, từng người
const cuoiKy = (p, f) => mean(p.tuan.slice(18, 26).map((t) => t[f]));
const ca = app.map((p, i) => {
  const t = doiChung[i];
  const dWaste = cuoiKy(t, 'waste') === 0 ? 0 : (cuoiKy(p, 'waste') - cuoiKy(t, 'waste')) / cuoiKy(t, 'waste');
  const dGolden = cuoiKy(t, 'golden') === 0 ? 0 : (cuoiKy(p, 'golden') - cuoiKy(t, 'golden')) / cuoiKy(t, 'golden');
  return { p, conDung: p.boTuan === null, dWaste, dGolden };
});

const phanLoai = (xs, f, nguong = 0.05) => ({
  totHon: xs.filter((x) => x[f] <= -nguong).length,
  khongDoi: xs.filter((x) => Math.abs(x[f]) < nguong).length,
  teDi: xs.filter((x) => x[f] >= nguong).length,
});
const conDung = ca.filter((x) => x.conDung);
const daBo = ca.filter((x) => !x.conDung);

// ─────────────────────────────────────────────────────── 3. kể thử vài câu chuyện
function keChuyen(p) {
  const d = doBatThuong(p);
  if (d.mu) return { p, cau: ['Không đủ dữ liệu để nói gì — ghi dưới ba ngày mỗi tuần.'], d };

  const cau = [];
  const hatTuan = {};
  for (const m of p.moments) (hatTuan[m.tuan] ??= { muoi: 0, keo: 0 })[m.muoi ? 'muoi' : 'keo'] += 1;

  for (const x of d.danhDau.slice(0, 5)) {
    const phan = x.lyDo
      .filter((l) => l.k !== 'muoi')
      .map(
        (l) =>
          `${l.ten} ${l.lech > 0 ? 'vọt lên' : 'tụt còn'} ${n1(l.gio)}h, ${l.lech > 0 ? 'cao hơn' : 'thấp hơn'} mức thường ${pcf(Math.abs(l.lech))}`,
      );
    const muoi = x.lyDo.find((l) => l.k === 'muoi');
    const hat = hatTuan[x.w];
    const duoi = muoi
      ? ` Tuần đó bạn bỏ ${muoi.muoi} hạt muối vào hũ.`
      : hat?.keo
        ? ` Tuần đó hũ nhận ${hat.keo} viên kẹo.`
        : '';
    if (phan.length) cau.push(`**Tuần ${x.w + 1}** — ${phan.join('; ')}.${duoi}`);
  }

  // Một câu về cả kỳ, từ năm ô tiền.
  const thuDau = p.thang[0]?.thu ?? 0, thuCuoi = p.thang[5]?.thu ?? 0;
  if (thuDau > 0 && Math.abs(thuCuoi - thuDau) / thuDau >= 0.12) {
    cau.push(
      `**Sáu tháng** — thu nhập đi từ ${n1(thuDau / 1e6)}tr xuống ${n1(thuCuoi / 1e6)}tr.`.replace(
        'xuống',
        thuCuoi > thuDau ? 'lên' : 'xuống',
      ),
    );
  }
  return { p, cau, d };
}

const viDu = [
  app.filter((p) => p.boTuan === null).sort((a, b) => b.events.length - a.events.length)[0],
  app.filter((p) => p.boTuan === null && p.events.some((e) => e.key === 'mat-khach'))[0],
  app.filter((p) => p.boTuan !== null && p.boTuan < 8)[0],
].filter(Boolean).map(keChuyen);

// ─────────────────────────────────────────────────────── báo cáo
const loai = Object.entries(theoLoai).sort((a, b) => b[1].tong - a[1].tong);

const md = `# Mira có kể được chuyện không, và có giúp được không

> Sinh bởi \`code/tools/cau-chuyen.mjs\` trên đúng 300 người của \`hanh-trinh.md\`.

## Luật chơi

Bộ dò chỉ được nhìn **thứ Mira thật sự lưu**: giờ theo nhóm việc mỗi tuần, giờ vàng, số hạt
muối, năm ô tiền, thói quen. Nó **không** được nhìn tính cách hay biến cố — đúng như app
ngoài đời.

Một tuần bị đánh dấu khi có nhóm việc lệch ít nhất **40% và 2 giờ** so với mức thường của
chính người đó, hoặc tuần đó có **từ hai hạt muối** trở lên.

Tuần nào ghi dưới ba ngày thì app coi như mù — và đó là một phần của câu trả lời.

---

## 1 · Mira nhìn thấy bao nhiêu phần đời người dùng

| | |
|---|---|
| Biến cố xảy ra khi người dùng còn mở app | **${tongBienCo}** |
| Mira bắt được | **${batDuoc}** (${pcf(batDuoc / tongBienCo)}) |
| Số tuần Mira đánh dấu | ${tongDanhDau} |
| Trong đó trùng biến cố thật | ${danhDauDung} (${pcf(danhDauDung / tongDanhDau)}) |
| Người không đủ dữ liệu để nói gì | ${soMu}/${N} (${pcf(soMu / N)}) |

### Loại biến cố nào Mira thấy, loại nào không

| Biến cố | Xảy ra | Bắt được | Tỷ lệ |
|---|---|---|---|
${loai.map(([ten, v]) => `| ${ten} | ${v.tong} | ${v.bat} | **${pcf(v.bat / v.tong)}** |`).join('\n')}

---

## 2 · Có giúp người ta tốt hơn không — xét từng người

So giờ lãng phí hai tháng cuối với **bản sao không cài app của chính mình**. Ngưỡng 5%.

| Nhóm | n | Khá hơn | Không đổi | Tệ hơn |
|---|---|---|---|---|
${[
  ['Còn dùng tới cuối', conDung],
  ['Đã bỏ giữa chừng', daBo],
  ['Tất cả người đăng ký', ca],
]
  .map(([ten, xs]) => {
    const r = phanLoai(xs, 'dWaste');
    return `| ${ten} | ${xs.length} | **${r.totHon}** (${pcf(r.totHon / xs.length)}) | ${r.khongDoi} (${pcf(r.khongDoi / xs.length)}) | ${r.teDi} (${pcf(r.teDi / xs.length)}) |`;
  })
  .join('\n')}

### Giờ vàng

| Nhóm | n | Khá hơn | Không đổi | Tệ hơn |
|---|---|---|---|---|
${[
  ['Còn dùng tới cuối', conDung],
  ['Tất cả người đăng ký', ca],
]
  .map(([ten, xs]) => {
    const r = phanLoai(xs, 'dGolden');
    // Giờ vàng thì "khá hơn" là tăng, nên đảo lại.
    return `| ${ten} | ${xs.length} | **${r.teDi}** (${pcf(r.teDi / xs.length)}) | ${r.khongDoi} (${pcf(r.khongDoi / xs.length)}) | ${r.totHon} (${pcf(r.totHon / xs.length)}) |`;
  })
  .join('\n')}

---

## 3 · Thử kể ba câu chuyện

Những câu dưới đây dựng **hoàn toàn từ dữ liệu Mira lưu**, không dùng biến cố thật.
Dòng *"đời thật"* ở cuối mỗi hồ sơ là thứ app không nhìn thấy, để đối chiếu.

${viDu
  .map(({ p, cau, d }) => {
    const that = p.events
      .slice()
      .sort((a, b) => a.batDau - b.batDau)
      .map((e) => `tuần ${Math.floor(e.batDau / 7) + 1} ${e.ten.toLowerCase()}`)
      .join(' · ');
    return `### ${p.job.name} · ${p.stage.name}
${p.boTuan === null ? `Dùng hết sáu tháng, ghi ${p.soNgayGhi} ngày.` : `**Bỏ ở tuần ${p.boTuan}**, ghi ${p.soNgayGhi} ngày.`} Mira nhìn rõ ${d.tuanNhinThay}/${WEEKS} tuần.

${cau.length ? cau.map((c) => `- ${c}`).join('\n') : '- Mira không có gì để nói.'}

> **Đời thật (app không thấy):** ${that || 'không có biến cố'}`;
  })
  .join('\n\n')}
`;

mkdirSync(OUT, { recursive: true });
writeFileSync(resolve(OUT, 'cau-chuyen.md'), md);

console.log(`Bien co khi con dung app: ${tongBienCo} · Mira bat duoc ${batDuoc} (${pcf(batDuoc / tongBienCo)})`);
console.log(`Tuan danh dau: ${tongDanhDau} · trung bien co that ${pcf(danhDauDung / tongDanhDau)}`);
console.log(`Khong du du lieu de noi gi: ${soMu}/${N}`);
console.log('\nBat duoc theo loai bien co:');
loai.forEach(([t, v]) => console.log(`  ${t.padEnd(24)} ${pcf(v.bat / v.tong).padStart(4)}  (${v.bat}/${v.tong})`));
const rw = phanLoai(conDung, 'dWaste');
console.log(`\nNguoi con dung: kha hon ${pcf(rw.totHon / conDung.length)} · khong doi ${pcf(rw.khongDoi / conDung.length)} · te hon ${pcf(rw.teDi / conDung.length)}`);
console.log(`\nDa ghi ${OUT}/cau-chuyen.md`);
