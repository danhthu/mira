/**
 * Kiểm bộ dò sự kiện của màn "Sáu tháng của bạn".
 *
 * Trên 300 persona nó bắt 38% biến cố thật với độ chính xác 93%. Test ở đây không đo lại
 * hai con số đó — chúng là kết quả của mô phỏng, không phải của đơn vị mã. Test này canh
 * những luật mà nếu vỡ thì màn hình bắt đầu nói dối:
 *
 *   im lặng khi chưa đủ dữ liệu, không đoán;
 *   chỉ báo khi lệch đủ CẢ hai ngưỡng, tỉ lệ và số giờ;
 *   phân biệt tuần vui với tuần nặng;
 *   và lúc phải cắt thì giữ tuần vui lại.
 */
import { describe, it, expect } from 'vitest';
import type { Moment, TimeBucket, TimeEntry } from '@mira/contract';
import { doCauChuyen } from '../cauChuyen';

let dem = 0;
const muc = (
  date: string,
  minutes: number,
  bucket: TimeBucket,
  golden = false,
): TimeEntry => ({ id: `e${(dem += 1)}`, date, minutes, bucket, golden, note: null, source: 'manual', nepId: null, danhMucId: null });

const hat = (date: string, kind: Moment['kind']): Moment => ({
  id: `m${(dem += 1)}`,
  date,
  kind,
  text: null,
  revisitAt: null,
  revisitAnswer: null,
});

