/**
 * Kiểm phần nhận ra mục ghi trùng.
 *
 * Ghi trùng mà không báo thì sổ cộng sai, và cộng sai ở đây đi thẳng vào con số "giờ
 * vàng tuần" — thứ cả app xoay quanh.
 */
import { describe, it, expect } from 'vitest';
import { stripDiacritics, entrySignature } from '../duplicate';

const g = (p: Partial<Parameters<typeof entrySignature>[0]> = {}) =>
  entrySignature({ date: '2026-11-25', minutes: 20, bucket: 'personal', note: 'Thể dục', categoryId: null, ...p });

describe('boDau', () => {
  it('⚑ hạ chữ thường TRƯỚC khi bỏ dấu', () => {
    // "Đ" hoa là U+0110, không tách được bằng NFD. Bỏ dấu trước rồi mới hạ chữ thì "Đi
    // bộ" ra "Đi bo" — còn nguyên chữ hoa, và không khớp được với "đi bộ".
    expect(stripDiacritics('Đi bộ')).toBe('di bo');
    expect(stripDiacritics('đi bộ')).toBe('di bo');
  });

  it('gộp khoảng trắng thừa', () => {
    expect(stripDiacritics('  Thể   dục ')).toBe('the duc');
  });
});

describe('chuKyGio', () => {
  it('⚑ sai dấu vẫn ra cùng chữ ký: "Thể dục" ≡ "Thẻ dục"', () => {
    // Đây là câu chuyện thật: Founder gõ hai lần, lệch một dấu, và sổ ghi 40 phút tập
    // trong khi thật ra là 20.
    expect(g({ note: 'Thẻ dục' })).toBe(g({ note: 'Thể dục' }));
  });

  it('khác số phút thì khác mục', () => {
    expect(g({ minutes: 30 })).not.toBe(g());
  });

  it('khác ngày thì khác mục', () => {
    expect(g({ date: '2026-11-24' })).not.toBe(g());
  });

  it('khác ô thì khác mục', () => {
    expect(g({ bucket: 'family' })).not.toBe(g());
  });

  it('⚑ mục có danh mục ký bằng ID, không phải tên', () => {
    // Tên danh mục đổi được; id thì không. Ký bằng tên thì đổi tên một cái là mọi mục cũ
    // bỗng hết trùng nhau.
    expect(g({ note: null, categoryId: 'dm-1' })).toBe(g({ note: 'tên gì cũng được', categoryId: 'dm-1' }));
    expect(g({ note: null, categoryId: 'dm-1' })).not.toBe(g({ note: null, categoryId: 'dm-2' }));
  });

  it('mục tự gõ không bao giờ trùng chữ ký với mục có danh mục', () => {
    expect(g({ note: 'Gym', categoryId: null })).not.toBe(g({ note: null, categoryId: 'Gym' }));
  });
});
