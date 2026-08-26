import { eq, isNull, and, desc } from 'drizzle-orm';
import { db } from '../client';
import { money, workLoad } from '../schema';
import type { Money, WorkLoad } from '../schema';
import type { CreateMoneyDto } from '@/shared/types';
import { getCurrentISOString } from '@/shared/utils/date';
import { generateId } from '@/shared/utils/id';
import { vi } from '@/i18n/vi';

export async function findAllMoneyRecords(): Promise<Money[]> {
  return db
    .select()
    .from(money)
    .where(isNull(money.deletedAt))
    .orderBy(desc(money.month));
}

export async function findMoneyByMonth(month: string): Promise<Money | null> {
  const rows = await db
    .select()
    .from(money)
    .where(and(eq(money.month, month), isNull(money.deletedAt)));
  return rows[0] ?? null;
}

/**
 * Một bản ghi mỗi tháng (S-003). Nhập lại cùng tháng là sửa đè, không tạo dòng
 * thứ hai — nếu để hai dòng cùng `month` thì trung bình trượt 3 tháng của tỷ giá
 * đời sẽ đếm tháng đó hai lần.
 */
export async function upsertMoney(dto: CreateMoneyDto): Promise<Money> {
  const now = getCurrentISOString();
  const existing = await findMoneyByMonth(dto.month);

  if (existing !== null) {
    const rows = await db
      .update(money)
      .set({
        netIncome: dto.netIncome,
        monthlyExpense: dto.monthlyExpense,
        netWorth: dto.netWorth,
        debt: dto.debt,
        updatedAt: now,
      })
      .where(eq(money.id, existing.id))
      .returning();
    const row = rows[0];
    if (row === undefined) {
      throw new Error(vi.errors.insertFailed);
    }
    return row;
  }

  const rows = await db
    .insert(money)
    .values({
      id: generateId(),
      month: dto.month,
      netIncome: dto.netIncome,
      monthlyExpense: dto.monthlyExpense,
      netWorth: dto.netWorth,
      debt: dto.debt,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    })
    .returning();
  const row = rows[0];
  if (row === undefined) {
    throw new Error(vi.errors.insertFailed);
  }
  return row;
}

export async function softDeleteMoney(id: string): Promise<void> {
  const now = getCurrentISOString();
  await db
    .update(money)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(money.id, id));
}

/**
 * Tải công việc nằm ở bảng `work_load` theo tuần, còn thu nhập nằm ở `money`
 * theo tháng. Tỷ giá đời cần cả hai, nên phần đọc `work_load` đặt cạnh `money`
 * thay vì ở một repository riêng — hai bảng chỉ được đọc chung ở đúng chỗ này.
 */
export async function findAllWorkLoads(): Promise<WorkLoad[]> {
  return db.select().from(workLoad).where(isNull(workLoad.deletedAt));
}
