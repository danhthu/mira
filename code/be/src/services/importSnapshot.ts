/**
 * Nhập cả một bộ dữ liệu cho một người, thay toàn bộ cái đang có.
 *
 * Phải chạy trong một transaction: xoá xong mà chèn hỏng thì người dùng mất sạch. Hoặc
 * cả hai cùng xong, hoặc không có gì đổi.
 *
 * Mọi bản ghi được ghi với `userId` của người đang đăng nhập — id trong file nhập vào
 * **không** được dùng để quyết định dữ liệu thuộc về ai.
 */
import type { IDatabase } from '../shared/interfaces/IDatabase';
import { TimeEntryRepository } from '../database/repositories/TimeEntryRepository';
import { MomentRepository } from '../database/repositories/MomentRepository';
import { GoalRepository } from '../database/repositories/GoalRepository';
import { MoneyRepository } from '../database/repositories/MoneyRepository';
import { HabitRepository } from '../database/repositories/HabitRepository';
import { RoutineRepository } from '../database/repositories/RoutineRepository';
import { CategoryRepository } from '../database/repositories/CategoryRepository';
import { MoneyEntryRepository } from '../database/repositories/MoneyEntryRepository';
import type { MoneyFlowCell, TimeBucket } from '../shared/types/enums';
import { MONEY_FLOW_CELLS, TIME_BUCKETS } from '../shared/constants';
import { badRequest } from '../shared/errors';

export interface ImportResult {
  readonly gio: number;
  readonly hat: number;
  readonly thang: number;
  readonly mucTieu: number;
  readonly thoiQuen: number;
  readonly lanDanhDau: number;
  readonly nep: number;
  readonly categories: number;
}

const XOA = [
  // Thứ tự có ý nghĩa: `time_entry.routine_id` trỏ tới `nep`, nên hàng giờ phải đi trước.
  // Và nếp PHẢI bị xoá: nhập bộ mới mà để nếp cũ sống thì lần mở app sau nó sinh lại
  // hàng theo luật của bộ dữ liệu đã bị thay, tức là bộ vừa nhập không còn nguyên vẹn.
  'DELETE FROM habit_check WHERE user_id = $1',
  'DELETE FROM habit WHERE user_id = $1',
  'DELETE FROM goal WHERE user_id = $1',
  'DELETE FROM money WHERE user_id = $1',
  'DELETE FROM moment WHERE user_id = $1',
  'DELETE FROM time_entry WHERE user_id = $1',
  'DELETE FROM routine_skip WHERE user_id = $1',
  'DELETE FROM routine WHERE user_id = $1',
  'DELETE FROM category WHERE user_id = $1',
] as const;

const laBucket = (x: unknown): x is TimeBucket =>
  typeof x === 'string' && TIME_BUCKETS.includes(x as TimeBucket);
const isInteger = (x: unknown): x is number => typeof x === 'number' && Number.isInteger(x);
const stringOrNull = (x: unknown): string | null => (typeof x === 'string' ? x : null);

