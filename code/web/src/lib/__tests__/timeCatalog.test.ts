import { describe, expect, it } from 'vitest';
import type { Category, TimeBucket, TimeEntry } from '@mira/contract';
import { catalogOf, longestIn } from '../timeCatalog';
import { UNFILED } from '../catalog';

const muc = (
  bucket: TimeBucket,
  minutes: number,
  categoryId: string | null,
  date = '2026-11-20',
): TimeEntry => ({
  id: `${bucket}-${minutes}-${date}-${categoryId ?? 'x'}`,
  date,
  minutes,
  bucket,
  golden: false,
  note: null,
  source: 'manual',
  routineId: null,
  categoryId,
});

const dm = (id: string, name: string, bucket: TimeBucket): Category => ({
  id,
  name,
  bucket,
  golden: false,
  archivedAt: null,
  icon: null,
  color: null,
});

describe('catalogOf — giờ', () => {
  it('gom nhiều mục cùng danh mục thành một dòng', () => {
    const ra = catalogOf(
      [
        muc('work', 60, 'c1', '2026-11-18'),
        muc('work', 120, 'c1', '2026-11-20'),
        muc('work', 30, 'c1', '2026-11-19'),
      ],
      [dm('c1', 'Họp', 'work')],
    );

    expect(ra).toHaveLength(1);
    expect(ra[0]?.cell).toBe('work');
    expect(ra[0]?.total).toBe(210);
    expect(ra[0]?.rows).toHaveLength(1);
    expect(ra[0]?.rows[0]).toMatchObject({ name: 'Họp', total: 210, count: 3 });
  });

  it('lấy ngày MUỘN NHẤT làm mốc "đã ghi", không lấy ngày đầu danh sách', () => {
    const ra = catalogOf(
      [muc('work', 60, 'c1', '2026-11-22'), muc('work', 60, 'c1', '2026-11-04')],
      [dm('c1', 'Họp', 'work')],
    );
    expect(ra[0]?.rows[0]?.lastDate).toBe('2026-11-22');
  });

  it('xếp dòng theo tổng giảm dần, bằng nhau thì theo tên tiếng Việt', () => {
    const ra = catalogOf(
      [
        muc('work', 30, 'c1'),
        muc('work', 300, 'c2'),
        muc('work', 30, 'c3'),
      ],
      [dm('c1', 'Ăn', 'work'), dm('c2', 'Việc dự án', 'work'), dm('c3', 'Đi lại', 'work')],
    );
    expect(ra[0]?.rows.map((r) => r.name)).toEqual(['Việc dự án', 'Ăn', 'Đi lại']);
  });

  it('xếp ô theo tổng giảm dần', () => {
    const ra = catalogOf(
      [muc('family', 600, 'c1'), muc('work', 60, 'c2'), muc('waste', 180, 'c3')],
      [dm('c1', 'Con', 'family'), dm('c2', 'Họp', 'work'), dm('c3', 'Điện thoại', 'waste')],
    );
    expect(ra.map((o) => o.cell)).toEqual(['family', 'waste', 'work']);
  });

  it('mục chưa xếp danh mục vẫn được một dòng, để tổng catalog khớp tổng vòng tròn', () => {
    const ra = catalogOf([muc('work', 480, null), muc('work', 60, 'c1')], [dm('c1', 'Họp', 'work')]);
    expect(ra[0]?.total).toBe(540);
    expect(ra[0]?.rows.map((r) => r.name)).toEqual([UNFILED, 'Họp']);
  });

  it('danh mục đã xoá khỏi bảng thì rơi về "chưa xếp", không làm hỏng dòng', () => {
    const ra = catalogOf([muc('work', 60, 'da-xoa')], []);
    expect(ra[0]?.rows[0]?.name).toBe(UNFILED);
    expect(ra[0]?.rows[0]?.categoryId).toBe('da-xoa');
  });

  it('không gom lẫn hai danh mục trùng tên ở hai nhóm việc khác nhau', () => {
    const ra = catalogOf(
      [muc('work', 60, 'c1'), muc('personal', 60, 'c2')],
      [dm('c1', 'Đọc', 'work'), dm('c2', 'Đọc', 'personal')],
    );
    expect(ra).toHaveLength(2);
    expect(ra.every((o) => o.rows.length === 1)).toBe(true);
  });

  it('danh sách rỗng ra catalog rỗng, không ra một ô tổng 0', () => {
    expect(catalogOf([], [])).toEqual([]);
  });

  it('longestIn luôn ≥ 1 để khỏi chia cho 0', () => {
    expect(longestIn([])).toBe(1);
    expect(longestIn(catalogOf([muc('work', 90, 'c1')], [dm('c1', 'Họp', 'work')])[0]?.rows ?? [])).toBe(90);
  });
});
