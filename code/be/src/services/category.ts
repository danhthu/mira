/**
 * Danh mục: tên việc do người dùng đặt, nằm bên trong một trong bốn ô.
 *
 * Bốn ô giữ nguyên vì chúng gánh ba lời hứa của sản phẩm — giờ vàng, luật khai nguồn
 * cho mục tiêu, và cách màn Sáu tháng phán tuần vui hay nặng. Danh mục chỉ thêm một
 * tầng tên bên dưới, nên mọi công thức không phải đổi một dòng nào: chúng vẫn chỉ nhìn
 * `bucket`.
 *
 * DANH MỤC LÀ TUỲ CHỌN. Ghi một giờ mà không chọn danh mục vẫn hợp lệ. Bắt phân loại là
 * thêm ma sát ghi, mà giảm ma sát mới là đòn bẩy +39%.
 *
 * CẤT ĐI, KHÔNG XOÁ. Danh mục đã dùng rồi thì mục giờ cũ còn trỏ về nó. Xoá là sửa lịch
 * sử; cất đi thì nó biến khỏi danh sách chọn mà số cũ vẫn đọc được.
 */
import type { CategoryRepository, CategoryRec } from '../database/repositories/CategoryRepository';
import type { TimeBucket } from '../shared/types/enums';
import { TIME_BUCKETS } from '../shared/constants';
import { badRequest, notFound, tierFull } from '../shared/errors';
// Hai hàm kiểm khoá dùng chung với danh mục tiền — cùng bảng hình, cùng bảng màu, nên
// cùng một chỗ kiểm. Chép sang đây là mở đường cho hai bên nhận hai danh sách khác nhau.
import { checkColor, checkIcon } from './moneyCategory';
import { DomainError } from '../shared/errors';

export interface CategoryDeps {
  readonly categories: CategoryRepository;
}

/**
 * Trần danh mục **mỗi ô**, không phải tổng.
 *
 * Đặt theo ô vì chỗ phải đọc là danh sách bên trong một lát donut. Sáu dòng còn liếc
 * một cái là hết; hai mươi dòng thì lại thành cái danh sách mà việc gom nếp vừa dẹp đi.
 */
export const CATEGORY_CAP = 6;

const duplicateNames = () =>
  new DomainError('name_taken', 409, 'Ô này đã có danh mục tên như vậy rồi.');

function checkName(raw: unknown): string {
  const ten = String(raw ?? '').trim().replace(/\s+/g, ' ');
  if (ten === '') throw badRequest('Danh mục phải có tên.');
  if (ten.length > 60) throw badRequest('Tên danh mục dài quá 60 ký tự.');
  return ten;
}

export async function createCategory(
  deps: CategoryDeps,
  userId: string,
  dto: { name: unknown; bucket: unknown; golden: unknown; icon?: unknown; color?: unknown },
): Promise<CategoryRec> {
  const name = checkName(dto.name);

  if (typeof dto.bucket !== 'string' || !TIME_BUCKETS.includes(dto.bucket as TimeBucket)) {
    throw badRequest(`bucket phải là một trong: ${TIME_BUCKETS.join(', ')}`);
  }
  const bucket = dto.bucket as TimeBucket;

  const present = await deps.categories.countInBucket(userId, bucket);
  if (present >= CATEGORY_CAP) {
    throw tierFull(
      `Ô này đã có ${present} danh mục, tối đa ${CATEGORY_CAP}. Cất bớt một cái trước.`,
    );
  }

  // Giờ vàng chỉ có nghĩa trong ô gia đình. Ở ô khác thì lặng lẽ bỏ cờ, không báo lỗi:
  // người dùng tick nhầm một ô không phải lý do chặn họ lại.
  const ra = await deps.categories.create(userId, {
    name,
    bucket,
    golden: dto.golden === true && bucket === 'family',
    icon: checkIcon(dto.icon),
    color: checkColor(dto.color),
  });
  if (ra === null) throw duplicateNames();
  return ra;
}

export async function renameCategory(
  deps: CategoryDeps,
  userId: string,
  id: string,
  dto: { name: unknown; golden: unknown; icon?: unknown; color?: unknown },
): Promise<CategoryRec> {
  const cu = await deps.categories.findById(id, userId);
  if (cu === null) throw notFound('Không có danh mục nào như vậy.');

  const ra = await deps.categories.rename(
    id,
    userId,
    checkName(dto.name),
    dto.golden === true && cu.bucket === 'family',
    // Vắng mặt thì GIỮ cái cũ — xem lý do ở `renameMoneyCategory`.
    dto.icon === undefined ? cu.icon : checkIcon(dto.icon),
    dto.color === undefined ? cu.color : checkColor(dto.color),
  );
  if (ra === null) throw duplicateNames();
  if (ra === undefined) throw notFound('Không có danh mục nào như vậy.');
  return ra;
}

export async function archiveCategory(
  deps: CategoryDeps,
  userId: string,
  id: string,
): Promise<CategoryRec> {
  const ra = await deps.categories.archive(id, userId);
  if (ra === null) throw notFound('Không có danh mục nào như vậy, hoặc nó đã cất rồi.');
  return ra;
}

/**
 * Đọc danh mục cho một mục giờ sắp ghi, và trả về ô kèm cờ giờ vàng của nó.
 *
 * Ô **luôn** lấy từ danh mục, không lấy từ tham số client gửi lên: nếu client gửi ô khác
 * với ô của danh mục thì có đúng một trong hai là sai, và danh mục mới là thứ người dùng
 * đã khai.
 */
export async function readCategory(
  deps: CategoryDeps,
  userId: string,
  id: unknown,
): Promise<CategoryRec | null> {
  if (id === null || id === undefined || id === '') return null;
  if (typeof id !== 'string') throw badRequest('danhMucId phải là chuỗi.');
  const ra = await deps.categories.findById(id, userId);
  if (ra === null) throw notFound('Không có danh mục nào như vậy.');
  return ra;
}
