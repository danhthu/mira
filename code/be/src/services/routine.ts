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
import type { RoutineRepository, RoutineRec } from '../database/repositories/RoutineRepository';
import type { TimeEntryRepository } from '../database/repositories/TimeEntryRepository';
import type { TimeBucket } from '../shared/types/enums';
import { TIME_BUCKETS } from '../shared/constants';
import { badRequest, notFound, tierFull } from '../shared/errors';
import { assertDate } from './time';

export interface RoutineDeps {
  readonly routines: RoutineRepository;
  readonly timeEntries: TimeEntryRepository;
}

/**
 * Nếp gắn vào một danh mục thì **lấy tên, ô và cờ giờ vàng từ danh mục đó**, không lấy
 * từ tham số client gửi lên. Đổi tên danh mục thì tên nếp đổi theo — đó là điều người
 * dùng mong đợi khi họ đổi tên một việc họ làm mỗi ngày.
 */
export interface CategoryForRoutine {
  readonly id: string;
  readonly name: string;
  readonly bucket: TimeBucket;
  readonly golden: boolean;
}

/**
 * Trần số nếp đang chạy. Cùng tinh thần với trần mục tiêu và trần thói quen: khai hai
 * mươi nếp thì không còn là khai nếp nữa, là lập thời khoá biểu cho một đời sống tưởng
 * tượng.
 */
export const ROUTINE_CAP = 8;

/** Chỉ sinh bù tối đa ngần này ngày. Xem docblock đầu file. */
const MAX_BACK = 7;

const DAYS_RE = /^[1-7]{1,7}$/;

/** Thứ trong tuần theo ISO: 1 là thứ hai, 7 là chủ nhật. */
const isoWeekday = (ngay: string): number => {
  const d = new Date(`${ngay}T00:00:00Z`).getUTCDay();
  return d === 0 ? 7 : d;
};

