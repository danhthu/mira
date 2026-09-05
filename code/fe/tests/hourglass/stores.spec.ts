import { Repository, personRepository } from '../../src/Common/Repositories';
import { registeredRepositories } from '../../src/Hourglass/Models/stores';
import { readState } from '../../src/Hourglass/Models/store';
import { DEFAULT_QUIET_TIME } from '../../src/Hourglass/Models/quietTime';

/**
 * Bài kiểm chống lại đúng lỗi lịch sử: nút "xoá toàn bộ dữ liệu" xoá 3 trong 13 bảng
 * vì danh sách được gõ tay. Danh sách phải suy từ `Common/Repositories/index.ts`.
 */
describe('danh sách kho suy từ nguồn duy nhất', () => {
  it('bắt được mọi repository đang export', () => {
    const found = registeredRepositories();
    expect(found.every((repository) => repository instanceof Repository)).toBe(true);
    expect(found).toContain(personRepository);
  });

  it('không bỏ sót bảng nào so với số repository đang đăng ký', () => {
    const registry: Record<string, unknown> = require('../../src/Common/Repositories');
    const expected = Object.keys(registry).filter(
      (key) => registry[key] instanceof Repository,
    ).length;
    expect(registeredRepositories().length).toBe(expected);
    expect(expected).toBeGreaterThanOrEqual(10);
  });
});

describe('đọc lại cấu hình module', () => {
  it('kho trống cho lại mặc định', () => {
    expect(readState(null)).toEqual({ quietTime: DEFAULT_QUIET_TIME, people: {} });
  });

  it('giữ lại card đã ẩn qua lần đọc sau', () => {
    const raw = JSON.stringify({
      quietTime: { curfewEnabled: false, curfewHour: 22 },
      people: { p1: { monthlyCadence: 2, daysPerVisit: 2, targetWeeklyHours: 0, hidden: true } },
    });
    const state = readState(raw);
    expect(state.people.p1.hidden).toBe(true);
    expect(state.quietTime.curfewEnabled).toBe(false);
    expect(state.quietTime.curfewHour).toBe(22);
  });

  it('bỏ qua mục người không phải object', () => {
    const state = readState(JSON.stringify({ people: { p1: 'hỏng' } }));
    expect(state.people).toEqual({});
  });
});
