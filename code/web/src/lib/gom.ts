import type { TimeEntry } from '@mira/contract';

/**
 * Gom các mục lặp lại thành một dòng.
 *
 * BÀI TOÁN
 * Màn Cá nhân đang có 28 dòng "Ăn tối 30m" giống hệt nhau. Hai mươi tám dòng chở đúng
 * một bit thông tin. Cuộn hết trang cũng không biết thêm điều gì.
 *
 * GOM Ở ĐÂU: LÚC HIỆN, KHÔNG PHẢI LÚC GHI
 * Đây là chỗ dễ chọn sai nhất, và ba ngành khác đã trả giá rồi:
 *
 *   rsyslog có tuỳ chọn gộp ngay lúc ghi ("last message repeated N times") và **mặc định
 *   tắt**, vì công cụ phân tích phía sau không đọc được định dạng đó. Gộp lúc ghi là mất
 *   dữ liệu gốc.
 *
 *   Lịch (RFC 5545) đi đường ngược lại: lưu một luật RRULE rồi vá bằng EXDATE và các bản
 *   ghi đè. CalConnect cảnh báo thẳng: sửa riêng đủ nhiều ngày thì khối dữ liệu phình to
 *   hơn cả việc lưu từng ngày, mà độ phức tạp thì gấp mấy lần.
 *
 *   App ngân hàng (Plaid, Monarch) **không đổi mô hình lưu**. Mỗi giao dịch vẫn là một
 *   bản ghi; chúng chỉ *suy ra* nếp khi hiện, và cho bấm vào xem lại từng giao dịch.
 *
 * Mira theo đường thứ ba. Mỗi ngày vẫn là một bản ghi thật, sửa một ngày không đụng ngày
 * khác, xuất file vẫn đơn giản. Chỉ màn hình gom lại.
 *
 * ĐIỀU ĐÁNG XEM LÀ CHỖ NẾP ĐỨT
 * Một nếp đều tăm tắp chẳng kể được chuyện gì. Chuyện nằm ở ngày khác thường. Nên nhóm
 * ở đây không gom theo số phút — nó gom theo **việc**, rồi tìm số phút hay gặp nhất, rồi
 * tách riêng những ngày lệch. Gom theo số phút thì đúng mấy ngày đáng nói nhất lại rơi
 * ra ngoài nhóm và nằm lẫn vào danh sách.
 *
 * Cách này mượn của ngân hàng: nhóm theo tên đã chuẩn hoá, cho số tiền xê dịch trong một
 * biên, và một lần đổi rồi ổn định thì đọc là *đổi giá*, không phải một khoản mới.
 */

export interface NhomMuc {
  /** Khoá gom: nhóm việc, ghi chú, có phải giờ vàng không. */
  readonly bucket: TimeEntry['bucket'];
  readonly note: string;
  readonly danhMucId: string | null;
  readonly golden: boolean;
  /**
   * Nếp **cứng** hay **mềm**.
   *
   * Cứng: hầu hết ngày cùng một số, vài ngày lệch. Nói "30m mỗi ngày, trừ 2 ngày".
   * Mềm: số nào cũng khác. Nói khoảng và trung bình, **đừng** gọi 17 trên 24 ngày là
   * ngoại lệ — nhiều đến thế thì không còn gì để làm chuẩn mà lệch.
   *
   * Ngân hàng tách đúng hai loại này: thuê bao cố định so với hoá đơn thay đổi.
   */
  readonly deu: boolean;
  /** Số phút hay gặp nhất. Chỉ có nghĩa khi `deu`. */
  readonly phutThuong: number;
  readonly phutNhoNhat: number;
  readonly phutLonNhat: number;
  readonly phutTrungBinh: number;
  readonly soLan: number;
  readonly tuNgay: string;
  readonly denNgay: string;
  readonly tongPhut: number;
  /** Những ngày lệch khỏi `phutThuong`. Chỉ đáng hiện khi `deu`. */
  readonly ngayKhac: readonly TimeEntry[];
  /** Mọi mục trong nhóm, đã xếp mới nhất trước, cho lúc người dùng mở ra xem. */
  readonly muc: readonly TimeEntry[];
}

/** Dưới ngưỡng này thì để nguyên từng dòng: hai lần chưa phải một nếp. */
const TOI_THIEU = 3;

/**
 * Quá tỉ lệ này ngày lệch thì coi là nếp mềm.
 *
 * Một phần ba là con số chọn tay, không phải số đo được. Nhưng hướng thì chắc: khi
 * "ngoại lệ" chiếm phần lớn thì cái gọi là chuẩn chỉ là giá trị hay gặp nhất trong một
 * đống số khác nhau, và bày nó ra như một chuẩn là bịa ra một nếp không có thật.
 */
