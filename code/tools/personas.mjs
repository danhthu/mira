/**
 * Sinh dữ liệu mẫu 6 tháng cho bốn vai người dùng, rồi phân tích xem Mira cho họ thấy gì.
 *
 *   node code/tools/personas.mjs
 *
 * Ra: docs/du-lieu-mau/<vai>.json   — đúng định dạng kho localStorage của web, dán vào là chạy
 *     docs/du-lieu-mau/phan-tich.md — bảng số và phần đọc kết quả
 *
 * Số ngẫu nhiên dùng seed cố định nên chạy lại cho ra đúng bộ cũ.
 *
 * Bốn nhóm việc và các trần ở đây phải khớp `code/contract/src/index.ts`. Script một lần
 * này cố ý không import contract (file .ts, cần loader) — nếu đổi luật bên đó thì sửa cả đây.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'docs/du-lieu-mau');

const WAKING_PER_WEEK = 16 * 60 * 7; // 6720 phút
const SALT_REVISIT_DAYS = 42;
const FROM = '2026-06-01';
const TO = '2026-11-30';

// ─────────────────────────────────────────────────────────── tiện ích

/** mulberry32: đủ tốt cho dữ liệu mẫu, và chạy lại cho đúng kết quả cũ. */
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const addDays = (date, n) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const weekday = (date) => (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7; // 0 = thứ hai
const monthOf = (date) => date.slice(0, 7);
const dayOfMonth = (date) => Number(date.slice(8, 10));
const daysBetween = (a, b) =>
  Math.round((new Date(`${b}T00:00:00Z`) - new Date(`${a}T00:00:00Z`)) / 86400000);

const allDays = () => {
  const out = [];
  for (let i = 0; i <= daysBetween(FROM, TO); i += 1) out.push(addDays(FROM, i));
  return out;
};

const months = () => {
  const out = [];
  for (let m = 6; m <= 11; m += 1) out.push(`2026-${String(m).padStart(2, '0')}`);
  return out;
};

let counter = 0;
const id = (prefix) => `${prefix}-${String((counter += 1)).padStart(5, '0')}`;

/** Quanh `mid` ± `spread`, trả phút nguyên. */
const near = (r, mid, spread) => Math.max(0, Math.round(mid + (r() * 2 - 1) * spread));

// ─────────────────────────────────────────────────────────── bốn vai

/**
 * Mỗi vai khai một hàm `day(date, r)` trả về số phút từng nhóm việc trong ngày đó,
 * cộng cờ giờ vàng. Nhịp làm việc khác nhau mới là thứ làm bốn vai khác nhau, chứ
 * không phải con số tổng.
 */
const PERSONAS = [
  {
    key: 'lap-trinh',
    name: 'Nhân viên lập trình',
    blurb: '28 tuổi, HCM, ở trọ một mình, công ty sản phẩm',
    seed: 1001,
    day(date, r) {
      const wd = weekday(date);
      const cuoiTuan = wd >= 5;
      // Sprint hai tuần: tuần chốt sprint làm nhiều hơn hẳn.
      const tuanChot = Math.floor(daysBetween(FROM, date) / 7) % 2 === 1;
      const work = cuoiTuan
        ? r() < 0.35
          ? near(r, 180, 60)
          : 0
        : near(r, tuanChot ? 620 : 545, 70);
      return {
        work,
        // Lướt điện thoại là nhóm lớn thứ hai của vai này, và chính chủ không biết.
        waste: near(r, cuoiTuan ? 210 : 150, 55),
        personal: near(r, cuoiTuan ? 150 : 75, 40),
        family: cuoiTuan ? near(r, 90, 50) : r() < 0.45 ? near(r, 30, 20) : 0,
        goldenShare: 0.55,
      };
    },
    money: (i) => ({
      netIncome: 32_000_000,
      monthlyExpense: 14_500_000 + i * 180_000,
      debtPayment: null,
      debtBalance: null,
      netWorth: 196_000_000 + i * 17_200_000,
    }),
    goals: [
      { tier: 'quarter', title: 'Viết blog kỹ thuật', weeklyMinutes: 240 },
      { tier: 'long', title: 'Đổi sang việc làm từ xa', weeklyMinutes: 120 },
    ],
    habits: [
      { title: 'Ngủ trước 12h', targetPerWeek: 5, rate: 0.52 },
      { title: 'Tập gym', targetPerWeek: 3, rate: 0.61 },
    ],
    moments: { perWeek: 1.6, saltShare: 0.34 },
  },

  {
    key: 'kinh-doanh',
    name: 'Nhân viên kinh doanh',
    blurb: '32 tuổi, đã lập gia đình, lương cứng cộng hoa hồng',
    seed: 2002,
    day(date, r) {
      const wd = weekday(date);
      const cuoiTuan = wd >= 5;
      // Cuối tháng chạy số: giờ làm vọt lên, mọi nhóm khác bị bóp lại.
      const chaySo = dayOfMonth(date) >= 24;
      const work = cuoiTuan
        ? r() < 0.5
          ? near(r, 210, 90)
          : 0
        : near(r, chaySo ? 700 : 560, 110);
      // Tiếp khách buổi tối tính vào công việc, nên nhóm cá nhân gần như không còn.
      return {
        work,
        waste: near(r, 95, 45),
        personal: near(r, cuoiTuan ? 90 : 35, 30),
        family: cuoiTuan ? near(r, 150, 70) : r() < 0.4 ? near(r, 45, 30) : 0,
        goldenShare: 0.5,
      };
    },
    money: (i) => {
      // Hoa hồng lên xuống rất mạnh — đây là điều vai này sống chung mà không đo được.
      const hoaHong = [6_500_000, 21_000_000, 4_000_000, 15_500_000, 26_000_000, 9_000_000][i];
      // Chi tiêu KHÔNG gồm trả nợ: trả nợ là ô riêng trong năm ô.
      const chi = 11_400_000 + (i % 2) * 1_300_000;
      const no = 5_200_000;
      return {
        netIncome: 12_000_000 + hoaHong,
        monthlyExpense: chi,
        debtPayment: no,
        debtBalance: 212_000_000 - i * no,
        netWorth: 84_000_000 + i * 3_400_000,
      };
    },
    goals: [{ tier: 'quarter', title: 'Học tiếng Anh thương mại', weeklyMinutes: 180 }],
    habits: [
      { title: 'Gọi về cho bố mẹ', targetPerWeek: 2, rate: 0.44 },
      { title: 'Đi bộ 30 phút', targetPerWeek: 4, rate: 0.38 },
    ],
    moments: { perWeek: 1.1, saltShare: 0.48 },
  },

  {
    key: 'ke-toan',
    name: 'Nhân viên kế toán',
    blurb: '35 tuổi, hai con nhỏ, nợ nhà còn 12 năm',
    seed: 3003,
    day(date, r) {
      const wd = weekday(date);
      const cuoiTuan = wd >= 5;
      const dom = dayOfMonth(date);
      // Quyết toán: ba ngày cuối và bốn ngày đầu tháng. Quý thì nặng hơn nữa.
      const quyetToan = dom >= 28 || dom <= 4;
      const cuoiQuy = ['2026-09', '2026-06'].includes(monthOf(date)) && dom >= 28;
      const work = cuoiTuan
        ? quyetToan
          ? near(r, 240, 90)
          : 0
        : near(r, quyetToan ? (cuoiQuy ? 690 : 620) : 490, 60);
      return {
        work,
        waste: near(r, 65, 30),
        personal: near(r, cuoiTuan ? 80 : 30, 25),
        // Giờ với con là nhóm lớn thứ hai, và phần lớn là giờ thật sự có mặt.
        family: cuoiTuan ? near(r, 300, 90) : quyetToan ? near(r, 55, 30) : near(r, 130, 45),
        goldenShare: 0.72,
      };
    },
    money: (i) => ({
      netIncome: 18_400_000,
      // Tháng 9 con vào năm học: khoản này đủ để đẩy một tháng xuống âm.
      monthlyExpense: 9_600_000 + (i === 3 ? 4_200_000 : 0),
      debtPayment: 5_200_000,
      debtBalance: 806_000_000 - i * 2_900_000,
      netWorth: 142_000_000 + i * 3_100_000,
    }),
    goals: [{ tier: 'quarter', title: 'Đọc sách cùng con', weeklyMinutes: 150 }],
    habits: [
      { title: 'Ăn tối cùng nhà', targetPerWeek: 5, rate: 0.78 },
      { title: 'Đi ngủ trước 11h', targetPerWeek: 5, rate: 0.57 },
    ],
    moments: { perWeek: 2.3, saltShare: 0.29 },
  },

  {
    key: 'sinh-vien',
    name: 'Sinh viên',
    blurb: '20 tuổi, năm ba, gia sư hai buổi mỗi tuần',
    seed: 4004,
    day(date, r) {
      const wd = weekday(date);
      const cuoiTuan = wd >= 5;
      const m = monthOf(date);
      const nghiHe = m === '2026-06' || m === '2026-07';
      const thiCuoiKy = m === '2026-11' && dayOfMonth(date) >= 15;
      // "Công việc" của sinh viên là đi học và đi làm thêm.
      const work = nghiHe
        ? wd < 2
          ? near(r, 180, 60)
          : 0
        : cuoiTuan
          ? r() < 0.4
            ? near(r, 150, 60)
            : 0
          : near(r, 330, 90);
      return {
        work,
        // Nhóm lớn nhất của vai này, và là thứ duy nhất họ còn toàn quyền.
        waste: near(r, nghiHe ? 310 : cuoiTuan ? 280 : 205, 80),
        personal: near(r, thiCuoiKy ? 300 : nghiHe ? 120 : 165, 60),
        family: nghiHe ? near(r, 200, 90) : cuoiTuan && r() < 0.35 ? near(r, 220, 80) : 0,
        goldenShare: 0.64,
      };
    },
    money: (i) => ({
      // Hai tháng hè không có lớp gia sư: thu tụt xuống dưới chi.
      netIncome: 4_200_000 + (i === 0 || i === 1 ? -1_200_000 : 0),
      monthlyExpense: 3_300_000,
      debtPayment: null,
      debtBalance: null,
      netWorth: 6_400_000 + i * 480_000,
    }),
    goals: [{ tier: 'quarter', title: 'Làm dự án cá nhân', weeklyMinutes: 300 }],
    habits: [
      { title: 'Học từ vựng', targetPerWeek: 5, rate: 0.41 },
      { title: 'Chạy bộ', targetPerWeek: 3, rate: 0.33 },
    ],
    moments: { perWeek: 0.9, saltShare: 0.41 },
  },
];

const CANDY = [
  'Đẩy được bản build chạy ngon',
  'Trời mát, đi bộ về nhà',
  'Cà phê với bạn cũ',
  'Ăn một bữa ngon',
  'Xong sớm hơn dự định',
  'Nghe được một câu hay',
  'Ngủ một giấc đã',
  'Có người cảm ơn mình',
];
const SALT = [
  'Họp hai tiếng không ra quyết định',
  'Bị nói nặng mà không cãi được',
  'Lại thức tới 2h sáng',
  'Tháng này tiêu quá tay',
  'Hứa rồi lại lỡ',
  'Mệt mà không biết vì sao',
  'Cãi nhau vì chuyện nhỏ',
];

// ─────────────────────────────────────────────────────────── sinh dữ liệu

function build(persona) {
  const r = rng(persona.seed);
  const timeEntries = [];
  const moments = [];
  const habitChecks = [];

  const habits = persona.habits.map((h) => ({
    id: id('hb'),
    title: h.title,
    targetPerWeek: h.targetPerWeek,
    startedOn: FROM,
    endedOn: null,
    rate: h.rate,
  }));

  const goals = persona.goals.map((g, i) => ({
    id: id('gl'),
    tier: g.tier,
    title: g.title,
    weeklyMinutes: g.weeklyMinutes,
    sourceBucket: 'waste',
    startedOn: addDays(FROM, i * 3),
    expiresOn: g.tier === 'quarter' ? addDays(FROM, i * 3 + 90) : null,
    endedOn: null,
    handedOverTo: null,
  }));

  for (const date of allDays()) {
    const d = persona.day(date, r);
    for (const bucket of ['work', 'family', 'personal', 'waste']) {
      const minutes = d[bucket];
      if (minutes <= 0) continue;
      // Giờ vàng chỉ là lát cắt bên trong nhóm gia đình.
      const golden = bucket === 'family' && r() < d.goldenShare;
      timeEntries.push({
        id: id('te'),
        date,
        minutes,
        bucket,
        golden,
        note: null,
        source: 'manual',
      });
    }

    // Hũ: xác suất theo tuần quy về ngày.
    if (r() < persona.moments.perWeek / 7) {
      const salt = r() < persona.moments.saltShare;
      const pool = salt ? SALT : CANDY;
      moments.push({
        id: id('mm'),
        date,
        kind: salt ? 'salt' : 'candy',
        text: pool[Math.floor(r() * pool.length)],
        revisitAt: salt ? addDays(date, SALT_REVISIT_DAYS) : null,
        // Hạt muối đã tới hạn thì phần lớn được trả lời, nhưng bỏ qua cũng được.
        revisitAnswer: salt && addDays(date, SALT_REVISIT_DAYS) <= TO && r() < 0.72
          ? ['same', 'lighter', 'gone'][Math.floor(r() * 3)]
          : null,
      });
    }

    for (const hb of habits) {
      // Xác suất mỗi ngày = (số lần mong muốn / 7) × tỷ lệ giữ được.
      // Kỳ vọng mỗi tuần = targetPerWeek × rate, đúng thứ muốn mô phỏng.
      if (r() < (hb.targetPerWeek / 7) * hb.rate) {
        habitChecks.push({ habitId: hb.id, date });
      }
    }
  }

  const money = {};
  months().forEach((m, i) => {
    money[m] = { month: m, ...persona.money(i) };
  });

  return {
    timeEntries,
    moments,
    money,
    goals,
    habits: habits.map(({ rate, ...h }) => h),
    habitChecks,
    wakingMinutesPerWeek: WAKING_PER_WEEK,
  };
}

// ─────────────────────────────────────────────────────────── phân tích

const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const h = (minutes) => `${(minutes / 60).toFixed(0)}h`;
const h1 = (minutes) => `${(minutes / 60).toFixed(1).replace('.', ',')}h`;
const tr = (vnd) => `${(vnd / 1_000_000).toFixed(1).replace('.', ',')}tr`;
const pc = (x) => `${(x * 100).toFixed(1).replace('.', ',')}%`;

function analyse(persona, data) {
  const weeks = (daysBetween(FROM, TO) + 1) / 7;
  const byBucket = {};
  for (const b of ['work', 'family', 'personal', 'waste']) {
    byBucket[b] = sum(data.timeEntries.filter((e) => e.bucket === b).map((e) => e.minutes));
  }
  const logged = sum(Object.values(byBucket));
  const golden = sum(data.timeEntries.filter((e) => e.golden).map((e) => e.minutes));
  const wakingTotal = WAKING_PER_WEEK * weeks;

  const ms = months().map((m) => data.money[m]);
  const surplus = ms.map((m) =>
    m.netIncome > 0 ? (m.netIncome - m.monthlyExpense - (m.debtPayment ?? 0)) / m.netIncome : 0,
  );
  const last = ms[ms.length - 1];
  const first = ms[0];
  const freeFirst = first.netWorth / first.monthlyExpense;
  const freeLast = last.netWorth / last.monthlyExpense;

  const goalNeed = sum(data.goals.filter((g) => !g.endedOn).map((g) => g.weeklyMinutes));
  const wastePerWeek = byBucket.waste / weeks;

  const candy = data.moments.filter((m) => m.kind === 'candy').length;
  const salt = data.moments.length - candy;
  const dueSalt = data.moments.filter((m) => m.kind === 'salt' && m.revisitAt <= TO);
  const answered = dueSalt.filter((m) => m.revisitAnswer !== null);
  const lighter = answered.filter((m) => m.revisitAnswer !== 'same').length;

  const habitStats = data.habits.map((hb) => {
    const done = data.habitChecks.filter((c) => c.habitId === hb.id).length;
    return { title: hb.title, target: hb.targetPerWeek, perWeek: done / weeks };
  });

  return {
    weeks,
    byBucket,
    logged,
    wakingTotal,
    golden,
    goldenPerWeek: golden / weeks,
    coverage: logged / wakingTotal,
    surplusAvg: sum(surplus) / surplus.length,
    surplusMin: Math.min(...surplus),
    surplusMax: Math.max(...surplus),
    freeFirst,
    freeLast,
    debtBalance: last.debtBalance,
    monthsHeldByDebt: last.debtBalance === null ? null : last.debtBalance / last.monthlyExpense,
    goalNeed,
    wastePerWeek,
    candy,
    salt,
    dueSalt: dueSalt.length,
    answered: answered.length,
    lighter,
    habitStats,
  };
}

// ─────────────────────────────────────────────────────────── chạy

mkdirSync(OUT, { recursive: true });
const results = [];

for (const persona of PERSONAS) {
  const data = build(persona);
  const stats = analyse(persona, data);
  writeFileSync(resolve(OUT, `${persona.key}.json`), JSON.stringify(data));
  results.push({ persona, data, stats });
  console.log(
    `${persona.key.padEnd(12)} ${String(data.timeEntries.length).padStart(4)} mục giờ · ` +
      `${String(data.moments.length).padStart(3)} hạt · ${data.habitChecks.length} lần thói quen`,
  );
}

// ── bảng tổng hợp
const rows = results.map(({ persona, stats }) => ({
  name: persona.name,
  blurb: persona.blurb,
  work: stats.byBucket.work,
  family: stats.byBucket.family,
  personal: stats.byBucket.personal,
  waste: stats.byBucket.waste,
  logged: stats.logged,
  coverage: stats.coverage,
  golden: stats.goldenPerWeek,
  wastePerWeek: stats.wastePerWeek,
  goalNeed: stats.goalNeed,
  surplusAvg: stats.surplusAvg,
  surplusMin: stats.surplusMin,
  surplusMax: stats.surplusMax,
  freeFirst: stats.freeFirst,
  freeLast: stats.freeLast,
  monthsHeldByDebt: stats.monthsHeldByDebt,
  candy: stats.candy,
  salt: stats.salt,
  dueSalt: stats.dueSalt,
  answered: stats.answered,
  lighter: stats.lighter,
  habits: stats.habitStats,
}));

const share = (r, b) => pc(r[b] / r.logged);

let md = `# Bốn vai, sáu tháng — dữ liệu mẫu và kết quả

> Sinh bởi \`code/tools/personas.mjs\` (seed cố định, chạy lại ra đúng bộ này).
> Khoảng: **${FROM} → ${TO}** (${Math.round((daysBetween(FROM, TO) + 1) / 7)} tuần).
> Mỗi vai có một file JSON cùng thư mục, đúng định dạng kho localStorage của \`code/web\`.
>
> Đây là dữ liệu **bịa theo mô hình**, không phải người thật. Nó dùng để kiểm xem các con số
> Mira đưa ra có nói lên điều gì không — chứ không phải để kết luận về nghề nghiệp nào.

## Nạp vào app để xem

Mở https://mira.joybit.one, bật Console rồi dán:

\`\`\`js
localStorage.setItem('mira.v1', JSON.stringify(/* nội dung file <vai>.json */));
location.reload();
\`\`\`

## Giờ chia theo nhóm việc

| Vai | Công việc | Gia đình | Cá nhân | Lãng phí | Đã ghi / giờ tỉnh |
|---|---|---|---|---|---|
${rows
  .map(
    (r) =>
      `| **${r.name}** | ${h(r.work)} (${share(r, 'work')}) | ${h(r.family)} (${share(r, 'family')}) | ` +
      `${h(r.personal)} (${share(r, 'personal')}) | ${h(r.waste)} (${share(r, 'waste')}) | ${pc(r.coverage)} |`,
  )
  .join('\n')}

## Giờ vàng và luật khai nguồn

| Vai | Giờ vàng/tuần | Lãng phí/tuần | Mục tiêu cần/tuần | Đủ nguyên liệu? |
|---|---|---|---|---|
${rows
  .map(
    (r) =>
      `| **${r.name}** | ${h1(r.golden)} | ${h1(r.wastePerWeek)} | ${h1(r.goalNeed)} | ` +
      `${r.wastePerWeek >= r.goalNeed ? `còn dư ${h1(r.wastePerWeek - r.goalNeed)}` : `**thiếu ${h1(r.goalNeed - r.wastePerWeek)}**`} |`,
  )
  .join('\n')}

## Tài chính

| Vai | Mức dư TB | Thấp nhất | Cao nhất | Vốn tự do đầu → cuối | Nợ giữ lại |
|---|---|---|---|---|---|
${rows
  .map(
    (r) =>
      `| **${r.name}** | ${pc(r.surplusAvg)} | ${pc(r.surplusMin)} | ${pc(r.surplusMax)} | ` +
      `${r.freeFirst.toFixed(1).replace('.', ',')} → **${r.freeLast.toFixed(1).replace('.', ',')}** tháng | ` +
      `${r.monthsHeldByDebt === null ? '—' : `${r.monthsHeldByDebt.toFixed(1).replace('.', ',')} tháng`} |`,
  )
  .join('\n')}

## Hũ và thói quen

| Vai | Kẹo | Muối | Muối tới hạn | Đã trả lời | Nhẹ đi |
|---|---|---|---|---|---|
${rows
  .map(
    (r) =>
      `| **${r.name}** | ${r.candy} | ${r.salt} | ${r.dueSalt} | ${r.answered} | ` +
      `${r.answered === 0 ? '—' : `${r.lighter}/${r.answered}`} |`,
  )
  .join('\n')}

| Vai | Thói quen | Mục tiêu | Thực tế |
|---|---|---|---|
${rows
  .flatMap((r) =>
    r.habits.map(
      (hb) =>
        `| ${r.name} | ${hb.title} | ${hb.target} lần/tuần | **${hb.perWeek.toFixed(1).replace('.', ',')}** lần/tuần |`,
    ),
  )
  .join('\n')}
`;

writeFileSync(resolve(OUT, 'phan-tich.md'), md);
console.log(`\nĐã ghi ${OUT}`);
console.log('  phan-tich.md + 4 file JSON');
