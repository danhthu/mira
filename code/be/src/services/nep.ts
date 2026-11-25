/**
 * Nếp: khai một luật, Mira tự ghi, người dùng từ chối khi không đạt.
 *
 * ĐẢO NGƯỢC MẶC ĐỊNH, VÀ ĐÓ LÀ CẢ Ý TƯỞNG
 *
 * App thói quen thường bắt **tick để xác nhận đã làm**. Mira làm ngược: việc đã khai là
 * nếp thì mặc định **coi như đã làm**, người dùng chỉ động tay khi **không** làm. Giảm
 * ma sát ghi là đòn bẩy +39% trong mô phỏng 300 persona, và cách giảm mạnh nhất là bỏ
 * hẳn thao tác cho trường hợp thường gặp.
 *
 * CHỖ NGUY HIỂM, VÀ CÁI CHẶN
 *
 * Tự ghi hộ là con dao hai lưỡi. Người bỏ app ba tháng rồi quay lại, nếu Mira sinh đủ
 * chín mươi ngày "đã ăn tối, đã ngủ" thì nhật ký của họ thành tiểu thuyết, và mọi con số
 * phía sau — donut, màn Sáu tháng, mức thường — đều dựng trên chuyện bịa.
 *
 * Nên có hai cái chặn:
 *
 *   TRẦN LÙI NGÀY. Chỉ sinh cho tối đa `TOI_DA_LUI` ngày gần nhất. Vắng lâu hơn thì
 *   quãng đó **để trống**, vì để trống là thật còn điền bừa là nói dối.
 *
 *   SOURCE RIÊNG. Hàng do nếp sinh mang `source = 'nep'`, không phải `'manual'`. Giao
 *   diện phân biệt được số người gõ với số máy suy ra, và sau này muốn loại chúng khỏi
 *   một phép tính nào đó thì vẫn còn đường.
 *
 * Nếp **không thay thế** dữ liệu. Mỗi ngày nếp chạy vẫn sinh một hàng `time_entry` thật,
 * sửa được, xoá được, xuất ra file được. Luật chỉ đỡ việc gõ.
 */
import type { NepRepository, NepRec } from '../database/repositories/NepRepository';
import type { TimeEntryRepository } from '../database/repositories/TimeEntryRepository';
import type { TimeBucket } from '../shared/types/enums';
import { TIME_BUCKETS } from '../shared/constants';
import { badRequest, notFound, tierFull } from '../shared/errors';
import { assertDate } from './time';

export interface NepDeps {
  readonly nep: NepRepository;
  readonly timeEntries: TimeEntryRepository;
}

/**
 * Trần số nếp đang chạy. Cùng tinh thần với trần mục tiêu và trần thói quen: khai hai
 * mươi nếp thì không còn là khai nếp nữa, là lập thời khoá biểu cho một đời sống tưởng
 * tượng.
 */
export const NEP_CAP = 8;

/** Chỉ sinh bù tối đa ngần này ngày. Xem docblock đầu file. */
const TOI_DA_LUI = 7;

const DAYS_RE = /^[1-7]{1,7}$/;

/** Thứ trong tuần theo ISO: 1 là thứ hai, 7 là chủ nhật. */
const thuIso = (ngay: string): number => {
  const d = new Date(`${ngay}T00:00:00Z`).getUTCDay();
  return d === 0 ? 7 : d;
};