const NGUONG_DEU = 1 / 3;

/**
 * Khoá gom. **Danh mục thắng ghi chú**: danh mục là thứ người dùng đã khai là "việc gì",
 * còn ghi chú là lời riêng cho một ngày. Gom theo ghi chú khi đã có danh mục thì hai
 * buổi "Ăn tối" khác lời nhận xét lại thành hai nếp khác nhau.
 */
const khoaCua = (e: TimeEntry): string =>
  e.danhMucId !== null
    ? `dm:${e.danhMucId}|${e.golden ? 'v' : ''}`
    : `${e.bucket}|${(e.note ?? '').trim().toLowerCase()}|${e.golden ? 'v' : ''}`;

/**
 * Trả về danh sách đã trộn: nhóm nào đủ lặp thì thành một `NhomMuc`, còn lại giữ nguyên
 * từng mục. Thứ tự theo ngày mới nhất của mỗi phần tử, để dòng gom không nhảy lên đầu
 * chỉ vì nó gom nhiều.
 */
export function gomMuc(entries: readonly TimeEntry[]): (NhomMuc | TimeEntry)[] {
  const theoKhoa = new Map<string, TimeEntry[]>();
  for (const e of entries) {
    const k = khoaCua(e);
    const cu = theoKhoa.get(k);
    if (cu === undefined) theoKhoa.set(k, [e]);
    else cu.push(e);
  }

  const ra: (NhomMuc | TimeEntry)[] = [];
  for (const nhom of theoKhoa.values()) {
    if (nhom.length < TOI_THIEU) {
      ra.push(...nhom);
      continue;
    }
    const muc = [...nhom].sort((a, b) => b.date.localeCompare(a.date));
    const phut = muc.map((e) => e.minutes);
    const phutThuong = hayGapNhat(phut);
    const dau = muc[muc.length - 1];
    const cuoi = muc[0];
    if (dau === undefined || cuoi === undefined) continue;

    const ngayKhac = muc.filter((e) => e.minutes !== phutThuong);
    const tongPhut = phut.reduce((t, n) => t + n, 0);

    ra.push({
      bucket: cuoi.bucket,
      note: (cuoi.note ?? '').trim(),
      danhMucId: cuoi.danhMucId,
      golden: cuoi.golden,
      deu: ngayKhac.length <= muc.length * NGUONG_DEU,
      phutThuong,
      phutNhoNhat: Math.min(...phut),
      phutLonNhat: Math.max(...phut),
      phutTrungBinh: Math.round(tongPhut / muc.length),
      soLan: muc.length,
      tuNgay: dau.date,
      denNgay: cuoi.date,
      tongPhut,
      ngayKhac,
      muc,
    });
  }

  return ra.sort((a, b) => ngayMoiNhat(b).localeCompare(ngayMoiNhat(a)));
}

export const laNhom = (x: NhomMuc | TimeEntry): x is NhomMuc => 'soLan' in x;

const ngayMoiNhat = (x: NhomMuc | TimeEntry): string => (laNhom(x) ? x.denNgay : x.date);

/** Giá trị xuất hiện nhiều nhất. Hoà thì lấy giá trị nhỏ hơn, để kết quả không đổi theo thứ tự. */
function hayGapNhat(so: readonly number[]): number {
  const dem = new Map<number, number>();
  for (const n of so) dem.set(n, (dem.get(n) ?? 0) + 1);
  let tot = so[0] ?? 0;
  let nhieuNhat = 0;
  for (const [giaTri, lan] of [...dem.entries()].sort((a, b) => a[0] - b[0])) {
    if (lan > nhieuNhat) {
      nhieuNhat = lan;
      tot = giaTri;
    }
  }
  return tot;
}

/** "mọi ngày" khi nhóm phủ kín khoảng, không thì "21 trong 28 ngày". */
export function nhipCua(nhom: NhomMuc): string {
  const soNgayTrongKhoang =
    Math.round(
      (Date.parse(`${nhom.denNgay}T00:00:00Z`) - Date.parse(`${nhom.tuNgay}T00:00:00Z`)) /
        86_400_000,
    ) + 1;
  if (nhom.soLan >= soNgayTrongKhoang) return 'mỗi ngày';
  if (soNgayTrongKhoang >= 7 && nhom.soLan * 7 >= soNgayTrongKhoang * 6) return 'gần như mỗi ngày';
  return `${nhom.soLan} trong ${soNgayTrongKhoang} ngày`;
}
