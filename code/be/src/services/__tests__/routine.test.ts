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
import { runRoutines, createRoutine, ROUTINE_CAP } from '../routine';
import type { RoutineRec } from '../../database/repositories/RoutineRepository';
import type { TimeBucket } from '../../shared/types/enums';
import { DomainError } from '../../shared/errors';

interface HourRow {
  date: string;
  minutes: number;
  bucket: TimeBucket;
  golden: boolean;
  note: string | null;
  source?: string;
  routineId?: string | null;
}

/** Giả lập hai repository, đủ cho `chayNep` và `taoNep`. */
function dung(
  nep: RoutineRec[],
  boQua: string[] = [],
  tuGhi: Partial<HourRow & { categoryId: string | null }>[] = [],
) {
  const saved: HourRow[] = [];
  const deps = {
    routines: {
      findActive: async () => nep,
      countActive: async () => nep.filter((n) => n.endedOn === null).length,
      skipsInRange: async () => new Set(boQua),
      generatedInRange: async () => new Set(saved.map((e) => `${e.routineId ?? ''}|${e.date}`)),
      create: async (_u: string, d: Record<string, unknown>) =>
        ({ ...d, id: 'moi', startedOn: '2026-11-25', endedOn: null }) as unknown as RoutineRec,
    },
    timeEntries: {
      findByDateRange: async () =>
        tuGhi.map((e) => ({
          bucket: 'personal',
          note: null,
          categoryId: null,
          routineId: null,
          ...e,
        })),
      create: async (_u: string, e: HourRow) => {
        saved.push(e);
        return e;
      },
    },
  } as never;
  return { deps, saved };
}

const routineColor = (over: Partial<RoutineRec> = {}): RoutineRec => ({
  id: 'n1',
  title: 'Ăn tối',
  bucket: 'personal',
  minutes: 30,
  golden: false,
  days: '1234567',
  startedOn: '2026-01-01',
  endedOn: null,
  categoryId: null,
  ...over,
});

const TODAY = '2026-11-25'; // thứ tư

describe('chayNep', () => {
  it('⚑ chỉ sinh bù tối đa bảy ngày, dù nếp đã khai từ đầu năm', async () => {
    // Người bỏ app ba tháng rồi quay lại không được nhận chín mươi ngày "đã ăn tối".
    // Quãng vắng để trống, vì để trống là thật còn điền bừa là nói dối.
    const { deps, saved } = dung([routineColor()]);
    await runRoutines(deps, 'u1', TODAY);
    expect(saved).toHaveLength(7);
    expect(saved.map((e) => e.date)).toEqual([
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
    const { deps, saved } = dung([routineColor({ startedOn: '2026-11-23' })]);
    await runRoutines(deps, 'u1', TODAY);
    expect(saved.map((e) => e.date)).toEqual(['2026-11-23', '2026-11-24', '2026-11-25']);
  });

  it('nếp khai hôm nay không bịa ra quá khứ của chính nó', async () => {
    const { deps, saved } = dung([routineColor({ startedOn: TODAY })]);
    await runRoutines(deps, 'u1', TODAY);
    expect(saved).toHaveLength(1);
  });

  it('chỉ sinh vào thứ đã khai', async () => {
    // "12345" là thứ hai tới thứ sáu. Trong bảy ngày 19–25 có T7 21/11 và CN 22/11.
    const { deps, saved } = dung([routineColor({ days: '12345' })]);
    await runRoutines(deps, 'u1', TODAY);
    expect(saved.map((e) => e.date)).toEqual([
      '2026-11-19',
      '2026-11-20',
      '2026-11-23',
      '2026-11-24',
      '2026-11-25',
    ]);
  });

  it('không sinh lại ngày người dùng đã từ chối', async () => {
    const { deps, saved } = dung([routineColor()], ['n1|2026-11-23']);
    const ra = await runRoutines(deps, 'u1', TODAY);
    expect(saved.map((e) => e.date)).not.toContain('2026-11-23');
    expect(ra.find((x) => x.date === '2026-11-23')?.state).toBe('bo-qua');
  });

  it('ngày đã có hàng rồi thì không sinh thêm', async () => {
    const { deps, saved } = dung([routineColor()]);
    await runRoutines(deps, 'u1', TODAY);
    await runRoutines(deps, 'u1', TODAY);
    expect(saved).toHaveLength(7);
  });

  it('hàng sinh ra mang source "nep" và tên nếp làm ghi chú', async () => {
    const { deps, saved } = dung([routineColor({ title: 'Ngủ', minutes: 420 })]);
    await runRoutines(deps, 'u1', TODAY);
    expect(saved[0]?.source).toBe('nep');
    expect(saved[0]?.note).toBe('Ngủ');
    expect(saved[0]?.minutes).toBe(420);
    expect(saved[0]?.routineId).toBe('n1');
  });

  it('không có nếp nào thì không gọi xuống CSDL', async () => {
    const { deps, saved } = dung([]);
    expect(await runRoutines(deps, 'u1', TODAY)).toEqual([]);
    expect(saved).toHaveLength(0);
  });
});

describe('taoNep', () => {
  let deps: never;
  beforeEach(() => {
    deps = dung([]).deps;
  });

  const tao = (over: Record<string, unknown> = {}) =>
    createRoutine(deps, 'u1', {
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
    const day = dung(
      Array.from({ length: ROUTINE_CAP }, (_, i) => routineColor({ id: `n${i}` })),
    ).deps;
    await expect(
      createRoutine(day, 'u1', {
        title: 'Thêm nữa',
        bucket: 'personal',
        minutes: 30,
        golden: false,
        days: '1',
      }),
    ).rejects.toBeInstanceOf(DomainError);
  });
});

describe('nếp gặp hàng người dùng tự ghi', () => {
  it('⚑ ngày đã tự ghi cùng danh mục thì nếp không sinh, cũng không hiện để "nhận lại"', async () => {
    // 27/11/2026: chạm phím "Việc dự án 8h" bên Nhật ký rồi mở Thời gian là thành 16h.
    const { deps, saved } = dung(
      [routineColor({ startedOn: TODAY, categoryId: 'dm-viec', bucket: 'work' })],
      ['n1|2026-11-25'],
      [{ date: TODAY, minutes: 480, bucket: 'work', categoryId: 'dm-viec' }],
    );
    const ra = await runRoutines(deps, 'u1', TODAY);
    expect(saved).toHaveLength(0);
    expect(ra).toHaveLength(0);
  });

  it('không danh mục thì so tên, không phân biệt hoa thường', async () => {
    const { deps, saved } = dung(
      [routineColor({ startedOn: TODAY })],
      [],
      [{ date: TODAY, minutes: 20, bucket: 'personal', note: ' ăn tối ' }],
    );
    await runRoutines(deps, 'u1', TODAY);
    expect(saved).toHaveLength(0);
  });

  it('tự ghi việc KHÁC thì nếp vẫn sinh', async () => {
    const { deps, saved } = dung(
      [routineColor({ startedOn: TODAY })],
      [],
      [{ date: TODAY, minutes: 20, bucket: 'personal', note: 'đọc sách' }],
    );
    await runRoutines(deps, 'u1', TODAY);
    expect(saved).toHaveLength(1);
  });

  it('hàng do chính nếp sinh không tính là tự ghi', async () => {
    const { deps, saved } = dung(
      [routineColor({ startedOn: TODAY })],
      [],
      [{ date: TODAY, minutes: 30, bucket: 'personal', note: 'Ăn tối', routineId: 'n9' }],
    );
    await runRoutines(deps, 'u1', TODAY);
    expect(saved).toHaveLength(1);
  });
});
