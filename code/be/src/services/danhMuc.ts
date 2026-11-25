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
import type { DanhMucRepository, DanhMucRec } from '../database/repositories/DanhMucRepository';
import type { TimeBucket } from '../shared/types/enums';
import { TIME_BUCKETS } from '../shared/constants';
import { badRequest, notFound, tierFull } from '../shared/errors';
import { DomainError } from '../shared/errors';

export interface DanhMucDeps {
  readonly danhMuc: DanhMucRepository;
}

/**
 * Trần danh mục **mỗi ô**, không phải tổng.
 *
 * Đặt theo ô vì chỗ phải đọc là danh sách bên trong một lát donut. Sáu dòng còn liếc
 * một cái là hết; hai mươi dòng thì lại thành cái danh sách mà việc gom nếp vừa dẹp đi.
 */
export const DANH_MUC_CAP = 6;

const trungTen = () =>
  new DomainError('name_taken', 409, 'Ô này đã có danh mục tên như vậy rồi.');

function kiemTen(raw: unknown): string {
  const ten = String(raw ?? '').trim().replace(/\s+/g, ' ');
  if (ten === '') throw badRequest('Danh mục phải có tên.');
  if (ten.length > 60) throw badRequest('Tên danh mục dài quá 60 ký tự.');
  return ten;
}

export async function taoDanhMuc(
  deps: DanhMucDeps,
  userId: string,
  dto: { name: unknown; bucket: unknown; golden: unknown },
): Promise<DanhMucRec> {
  const name = kiemTen(dto.name);

  if (typeof dto.bucket !== 'string' || !TIME_BUCKETS.includes(dto.bucket as TimeBucket)) {
    throw badRequest(`bucket phải là một trong: ${TIME_BUCKETS.join(', ')}`);
  }
  const bucket = dto.bucket as TimeBucket;

  const dangCo = await deps.danhMuc.countInBucket(userId, bucket);
  if (dangCo >= DANH_MUC_CAP) {
    throw tierFull(
      `Ô này đã có ${dangCo} danh mục, tối đa ${DANH_MUC_CAP}. Cất bớt một cái trước.`,
    );
  }

  // Giờ vàng chỉ có nghĩa trong ô gia đình. Ở ô khác thì lặng lẽ bỏ cờ, không báo lỗi:
  // người dùng tick nhầm một ô không phải lý do chặn họ lại.
  const ra = await deps.danhMuc.create(userId, {
    name,
    bucket,
    golden: dto.golden === true && bucket === 'family',
  });
  if (ra === null) throw trungTen();
  return ra;
}

export async function doiTenDanhMuc(
  deps: DanhMucDeps,
  userId: string,
  id: string,
  dto: { name: unknown; golden: unknown },
): Promise<DanhMucRec> {
  const cu = await deps.danhMuc.findById(id, userId);
  if (cu === null) throw notFound('Không có danh mục nào như vậy.');

  const ra = await deps.danhMuc.rename(
    id,
    userId,
    kiemTen(dto.name),
    dto.golden === true && cu.bucket === 'family',
  );
  if (ra === null) throw trungTen();
  if (ra === undefined) throw notFound('Không có danh mục nào như vậy.');
  return ra;
}

export async function catDanhMuc(
  deps: DanhMucDeps,
  userId: string,
  id: string,
): Promise<DanhMucRec> {
  const ra = await deps.danhMuc.archive(id, userId);
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
export async function docDanhMuc(
  deps: DanhMucDeps,
  userId: string,
  id: unknown,
): Promise<DanhMucRec | null> {
  if (id === null || id === undefined || id === '') return null;
  if (typeof id !== 'string') throw badRequest('danhMucId phải là chuỗi.');
  const ra = await deps.danhMuc.findById(id, userId);
  if (ra === null) throw notFound('Không có danh mục nào như vậy.');
  return ra;
}