const addDaysTo = (ngay: string, n: number): string => {
  const d = new Date(`${ngay}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export async function createRoutine(
  deps: RoutineDeps,
  userId: string,
  dto: { title: string; bucket: unknown; minutes: unknown; golden: unknown; days: unknown },
  categories: CategoryForRoutine | null = null,
): Promise<RoutineRec> {
  const title = categories?.name ?? String(dto.title ?? '').trim();
  if (title === '') throw badRequest('Nếp phải có tên.');
  if (title.length > 120) throw badRequest('Tên nếp dài quá 120 ký tự.');

  const bucket = categories?.bucket ?? dto.bucket;
  if (typeof bucket !== 'string' || !TIME_BUCKETS.includes(bucket as TimeBucket)) {
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

  const busy = await deps.routines.countActive(userId);
  if (busy >= ROUTINE_CAP) {
    throw tierFull(`Đang có ${busy} nếp, tối đa ${ROUTINE_CAP}. Dừng bớt một cái trước.`);
  }

  return deps.routines.create(userId, {
    title,
    bucket: bucket as TimeBucket,
    minutes: dto.minutes,
    golden: (categories?.golden ?? dto.golden === true) && bucket === 'family',
    days: sach,
    categoryId: categories?.id ?? null,
  });
}

export async function endRoutine(
  deps: RoutineDeps,
  userId: string,
  id: string,
): Promise<RoutineRec> {
  const ra = await deps.routines.end(id, userId);
  if (ra === null) throw notFound('Không có nếp nào như vậy, hoặc nó đã dừng rồi.');
  return ra;
}

export interface RoutineDay {
  readonly routineId: string;
  readonly title: string;
  readonly bucket: TimeBucket;
  readonly minutes: number;
  readonly golden: boolean;
  readonly date: string;
  /** 'da-ghi' đã sinh hàng giờ, 'bo-qua' người dùng từ chối. */
  readonly state: 'da-ghi' | 'bo-qua';
}

/**
 * Chạy mọi nếp cho tới hôm nay, sinh hàng giờ cho ngày nào chưa có và chưa bị từ chối.
 *
 * Gọi mỗi lần web mở màn Thời gian. Chạy lại nhiều lần không sinh trùng: chỉ mục duy
 * nhất `(routine_id, date)` là chỗ thật sự chặn, phần kiểm ở đây chỉ để đỡ tốn lệnh ghi.
 */
export async function runRoutines(
  deps: RoutineDeps,
  userId: string,
  homNay: string,
): Promise<RoutineDay[]> {
  assertDate(homNay, 'date');
  const nep = await deps.routines.findActive(userId);
  if (nep.length === 0) return [];

  const tu = addDaysTo(homNay, -(MAX_BACK - 1));
  const [skipped, generated, daCo] = await Promise.all([
    deps.routines.skipsInRange(userId, tu, homNay),
    deps.routines.generatedInRange(userId, tu, homNay),
    deps.timeEntries.findByDateRange(userId, tu, homNay),
  ]);

  // Những việc người dùng ĐÃ TỰ GHI trong khoảng này (không tính hàng nếp sinh).
  //
  // 27/11/2026: nếp chỉ chạy khi mở màn Thời gian, còn phím Ghi nhanh bên Nhật ký vẫn mời
  // "Việc dự án 8h". Chạm phím rồi mở Thời gian là nếp ghi thêm 8h nữa: một ngày 16h
  // làm. Chặn ở đây thì mọi đường ghi — chat, phím, form, app khác sau này — đều không đôi.
  // Người tự ghi là số thật hơn số nếp đoán, kể cả khi họ ghi ít hơn.
  const tuGhi = new Set(
    daCo
      .filter((e) => e.routineId === null)
      .map((e) => khoaViec(e.date, e.categoryId, e.bucket, e.note)),
  );

  const ra: RoutineDay[] = [];

  for (let i = 0; i < MAX_BACK; i += 1) {
    const ngay = addDaysTo(tu, i);
    if (ngay > homNay) break;
    const thu = isoWeekday(ngay);

    for (const n of nep) {
      if (!n.days.includes(String(thu))) continue;
      // Nếp mới khai hôm nay không được tự bịa ra quá khứ của chính nó.
      if (ngay < n.startedOn) continue;

      const khoa = `${n.id}|${ngay}`;
      // Đã tự ghi và nếp chưa sinh: im, không sinh, không hiện. Hiện "bỏ qua / nhận lại" ở
      // đây là mời người ta bấm "nhận lại" rồi đếm đôi.
      if (!generated.has(khoa) && tuGhi.has(khoaViec(ngay, n.categoryId, n.bucket, n.title))) {
        continue;
      }
      if (skipped.has(khoa)) {
        ra.push({ ...rut(n), date: ngay, state: 'bo-qua' });
        continue;
      }
      if (!generated.has(khoa)) {
        await deps.timeEntries.create(userId, {
          date: ngay,
          minutes: n.minutes,
          bucket: n.bucket,
          golden: n.golden,
          note: n.title,
          source: 'nep',
          routineId: n.id,
          categoryId: n.categoryId,
        });
      }
      ra.push({ ...rut(n), date: ngay, state: 'da-ghi' });
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
export async function skipDay(
  deps: RoutineDeps,
  userId: string,
  routineId: string,
  date: string,
): Promise<void> {
  assertDate(date, 'date');
  const n = await deps.routines.findById(routineId, userId);
  if (n === null) throw notFound('Không có nếp nào như vậy.');

  await deps.routines.addSkip(routineId, userId, date);

  const onDay = await deps.timeEntries.findByDate(userId, date);
  for (const e of onDay) {
    if (e.routineId === routineId) await deps.timeEntries.softDelete(userId, e.id);
  }
}

/** Đổi ý: nhận lại một ngày đã từ chối. Lần chạy nếp sau sẽ sinh lại hàng. */
export async function unskipDay(
  deps: RoutineDeps,
  userId: string,
  routineId: string,
  date: string,
): Promise<void> {
  assertDate(date, 'date');
  const n = await deps.routines.findById(routineId, userId);
  if (n === null) throw notFound('Không có nếp nào như vậy.');
  await deps.routines.removeSkip(routineId, userId, date);
}

const rut = (n: RoutineRec) => ({
  routineId: n.id,
  title: n.title,
  bucket: n.bucket,
  minutes: n.minutes,
  golden: n.golden,
});

/**
 * Khoá "việc gì, ngày nào" để so một hàng tự ghi với một nếp.
 *
 * Có danh mục thì so danh mục. Không có thì so ô cộng tên (ghi chú của hàng, tên của nếp),
 * không phân biệt hoa thường: "ăn tối" gõ tay và nếp "Ăn tối" là một việc.
 */
export function khoaViec(
  date: string,
  categoryId: string | null,
  bucket: string,
  ten: string | null,
): string {
  return categoryId !== null
    ? `c|${categoryId}|${date}`
    : `t|${bucket}|${(ten ?? '').trim().toLowerCase()}|${date}`;
}
