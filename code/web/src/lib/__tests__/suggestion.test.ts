/**
 * Kiểm hàng phím tắt ghi nhanh.
 *
 * Phím tắt ghi **thẳng** vào nhật ký khi chạm, nên nó phải đúng: sai số phút ở đây là
 * sai mỗi ngày, lặng lẽ, và người dùng chỉ phát hiện khi tổng tuần đã lệch.
 */
import { describe, it, expect } from 'vitest';
import { quickSuggestion, MAX_SUGGESTIONS } from '../suggestion';
import type { TimeEntry } from '@mira/contract';

let dem = 0;
const muc = (p: Partial<TimeEntry> & { minutes: number; date: string }): TimeEntry => ({
  id: `e${(dem += 1)}`,
  date: p.date,
  minutes: p.minutes,
  bucket: p.bucket ?? 'work',
  golden: p.golden ?? false,
  note: p.note ?? null,
  categoryId: p.categoryId ?? null,
  routineId: p.routineId ?? null,
  source: p.source ?? 'manual',
});

/** n mục giống nhau, mỗi mục một ngày lùi dần. */
const lap = (n: number, p: Partial<TimeEntry> & { minutes: number }, tuNgay = 25): TimeEntry[] =>
  Array.from({ length: n }, (_, i) => muc({ ...p, date: `2026-11-${String(tuNgay - i).padStart(2, '0')}` }));

describe('goiYNhanh', () => {
  it('rút việc hay ghi nhất lên trước', () => {
    const r = quickSuggestion([
      ...lap(5, { note: 'Giờ làm việc', minutes: 480 }),
      ...lap(2, { note: 'Ăn tối', minutes: 30, bucket: 'personal' }),
    ]);
    expect(r.map((g) => g.label)).toEqual(['Giờ làm việc', 'Ăn tối']);
  });

  it('⚑ số phút lấy MODE, không lấy trung bình', () => {
    // "Ăn tối" 30 phút suốt, một hôm 45. Trung bình ra 33 — một con số chưa từng xảy ra,
    // và chạm vào phím là ghi sai mỗi lần.
    const r = quickSuggestion([
      ...lap(4, { note: 'Ăn tối', minutes: 30 }),
      ...lap(1, { note: 'Ăn tối', minutes: 45 }, 20),
    ]);
    expect(r[0]?.minutes).toBe(30);
  });

  it('⚑ ghi một lần thì CHƯA thành phím tắt', () => {
    // Một lần ghi lẻ không phải thói quen. Đưa lên phím tắt là mời người ta ghi lại một
    // việc họ làm đúng một lần.
    expect(quickSuggestion(lap(1, { note: 'Đi khám răng', minutes: 60 }))).toHaveLength(0);
    expect(quickSuggestion(lap(2, { note: 'Đi khám răng', minutes: 60 }))).toHaveLength(1);
  });

  it('giữ nguyên ô và cờ giờ vàng của mục gốc', () => {
    const r = quickSuggestion(lap(3, { note: 'Chơi với con', minutes: 60, bucket: 'family', golden: true }));
    expect(r[0]).toMatchObject({ bucket: 'family', golden: true });
  });

  it('mục theo danh mục gom theo danh mục, không theo ghi chú', () => {
    const r = quickSuggestion([
      ...lap(2, { note: 'ghi chú lần một', minutes: 60, categoryId: 'dm-1' }),
      ...lap(2, { note: 'ghi chú khác hẳn', minutes: 60, categoryId: 'dm-1' }, 20),
    ]);
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ categoryId: 'dm-1', times: 4 });
  });

  it('bỏ qua mục không tên và không danh mục', () => {
    // Không có gì để in lên phím thì phím đó là một ô trống bấm được.
    expect(quickSuggestion(lap(5, { note: null, minutes: 60 }))).toHaveLength(0);
    expect(quickSuggestion(lap(5, { note: '   ', minutes: 60 }))).toHaveLength(0);
  });

  it('không vượt quá số phím tối đa', () => {
    const nhieu = Array.from({ length: 12 }, (_, i) => lap(3, { note: `Việc ${i}`, minutes: 60 })).flat();
    expect(quickSuggestion(nhieu).length).toBeLessThanOrEqual(MAX_SUGGESTIONS);
  });

  it('hoà số lần thì cái ghi gần đây hơn lên trước', () => {
    const r = quickSuggestion([
      ...lap(2, { note: 'Cũ', minutes: 60 }, 12),
      ...lap(2, { note: 'Mới', minutes: 60 }, 25),
    ]);
    expect(r[0]?.label).toBe('Mới');
  });

  it('nhật ký rỗng thì không có phím nào', () => {
    expect(quickSuggestion([])).toEqual([]);
  });
});

describe('nhãn phím khi mục không có ghi chú', () => {
  // Tài khoản thật 26/11/2026: mục ghi qua phím nhanh lưu categoryId, ghi chú trống, nên
  // phím chỉ còn "2h", "8h", "30m".
  it('lấy tên danh mục làm nhãn', () => {
    const r = quickSuggestion(
      lap(3, { categoryId: 'dm1', minutes: 480 }),
      undefined,
      new Map([['dm1', 'Làm việc']]),
    );
    expect(r.map((g) => g.label)).toEqual(['Làm việc']);
  });

  it('không biết tên danh mục thì bỏ phím, không in phím trống', () => {
    expect(quickSuggestion(lap(3, { categoryId: 'dm-la', minutes: 60 }))).toEqual([]);
  });
});
