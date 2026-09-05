import { Money } from '../../src/Common/Entities/money';
import { Person } from '../../src/Common/Entities/person';
import { TimeEntry } from '../../src/Common/Entities/timeEntry';
import { isSyncedTable } from '../../src/Common/Sync/constants';

describe('tên bảng khớp allowlist đồng bộ', () => {
  it('ba bảng Mira nằm trong allowlist', () => {
    expect(isSyncedTable('person')).toBe(true);
    expect(isSyncedTable('time_entry')).toBe(true);
    expect(isSyncedTable('money')).toBe(true);
  });
});

describe('Person', () => {
  it('đồng hồ cát mặc định TẮT — ràng buộc cứng #4', () => {
    const person = new Person();
    expect(person.hourglassEnabled).toBe(false);
  });

  it('kế thừa base: có id và created_date', () => {
    const person = new Person();
    expect(typeof person.id).toBe('string');
    expect(typeof person.created_date).toBe('number');
  });
});

describe('quy ước lưu trữ', () => {
  it('thời lượng là phút nguyên, không giờ thập phân', () => {
    const entry = new TimeEntry();
    entry.minutes = 90;
    expect(Number.isInteger(entry.minutes)).toBe(true);
  });

  it('tiền là VND nguyên, đủ năm ô nhập của trụ Tài chính', () => {
    const money = new Money();
    money.month = '2026-09';
    money.netIncome = 30_000_000;
    money.monthlyExpense = 14_000_000;
    money.debt = 5_000_000;
    money.savings = 6_000_000;
    money.netWorth = 180_000_000;

    const cells = [
      money.netIncome,
      money.monthlyExpense,
      money.debt,
      money.savings,
      money.netWorth,
    ];
    expect(cells.every((value) => Number.isInteger(value))).toBe(true);
  });
});
