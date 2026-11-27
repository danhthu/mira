// Tỷ giá đời — hàm thuần, theo docs/03-formulas.md §2.
// lifeRate = netIncome / (realWorkHours × 52 / 12)
// Đơn vị: netIncome = đồng/tháng; các giờ = giờ/tuần.

const WEEKS_PER_MONTH = 52 / 12;

function num(v) {
  const n = typeof v === 'string' ? Number(v.replace(/[.\s]/g, '').replace(',', '.')) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function lifeRate(input = {}) {
  const netIncome = num(input.netIncome);
  const work = Math.max(0, num(input.workHoursPerWeek));
  const commute = Math.max(0, num(input.commuteHoursPerWeek));
  const prep = Math.max(0, num(input.prepHoursPerWeek));
  const recovery = Math.max(0, num(input.recoveryHoursPerWeek));
  const realWorkHoursPerWeek = work + commute + prep + recovery;

  // Biên: thiếu giờ thì không hiện chỉ số (không trả 0).
  if (realWorkHoursPerWeek <= 0) {
    return { status: 'need-hours', message: 'Cần nhập giờ làm việc', realWorkHoursPerWeek: 0 };
  }
  // Biên: thu nhập <= 0 thì không hiện chỉ số.
  if (netIncome <= 0) {
    return { status: 'need-income', message: 'Cần nhập thu nhập ròng mỗi tháng', realWorkHoursPerWeek };
  }

  const realWorkHoursPerMonth = realWorkHoursPerWeek * WEEKS_PER_MONTH;
  const rate = netIncome / realWorkHoursPerMonth;

  // "Trên hợp đồng": chỉ tính khi có giờ hợp đồng (ô giờ làm việc).
  let contractRate = null;
  let gapPercent = null;
  if (work > 0) {
    contractRate = netIncome / (work * WEEKS_PER_MONTH);
    gapPercent = ((contractRate - rate) / contractRate) * 100;
  }

  return {
    status: 'ok',
    lifeRate: rate,
    contractRate,
    gapPercent,
    realWorkHoursPerWeek,
    realWorkHoursPerMonth,
  };
}

// Giá món đồ (đồng) ÷ tỷ giá = số giờ. Trả null nếu chưa đủ dữ kiện.
export function itemHours(price, rate) {
  const p = num(price);
  if (!(p > 0) || !(rate > 0)) return null;
  return p / rate;
}

// 115385 -> 115000 (làm tròn nghìn, để hiển thị)
export function roundThousand(n) {
  return Math.round(n / 1000) * 1000;
}

// 115000 -> "115.000đ"
export function formatVnd(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
}

export function formatHours(h) {
  return Math.round(h).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
