/**
 * Mô hình dân số dùng chung cho `population.mjs` (báo cáo phân khúc) và
 * `tin-hieu.mjs` (phân tích tín hiệu). Một nguồn sự thật cho tham số, để hai báo cáo
 * không bao giờ nói về hai dân số khác nhau.
 *
 * GIỚI HẠN: tham số ở đây do người viết đặt, không phải đo từ người thật. Xem đầu
 * `docs/du-lieu-mau/thi-truong.md`.
 */
export const WAKING_PER_WEEK = 16 * 60 * 7;
export const WEEKS = 26;
export const DAYS = WEEKS * 7;

export function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const pick = (r, xs) => xs[Math.floor(r() * xs.length)];
const between = (r, lo, hi) => lo + r() * (hi - lo);
const near = (r, mid, spread) => Math.max(0, Math.round(mid + (r() * 2 - 1) * spread));

/**
 * Nghề. Giờ tính bằng phút mỗi ngày.
 *   work/waste/personal — [ngày thường, cuối tuần]
 *   peak                — số ngày cao điểm mỗi tháng và hệ số nhân giờ làm
 *   income              — thu nhập ròng tháng, triệu VND [thấp, cao]
 *   vary                — biên độ dao động thu nhập (0 = lương cứng, 0.6 = sống bằng hoa hồng)
 *   friction            — khó ghi chép mỗi ngày: 0 dễ (ngồi bàn), 1 rất khó (ca kíp, chạy ngoài đường)
 */
export const JOBS = [
  { key: 'it',        name: 'Lập trình / IT',        work: [560, 90],  waste: [150, 210], personal: [80, 150], peak: [4, 1.15], income: [25, 45], vary: 0.05, friction: 0.1 },
  { key: 'sales',     name: 'Kinh doanh',            work: [570, 120], waste: [95, 140],  personal: [35, 90],  peak: [6, 1.25], income: [12, 35], vary: 0.55, friction: 0.5 },
  { key: 'ketoan',    name: 'Kế toán / tài chính',   work: [500, 60],  waste: [70, 110],  personal: [30, 80],  peak: [7, 1.35], income: [13, 22], vary: 0.03, friction: 0.15 },
  { key: 'sinhvien',  name: 'Sinh viên',             work: [330, 90],  waste: [205, 290], personal: [165, 130], peak: [0, 1],   income: [2, 6],   vary: 0.35, friction: 0.25 },
  { key: 'giaovien',  name: 'Giáo viên',             work: [470, 110], waste: [90, 140],  personal: [55, 120], peak: [5, 1.2],  income: [9, 15],  vary: 0.12, friction: 0.3 },
  { key: 'congnhan',  name: 'Công nhân nhà máy',     work: [600, 240], waste: [110, 180], personal: [25, 70],  peak: [0, 1],    income: [7, 11],  vary: 0.18, friction: 0.8 },
  { key: 'yte',       name: 'Y tá / điều dưỡng',     work: [585, 300], waste: [75, 120],  personal: [30, 75],  peak: [0, 1],    income: [10, 16], vary: 0.1,  friction: 0.9 },
  { key: 'taixe',     name: 'Tài xế công nghệ',      work: [630, 450], waste: [90, 120],  personal: [25, 55],  peak: [0, 1],    income: [9, 15],  vary: 0.4,  friction: 0.95 },
  { key: 'online',    name: 'Bán hàng online',       work: [480, 300], waste: [130, 160], personal: [40, 80],  peak: [5, 1.3],  income: [8, 30],  vary: 0.6,  friction: 0.45 },
  { key: 'marketing', name: 'Marketing',             work: [540, 100], waste: [140, 195], personal: [55, 110], peak: [5, 1.2],  income: [14, 28], vary: 0.15, friction: 0.15 },
  { key: 'hanhchinh', name: 'Hành chính văn phòng',  work: [480, 40],  waste: [160, 220], personal: [45, 110], peak: [0, 1],    income: [10, 16], vary: 0.03, friction: 0.1 },
  { key: 'freelance', name: 'Freelancer sáng tạo',   work: [430, 260], waste: [175, 215], personal: [70, 130], peak: [6, 1.3],  income: [12, 30], vary: 0.5,  friction: 0.2 },
  { key: 'quanan',    name: 'Chủ quán ăn nhỏ',       work: [660, 540], waste: [70, 95],   personal: [20, 50],  peak: [0, 1],    income: [15, 40], vary: 0.45, friction: 0.85 },
  { key: 'congchuc',  name: 'Công chức',             work: [450, 40],  waste: [175, 230], personal: [50, 115], peak: [4, 1.1],  income: [8, 14],  vary: 0.04, friction: 0.12 },
  { key: 'noitro',    name: 'Nội trợ toàn thời gian', work: [330, 330], waste: [120, 150], personal: [45, 70], peak: [0, 1],    income: [8, 20],  vary: 0.1,  friction: 0.35, note: 'nhập số của cả hộ, không phải thu nhập riêng' },
];

