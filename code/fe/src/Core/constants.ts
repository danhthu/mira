/** Hằng số của tầng Core. Không số ma thuật rải trong công thức (code/CLAUDE.md "Quy ước code"). */

export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_WEEK = 168;
export const MINUTES_PER_WEEK = HOURS_PER_WEEK * MINUTES_PER_HOUR;
export const DAYS_PER_WEEK = 7;
export const WEEKS_PER_YEAR = 52;
export const MONTHS_PER_YEAR = 12;

/** `03-formulas.md` §3: quy đổi tiết kiệm/chi tiêu ra "ngày tự do" dùng tháng 30 ngày. */
export const DAYS_PER_MONTH = 30;

/** `03-formulas.md` §1 biên: tuần chưa đủ 7 ngày dữ liệu thì không ngoại suy. */
export const MIN_DAYS_FOR_WEEKLY_METRIC = DAYS_PER_WEEK;

/** `03-formulas.md` §2 biên: thu nhập không đều dùng trung bình trượt 3 tháng. */
export const INCOME_AVERAGE_MONTHS = 3;

/**
 * Ranh giới bốn nấc giàu theo `08-three-pillars.md` §"Bốn nấc giàu", quy về tháng.
 * Sống sót < 3 · An toàn 3–12 · Linh hoạt 12–300 · Tự do ≥ 300 (25 năm).
 */
export const WEALTH_TIER_SAFE_MONTHS = 3;
export const WEALTH_TIER_FLEXIBLE_MONTHS = 12;
export const WEALTH_TIER_FREE_MONTHS = 25 * MONTHS_PER_YEAR;
