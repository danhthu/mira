import { TimeEntryLike } from '../../src/Core/time';
import {
  MoneySnapshot,
  latestMoneyUpTo,
  moneyDashboard,
  timeDashboard,
} from '../../src/Home/Models/dashboard';
import {
  evaporationMetricView,
  timeMetricView,
  wealthMetricView,
} from '../../src/Home/Models/presenter';
import { useText } from '../../src/Home/Text';

const text = useText();

const FULL_WEEK: readonly string[] = [
  '2026-08-31',
  '2026-09-01',
  '2026-09-02',
  '2026-09-03',
  '2026-09-04',
  '2026-09-05',
  '2026-09-06',
];

function spread(
  bucket: TimeEntryLike['bucket'],
  minutesPerDay: number,
): TimeEntryLike[] {
  return FULL_WEEK.map((date) => ({ date, minutes: minutesPerDay, bucket }));
}

/** Năm ô của `08-three-pillars.md` §Trụ 2, đúng ví dụ trong tài liệu. */
const SPEC_MONEY: MoneySnapshot = {
  month: '2026-09',
  netIncome: 30000000,
  monthlyExpense: 14000000,
  debt: 5000000,
  savings: 6000000,
  netWorth: 180000000,
};

describe('hai con số thời gian', () => {
  it('tuần đủ bảy ngày ra trạng thái ready và đúng số giờ', () => {
    const board = timeDashboard(spread('people', 60), []);
    expect(board.meaningful.minutes).toEqual({ status: 'ready', value: 420 });
  });

  it('nhóm chưa có bản ghi nào thì rỗng, không phải bằng 0', () => {
    const board = timeDashboard(spread('people', 60), []);
    expect(board.waste.minutes.status).toBe('empty');
  });

  it('tuần chưa đủ bảy ngày thì đang tính, không ngoại suy', () => {
    const board = timeDashboard(
      [{ date: '2026-09-01', minutes: 120, bucket: 'people' }],
      [],
    );
    expect(board.meaningful.minutes).toEqual({
      status: 'learning',
      value: 120,
      samplesHave: 1,
      samplesNeed: 7,
    });
  });

  it('delta chỉ có khi tuần trước cũng có bản ghi của nhóm đó', () => {
    const withPrevious = timeDashboard(spread('people', 60), spread('people', 30));
    expect(withPrevious.meaningful.deltaMinutes).toBe(210);
    expect(timeDashboard(spread('people', 60), []).meaningful.deltaMinutes).toBeNull();
  });
});

describe('tuần đầu — không ô nào hiện số 0 hay số âm', () => {
  it('chưa ghi gì thì cả hai dòng thời gian đều là dấu gạch', () => {
    const board = timeDashboard([], []);
    const meaningful = timeMetricView(
      text.meaningfulLabel,
      text.meaningfulEmpty,
      board.meaningful,
      text,
    );
    const waste = timeMetricView(text.wasteLabel, text.wasteEmpty, board.waste, text);

    expect(meaningful.value).toBeNull();
    expect(meaningful.delta).toBeNull();
    expect(waste.value).toBeNull();
  });

  it('mới ghi vài phút thì hiện phút, không hiện "0,0 h"', () => {
    const board = timeDashboard(
      [{ date: '2026-09-05', minutes: 15, bucket: 'people' }],
      [],
    );
    const view = timeMetricView(
      text.meaningfulLabel,
      text.meaningfulEmpty,
      board.meaningful,
      text,
    );

    expect(view.value).toBe('15');
    expect(view.unit).toBe(text.minuteUnit);
  });

  it('chưa có năm ô tài chính thì hai dòng tiền cũng rỗng, kèm lời mời nhập', () => {
    const money = moneyDashboard(null, '2026-09', 0);
    const wealth = wealthMetricView(money.standing, text);

    expect(wealth.value).toBeNull();
    expect(wealth.notes).toContain(text.wealthHint);
    expect(evaporationMetricView(money, text).value).toBeNull();
  });

  it('tài sản ròng âm không ra số âm, chỉ ra quãng đường về vạch 0', () => {
    const money = moneyDashboard({ ...SPEC_MONEY, netWorth: -12000000 }, '2026-09', 0);
    const wealth = wealthMetricView(money.standing, text);

    expect(wealth.value).toBe(text.wealthBelowZero);
    expect(wealth.notes[0]).toBe('còn 12,0 tr nữa về vạch 0');
    expect(wealth.notes[1]).toBe('khoảng 2,0 tháng tiết kiệm');
  });
});

describe('hai con số tài chính theo ví dụ của 08-three-pillars', () => {
  it('bạn giàu luôn kèm quãng đường tới nấc kế — không hiện số trần', () => {
    const money = moneyDashboard(SPEC_MONEY, '2026-09', 0);
    const wealth = wealthMetricView(money.standing, text);

    expect(wealth.value).toBe('9,5');
    expect(wealth.unit).toBe(text.monthUnit);
    expect(wealth.notes[0]).toBe('ở nấc an toàn · còn 2,5 tháng nữa tới linh hoạt');
  });

  it('bốc hơi ra 5,0 tr', () => {
    const view = evaporationMetricView(moneyDashboard(SPEC_MONEY, '2026-09', 0), text);
    expect(view.label).toBe(text.evaporationLabel);
    expect(view.value).toBe('5,0 tr');
  });

  it('chưa biết giờ làm thật thì không quy ra giờ đời, không hiện 0 giờ', () => {
    const view = evaporationMetricView(moneyDashboard(SPEC_MONEY, '2026-09', 0), text);
    expect(view.notes).toEqual([]);
  });

  it('có giờ làm thật thì hiện dòng giờ đời', () => {
    const view = evaporationMetricView(
      moneyDashboard(SPEC_MONEY, '2026-09', 45 * 60),
      text,
    );
    expect(view.notes[0]).toBe('= 33 giờ đời');
  });

  it('tiêu quá thu đổi nhãn thay vì hiện số âm', () => {
    const overspent: MoneySnapshot = { ...SPEC_MONEY, netIncome: 20000000 };
    const view = evaporationMetricView(moneyDashboard(overspent, '2026-09', 0), text);

    expect(view.label).toBe(text.overspendLabel);
    expect(view.value).toBe('5,0 tr');
  });

  it('dùng bản ghi mới nhất và nói rõ nó thuộc tháng nào', () => {
    const older: MoneySnapshot = { ...SPEC_MONEY, month: '2026-08' };
    const records = [older, { ...SPEC_MONEY, month: '2026-10' }];

    expect(latestMoneyUpTo(records, '2026-09')).toBe(older);
    const view = evaporationMetricView(
      moneyDashboard(latestMoneyUpTo(records, '2026-09'), '2026-09', 0),
      text,
    );
    expect(view.notes).toContain('số của tháng 8');
  });
});