/** Giai đoạn sống: quyết định giờ gia đình, tỷ lệ chi tiêu, khả năng có nợ. */
export const STAGES = [
  { key: 'doc-than-tre', name: 'Độc thân 22–27', family: [25, 110],  golden: 0.5,  expense: [0.42, 0.72], debt: 0.18, ageBand: '22–27' },
  { key: 'doc-than',     name: 'Độc thân 28–34', family: [35, 130],  golden: 0.52, expense: [0.38, 0.65], debt: 0.3,  ageBand: '28–34' },
  { key: 'vo-chong',     name: 'Vợ chồng chưa con', family: [95, 230], golden: 0.6, expense: [0.45, 0.72], debt: 0.52, ageBand: '26–34' },
  { key: 'con-nho',      name: 'Có con nhỏ',     family: [135, 330], golden: 0.72, expense: [0.55, 0.86], debt: 0.63, ageBand: '29–40' },
  { key: 'con-lon',      name: 'Có con đi học',  family: [95, 220],  golden: 0.6,  expense: [0.58, 0.88], debt: 0.5,  ageBand: '36–48' },
];

export const CITIES = [
  { key: 'hcm-hn', name: 'HCM / Hà Nội', incomeMul: 1.0, expenseMul: 1.0, share: 0.46 },
  { key: 'tp-tinh', name: 'Thành phố tỉnh', incomeMul: 0.74, expenseMul: 0.78, share: 0.33 },
  { key: 'nong-thon', name: 'Thị trấn / nông thôn', incomeMul: 0.55, expenseMul: 0.62, share: 0.21 },
];

// Nghề nào hay gặp ở giai đoạn sống nào — tránh sinh ra sinh viên 40 tuổi có hai con.
const STAGE_BY_JOB = {
  sinhvien: ['doc-than-tre'],
  it: ['doc-than-tre', 'doc-than', 'vo-chong', 'con-nho'],
  congnhan: ['doc-than-tre', 'vo-chong', 'con-nho', 'con-lon'],
  noitro: ['con-nho', 'con-lon'],
  quanan: ['vo-chong', 'con-nho', 'con-lon'],
  congchuc: ['doc-than', 'vo-chong', 'con-nho', 'con-lon'],
};
export const stagesFor = (job) =>
  (STAGE_BY_JOB[job.key] ?? STAGES.map((s) => s.key)).map((k) => STAGES.find((s) => s.key === k));

// ─────────────────────────────────────────────────────── sinh một người

