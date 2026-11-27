/**
 * Khoản tiền lẻ. Bản sao của `services/time.ts` cho mục giờ.
 *
 * Nhịp ở đây là NGÀY, còn nhịp của màn Tài chính là THÁNG. Tách ra được vì năm ô dòng
 * chảy là tổng của nhiều lần — xem đầu `migrations/013_money_entries.sql`.
 */
import type {
  MoneyEntryRepository,
  MoneyEntryRec,
} from '../database/repositories/MoneyEntryRepository';
import type { MoneyCategoryRec } from '../database/repositories/MoneyCategoryRepository';
import type { MoneyFlowCell } from '../shared/types/enums';
import { badRequest, notFound } from '../shared/errors';
import { checkFlowCell } from './moneyCategory';
import { assertDate } from './time';

export interface MoneyEntryDeps {
  readonly moneyEntries: MoneyEntryRepository;
}

/**
 * Trần một khoản: một nghìn tỷ.
 *
 * Không phải để chặn người giàu. Để chặn **lỗi gõ**: "20000000000" là thứ người ta gõ
 * khi định gõ "20000000" và quên nhấc tay. Một con số như vậy lọt vào thì vòng dòng
 * tiền bẹp dí và mọi tỷ lệ của tháng đó thành vô nghĩa.
 */
const TRAN_VND = 1_000_000_000_000;

function checkAmount(raw: unknown): number {
  const n = typeof raw === 'number' ? raw : Number(String(raw ?? '').replace(/[^\d]/g, ''));
  if (!Number.isInteger(n) || n <= 0) {
    throw badRequest('Số tiền phải là số nguyên dương.');
  }
  if (n > TRAN_VND) {
    throw badRequest('Số tiền lớn bất thường. Kiểm lại số chữ số.');
  }
  return n;
}

function checkNote(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim().replace(/\s+/g, ' ');
  if (s === '') return null;
  if (s.length > 120) throw badRequest('Ghi chú dài quá 120 ký tự.');
  return s;
}

export async function createMoneyEntry(
  deps: MoneyEntryDeps,
  userId: string,
  dto: { date: unknown; amount: unknown; cell: unknown; note: unknown },
  category: MoneyCategoryRec | null,
): Promise<MoneyEntryRec> {
  // Ô lấy từ danh mục khi có danh mục — người dùng đã khai nó thuộc ô nào rồi.
  const cell: MoneyFlowCell = category === null ? checkFlowCell(dto.cell) : category.cell;

  return deps.moneyEntries.create(userId, {
    date: assertDate(String(dto.date ?? ''), 'date'),
    amount: checkAmount(dto.amount),
    cell,
    categoryId: category?.id ?? null,
    note: checkNote(dto.note),
  });
}

export async function updateMoneyEntry(
  deps: MoneyEntryDeps,
  userId: string,
  id: string,
  dto: { date?: unknown; amount?: unknown; cell?: unknown; note?: unknown },
  category: MoneyCategoryRec | null | undefined,
): Promise<MoneyEntryRec> {
  const ra = await deps.moneyEntries.update(userId, id, {
    date: dto.date === undefined ? undefined : assertDate(String(dto.date), 'date'),
    amount: dto.amount === undefined ? undefined : checkAmount(dto.amount),
    // Đổi danh mục thì ô đi theo danh mục; không đổi thì nhận ô client gửi.
    cell:
      category != null
        ? category.cell
        : dto.cell === undefined
          ? undefined
          : checkFlowCell(dto.cell),
    categoryId: category === undefined ? undefined : (category?.id ?? null),
    note: dto.note === undefined ? undefined : checkNote(dto.note),
  });
  if (ra === null) throw notFound('Không có khoản tiền nào với id này.');
  return ra;
}

export async function deleteMoneyEntry(
  deps: MoneyEntryDeps,
  userId: string,
  id: string,
): Promise<void> {
  const ra = await deps.moneyEntries.softDelete(userId, id);
  if (ra === null) throw notFound('Không có khoản tiền nào với id này.');
}
