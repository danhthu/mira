/**
 * Kiểm phần quyết định lời nhắc nào tới hạn.
 *
 * Nhắc sai giờ còn tệ hơn không nhắc: nó dạy người dùng rằng app này không đáng tin, và
 * việc họ làm sau đó là tắt hẳn — mất luôn cả những lời nhắc đáng giá.
 */
import { describe, it, expect } from 'vitest';
import { remindersDue, minutesOfHour, isoWeekday, shiftWeekday, loggedManually, type Reminder } from '../reminder';
import type { TimeEntry } from '@mira/contract';

/** 25/11/2026 là thứ 4. 27/11 là thứ 6, 28/11 là thứ 7, 29/11 là chủ nhật. */
const ORDER = '2026-11-25';

const n = (p: Partial<Reminder> & { id: string }): Reminder => ({
  at: '21:00',
  days: '1234567',
  text: null,
  enabled: true,
  ...p,
});

const bc = (phut: number, saved = false, date = ORDER) => ({
  date,
  phutHienTai: phut,
  saved,
});

const GIO = (h: number, m = 0) => h * 60 + m;

describe('phutCuaGio', () => {
  it('đọc đúng giờ hợp lệ', () => {
    expect(minutesOfHour('21:05')).toBe(21 * 60 + 5);
    expect(minutesOfHour('00:00')).toBe(0);
    expect(minutesOfHour('23:59')).toBe(23 * 60 + 59);
  });

  it('⚑ chuỗi sai dạng trả null, KHÔNG trả NaN', () => {
    // NaN đi tiếp vào phép so sánh thì mọi so sánh đều false, và lời nhắc lặng lẽ không
    // bao giờ hiện — hỏng mà không có dấu hiệu nào.
    for (const x of ['24:00', '9:00', '21:60', 'abc', '']) expect(minutesOfHour(x)).toBeNull();
  });
});

describe('thuIso', () => {
  it('thứ hai là 1, chủ nhật là 7', () => {
    expect(isoWeekday('2026-11-23')).toBe(1);
    expect(isoWeekday(ORDER)).toBe(3);
    expect(isoWeekday('2026-11-29')).toBe(7);
  });
});

describe('nhacToiHan', () => {
  it('chưa tới giờ thì chưa nhắc', () => {
    expect(remindersDue([n({ id: 'a', at: '21:00' })], [], bc(GIO(20, 59)))).toHaveLength(0);
  });

  it('đúng giờ thì nhắc', () => {
    expect(remindersDue([n({ id: 'a', at: '21:00' })], [], bc(GIO(21)))).toHaveLength(1);
  });

  it('quá giờ rồi vẫn nhắc, vì mở app lúc nào thấy lúc đó', () => {
    expect(remindersDue([n({ id: 'a', at: '21:00' })], [], bc(GIO(23, 30)))).toHaveLength(1);
  });

  it('⚑ ĐÃ GHI TAY hôm nay thì không nhắc nữa', () => {
    // Ghi xong mà vẫn nhắc thì lời nhắc thành lời trách.
    expect(remindersDue([n({ id: 'a' })], [], bc(GIO(22), true))).toHaveLength(0);
  });

  it('tắt thì không nhắc', () => {
    expect(remindersDue([n({ id: 'a', enabled: false })], [], bc(GIO(22)))).toHaveLength(0);
  });

  it('⚑ bỏ qua chỉ có tác dụng ĐÚNG NGÀY ĐÓ', () => {
    // Hôm nay bận không phải lý do để bỏ một thói quen đang xây.
    const ds = [n({ id: 'a' })];
    const bo = [{ reminderId: 'a', date: ORDER }];
    expect(remindersDue(ds, bo, bc(GIO(22)))).toHaveLength(0);
    expect(remindersDue(ds, bo, bc(GIO(22), false, '2026-11-26'))).toHaveLength(1);
  });

  it('bỏ qua lời nhắc này không ảnh hưởng lời nhắc khác', () => {
    const ds = [n({ id: 'a', at: '12:00' }), n({ id: 'b', at: '21:00' })];
    const ra = remindersDue(ds, [{ reminderId: 'a', date: ORDER }], bc(GIO(22)));
    expect(ra.map((x) => x.id)).toEqual(['b']);
  });

  it('⚑ không nhắc vào thứ không được chọn', () => {
    // 25/11 là thứ 4. Lời nhắc chỉ đặt thứ 2 và thứ 6 thì hôm nay phải im.
    expect(remindersDue([n({ id: 'a', days: '15' })], [], bc(GIO(22)))).toHaveLength(0);
    expect(remindersDue([n({ id: 'a', days: '3' })], [], bc(GIO(22)))).toHaveLength(1);
  });

  it('nhiều lời nhắc quá hạn thì xếp theo giờ tăng dần', () => {
    const ds = [n({ id: 'toi', at: '21:00' }), n({ id: 'trua', at: '12:30' })];
    expect(remindersDue(ds, [], bc(GIO(22))).map((x) => x.id)).toEqual(['trua', 'toi']);
  });

  it('giờ sai dạng thì bỏ qua lời nhắc đó, không làm hỏng cả danh sách', () => {
    const ds = [n({ id: 'hong', at: '9:00' }), n({ id: 'tot', at: '08:00' })];
    expect(remindersDue(ds, [], bc(GIO(22))).map((x) => x.id)).toEqual(['tot']);
  });
});

describe('daGhiTay', () => {
  const e = (p: Partial<TimeEntry> & { date: string }): TimeEntry => ({
    id: 'x',
    minutes: 30,
    bucket: 'work',
    golden: false,
    note: null,
    categoryId: null,
    routineId: null,
    source: 'manual',
    ...p,
  });

  it('⚑ mục do NẾP sinh ra KHÔNG tính là đã ghi', () => {
    // Nếp là máy tự điền. Đếm nó thành "người dùng đã ghi" thì lời nhắc tắt vĩnh viễn
    // với bất kỳ ai có một nếp chạy mỗi ngày — tức là gần như mọi người dùng.
    expect(loggedManually([e({ date: ORDER, source: 'nep' })], ORDER)).toBe(false);
    expect(loggedManually([e({ date: ORDER, source: 'manual' })], ORDER)).toBe(true);
  });

  it('ghi hôm qua không tính cho hôm nay', () => {
    expect(loggedManually([e({ date: '2026-11-24' })], ORDER)).toBe(false);
  });
});

describe('doiThu', () => {
  it('gộp các trường hợp hay gặp thành tên gọi', () => {
    expect(shiftWeekday('1234567')).toBe('Mỗi ngày');
    expect(shiftWeekday('12345')).toBe('Thứ 2 → Thứ 6');
    expect(shiftWeekday('67')).toBe('Cuối tuần');
  });

  it('còn lại thì liệt kê', () => {
    expect(shiftWeekday('24')).toBe('Thứ 3, Thứ 5');
  });

  it('thứ tự gõ vào không đổi kết quả', () => {
    expect(shiftWeekday('42')).toBe(shiftWeekday('24'));
  });
});