export function simulate(seedBase, job, stage, city) {
  const r = rng(seedBase);
  const incomeBase =
    between(r, job.income[0], job.income[1]) * city.incomeMul * 1_000_000;
  const expenseRatio = between(r, stage.expense[0], stage.expense[1]);
  const hasDebt = r() < stage.debt && job.key !== 'sinhvien';

  const peakDays = job.peak[0];
  const peakMul = job.peak[1];

  // ── giờ
  const weekWaste = [], weekFamily = [], weekWork = [], weekGolden = [], weekLogged = [];
  let work = 0, family = 0, personal = 0, waste = 0, golden = 0, entries = 0;

  for (let d = 0; d < DAYS; d += 1) {
    const wd = d % 7;
    const cuoiTuan = wd >= 5;
    const dom = (d % 30) + 1;
    const peak = peakDays > 0 && (dom > 30 - peakDays || dom <= 2);
    const i = cuoiTuan ? 1 : 0;

    const w = Math.round(near(r, job.work[i], job.work[i] * 0.18) * (peak ? peakMul : 1));
    const wa = near(r, job.waste[i], job.waste[i] * 0.3);
    const p = near(r, job.personal[i], job.personal[i] * 0.35);
    // Cao điểm công việc thì giờ gia đình bị bóp lại — đây là thứ Mira bày ra được.
    const f = Math.round(near(r, stage.family[i], stage.family[i] * 0.35) * (peak ? 0.55 : 1));

    work += w; waste += wa; personal += p; family += f;
    entries += [w, wa, p, f].filter((x) => x > 0).length;

    const wk = Math.floor(d / 7);
    const g = Math.round(f * stage.golden * between(r, 0.8, 1.1));
    weekWaste[wk] = (weekWaste[wk] ?? 0) + wa;
    weekFamily[wk] = (weekFamily[wk] ?? 0) + f;
    weekWork[wk] = (weekWork[wk] ?? 0) + w;
    weekGolden[wk] = (weekGolden[wk] ?? 0) + g;
    golden += g;
    weekLogged[wk] = (weekLogged[wk] ?? 0) + w + wa + p + f;
  }

  // ── tiền
  const incomes = [];
  for (let m = 0; m < 6; m += 1) {
    incomes.push(Math.round(incomeBase * (1 + (r() * 2 - 1) * job.vary)));
  }
  const expense = Math.round(incomeBase * expenseRatio * city.expenseMul);
  const debtPayment = hasDebt ? Math.round(incomeBase * between(r, 0.14, 0.3)) : null;
  const debtBalance = hasDebt ? Math.round(debtPayment * between(r, 26, 150)) : null;
  // Thu nhập 0 thì mức dư không tính được — trả 0 chứ không trả NaN, và điểm tiền sẽ tự thấp.
  const surplus = incomes.map((inc) => (inc <= 0 ? 0 : (inc - expense - (debtPayment ?? 0)) / inc));
  // Tài sản ròng khởi điểm: tuổi nghề và mức dư quyết định, nội trợ gần như không có.
  // Phân bố tài sản lệch mạnh về phía thấp: phần lớn hộ Việt Nam có rất ít tháng dự phòng,
  // một thiểu số có nhiều. r^2.4 tạo đuôi dài đó; thu nhập cao thì nhân thêm, nhưng không
  // tuyến tính vì người thu nhập cao cũng tiêu nhiều hơn.
  const heSoThu = Math.max(0.3, Math.min(2.2, (incomeBase / 15_000_000) ** 0.7));
  const thangDuPhong =
    job.key === 'sinhvien' ? Math.pow(r(), 2.2) * 3
    : Math.pow(r(), 2.4) * 16 * heSoThu;
  const netWorthStart = expense * thangDuPhong;
  const monthlySave = incomes.reduce((a, b) => a + b, 0) / 6 - expense - (debtPayment ?? 0);
  const netWorthEnd = netWorthStart + monthlySave * 6;

  const avgSurplus = surplus.reduce((a, b) => a + b, 0) / 6;
  const spreadSurplus = Math.max(...surplus) - Math.min(...surplus);
  const freeStart = expense <= 0 ? 0 : netWorthStart / expense;
  const freeEnd = expense <= 0 ? 0 : netWorthEnd / expense;
  const monthsHeldByDebt = debtBalance === null || expense <= 0 ? 0 : debtBalance / expense;

  const logged = work + family + personal + waste;
  const wastePerWeek = waste / WEEKS;
  const goldenPerWeek = golden / WEEKS;
  const entriesPerDay = entries / DAYS;

  // Độ dao động của giờ lãng phí giữa các tuần: app có gì mới để nói hay lặp lại chính nó.
  const meanW = waste / WEEKS;
  const varW = weekWaste.reduce((a, x) => a + (x - meanW) ** 2, 0) / WEEKS;
  const cvWaste = meanW === 0 ? 0 : Math.sqrt(varW) / meanW;

  return {
    job, stage, city, hasDebt,
    income: Math.round(incomes.reduce((a, b) => a + b, 0) / 6),
    expense, debtPayment, debtBalance,
    work, family, personal, waste, golden, logged,
    wastePerWeek, goldenPerWeek, entriesPerDay,
    avgSurplus, spreadSurplus, freeStart, freeEnd, monthsHeldByDebt, cvWaste,
    surplus,
    weekly: { waste: weekWaste, family: weekFamily, work: weekWork, golden: weekGolden, logged: weekLogged },
  };
}

