/**
 * Số nào của Mira thật sự mang tín hiệu, số nào là nhiễu hoặc nói lại điều đã biết.
 *
 *   node code/tools/tin-hieu.mjs   →  docs/du-lieu-mau/tin-hieu.md
 *
 * Ba câu hỏi, mỗi câu một phép đo:
 *
 *   1. PHÂN BIỆT NGƯỜI — số này có khác nhau giữa người với người không?
 *      Số nào ai cũng giống ai thì không dùng để định vị hay để onboarding được.
 *
 *   2. TRÙNG LẶP — hai số có đang nói cùng một điều không?
 *      Tương quan |r| ≥ 0,8 nghĩa là bày cả hai chỉ tốn chỗ.
 *
 *   3. ĐỔI THEO TUẦN — tuần sau mở app ra, số này có khác đi đủ để đáng nhìn không?
 *      Đây là thứ quyết định người ta còn quay lại hay không (N-208).
 *
 * Và một tỷ số gộp hai câu đầu với câu cuối:
 *      tín hiệu giữa người ÷ dao động trong một người
 *   Cao  → số này nói "bạn là ai". Bày một lần lúc mở tài khoản là đủ.
 *   Thấp → số này nói "tuần này khác gì". Đáng bày mỗi tuần.
 *   Hai loại này phải nằm ở hai chỗ khác nhau trên giao diện.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JOBS, WEEKS, rng, pick, simulate, score, stagesFor, CITIES } from './lib/dan-so.mjs';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../docs/du-lieu-mau');
const N = 300;

// ── dựng lại đúng dân số của population.mjs
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

// ── thống kê cơ bản
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const sd = (xs) => {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / xs.length);
};
const quant = (xs, q) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
};
const corr = (xs, ys) => {
  const mx = mean(xs), my = mean(ys);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < xs.length; i += 1) {
    const a = xs[i] - mx, b = ys[i] - my;
    num += a * b; dx += a * a; dy += b * b;
  }
  return dx === 0 || dy === 0 ? 0 : num / Math.sqrt(dx * dy);
};
const n1 = (x) => x.toFixed(1).replace('.', ',');
const n2 = (x) => x.toFixed(2).replace('.', ',');
const pcf = (x) => `${(x * 100).toFixed(0)}%`;

// ── các số Mira bày ra cho người dùng
const METRICS = [
  { key: 'waste', name: 'Giờ lãng phí / tuần', unit: 'h', get: (p) => p.wastePerWeek / 60 },
  { key: 'family', name: 'Giờ gia đình / tuần', unit: 'h', get: (p) => p.family / 60 / WEEKS },
  { key: 'golden', name: 'Giờ vàng / tuần', unit: 'h', get: (p) => p.goldenPerWeek / 60 },
  { key: 'work', name: 'Giờ công việc / tuần', unit: 'h', get: (p) => p.work / 60 / WEEKS },
  { key: 'logged', name: 'Tổng đã ghi / tuần', unit: 'h', get: (p) => p.logged / 60 / WEEKS },
  { key: 'wasteShare', name: 'Tỷ lệ lãng phí', unit: '%', get: (p) => (p.waste / p.logged) * 100 },
  { key: 'free', name: 'Vốn tự do', unit: 'tháng', get: (p) => p.freeEnd },
  { key: 'surplus', name: 'Mức dư trung bình', unit: '%', get: (p) => p.avgSurplus * 100 },
  { key: 'spread', name: 'Biên độ mức dư', unit: 'điểm %', get: (p) => p.spreadSurplus * 100 },
  { key: 'debtMonths', name: 'Nợ giữ lại', unit: 'tháng', get: (p) => p.monthsHeldByDebt },
  { key: 'income', name: 'Thu nhập', unit: 'tr', get: (p) => p.income / 1e6 },
];

// ── 1. phân biệt giữa người
const between = METRICS.map((m) => {
  const xs = people.map(m.get);
  const mu = mean(xs);
  return {
    ...m, mu, sd: sd(xs),
    cv: mu === 0 ? 0 : sd(xs) / Math.abs(mu),
    p10: quant(xs, 0.1), p50: quant(xs, 0.5), p90: quant(xs, 0.9),
    spread90_10: quant(xs, 0.9) - quant(xs, 0.1),
    xs,
  };
});

// ── 2. trùng lặp
const pairs = [];
for (let i = 0; i < between.length; i += 1) {
  for (let j = i + 1; j < between.length; j += 1) {
    const r = corr(between[i].xs, between[j].xs);
    if (Math.abs(r) >= 0.55) pairs.push({ a: between[i].name, b: between[j].name, r });
  }
}
pairs.sort((x, y) => Math.abs(y.r) - Math.abs(x.r));

// ── 3. đổi theo tuần
/**
 * "Đáng nhìn" = đổi ít nhất 15% so với tuần trước VÀ ít nhất nửa giờ.
 * Dưới ngưỡng đó thì con số mới nhìn như con số cũ.
 */
const WEEKLY = [
  { key: 'waste', name: 'Giờ lãng phí' },
  { key: 'family', name: 'Giờ gia đình' },
  { key: 'golden', name: 'Giờ vàng' },
  { key: 'work', name: 'Giờ công việc' },
  { key: 'logged', name: 'Tổng đã ghi' },
];

