import { eq, isNull, and, gte, lt, desc } from 'drizzle-orm';
import { db } from '../client';
import { expense } from '../schema';
import type { Expense } from '../schema';
import type { CreateExpenseDto } from '@/shared/types';
import { getCurrentISOString } from '@/shared/utils/date';
import { generateId } from '@/shared/utils/id';
import { vi } from '@/i18n/vi';

export async function findAllExpenses(): Promise<Expense[]> {
  return db
    .select()
    .from(expense)
    .where(isNull(expense.deletedAt))
    .orderBy(desc(expense.occurredAt));
}

/**
 * `occurredAt` là ISO string nên so sánh chuỗi theo tiền tố tháng là đủ:
 * '2026-08-01T00:00:00.000Z' <= x < '2026-09'.
 */
export async function findExpensesByMonth(month: string): Promise<Expense[]> {
  return db
    .select()
    .from(expense)
    .where(
      and(
        isNull(expense.deletedAt),
        gte(expense.occurredAt, `${month}-01`),
        lt(expense.occurredAt, nextMonth(month)),
      ),
    )
    .orderBy(desc(expense.occurredAt));
}

export async function createExpense(dto: CreateExpenseDto): Promise<Expense> {
  const now = getCurrentISOString();
  const rows = await db
    .insert(expense)
    .values({
      id: generateId(),
      occurredAt: dto.occurredAt,
      amount: dto.amount,
      description: dto.description,
      bucket: dto.bucket ?? null,
      sourceType: dto.sourceType ?? 'manual',
      // Khoản nhập tay là do người dùng tự gõ nên đã xác nhận sẵn; chỉ khoản đọc
      // từ SMS/notification mới cần một chạm xác nhận (R-086).
      confirmed: (dto.sourceType ?? 'manual') === 'manual',
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

export async function softDeleteExpense(id: string): Promise<void> {
  const now = getCurrentISOString();
  await db
    .update(expense)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(expense.id, id));
}

function nextMonth(month: string): string {
  const [yearPart, monthPart] = month.split('-');
  const year = Number(yearPart);
  const index = Number(monthPart);
  return index === 12
    ? `${year + 1}-01`
    : `${year}-${String(index + 1).padStart(2, '0')}`;
}
