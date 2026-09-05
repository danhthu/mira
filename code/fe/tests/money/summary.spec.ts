import { emptyMetric, readyMetric } from '../../src/Core/dataState';
import { moneyDashboard } from '../../src/Money/Models/dashboard';
import { realWorkMinutesPerWeek } from '../../src/Money/Models/lifeRate';
import { MoneyRecordLike, summarizeMoney } from '../../src/Money/Models/summary';

/** Ví dụ chuẩn của `08-three-pillars.md` §"Chỉ 5 ô nhập". */
const EXAMPLE: MoneyRecordLike = {
  month: '2026-09',
  netIncome: 30_000_000,
  monthlyExpense: 14_000_000,
  debt: 5_000_000,
  savings: 6_000_000,
  netWorth: 180_000_000,
};

const NO_LIFE_RATE = emptyMetric<number>('not_applicable');

describe('ví dụ chuẩn của 08', () => {
  const summary = summarizeMoney([EXAMPLE, EXAMPLE, EXAMPLE], NO_LIFE_RATE);

  it('đủ ba tháng thì chỉ số hết trạng thái đang tính', () => {
    expect(summary.status).toBe('ready');
  });

  it('nấc An toàn 9,5 tháng, kèm quãng đường tới Linh hoạt', () => {
    if (summary.status === 'empty') throw new Error('summary must have a value');
    const standing = summary.value.standing;
    if (standing.status === 'empty') throw new Error('standing must have a value');
    if (standing.value.kind !== 'on_ladder') throw new Error('standing must be on ladder');

    expect(standing.value.tier).toBe('safe');
    expect(Math.round(standing.value.freedomMonths * 10) / 10).toBe(9.5);
    expect(standing.value.nextTier).toBe('flexible');
    expect(Math.round(standing.value.monthsOfSavingToNextTier)).toBe(8);
  });

  it('bốc hơi 5 triệu, quy ra 7,9 ngày tự do', () => {
    if (summary.status === 'empty') throw new Error('summary must have a value');
    expect(summary.value.evaporation).toEqual({ status: 'ready', value: 5_000_000 });

    const days = summary.value.evaporationFreedomDays;
    if (days.status === 'empty') throw new Error('freedom days must have a value');
    expect(Math.round(days.value * 10) / 10).toBe(7.9);
  });

  it('không có giờ làm thật thì bỏ hẳn dòng giờ đời, không hiện 0 giờ', () => {
    if (summary.status === 'empty') throw new Error('summary must have a value');
    expect(summary.value.evaporationLifeHours.status).toBe('empty');
  });

  it('bốc hơi quy ra 43 giờ đời khi đã biết tỷ giá đời', () => {
    const withRate = summarizeMoney([EXAMPLE], readyMetric(116_279));
    if (withRate.status === 'empty') throw new Error('summary must have a value');
    const hours = withRate.value.evaporationLifeHours;
    if (hours.status === 'empty') throw new Error('life hours must have a value');
    expect(Math.round(hours.value)).toBe(43);
  });

  it('tỷ lệ tiết kiệm 20% và 9,5 ngày tự do mua thêm', () => {
    if (summary.status === 'empty') throw new Error('summary must have a value');
    expect(summary.value.savingsRate).toEqual({ status: 'ready', value: 0.2 });

    const gained = summary.value.freedomDaysGained;
    if (gained.status === 'empty') throw new Error('gained must have a value');
    expect(Math.round(gained.value * 10) / 10).toBe(9.5);
  });
});

