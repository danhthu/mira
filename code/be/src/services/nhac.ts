/**
 * Nhắc: hẹn giờ gợi người dùng quay lại ghi.
 *
 * MÁY CHỦ KHÔNG BIẾT MẤY GIỜ, VÀ KHÔNG CẦN BIẾT.
 *
 * Nó chỉ giữ chuỗi "21:00" cùng những thứ trong tuần. Việc so với bây giờ là việc của
 * client — nơi duy nhất biết người dùng đang ở múi giờ nào. Vì thế ở đây **không có**
 * hàm "lời nhắc nào tới hạn": viết được hàm đó nghĩa là đã đoán múi giờ, và đoán sai thì
 * lời nhắc 21:00 nhảy ra lúc 14:00.
 *
 * TRẦN BA LỜI NHẮC.
 * Nhắc nhiều hơn ba lần một ngày thì nó hết là lời nhắc và thành tiếng ồn, mà thứ người
 * ta làm với tiếng ồn là tắt hẳn — mất luôn cả lời nhắc đáng giá.
 */
import type { NhacRepository, NhacRec } from '../database/repositories/NhacRepository';
import { badRequest, notFound, tierFull } from '../shared/errors';

export interface NhacDeps {
  readonly nhac: NhacRepository;
}

export const NHAC_CAP = 3;

const GIO_RE = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
const DAYS_RE = /^[1-7]{1,7}$/;

function kiemGio(raw: unknown): string {
  const gio = String(raw ?? '').trim();
  if (!GIO_RE.test(gio)) throw badRequest('Giờ phải có dạng HH:MM, ví dụ 21:00.');
  return gio;
}

/**
 * Thứ trong tuần. Bỏ trùng và sắp lại, vì "1131" và "13" là cùng một ý định — để nguyên
 * thì hai hàng trông khác nhau mà chạy giống nhau.
 */
function kiemDays(raw: unknown): string {
  const days = String(raw ?? '').trim();
  if (!DAYS_RE.test(days)) throw badRequest('Thứ phải là các số 1–7, ví dụ "12345".');
  return [...new Set(days.split(''))].sort().join('');
}

function kiemLoi(raw: unknown): string | null {
  if (raw === undefined || raw === null) return null;
  const loi = String(raw).trim().replace(/\s+/g, ' ');
  if (loi === '') return null;
  if (loi.length > 120) throw badRequest('Lời nhắc dài quá 120 ký tự.');
  return loi;
}

export async function taoNhac(
  deps: NhacDeps,
  userId: string,
  dto: { gio: unknown; days: unknown; loi: unknown },
): Promise<NhacRec> {
  const dangCo = await deps.nhac.count(userId);
  if (dangCo >= NHAC_CAP) {
    throw tierFull(`Đã có ${dangCo} lời nhắc, tối đa ${NHAC_CAP}. Xoá bớt một cái trước.`);
  }
  return deps.nhac.create(userId, {
    gio: kiemGio(dto.gio),
    days: kiemDays(dto.days),
    loi: kiemLoi(dto.loi),
  });
}

export async function suaNhac(
  deps: NhacDeps,
  userId: string,
  id: string,
  dto: { gio?: unknown; days?: unknown; loi?: unknown; bat?: unknown },
): Promise<NhacRec> {
  const ra = await deps.nhac.update(id, userId, {
    gio: dto.gio === undefined ? undefined : kiemGio(dto.gio),
    days: dto.days === undefined ? undefined : kiemDays(dto.days),
    loi: dto.loi === undefined ? undefined : kiemLoi(dto.loi),
    bat: dto.bat === undefined ? undefined : dto.bat === true,
  });
  if (ra === null) throw notFound('Không có lời nhắc nào như vậy.');
  return ra;
}

export async function xoaNhac(deps: NhacDeps, userId: string, id: string): Promise<NhacRec> {
  const ra = await deps.nhac.softDelete(id, userId);
  if (ra === null) throw notFound('Không có lời nhắc nào như vậy.');
  return ra;
}

/**
 * Bỏ qua một lời nhắc cho **đúng một ngày**.
 *
 * Tách khỏi việc tắt hẳn là có chủ ý: hôm nay bận không phải lý do để bỏ một thói quen
 * đang xây. Giống hệt `nep_bo_qua`, và cố ý giống — hai cơ chế "hôm nay không" khác nhau
 * trong cùng một sản phẩm là thứ người dùng phải học hai lần.
 */
export async function boQuaNhac(
  deps: NhacDeps,
  userId: string,
  id: string,
  date: string,
): Promise<void> {
  const co = await deps.nhac.findById(id, userId);
  if (co === null) throw notFound('Không có lời nhắc nào như vậy.');
  await deps.nhac.themBoQua(id, userId, date);
}
