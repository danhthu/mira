import { WEALTH_TIER_FREE_MONTHS } from '../../src/Core/constants';
import {
  MonthlyMoneyInput,
  amountToFreedomDays,
  amountToLifeHours,
  averageNetIncome,
  evaporation,
  expenseAmount,
  freedomDaysGained,
  freedomMonths,
  lifeRatePerHour,
  savingsRate,
  trueLivingCost,
  wealthStanding,
  wealthTierOf,
  workLoadAmount,
} from '../../src/Core/money';

/** Ví dụ chuẩn của `08-three-pillars.md` §"Chỉ 5 ô nhập". */
const EXAMPLE: MonthlyMoneyInput = {
  netIncome: 30_000_000,
  monthlyExpense: 14_000_000,
  debt: 5_000_000,
  savings: 6_000_000,
  netWorth: 180_000_000,
};

describe('ví dụ chuẩn trong 08-three-pillars', () => {
  it('chi phí sống thật = chi cố định + trả nợ', () => {
    expect(trueLivingCost(EXAMPLE)).toEqual({ status: 'ready', value: 19_000_000 });
  });

  it('tỷ lệ tiết kiệm 20%', () => {
    expect(savingsRate(EXAMPLE)).toEqual({ status: 'ready', value: 0.2 });
  });

  it('vốn tự do 9,5 tháng', () => {
    const result = freedomMonths(EXAMPLE);
    expect(result.status === 'ready' && Math.round(result.value * 10) / 10).toBe(9.5);
  });

  it('bốc hơi 5 triệu', () => {
    expect(evaporation(EXAMPLE)).toEqual({ status: 'ready', value: 5_000_000 });
  });

  it('mua thêm 9,5 ngày tự do', () => {
    const result = freedomDaysGained(EXAMPLE);
    expect(result.status === 'ready' && Math.round(result.value * 10) / 10).toBe(9.5);
  });
});

describe('bốc hơi', () => {
  it('âm khi tiêu lẹm vào tài sản — vẫn trả về vì đó là sự thật cần biết', () => {
    const result = evaporation({ ...EXAMPLE, savings: 15_000_000 });
    expect(result).toEqual({ status: 'ready', value: -4_000_000 });
  });

  it('chưa nhập thu nhập thì rỗng', () => {
    expect(evaporation({ ...EXAMPLE, netIncome: 0 })).toEqual({
      status: 'empty',
      reason: 'no_data',
    });
  });
});

describe('chia cho 0', () => {
  const zeroCost: MonthlyMoneyInput = {
    ...EXAMPLE,
    monthlyExpense: 0,
    debt: 0,
  };

  it('chi phí sống thật = 0 thì không tính vốn tự do', () => {
    expect(freedomMonths(zeroCost)).toEqual({
      status: 'empty',
      reason: 'divide_by_zero',
    });
  });

  it('chi phí sống thật = 0 thì không tính ngày tự do', () => {
    expect(freedomDaysGained(zeroCost)).toEqual({
      status: 'empty',
      reason: 'divide_by_zero',
    });
  });

  it('chi phí sống thật = 0 thì không xếp nấc giàu', () => {
    expect(wealthStanding(zeroCost)).toEqual({
      status: 'empty',
      reason: 'divide_by_zero',
    });
  });

  it('thu nhập = 0 thì không tính tỷ lệ tiết kiệm', () => {
    expect(savingsRate({ ...EXAMPLE, netIncome: 0 })).toEqual({
      status: 'empty',
      reason: 'divide_by_zero',
    });
  });
});

describe('tài sản ròng âm', () => {
  const inDebt: MonthlyMoneyInput = { ...EXAMPLE, netWorth: -60_000_000 };

  it('vốn tự do không bao giờ ra số âm', () => {
    expect(freedomMonths(inDebt)).toEqual({ status: 'ready', value: 0 });
  });

  it('trả về quãng đường về vạch 0, không phải con số âm', () => {
    const result = wealthStanding(inDebt);
    expect(result.status).toBe('ready');
    if (result.status !== 'ready' || result.value.kind !== 'in_debt') {
      throw new Error('expected in_debt standing');
    }
    expect(result.value.shortfall).toBe(60_000_000);
    expect(result.value.monthsOfSavingToBreakEven).toBe(10);
  });

  it('không tiết kiệm được thì không hứa quãng đường', () => {
    const result = wealthStanding({ ...inDebt, savings: 0 });
    if (result.status !== 'ready' || result.value.kind !== 'in_debt') {
      throw new Error('expected in_debt standing');
    }
    expect(result.value.monthsOfSavingToBreakEven).toBeNull();
  });
});

