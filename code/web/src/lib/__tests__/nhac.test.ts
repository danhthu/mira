/**
 * Kiểm phần quyết định lời nhắc nào tới hạn.
 *
 * Nhắc sai giờ còn tệ hơn không nhắc: nó dạy người dùng rằng app này không đáng tin, và
 * việc họ làm sau đó là tắt hẳn — mất luôn cả những lời nhắc đáng giá.
 */
import { describe, it, expect } from 'vitest';
import { nhacToiHan, phutCuaGio, thuIso, doiThu, daGhiTay, type Nhac } from '../nhac';
import type { TimeEntry } from '@mira/contract';

/** 25/11/2026 là thứ 4. 27/11 là thứ 6, 28/11 là thứ 7, 29/11 là chủ nhật. */
const THU_TU = '2026-11-25';

const n = (p: Partial<Nhac> & { id: string }): Nhac => ({
  gio: '21:00',
  days: '1234567',
  loi: null,
  bat: true,
  ...p,
});

const bc = (phut: number, daGhi = false, ngay = THU_TU) => ({
  ngay,
  phutHienTai: phut,
  daGhi,
});

const GIO = (h: number, m = 0) => h * 60 + m;

describe('phutCuaGio', () => {
  it('đọc đúng giờ hợp lệ', () => {
    expect(phutCuaGio('21:05')).toBe(21 * 60 + 5);
    expect(phutCuaGio('00:00')).toBe(0);
    expect(phutCuaGio('23:59')).toBe(23 * 60 + 59);
  });

  it('⚑ chuỗi sai dạng trả null, KHÔNG trả NaN', () => {
    // NaN đi tiếp vào phép so sánh thì mọi so sánh đều false, và lời nhắc lặng lẽ không
    // bao giờ hiện — hỏng mà không có dấu hiệu nào.
    for (const x of ['24:00', '9:00', '21:60', 'abc', '']) expect(phutCuaGio(x)).toBeNull();
  });
});

describe('thuIso', () => {
  it('thứ hai là 1, chủ nhật là 7', () => {
    expect(thuIso('2026-11-23')).toBe(1);
    expect(thuIso(THU_TU)).toBe(3);
    expect(thuIso('2026-11-29')).toBe(7);
  });
});

describe('nhacToiHan', () => {
  it('chưa tới giờ thì chưa nhắc', () => {
    expect(nhacToiHan([n({ id: 'a', gio: '21:00' })], [], bc(GIO(20, 59)))).toHaveLength(0);
  });

  it('đúng giờ thì nhắc', () => {
    expect(nhacToiHan([n({ id: 'a', gio: '21:00' })], [], bc(GIO(21)))).toHaveLength(1);
  });

  it('quá giờ rồi vẫn nhắc, vì mở app lúc nào thấy lúc đó', () => {
    expect(nhacToiHan([n({ id: 'a', gio: '21:00' })], [], bc(GIO(23, 30)))).toHaveLength(1);
  });

  it('⚑ ĐÃ GHI TAY hôm nay thì không nhắc nữa', () => {
    // Ghi xong mà vẫn nhắc thì lời nhắc thành lời trách.
    expect(nhacToiHan([n({ id: 'a' })], [], bc(GIO(22), true))).toHaveLength(0);
  });

  it('tắt thì không nhắc', () => {
    expect(nhacToiHan([n({ id: 'a', bat: false })], [], bc(GIO(22)))).toHaveLength(0);
  });

  it('⚑ bỏ qua chỉ có tác dụng ĐÚNG NGÀY ĐÓ', () => {
    // Hôm nay bận không phải lý do để bỏ một thói quen đang xây.
    const ds = [n({ id: 'a' })];
    const bo = [{ nhacId: 'a', date: THU_TU }];
    expect(nhacToiHan(ds, bo, bc(GIO(22)))).toHaveLength(0);
    expect(nhacToiHan(ds, bo, bc(GIO(22), false, '2026-11-26'))).toHaveLength(1);
  });

  it('bỏ qua lời nhắc này không ảnh hưởng lời nhắc khác', () => {
    const ds = [n({ id: 'a', gio: '12:00' }), n({ id: 'b', gio: '21:00' })];
    const ra = nhacToiHan(ds, [{ nhacId: 'a', date: THU_TU }], bc(GIO(22)));
    expect(ra.map((x) => x.id)).toEqual(['b']);
  });

  it('⚑ không nhắc vào thứ không được chọn', () => {
    // 25/11 là thứ 4. Lời nhắc chỉ đặt thứ 2 và thứ 6 thì hôm nay phải im.
    expect(nhacToiHan([n({ id: 'a', days: '15' })], [], bc(GIO(22)))).toHaveLength(0);
    expect(nhacToiHan([n({ id: 'a', days: '3' })], [], bc(GIO(22)))).toHaveLength(1);
  });

  it('nhiều lời nhắc quá hạn thì xếp theo giờ tăng dần', () => {
    const ds = [n({ id: 'toi', gio: '21:00' }), n({ id: 'trua', gio: '12:30' })];
    expect(nhacToiHan(ds, [], bc(GIO(22))).map((x) => x.id)).toEqual(['trua', 'toi']);
  });

  it('giờ sai dạng thì bỏ qua lời nhắc đó, không làm hỏng cả danh sách', () => {
    const ds = [n({ id: 'hong', gio: '9:00' }), n({ id: 'tot', gio: '08:00' })];
    expect(nhacToiHan(ds, [], bc(GIO(22))).map((x) => x.id)).toEqual(['tot']);
  });
});

describe('daGhiTay', () => {
  const e = (p: Partial<TimeEntry> & { date: string }): TimeEntry => ({
    id: 'x',
    minutes: 30,
    bucket: 'work',
    golden: false,
    note: null,
    danhMucId: null,
    nepId: null,
    source: 'manual',
    ...p,
  });

  it('⚑ mục do NẾP sinh ra KHÔNG tính là đã ghi', () => {
    // Nếp là máy tự điền. Đếm nó thành "người dùng đã ghi" thì lời nhắc tắt vĩnh viễn
    // với bất kỳ ai có một nếp chạy mỗi ngày — tức là gần như mọi người dùng.
    expect(daGhiTay([e({ date: THU_TU, source: 'nep' })], THU_TU)).toBe(false);
    expect(daGhiTay([e({ date: THU_TU, source: 'manual' })], THU_TU)).toBe(true);
  });

  it('ghi hôm qua không tính cho hôm nay', () => {
    expect(daGhiTay([e({ date: '2026-11-24' })], THU_TU)).toBe(false);
  });
});

describe('doiThu', () => {
  it('gộp các trường hợp hay gặp thành tên gọi', () => {
    expect(doiThu('1234567')).toBe('Mỗi ngày');
    expect(doiThu('12345')).toBe('Thứ 2 → Thứ 6');
    expect(doiThu('67')).toBe('Cuối tuần');
  });

  it('còn lại thì liệt kê', () => {
    expect(doiThu('24')).toBe('Thứ 3, Thứ 5');
  });

  it('thứ tự gõ vào không đổi kết quả', () => {
    expect(doiThu('42')).toBe(doiThu('24'));
  });
});