export async function importSnapshot(db: IDatabase, userId: string, raw: unknown): Promise<ImportResult> {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw badRequest('Bộ dữ liệu phải là một object JSON.');
  }
  const bo = raw as Record<string, unknown>;
  const mang = (k: string): unknown[] => (Array.isArray(bo[k]) ? (bo[k] as unknown[]) : []);

  return db.transaction(async (tx) => {
    for (const sql of XOA) await tx.execute(sql, [userId]);

    const timeEntries = new TimeEntryRepository(tx);
    const moments = new MomentRepository(tx);
    const goals = new GoalRepository(tx);
    const money = new MoneyRepository(tx);
    const moneyEntries = new MoneyEntryRepository(tx);
    const habits = new HabitRepository(tx);
    const nepRepo = new RoutineRepository(tx);
    const danhMucRepo = new CategoryRepository(tx);

    // Danh mục vào trước cả nếp lẫn hàng giờ: cả hai đều trỏ về nó.
    const dmIdMoi = new Map<string, string>();
    let categories = 0;
    for (const x of mang('danhMuc')) {
      const d = x as Record<string, unknown>;
      if (typeof d.name !== 'string' || !laBucket(d.bucket)) continue;
      const tao = await danhMucRepo.create(userId, {
        name: d.name,
        bucket: d.bucket,
        golden: d.golden === true,
        // Bản sao lưu cũ không có hai trường này. Lấy null chứ không bịa một cái hình:
        // giao diện rơi về hình của ô, và người dùng chọn lại khi họ muốn.
        icon: typeof d.icon === 'string' ? d.icon : null,
        color: typeof d.color === 'string' ? d.color : null,
      });
      if (tao === null) continue;
      if (typeof d.id === 'string') dmIdMoi.set(d.id, tao.id);
      categories += 1;
    }

    // Nếp phải vào TRƯỚC hàng giờ: hàng giờ trỏ về nếp, và id trong file là id cũ nên
    // phải giữ bảng tra sang id mới, y như thói quen.
    const nepIdMoi = new Map<string, string>();
    let nep = 0;
    for (const x of mang('nep')) {
      const n = x as Record<string, unknown>;
      if (typeof n.title !== 'string' || !laBucket(n.bucket) || !isInteger(n.minutes)) continue;
      if (typeof n.days !== 'string' || !/^[1-7]{1,7}$/.test(n.days)) continue;
      const tao = await nepRepo.create(userId, {
        title: n.title,
        bucket: n.bucket,
        minutes: n.minutes,
        golden: n.golden === true,
        days: n.days,
        categoryId: typeof n.categoryId === 'string' ? (dmIdMoi.get(n.categoryId) ?? null) : null,
      });
      if (typeof n.id === 'string') nepIdMoi.set(n.id, tao.id);
      nep += 1;
    }

    let gio = 0;
    for (const x of mang('timeEntries')) {
      const e = x as Record<string, unknown>;
      if (typeof e.date !== 'string' || !isInteger(e.minutes) || !laBucket(e.bucket)) continue;
      const cu = typeof e.routineId === 'string' ? nepIdMoi.get(e.routineId) : undefined;
      await timeEntries.create(userId, {
        date: e.date,
        minutes: e.minutes,
        bucket: e.bucket,
        golden: e.golden === true,
        note: stringOrNull(e.note),
        source: cu === undefined ? undefined : 'nep',
        routineId: cu ?? null,
        categoryId: typeof e.categoryId === 'string' ? (dmIdMoi.get(e.categoryId) ?? null) : null,
      });
      gio += 1;
    }

    let hat = 0;
    for (const x of mang('moments')) {
      const m = x as Record<string, unknown>;
      if (typeof m.date !== 'string' || (m.kind !== 'candy' && m.kind !== 'salt')) continue;
      await moments.create(userId, { date: m.date, kind: m.kind, text: stringOrNull(m.text) });
      hat += 1;
    }

    // Hai ô MỨC đi vào bảng `money`; năm ô DÒNG CHẢY thành khoản ngày mùng 1, giống
    // hệt cách migration 013 chuyển số cũ. Một bản sao lưu cũ chỉ có bảy con số tháng
    // vẫn nạp lại được, không mất gì.
    let thang = 0;
    const tien = typeof bo.money === 'object' && bo.money !== null ? (bo.money as Record<string, unknown>) : {};
    for (const [thangKey, v] of Object.entries(tien)) {
      if (!/^\d{4}-\d{2}$/.test(thangKey) || typeof v !== 'object' || v === null) continue;
      const m = v as Record<string, unknown>;
      const so = (k: string): number | null => (isInteger(m[k]) ? (m[k] as number) : null);

      await money.upsert(userId, thangKey, {
        debtBalance: so('debtBalance'),
        netWorth: so('netWorth'),
      });

      for (const cell of MONEY_FLOW_CELLS) {
        const n = so(cell);
        if (n === null || n <= 0) continue;
        await moneyEntries.create(userId, {
          date: `${thangKey}-01`,
          amount: n,
          cell,
          categoryId: null,
          note: 'Số tháng từ bản sao lưu',
        });
      }
      thang += 1;
    }

    // Khoản tiền ghi thẳng, nếu bản sao lưu có. Bản cũ không có khoá này.
    for (const x of mang('moneyEntries')) {
      const e = x as Record<string, unknown>;
      if (typeof e.date !== 'string' || !isInteger(e.amount)) continue;
      if (typeof e.cell !== 'string' || !MONEY_FLOW_CELLS.includes(e.cell as MoneyFlowCell)) continue;
      await moneyEntries.create(userId, {
        date: e.date,
        amount: e.amount as number,
        cell: e.cell as MoneyFlowCell,
        categoryId: null,
        note: stringOrNull(e.note),
      });
    }

    let mucTieu = 0;
    for (const x of mang('goals')) {
      const g = x as Record<string, unknown>;
      const tier = g.tier;
      if (tier !== 'long' && tier !== 'quarter' && tier !== 'rhythm') continue;
      if (typeof g.title !== 'string' || !isInteger(g.weeklyMinutes)) continue;
      await goals.create(userId, {
        tier,
        title: g.title,
        weeklyMinutes: g.weeklyMinutes,
        sourceBucket: laBucket(g.sourceBucket) ? g.sourceBucket : undefined,
      });
      mucTieu += 1;
    }

    // Thói quen phải tạo trước rồi mới gắn lần đánh dấu, và id mới do máy chủ cấp —
    // nên phải giữ bảng tra từ id cũ trong file sang id mới.
    const idMoi = new Map<string, string>();
    let thoiQuen = 0;
    for (const x of mang('habits')) {
      const h = x as Record<string, unknown>;
      if (typeof h.title !== 'string' || !isInteger(h.targetPerWeek)) continue;
      if (h.targetPerWeek < 1 || h.targetPerWeek > 7) continue;
      const tao = await habits.create(userId, h.title, h.targetPerWeek);
      if (typeof h.id === 'string') idMoi.set(h.id, tao.id);
      thoiQuen += 1;
    }

    let lanDanhDau = 0;
    for (const x of mang('habitChecks')) {
      const c = x as Record<string, unknown>;
      if (typeof c.habitId !== 'string' || typeof c.date !== 'string') continue;
      const moi = idMoi.get(c.habitId);
      if (moi === undefined) continue;
      await habits.check(userId, moi, c.date);
      lanDanhDau += 1;
    }

    return { gio, hat, thang, mucTieu, thoiQuen, lanDanhDau, nep, categories };
  });
}
