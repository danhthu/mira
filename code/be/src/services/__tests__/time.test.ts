/**
 * Kiểm phép so hai tuần của `weekSummary`.
 *
 * Lỗi đã có thật, phát hiện ngày 25/11/2026 với dữ liệu thật của Founder: tuần đang dở
 * mới ghi 3 ngày, tuần trước ghi đủ 7, và thẻ nhận xét khen "Lãng phí giảm 26h 24m".
 * Không giảm gì cả — bốn ngày chưa xảy ra.
 *
 * Test ở đây chặn đúng chỗ đó: `previous` phải là null khi tuần này ghi ít ngày hơn.
 */
import { describe, it, expect } from 'vitest';
import type { TimeBucket } from '../../shared/types/enums';
import { weekSummary } from '../time';

/** Giả lập repository thay vì cả CSDL: service chỉ cần ba phép đọc này. */
function fakeRepo(byWeek: Record<string, { bucket: TimeBucket; minutes: number }[]>) {
  const lay = (from: string) => byWeek[from] ?? [];
  return {
    async sumByBucket(_userId: string, from: string) {
      return lay(from);
    },
    async sumGolden() {
      return 0;
    },
    async countDays(_userId: string, from: string) {
      // Mỗi tuần khai sẵn số ngày qua khoá `ngay:<from>`; không khai thì suy ra 0 hoặc 7.
      const n = dayCount[from];
      return n ?? (lay(from).length > 0 ? 7 : 0);
    },
  } as never;
}

let dayCount: Record<string, number> = {};

const TUAN_NAY = '2026-11-23';
const TUAN_TRUOC = '2026-11-16';
const deps = (repo: never) => ({ timeEntries: repo, wakingMinutesPerWeek: 17 * 60 * 7 });

describe('weekSummary — phép so hai tuần', () => {
  it('không so khi tuần này ghi ít ngày hơn tuần trước', async () => {
    dayCount = { [TUAN_NAY]: 3, [TUAN_TRUOC]: 7 };
    const repo = fakeRepo({
      [TUAN_NAY]: [{ bucket: 'waste', minutes: 558 }],
      [TUAN_TRUOC]: [{ bucket: 'waste', minutes: 2140 }],
    });

    const kq = await weekSummary(deps(repo), 'u1', TUAN_NAY);

    expect(kq.recordedDays).toBe(3);
    expect(kq.previous).toBeNull();
  });

  it('có so khi hai tuần ghi bằng số ngày', async () => {
    dayCount = { [TUAN_NAY]: 7, [TUAN_TRUOC]: 7 };
    const repo = fakeRepo({
      [TUAN_NAY]: [{ bucket: 'waste', minutes: 1300 }],
      [TUAN_TRUOC]: [{ bucket: 'waste', minutes: 2140 }],
    });

    const kq = await weekSummary(deps(repo), 'u1', TUAN_NAY);

    expect(kq.previous).not.toBeNull();
    expect(kq.previous?.loggedMinutes).toBe(2140);
    expect(kq.previous?.recordedDays).toBe(7);
  });

  it('có so khi tuần này ghi nhiều ngày hơn — người dùng ghi đều hơn lên', async () => {
    dayCount = { [TUAN_NAY]: 7, [TUAN_TRUOC]: 4 };
    const repo = fakeRepo({
      [TUAN_NAY]: [{ bucket: 'family', minutes: 700 }],
      [TUAN_TRUOC]: [{ bucket: 'family', minutes: 300 }],
    });

    const kq = await weekSummary(deps(repo), 'u1', TUAN_NAY);

    expect(kq.previous?.recordedDays).toBe(4);
  });

  it('không so khi tuần trước trống, dù tuần này đủ ngày', async () => {
    dayCount = { [TUAN_NAY]: 7, [TUAN_TRUOC]: 0 };
    const repo = fakeRepo({ [TUAN_NAY]: [{ bucket: 'work', minutes: 4200 }] });

    const kq = await weekSummary(deps(repo), 'u1', TUAN_NAY);

    expect(kq.previous).toBeNull();
  });

  it('tỉ lệ tính trên giờ tỉnh truyền vào, không trên 16h đóng cứng', async () => {
    dayCount = { [TUAN_NAY]: 7, [TUAN_TRUOC]: 0 };
    // 70h làm việc trong tuần tỉnh 119h → 588‰, không phải 625‰ của mẫu số 112h.
    const repo = fakeRepo({ [TUAN_NAY]: [{ bucket: 'work', minutes: 70 * 60 }] });

    const kq = await weekSummary(deps(repo), 'u1', TUAN_NAY);

    expect(kq.wakingMinutes).toBe(119 * 60);
    expect(kq.slices.find((s) => s.bucket === 'work')?.perMille).toBe(588);
  });

  it('luôn trả đủ bốn lát để donut không đổi thứ tự màu', async () => {
    dayCount = { [TUAN_NAY]: 1, [TUAN_TRUOC]: 0 };
    const repo = fakeRepo({ [TUAN_NAY]: [{ bucket: 'waste', minutes: 60 }] });

    const kq = await weekSummary(deps(repo), 'u1', TUAN_NAY);

    expect(kq.slices.map((s) => s.bucket)).toEqual(['work', 'family', 'personal', 'waste']);
  });
});