describe('bốn nấc giàu', () => {
  it('ranh giới bốn nấc', () => {
    expect(wealthTierOf(2.9)).toBe('survival');
    expect(wealthTierOf(3)).toBe('safe');
    expect(wealthTierOf(11.9)).toBe('safe');
    expect(wealthTierOf(12)).toBe('flexible');
    expect(wealthTierOf(WEALTH_TIER_FREE_MONTHS - 1)).toBe('flexible');
    expect(wealthTierOf(WEALTH_TIER_FREE_MONTHS)).toBe('free');
  });

  it('luôn kèm khoảng cách tới nấc kế tiếp — không bao giờ trả số trần', () => {
    const result = wealthStanding(EXAMPLE);
    if (result.status !== 'ready' || result.value.kind !== 'on_ladder') {
      throw new Error('expected on_ladder standing');
    }
    expect(result.value.tier).toBe('safe');
    expect(result.value.nextTier).toBe('flexible');
    // 12 tháng − 9,47 tháng = 2,53 tháng × 19tr = 48tr, chia tiết kiệm 6tr = 8 tháng.
    expect(Math.round(result.value.monthsOfSavingToNextTier as number)).toBe(8);
  });

  it('đã ở nấc Tự do thì không còn nấc kế tiếp', () => {
    const result = wealthStanding({ ...EXAMPLE, netWorth: 19_000_000 * 400 });
    if (result.status !== 'ready' || result.value.kind !== 'on_ladder') {
      throw new Error('expected on_ladder standing');
    }
    expect(result.value.tier).toBe('free');
    expect(result.value.nextTier).toBeNull();
    expect(result.value.monthsGapToNextTier).toBe(0);
    expect(result.value.monthsOfSavingToNextTier).toBeNull();
  });

  it('tiết kiệm ≤ 0 thì chỉ hiện trạng thái hiện tại, không tính quãng đường', () => {
    const result = wealthStanding({ ...EXAMPLE, savings: 0 });
    if (result.status !== 'ready' || result.value.kind !== 'on_ladder') {
      throw new Error('expected on_ladder standing');
    }
    expect(result.value.tier).toBe('safe');
    expect(result.value.monthsOfSavingToNextTier).toBeNull();
  });

  it('tiết kiệm ≤ 0 thì không hứa mua thêm ngày tự do', () => {
    expect(freedomDaysGained({ ...EXAMPLE, savings: 0 })).toEqual({
      status: 'empty',
      reason: 'not_applicable',
    });
  });
});

describe('thu nhập không đều', () => {
  it('lấy trung bình 3 tháng gần nhất, bỏ tháng cũ hơn', () => {
    expect(averageNetIncome([1_000_000, 30_000_000, 20_000_000, 10_000_000])).toEqual({
      status: 'ready',
      value: 20_000_000,
    });
  });

  it('chưa đủ 3 tháng thì learning, vẫn tính trên số tháng đang có', () => {
    const result = averageNetIncome([30_000_000, 20_000_000]);
    expect(result).toEqual({
      status: 'learning',
      value: 25_000_000,
      samplesHave: 2,
      samplesNeed: 3,
    });
  });

  it('chưa có tháng nào thì rỗng', () => {
    expect(averageNetIncome([])).toEqual({ status: 'empty', reason: 'no_data' });
  });

  it('trung bình vẫn là VND nguyên', () => {
    const result = averageNetIncome([10_000_000, 10_000_000, 10_000_001]);
    expect(result.status === 'ready' && Number.isInteger(result.value)).toBe(true);
  });
});

describe('tỷ giá đời', () => {
  it('tính trên giờ THẬT, không phải giờ hợp đồng', () => {
    const contractHours = lifeRatePerHour(30_000_000, 40 * 60);
    const realHours = lifeRatePerHour(30_000_000, 60 * 60);
    if (contractHours.status !== 'ready' || realHours.status !== 'ready') {
      throw new Error('expected ready life rate');
    }
    expect(realHours.value).toBeLessThan(contractHours.value);
    expect(Number.isInteger(realHours.value)).toBe(true);
  });

  it('người không đi làm: ẩn hẳn, không hiện 0đ/giờ', () => {
    expect(lifeRatePerHour(0, 0)).toEqual({ status: 'empty', reason: 'not_applicable' });
  });

  it('có giờ làm nhưng chưa nhập thu nhập thì rỗng', () => {
    expect(lifeRatePerHour(0, 40 * 60)).toEqual({ status: 'empty', reason: 'no_data' });
  });
});

describe('quy đổi tiền sang giờ đời', () => {
  const rate = lifeRatePerHour(30_000_000, 60 * 60);

  it('5 triệu bốc hơi = 43 giờ đời, đúng ví dụ trong 08-three-pillars', () => {
    const result = amountToLifeHours(expenseAmount(5_000_000), rate);
    expect(result.status).toBe('ready');
    expect(result.status === 'ready' && Math.round(result.value)).toBe(43);
  });

  it('tải công việc cũng quy đổi được', () => {
    expect(amountToLifeHours(workLoadAmount(1_000_000), rate).status).toBe('ready');
  });

  it('không có tỷ giá thì không quy đổi, lý do được giữ nguyên', () => {
    expect(amountToLifeHours(expenseAmount(5_000_000), lifeRatePerHour(0, 0))).toEqual({
      status: 'empty',
      reason: 'not_applicable',
    });
  });

  it('điện thoại 25 triệu đẩy lùi bao nhiêu ngày tự do', () => {
    const result = amountToFreedomDays(expenseAmount(25_000_000), EXAMPLE);
    expect(result.status === 'ready' && Math.round(result.value)).toBe(39);
  });

  it('chi phí sống thật = 0 thì không quy ra ngày tự do', () => {
    expect(
      amountToFreedomDays(expenseAmount(25_000_000), {
        ...EXAMPLE,
        monthlyExpense: 0,
        debt: 0,
      }),
    ).toEqual({ status: 'empty', reason: 'divide_by_zero' });
  });
});
