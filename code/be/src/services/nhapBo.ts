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
import type { TimeBucket } from '../shared/types/enums';
import { TIME_BUCKETS } from '../shared/constants';
import { badRequest } from '../shared/errors';

export interface KetQuaNhap {
  readonly gio: number;
  readonly hat: number;
  readonly thang: number;
  readonly mucTieu: number;
  readonly thoiQuen: number;
  readonly lanDanhDau: number;
}

const XOA = [
  'DELETE FROM habit_check WHERE user_id = $1',
  'DELETE FROM habit WHERE user_id = $1',
  'DELETE FROM goal WHERE user_id = $1',
  'DELETE FROM money WHERE user_id = $1',
  'DELETE FROM moment WHERE user_id = $1',
  'DELETE FROM time_entry WHERE user_id = $1',
] as const;

const laBucket = (x: unknown): x is TimeBucket =>
  typeof x === 'string' && TIME_BUCKETS.includes(x as TimeBucket);
const soNguyen = (x: unknown): x is number => typeof x === 'number' && Number.isInteger(x);
const chuoiHoacNull = (x: unknown): string | null => (typeof x === 'string' ? x : null);

export async function nhapBo(db: IDatabase, userId: string, raw: unknown): Promise<KetQuaNhap> {
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
    const habits = new HabitRepository(tx);

    let gio = 0;
    for (const x of mang('timeEntries')) {
      const e = x as Record<string, unknown>;
      if (typeof e.date !== 'string' || !soNguyen(e.minutes) || !laBucket(e.bucket)) continue;
      await timeEntries.create(userId, {
        date: e.date,
        minutes: e.minutes,
        bucket: e.bucket,
        golden: e.golden === true,
        note: chuoiHoacNull(e.note),
      });
      gio += 1;
    }

    let hat = 0;
    for (const x of mang('moments')) {
      const m = x as Record<string, unknown>;
      if (typeof m.date !== 'string' || (m.kind !== 'candy' && m.kind !== 'salt')) continue;
      await moments.create(userId, { date: m.date, kind: m.kind, text: chuoiHoacNull(m.text) });
      hat += 1;
    }

    let thang = 0;
    const tien = typeof bo.money === 'object' && bo.money !== null ? (bo.money as Record<string, unknown>) : {};
    for (const [thangKey, v] of Object.entries(tien)) {
      if (!/^\d{4}-\d{2}$/.test(thangKey) || typeof v !== 'object' || v === null) continue;
      const m = v as Record<string, unknown>;
      const so = (k: string): number | null => (soNguyen(m[k]) ? (m[k] as number) : null);
      await money.upsert(userId, thangKey, {
        netIncome: so('netIncome'),
        monthlyExpense: so('monthlyExpense'),
        debtPayment: so('debtPayment'),
        debtBalance: so('debtBalance'),
        netWorth: so('netWorth'),
      });
      thang += 1;
    }

    let mucTieu = 0;
    for (const x of mang('goals')) {
      const g = x as Record<string, unknown>;
      const tier = g.tier;
      if (tier !== 'long' && tier !== 'quarter' && tier !== 'rhythm') continue;
      if (typeof g.title !== 'string' || !soNguyen(g.weeklyMinutes)) continue;
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
      if (typeof h.title !== 'string' || !soNguyen(h.targetPerWeek)) continue;
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

    return { gio, hat, thang, mucTieu, thoiQuen, lanDanhDau };
  });
}
