/**
 * Kiểm luật sinh hàng của nếp.
 *
 * Đây là chỗ duy nhất trong Mira **tự ghi hộ người dùng**, nên nó là chỗ duy nhất có thể
 * bịa ra đời người ta. Mấy test dưới canh đúng những luật giữ cho nó không bịa:
 *
 *   không sinh quá bảy ngày lùi, dù nếp đã khai từ lâu;
 *   không sinh trước ngày nếp bắt đầu;
 *   không sinh vào thứ không khai;
 *   không sinh lại ngày người dùng đã từ chối;
 *   chạy lại nhiều lần không sinh trùng.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { chayNep, taoNep, NEP_CAP } from '../nep';
import type { NepRec } from '../../database/repositories/NepRepository';
import type { TimeBucket } from '../../shared/types/enums';
import { DomainError } from '../../shared/errors';

interface HangGio {
  date: string;
  minutes: number;
  bucket: TimeBucket;
  golden: boolean;
  note: string | null;
  source?: string;
  nepId?: string | null;
}

/** Giả lập hai repository, đủ cho `chayNep` và `taoNep`. */
function dung(nep: NepRec[], boQua: string[] = []) {
  const daGhi: HangGio[] = [];
  const deps = {
    nep: {
      findActive: async () => nep,
      countActive: async () => nep.filter((n) => n.endedOn === null).length,
      boQuaTrongKhoang: async () => new Set(boQua),
      daSinhTrongKhoang: async () =>
        new Set(daGhi.map((e) => `${e.nepId ?? ''}|${e.date}`)),
      create: async (_u: string, d: Record<string, unknown>) => ({ ...d, id: 'moi', startedOn: '2026-11-25', endedOn: null }) as unknown as NepRec,
    },
    timeEntries: {
      create: async (_u: string, e: HangGio) => {
        daGhi.push(e);
        return e;
      },
    },
  } as never;
  return { deps, daGhi };
}

const mauNep = (over: Partial<NepRec> = {}): NepRec => ({
  id: 'n1',
  title: 'Ăn tối',
  bucket: 'personal',
  minutes: 30,
  golden: false,
  days: '1234567',
  startedOn: '2026-01-01',
  endedOn: null,
  danhMucId: null,
  ...over,
});

const HOM_NAY = '2026-11-25'; // thứ tư

describe('chayNep', () => {
  it('⚑ chỉ sinh bù tối đa bảy ngày, dù nếp đã khai từ đầu năm', async () => {
    // Người bỏ app ba tháng rồi quay lại không được nhận chín mươi ngày "đã ăn tối".
    // Quãng vắng để trống, vì để trống là thật còn điền bừa là nói dối.
    const { deps, daGhi } = dung([mauNep()]);
    await chayNep(deps, 'u1', HOM_NAY);
    expect(daGhi).toHaveLength(7);
    expect(daGhi.map((e) => e.date)).toEqual([
      '2026-11-19',
      '2026-11-20',
      '2026-11-21',
      '2026-11-22',
      '2026-11-23',
      '2026-11-24',
      '2026-11-25',
    ]);
  });

  it('không sinh trước ngày nếp bắt đầu', async () => {
    const { deps, daGhi } = dung([mauNep({ startedOn: '2026-11-23' })]);
    await chayNep(deps, 'u1', HOM_NAY);
    expect(daGhi.map((e) => e.date)).toEqual(['2026-11-23', '2026-11-24', '2026-11-25']);
  });

  it('nếp khai hôm nay không bịa ra quá khứ của chính nó', async () => {
    const { deps, daGhi } = dung([mauNep({ startedOn: HOM_NAY })]);
    await chayNep(deps, 'u1', HOM_NAY);
    expect(daGhi).toHaveLength(1);
  });

  it('chỉ sinh vào thứ đã khai', async () => {
    // "12345" là thứ hai tới thứ sáu. Trong bảy ngày 19–25 có T7 21/11 và CN 22/11.
    const { deps, daGhi } = dung([mauNep({ days: '12345' })]);
    await chayNep(deps, 'u1', HOM_NAY);
    expect(daGhi.map((e) => e.date)).toEqual([
      '2026-11-19',
      '2026-11-20',
      '2026-11-23',
      '2026-11-24',
      '2026-11-25',
    ]);
  });

  it('không sinh lại ngày người dùng đã từ chối', async () => {
    const { deps, daGhi } = dung([mauNep()], ['n1|2026-11-23']);
    const ra = await chayNep(deps, 'u1', HOM_NAY);
    expect(daGhi.map((e) => e.date)).not.toContain('2026-11-23');
    expect(ra.find((x) => x.date === '2026-11-23')?.trangThai).toBe('bo-qua');
  });

  it('ngày đã có hàng rồi thì không sinh thêm', async () => {
    const { deps, daGhi } = dung([mauNep()]);
    await chayNep(deps, 'u1', HOM_NAY);
    await chayNep(deps, 'u1', HOM_NAY);
    expect(daGhi).toHaveLength(7);
  });

  it('hàng sinh ra mang source "nep" và tên nếp làm ghi chú', async () => {
    const { deps, daGhi } = dung([mauNep({ title: 'Ngủ', minutes: 420 })]);
    await chayNep(deps, 'u1', HOM_NAY);
    expect(daGhi[0]?.source).toBe('nep');
    expect(daGhi[0]?.note).toBe('Ngủ');
    expect(daGhi[0]?.minutes).toBe(420);
    expect(daGhi[0]?.nepId).toBe('n1');
  });

  it('không có nếp nào thì không gọi xuống CSDL', async () => {
    const { deps, daGhi } = dung([]);
    expect(await chayNep(deps, 'u1', HOM_NAY)).toEqual([]);
    expect(daGhi).toHaveLength(0);
  });
});

