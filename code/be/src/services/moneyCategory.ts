/**
 * Danh mục tiền: tên khoản do người dùng đặt, nằm bên trong một ô tiền.
 *
 * Bản sao của `services/category.ts` bên thời gian, cố ý giống từng luật:
 *
 *   • TUỲ CHỌN — ghi một khoản không chọn danh mục vẫn hợp lệ. Bắt phân loại là thêm
 *     ma sát ghi, mà giảm ma sát mới là đòn bẩy +39%.
 *   • CẤT ĐI, KHÔNG XOÁ — khoản cũ còn trỏ về nó. Xoá là sửa lịch sử.
 *   • TRẦN THEO Ô, không phải tổng — chỗ phải đọc là danh sách bên trong một ô.
 *
 * Khác bên thời gian đúng một chỗ: không có cờ `golden`. Giờ vàng là khái niệm của thời
 * gian, tiền không có thứ tương đương.
 */
import type {
  MoneyCategoryRepository,
  MoneyCategoryRec,
} from '../database/repositories/MoneyCategoryRepository';
import type { MoneyFlowCell } from '../shared/types/enums';
import { CATEGORY_COLORS, CATEGORY_ICONS, MONEY_FLOW_CELLS } from '../shared/constants';
import { badRequest, notFound, tierFull, DomainError } from '../shared/errors';

export interface MoneyCategoryDeps {
  readonly moneyCategories: MoneyCategoryRepository;
}

export const MONEY_CATEGORY_CAP = 6;

const duplicateNames = () =>
  new DomainError('name_taken', 409, 'Ô này đã có danh mục tên như vậy rồi.');

/**
 * Kiểm khoá hình và màu.
 *
 * Bỏ trống hoặc gửi null đều ra null — danh mục không có hình là hợp lệ, giao diện rơi về
 * hình của ô. Nhưng gửi một khoá LẠ thì ném lỗi chứ không lặng lẽ về null: khoá lạ nghĩa
 * là client và máy chủ đang bất đồng, và nuốt nó đi thì lần sau vẫn thế mà không ai biết.
 */
export function checkIcon(raw: unknown): string | null {
  if (raw === null || raw === undefined || raw === '') return null;
  if (typeof raw !== 'string' || !(CATEGORY_ICONS as readonly string[]).includes(raw)) {
    throw badRequest(`icon phải là một trong: ${CATEGORY_ICONS.join(', ')}.`);
  }
  return raw;
}

export function checkColor(raw: unknown): string | null {
  if (raw === null || raw === undefined || raw === '') return null;
  if (typeof raw !== 'string' || !(CATEGORY_COLORS as readonly string[]).includes(raw)) {
    throw badRequest(`color phải là một trong: ${CATEGORY_COLORS.join(', ')}.`);
  }
  return raw;
}

function checkName(raw: unknown): string {
  const ten = String(raw ?? '')
    .trim()
    .replace(/\s+/g, ' ');
  if (ten === '') throw badRequest('Danh mục phải có tên.');
  if (ten.length > 60) throw badRequest('Tên danh mục dài quá 60 ký tự.');
  return ten;
}

/**
 * Hai ô mức bị chặn ở đây, không phải lặng lẽ bỏ qua.
 *
 * "Dư nợ" và "Tài sản ròng" là ảnh chụp tại một thời điểm, không cộng dồn được. Cho tạo
 * danh mục cho chúng là mời người dùng ghi từng khoản dư nợ, rồi Mira cộng lại và báo
 * một con số nợ gấp đôi sự thật.
 */
export function checkFlowCell(raw: unknown): MoneyFlowCell {
  if (typeof raw !== 'string' || !MONEY_FLOW_CELLS.includes(raw as MoneyFlowCell)) {
    throw badRequest(
      `cell phải là một trong: ${MONEY_FLOW_CELLS.join(', ')}. ` +
        'Dư nợ và tài sản ròng là ô mức, khai thẳng một con số chứ không có khoản lẻ.',
    );
  }
  return raw as MoneyFlowCell;
}

export async function createMoneyCategory(
  deps: MoneyCategoryDeps,
  userId: string,
  dto: { name: unknown; cell: unknown; icon?: unknown; color?: unknown },
): Promise<MoneyCategoryRec> {
  const name = checkName(dto.name);
  const cell = checkFlowCell(dto.cell);
  const icon = checkIcon(dto.icon);
  const color = checkColor(dto.color);

  const present = await deps.moneyCategories.countInCell(userId, cell);
  if (present >= MONEY_CATEGORY_CAP) {
    throw tierFull(
      `Ô này đã có ${present} danh mục, tối đa ${MONEY_CATEGORY_CAP}. Cất bớt một cái trước.`,
    );
  }

  const ra = await deps.moneyCategories.create(userId, { name, cell, icon, color });
  if (ra === null) throw duplicateNames();
  return ra;
}

export async function renameMoneyCategory(
  deps: MoneyCategoryDeps,
  userId: string,
  id: string,
  dto: { name: unknown; icon?: unknown; color?: unknown },
): Promise<MoneyCategoryRec> {
  const cu = await deps.moneyCategories.findById(id, userId);
  if (cu === null) throw notFound('Không có danh mục nào như vậy.');

  // Trường vắng mặt thì GIỮ giá trị cũ, không xoá về null. Khay sửa tên không gửi icon,
  // và một lần đổi tên không được làm mất cái hình người dùng đã chọn.
  const icon = dto.icon === undefined ? cu.icon : checkIcon(dto.icon);
  const color = dto.color === undefined ? cu.color : checkColor(dto.color);

  const ra = await deps.moneyCategories.rename(id, userId, checkName(dto.name), icon, color);
  if (ra === null) throw duplicateNames();
  if (ra === undefined) throw notFound('Không có danh mục nào như vậy.');
  return ra;
}

export async function archiveMoneyCategory(
  deps: MoneyCategoryDeps,
  userId: string,
  id: string,
): Promise<MoneyCategoryRec> {
  const ra = await deps.moneyCategories.archive(id, userId);
  if (ra === null) throw notFound('Không có danh mục nào như vậy, hoặc nó đã cất rồi.');
  return ra;
}

/**
 * Đọc danh mục cho một khoản sắp ghi, và trả về ô của nó.
 *
 * Ô **luôn** lấy từ danh mục, không lấy từ tham số client gửi lên — giống hệt
 * `readCategory` bên thời gian. Client gửi ô khác với ô của danh mục thì có đúng một
 * trong hai là sai, và danh mục mới là thứ người dùng đã khai.
 */
export async function readMoneyCategory(
  deps: MoneyCategoryDeps,
  userId: string,
  id: unknown,
): Promise<MoneyCategoryRec | null> {
  if (id === null || id === undefined || id === '') return null;
  if (typeof id !== 'string') throw badRequest('categoryId phải là chuỗi.');
  const ra = await deps.moneyCategories.findById(id, userId);
  if (ra === null) throw notFound('Không có danh mục nào như vậy.');
  return ra;
}