// ─────────────────────────────────────────────────────── chấm điểm phù hợp
/**
 * Bốn thành phần giá trị, mỗi cái 0–100, rồi trừ đi chi phí ghi chép.
 * Tất cả đều tính TỪ ĐẦU RA CỦA CHÍNH MIRA, không phải từ ý kiến người viết:
 * nếu một phép tính của app không ra con số đáng nhìn cho người này, điểm thấp.
 */
export function score(p) {
  const clamp = (x) => Math.max(0, Math.min(100, x));

  // 1. Rò rỉ: donut chỉ đáng mở nếu có một nhóm đủ lớn để giật mình. 1h/ngày = 7h/tuần là mốc.
  const roRi = clamp(((p.wastePerWeek / 60 - 2) / 12) * 100);

  // 2. Đòn bẩy tiền: vốn tự do chỉ có nghĩa khi có tài sản để chia. Dưới 1 tháng thì
  //    con số chỉ nói "bạn không có gì", điều người ta đã biết.
  const tienCoNghia = clamp(((p.freeEnd - 0.5) / 11) * 100);
  //    Nợ quy ra tháng tự do là con số không app nào khác đưa ra — cộng thêm khi có nợ.
  const tinHieuTien = clamp(tienCoNghia * 0.72 + Math.min(100, p.monthsHeldByDebt * 1.6) * 0.28);

  // 3. Quan hệ: giờ vàng chỉ nói được gì khi có người để ở cùng.
  const tinHieuQuanHe = clamp(((p.goldenPerWeek / 60) / 14) * 100);

  // 4. Có gì mới để nói: biến động giữa các tuần. Đời quá đều thì app lặp lại chính nó
  //    và người ta bỏ (N-208). Biến động quá lớn cũng khó đọc, nên có đỉnh ở giữa.
  const coTinMoi = clamp(100 - Math.abs(p.cvWaste - 0.3) * 240);
  //    Thu nhập dao động mạnh làm bảng tiền có chuyện để kể.
  const tinTien = clamp(p.spreadSurplus * 130);
  const moiMe = clamp(coTinMoi * 0.6 + tinTien * 0.4);

  const giaTri = roRi * 0.3 + tinHieuTien * 0.26 + tinHieuQuanHe * 0.24 + moiMe * 0.2;

  // Chi phí: nghề khó ghi + số mục phải ghi mỗi ngày. N-208 nói đây là lý do bỏ app số một.
  const chiPhi = clamp(p.job.friction * 62 + (p.entriesPerDay - 2) * 16);

  return {
    roRi, tinHieuTien, tinHieuQuanHe, moiMe,
    giaTri, chiPhi,
    diem: clamp(giaTri - chiPhi * 0.55),
  };
}