describe('taoNep', () => {
  let deps: never;
  beforeEach(() => {
    deps = dung([]).deps;
  });

  const tao = (over: Record<string, unknown> = {}) =>
    taoNep(deps, 'u1', {
      title: 'Ăn tối',
      bucket: 'personal',
      minutes: 30,
      golden: false,
      days: '1234567',
      ...over,
    });

  it('tên rỗng thì từ chối', async () => {
    await expect(tao({ title: '  ' })).rejects.toBeInstanceOf(DomainError);
  });

  it('nhóm việc lạ thì từ chối', async () => {
    await expect(tao({ bucket: 'ngu-quen' })).rejects.toBeInstanceOf(DomainError);
  });

  it('số phút không nguyên dương thì từ chối', async () => {
    await expect(tao({ minutes: 0 })).rejects.toBeInstanceOf(DomainError);
    await expect(tao({ minutes: 30.5 })).rejects.toBeInstanceOf(DomainError);
  });

  it('một nếp không dài hơn một ngày', async () => {
    await expect(tao({ minutes: 1441 })).rejects.toBeInstanceOf(DomainError);
  });

  it('days sai hình dạng thì từ chối', async () => {
    await expect(tao({ days: '0' })).rejects.toBeInstanceOf(DomainError);
    await expect(tao({ days: '8' })).rejects.toBeInstanceOf(DomainError);
    await expect(tao({ days: '' })).rejects.toBeInstanceOf(DomainError);
  });

  it('days trùng thứ thì dọn, "1123" thành "123"', async () => {
    const ra = await tao({ days: '1123' });
    expect((ra as unknown as { days: string }).days).toBe('123');
  });

  it('giờ vàng chỉ có nghĩa với nhóm gia đình', async () => {
    const khac = await tao({ bucket: 'work', golden: true });
    expect((khac as unknown as { golden: boolean }).golden).toBe(false);
    const giaDinh = await tao({ bucket: 'family', golden: true });
    expect((giaDinh as unknown as { golden: boolean }).golden).toBe(true);
  });

  it('đủ trần thì từ chối', async () => {
    const day = dung(Array.from({ length: NEP_CAP }, (_, i) => mauNep({ id: `n${i}` }))).deps;
    await expect(
      taoNep(day, 'u1', {
        title: 'Thêm nữa',
        bucket: 'personal',
        minutes: 30,
        golden: false,
        days: '1',
      }),
    ).rejects.toBeInstanceOf(DomainError);
  });
});