/** Thứ hai của tuần thứ `w`, đếm từ 2026-06-01 (một thứ hai). */
const thuHai = (w: number): string => {
  const d = new Date('2026-06-01T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + w * 7);
  return d.toISOString().slice(0, 10);
};
const ngay = (w: number, i: number): string => {
  const d = new Date(`${thuHai(w)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + i);
  return d.toISOString().slice(0, 10);
};

/** Một tuần đều đặn: năm ngày, mỗi ngày ngần ấy phút vào nhóm đó. */
function tuanDeu(w: number, phutMoiNgay: number, bucket: TimeBucket, golden = false): TimeEntry[] {
  return Array.from({ length: 5 }, (_, i) => muc(ngay(w, i), phutMoiNgay, bucket, golden));
}

describe('doCauChuyen', () => {
  it('dưới sáu tuần nhìn được thì im, không đoán', () => {
    const e = [0, 1, 2, 3, 4].flatMap((w) => tuanDeu(w, 120, 'waste'));
    const ra = doCauChuyen(e, []);
    expect(ra.mu).toBe(true);
    expect(ra.tuan).toHaveLength(0);
    expect(ra.tuanNhinThay).toBe(5);
  });

  it('tuần ghi dưới ba ngày không được tính vào số tuần nhìn được', () => {
    const e = [
      ...[0, 1, 2, 3, 4, 5].flatMap((w) => tuanDeu(w, 120, 'waste')),
      muc(ngay(6, 0), 120, 'waste'),
      muc(ngay(6, 1), 120, 'waste'),
    ];
    expect(doCauChuyen(e, []).tuanNhinThay).toBe(6);
  });

  it('mọi tuần quanh mức thường thì không có tuần nào đáng kể', () => {
    const e = Array.from({ length: 8 }, (_, w) => tuanDeu(w, 120, 'waste')).flat();
    const ra = doCauChuyen(e, []);
    expect(ra.mu).toBe(false);
    expect(ra.tuan).toHaveLength(0);
  });

  it('bắt tuần lãng phí vọt lên, và gọi đó là tuần nặng', () => {
    const e = [
      ...Array.from({ length: 7 }, (_, w) => tuanDeu(w, 120, 'waste')).flat(),
      ...tuanDeu(7, 300, 'waste'),
    ];
    const ra = doCauChuyen(e, []);
    expect(ra.tuan).toHaveLength(1);
    expect(ra.tuan[0]?.so).toBe(8);
    expect(ra.tuan[0]?.tone).toBe('nang');
    expect(ra.tuan[0]?.cau).toContain('vọt lên');
    expect(ra.tuan[0]?.cau).toContain('Giờ lãng phí');
  });

  it('bắt tuần giờ vàng vọt lên, và gọi đó là tuần vui', () => {
    const e = [
      ...Array.from({ length: 7 }, (_, w) => tuanDeu(w, 120, 'family', true)).flat(),
      ...tuanDeu(7, 300, 'family', true),
    ];
    const ra = doCauChuyen(e, []);
    expect(ra.tuan[0]?.tone).toBe('vui');
  });

  it('lệch đủ tỉ lệ nhưng chưa đủ hai giờ thì không báo', () => {
    // 20 phút lên 40 phút là lệch 100%, nhưng cách nhau 100 phút mỗi tuần: chưa đủ.
    const e = [
      ...Array.from({ length: 7 }, (_, w) => tuanDeu(w, 20, 'waste')).flat(),
      ...tuanDeu(7, 40, 'waste'),
    ];
    expect(doCauChuyen(e, []).tuan).toHaveLength(0);
  });

  it('lệch đủ số giờ nhưng chưa đủ tỉ lệ thì cũng không báo', () => {
    // 600 lên 660 phút mỗi ngày là cách nhau 300 phút/tuần nhưng chỉ lệch 10%.
    const e = [
      ...Array.from({ length: 7 }, (_, w) => tuanDeu(w, 600, 'work')).flat(),
      ...tuanDeu(7, 660, 'work'),
    ];
    expect(doCauChuyen(e, []).tuan).toHaveLength(0);
  });

  it('hai hạt muối làm tuần thành nặng dù số giờ là tin vui', () => {
    const e = [
      ...Array.from({ length: 7 }, (_, w) => tuanDeu(w, 120, 'family', true)).flat(),
      ...tuanDeu(7, 300, 'family', true),
    ];
    const m = [hat(ngay(7, 1), 'salt'), hat(ngay(7, 2), 'salt')];
    const ra = doCauChuyen(e, m);
    expect(ra.tuan[0]?.tone).toBe('nang');
    expect(ra.tuan[0]?.muoi).toBe(2);
  });

  it('nặng chỉ vì hạt thì câu phải NÓI RA, không để màu cãi nhau với chữ', () => {
    const e = [
      ...Array.from({ length: 7 }, (_, w) => tuanDeu(w, 120, 'family', true)).flat(),
      ...tuanDeu(7, 300, 'family', true),
    ];
    const ra = doCauChuyen(e, [hat(ngay(7, 1), 'salt'), hat(ngay(7, 2), 'salt')]);
    expect(ra.tuan[0]?.tone).toBe('nang');
    expect(ra.tuan[0]?.cau).toContain('Số giờ thì nhẹ');
  });

  it('nặng vì chính số giờ thì không thêm câu giải thích thừa', () => {
    const e = [
      ...Array.from({ length: 7 }, (_, w) => tuanDeu(w, 120, 'waste')).flat(),
      ...tuanDeu(7, 300, 'waste'),
    ];
    const ra = doCauChuyen(e, [hat(ngay(7, 1), 'salt'), hat(ngay(7, 2), 'salt')]);
    expect(ra.tuan[0]?.cau).not.toContain('Số giờ thì nhẹ');
  });

  it('một hạt muối thì chưa đủ để lật tuần vui thành tuần nặng', () => {
    const e = [
      ...Array.from({ length: 7 }, (_, w) => tuanDeu(w, 120, 'family', true)).flat(),
      ...tuanDeu(7, 300, 'family', true),
    ];
    const ra = doCauChuyen(e, [hat(ngay(7, 1), 'salt')]);
    expect(ra.tuan[0]?.tone).toBe('vui');
  });

  it('gắn hạt của đúng tuần đó vào câu', () => {
    const e = [
      ...Array.from({ length: 7 }, (_, w) => tuanDeu(w, 120, 'waste')).flat(),
      ...tuanDeu(7, 300, 'waste'),
    ];
    const m = [hat(ngay(7, 0), 'candy'), hat(ngay(3, 0), 'candy')];
    const ra = doCauChuyen(e, m);
    expect(ra.tuan[0]?.keo).toBe(1);
  });

  it('⚑ cắt bớt thì GIỮ TUẦN VUI, không để màn thành bản cáo trạng', () => {
    // Mười tuần đáng kể: ba vui, bảy nặng. Trần là sáu.
    // Cắt theo thứ tự thời gian sẽ ra gần như toàn tin xấu, và đó là sai lệch của bộ đo
    // chứ không phải của đời người dùng.
    const nen = Array.from({ length: 10 }, (_, w) => [
      ...tuanDeu(w, 120, 'waste'),
      ...tuanDeu(w, 120, 'family', true),
    ]).flat();
    const nang = [10, 11, 12, 13, 14, 15, 16].flatMap((w) => [
      ...tuanDeu(w, 400, 'waste'),
      ...tuanDeu(w, 120, 'family', true),
    ]);
    const vui = [17, 18, 19].flatMap((w) => [
      ...tuanDeu(w, 120, 'waste'),
      ...tuanDeu(w, 400, 'family', true),
    ]);

    const ra = doCauChuyen([...nen, ...nang, ...vui], []);
    expect(ra.tuan).toHaveLength(6);
    expect(ra.tuan.filter((t) => t.tone === 'vui').length).toBeGreaterThanOrEqual(3);
    // Vẫn xếp theo thứ tự thời gian sau khi cắt.
    expect([...ra.tuan].map((t) => t.so)).toEqual([...ra.tuan].map((t) => t.so).sort((a, b) => a - b));
  });

  it('không có gì để đọc thì im, không nổ', () => {
    const ra = doCauChuyen([], []);
    expect(ra.mu).toBe(true);
    expect(ra.tuan).toHaveLength(0);
  });
});