const themNgay = (ngay: string, n: number): string => {
  const d = new Date(`${ngay}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export async function taoNep(
  deps: NepDeps,
  userId: string,
  dto: { title: string; bucket: unknown; minutes: unknown; golden: unknown; days: unknown },
): Promise<NepRec> {
  const title = String(dto.title ?? '').trim();
  if (title === '') throw badRequest('Nếp phải có tên.');
  if (title.length > 120) throw badRequest('Tên nếp dài quá 120 ký tự.');

  if (typeof dto.bucket !== 'string' || !TIME_BUCKETS.includes(dto.bucket as TimeBucket)) {
    throw badRequest(`bucket phải là một trong: ${TIME_BUCKETS.join(', ')}`);
  }
  if (typeof dto.minutes !== 'number' || !Number.isInteger(dto.minutes) || dto.minutes <= 0) {
    throw badRequest('Số phút phải là số nguyên dương.');
  }
  if (dto.minutes > 1440) throw badRequest('Một nếp không dài hơn một ngày.');

  const days = String(dto.days ?? '');
  if (!DAYS_RE.test(days)) {
    throw badRequest('days phải là chuỗi các số 1–7, ví dụ "1234567" cho mỗi ngày.');
  }
  // Trùng thứ thì dọn, để "1123" không thành hai lần thứ hai.
  const sach = [...new Set(days.split(''))].sort().join('');

  const dangChay = await deps.nep.countActive(userId);
  if (dangChay >= NEP_CAP) {
    throw tierFull(`Đang có ${dangChay} nếp, tối đa ${NEP_CAP}. Dừng bớt một cái trước.`);
  }

  return deps.nep.create(userId, {
    title,
    bucket: dto.bucket as TimeBucket,
    minutes: dto.minutes,
    golden: dto.golden === true && dto.bucket === 'family',
    days: sach,
  });
}

export async function dungNep(deps: NepDeps, userId: string, id: string): Promise<NepRec> {
  const ra = await deps.nep.end(id, userId);
  if (ra === null) throw notFound('Không có nếp nào như vậy, hoặc nó đã dừng rồi.');
  return ra;
}

export interface NgayCuaNep {
  readonly nepId: string;
  readonly title: string;
  readonly bucket: TimeBucket;
  readonly minutes: number;
  readonly golden: boolean;
  readonly date: string;
  /** 'da-ghi' đã sinh hàng giờ, 'bo-qua' người dùng từ chối. */
  readonly trangThai: 'da-ghi' | 'bo-qua';
}

/**
 * Chạy mọi nếp cho tới hôm nay, sinh hàng giờ cho ngày nào chưa có và chưa bị từ chối.
 *
 * Gọi mỗi lần web mở màn Thời gian. Chạy lại nhiều lần không sinh trùng: chỉ mục duy
 * nhất `(nep_id, date)` là chỗ thật sự chặn, phần kiểm ở đây chỉ để đỡ tốn lệnh ghi.
 */
export async function chayNep(
  deps: NepDeps,
  userId: string,
  homNay: string,
): Promise<NgayCuaNep[]> {
  assertDate(homNay, 'date');
  const nep = await deps.nep.findActive(userId);
  if (nep.length === 0) return [];

  const tu = themNgay(homNay, -(TOI_DA_LUI - 1));
  const [daBoQua, daSinh] = await Promise.all([
    deps.nep.boQuaTrongKhoang(userId, tu, homNay),
    deps.nep.daSinhTrongKhoang(userId, tu, homNay),
  ]);

  const ra: NgayCuaNep[] = [];

  for (let i = 0; i < TOI_DA_LUI; i += 1) {
    const ngay = themNgay(tu, i);
    if (ngay > homNay) break;
    const thu = thuIso(ngay);

    for (const n of nep) {
      if (!n.days.includes(String(thu))) continue;
      // Nếp mới khai hôm nay không được tự bịa ra quá khứ của chính nó.
      if (ngay < n.startedOn) continue;

      const khoa = `${n.id}|${ngay}`;
      if (daBoQua.has(khoa)) {
        ra.push({ ...rut(n), date: ngay, trangThai: 'bo-qua' });
        continue;
      }
      if (!daSinh.has(khoa)) {
        await deps.timeEntries.create(userId, {
          date: ngay,
          minutes: n.minutes,
          bucket: n.bucket,
          golden: n.golden,
          note: n.title,
          source: 'nep',
          nepId: n.id,
        });
      }
      ra.push({ ...rut(n), date: ngay, trangThai: 'da-ghi' });
    }
  }

  return ra;
}

/**
 * Từ chối một ngày: xoá hàng giờ nếp đã sinh, và nhớ là đã từ chối để không sinh lại.
 *
 * Hai việc phải đi cùng nhau. Chỉ xoá hàng thì lần mở app sau nếp sinh lại ngay, và
 * người dùng từ chối mãi không xong.
 */
export async function tuChoiNgay(
  deps: NepDeps,
  userId: string,
  nepId: string,
  date: string,
): Promise<void> {
  assertDate(date, 'date');
  const n = await deps.nep.findById(nepId, userId);
  if (n === null) throw notFound('Không có nếp nào như vậy.');

  await deps.nep.themBoQua(nepId, userId, date);

  const trongNgay = await deps.timeEntries.findByDate(userId, date);
  for (const e of trongNgay) {
    if (e.nepId === nepId) await deps.timeEntries.softDelete(userId, e.id);
  }
}

/** Đổi ý: nhận lại một ngày đã từ chối. Lần chạy nếp sau sẽ sinh lại hàng. */
export async function nhanLaiNgay(
  deps: NepDeps,
  userId: string,
  nepId: string,
  date: string,
): Promise<void> {
  assertDate(date, 'date');
  const n = await deps.nep.findById(nepId, userId);
  if (n === null) throw notFound('Không có nếp nào như vậy.');
  await deps.nep.xoaBoQua(nepId, userId, date);
}

const rut = (n: NepRec) => ({
  nepId: n.id,
  title: n.title,
  bucket: n.bucket,
  minutes: n.minutes,
  golden: n.golden,
});