const weekly = WEEKLY.map((w) => {
  let changed = 0, total = 0;
  const withinSds = [];
  const personMeans = [];
  const flatPeople = [];

  for (const p of people) {
    const series = p.weekly[w.key].map((x) => x / 60);
    personMeans.push(mean(series));
    withinSds.push(sd(series));
    let c = 0;
    for (let i = 1; i < series.length; i += 1) {
      const prev = series[i - 1], cur = series[i];
      const rel = prev === 0 ? (cur > 0 ? 1 : 0) : Math.abs(cur - prev) / prev;
      if (rel >= 0.15 && Math.abs(cur - prev) >= 0.5) c += 1;
      total += 1;
      if (rel >= 0.15 && Math.abs(cur - prev) >= 0.5) changed += 1;
    }
    if (c / (series.length - 1) < 0.2) flatPeople.push(p);
  }

  const sdBetween = sd(personMeans);
  const sdWithin = mean(withinSds);
  return {
    ...w,
    newsRate: changed / total,
    sdBetween, sdWithin,
    ratio: sdWithin === 0 ? Infinity : sdBetween / sdWithin,
    flat: flatPeople.length,
  };
});

// ── 4. số nào kéo điểm phù hợp
const diem = people.map((p) => p.diem);
const drivers = between
  .map((m) => ({ name: m.name, r: corr(m.xs, diem) }))
  .sort((a, b) => Math.abs(b.r) - Math.abs(a.r));

// ── viết báo cáo
const loai = (ratio) =>
  ratio >= 1.6 ? '**bạn là ai**' : ratio >= 0.9 ? 'cả hai' : '**tuần này khác gì**';

const md = `# Số nào mang tín hiệu, số nào là nhiễu

> Sinh bởi \`code/tools/tin-hieu.mjs\` trên đúng dân số 300 người của \`thi-truong.md\`.
> Vẫn là mô phỏng, không phải người thật — xem phần giới hạn ở \`thi-truong.md\`.

Ba câu hỏi cho mỗi con số Mira bày ra:

1. **Phân biệt người** — số này có khác nhau giữa người với người không? Số nào ai cũng
   giống ai thì không dùng để định vị được.
2. **Trùng lặp** — hai số có đang nói cùng một điều không?
3. **Đổi theo tuần** — tuần sau mở app, số này có khác đi đủ để đáng nhìn không? Đây là thứ
   quyết định người ta còn quay lại (N-208).

---

## 1 · Phân biệt người đến đâu

Cột **p10 → p90** là khoảng giữa người thứ 10% và người thứ 90%. Khoảng hẹp nghĩa là con số
đó gần như nhau với mọi người.

| Số | p10 | Trung vị | p90 | Hệ số biến thiên |
|---|---|---|---|---|
${between
  .slice()
  .sort((a, b) => b.cv - a.cv)
  .map(
    (m) =>
      `| ${m.name} | ${n1(m.p10)}${m.unit} | **${n1(m.p50)}${m.unit}** | ${n1(m.p90)}${m.unit} | ${n2(m.cv)} |`,
  )
  .join('\n')}

## 2 · Số nào nói lại điều số khác đã nói

Tương quan tuyệt đối từ 0,55 trở lên. Từ **0,8** trở lên thì bày cả hai chỉ tốn chỗ.

| Cặp số | r | |
|---|---|---|
${pairs
  .map(
    (p) =>
      `| ${p.a} ↔ ${p.b} | ${n2(p.r)} | ${Math.abs(p.r) >= 0.8 ? '**trùng — bỏ một**' : 'gần nhau'} |`,
  )
  .join('\n')}

## 3 · Đổi theo tuần đến đâu

**Tỷ lệ tuần đáng nhìn**: phần trăm số tuần mà con số đổi ít nhất 15% và ít nhất nửa giờ so
với tuần trước.

**Người "đứng yên"**: số người mà con số này đổi đáng kể ở dưới 20% số tuần — với họ, màn
hình đó tuần nào cũng như tuần nào.

| Số | Tuần đáng nhìn | Người đứng yên | SD giữa người | SD trong một người | Tỷ số | Nên dùng để nói |
|---|---|---|---|---|---|---|
${weekly
  .map(
    (w) =>
      `| ${w.name} | **${pcf(w.newsRate)}** | ${w.flat}/${N} | ${n1(w.sdBetween)}h | ${n1(w.sdWithin)}h | ${n2(w.ratio)} | ${loai(w.ratio)} |`,
  )
  .join('\n')}

## 4 · Số nào kéo điểm phù hợp

| Số | Tương quan với điểm |
|---|---|
${drivers.map((d) => `| ${d.name} | ${n2(d.r)} |`).join('\n')}
`;

mkdirSync(OUT, { recursive: true });
writeFileSync(resolve(OUT, 'tin-hieu.md'), md);

console.log('PHAN BIET NGUOI (he so bien thien, cao = phan biet tot)');
between.slice().sort((a, b) => b.cv - a.cv).forEach((m) => console.log(`  ${m.name.padEnd(24)} ${n2(m.cv)}`));
console.log('\nDOI THEO TUAN');
weekly.forEach((w) => console.log(`  ${w.name.padEnd(18)} tuan dang nhin ${pcf(w.newsRate).padStart(4)}  ty so ${n2(w.ratio)}  dung yen ${w.flat}`));
console.log('\nTRUNG LAP manh (|r| >= 0.8)');
pairs.filter((p) => Math.abs(p.r) >= 0.8).forEach((p) => console.log(`  ${p.a} <-> ${p.b}  r=${n2(p.r)}`));
console.log(`\nDa ghi ${OUT}/tin-hieu.md`);