describe('ràng buộc hiển thị', () => {
  it('chưa có tháng nào thì không có con số nào để hiện', () => {
    expect(summarizeMoney([], NO_LIFE_RATE)).toEqual({
      status: 'empty',
      reason: 'no_data',
    });
  });

  it('chưa đủ ba tháng thì cả cụm là đang tính, không phải 0 tháng', () => {
    const summary = summarizeMoney([EXAMPLE], NO_LIFE_RATE);
    expect(summary.status).toBe('learning');
    if (summary.status !== 'learning') throw new Error('summary must be learning');
    expect(summary.samplesHave).toBe(1);
    expect(summary.samplesNeed).toBe(3);
    expect(summary.value.standing.status).toBe('learning');
  });

  it('tài sản ròng âm ra quãng đường về vạch 0, không ra số âm', () => {
    const inDebt = summarizeMoney(
      [{ ...EXAMPLE, netWorth: -60_000_000 }],
      NO_LIFE_RATE,
    );
    if (inDebt.status === 'empty') throw new Error('summary must have a value');
    const standing = inDebt.value.standing;
    if (standing.status === 'empty') throw new Error('standing must have a value');
    if (standing.value.kind !== 'in_debt') throw new Error('standing must be in debt');

    expect(standing.value.shortfall).toBe(60_000_000);
    expect(standing.value.monthsOfSavingToBreakEven).toBe(10);
  });

  it('chi phí sống thật bằng 0 thì không có vốn tự do để hiện', () => {
    const noCost = summarizeMoney(
      [{ ...EXAMPLE, monthlyExpense: 0, debt: 0 }],
      NO_LIFE_RATE,
    );
    if (noCost.status === 'empty') throw new Error('summary must have a value');
    expect(noCost.value.standing).toEqual({
      status: 'empty',
      reason: 'divide_by_zero',
    });
    expect(noCost.value.freedomDaysGained.status).toBe('empty');
  });

  it('tháng chi vượt thu vẫn ra bốc hơi âm, nhưng không quy ra giờ đời', () => {
    const overspent = summarizeMoney(
      [{ ...EXAMPLE, savings: 12_000_000 }],
      readyMetric(116_279),
    );
    if (overspent.status === 'empty') throw new Error('summary must have a value');
    const evaporated = overspent.value.evaporation;
    if (evaporated.status === 'empty') throw new Error('evaporation must have a value');

    expect(evaporated.value).toBe(-1_000_000);
    expect(overspent.value.evaporationLifeHours.status).toBe('empty');
    expect(overspent.value.evaporationFreedomDays.status).toBe('empty');
  });

  it('không tiết kiệm thì không hứa quãng đường tới nấc kế tiếp', () => {
    const noSaving = summarizeMoney([{ ...EXAMPLE, savings: 0 }], NO_LIFE_RATE);
    if (noSaving.status === 'empty') throw new Error('summary must have a value');
    const standing = noSaving.value.standing;
    if (standing.status === 'empty') throw new Error('standing must have a value');
    if (standing.value.kind !== 'on_ladder') throw new Error('standing must be on ladder');
    expect(standing.value.monthsOfSavingToNextTier).toBeNull();
    expect(standing.value.monthsGapToNextTier).toBeGreaterThan(0);
  });
});

describe('giờ làm thật suy từ bản ghi thời gian', () => {
  const now = new Date('2026-09-30T12:00:00');

  it('bốn tuần bản ghi CẦN THIẾT ra số phút mỗi tuần', () => {
    const entries = [
      { date: '2026-09-28', minutes: 2_400, bucket: 'work' as const },
      { date: '2026-09-21', minutes: 2_400, bucket: 'work' as const },
      { date: '2026-09-14', minutes: 2_400, bucket: 'work' as const },
      { date: '2026-09-07', minutes: 2_400, bucket: 'work' as const },
    ];
    expect(realWorkMinutesPerWeek(entries, now)).toBe(2_400);
  });

  it('bản ghi ngoài cửa sổ bốn tuần không được tính', () => {
    const entries = [{ date: '2026-06-01', minutes: 2_400, bucket: 'work' as const }];
    expect(realWorkMinutesPerWeek(entries, now)).toBe(0);
  });

  it('không có bản ghi thời gian thì cụm chỉ số vẫn dựng được, chỉ thiếu dòng giờ đời', () => {
    const dashboard = moneyDashboard([EXAMPLE, EXAMPLE, EXAMPLE], [], now);
    if (dashboard.status === 'empty') throw new Error('dashboard must have a value');
    expect(dashboard.value.evaporationLifeHours.status).toBe('empty');
    expect(dashboard.value.standing.status).toBe('ready');
  });
});
