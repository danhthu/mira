import type { Moment, TimeBucket, TimeEntry } from '@mira/contract';

/**
 * Bộ dò sự kiện cho màn "Sáu tháng của bạn".
 *
 * Cổng từ `code/tools/cau-chuyen.mjs`, nơi nó đã chạy trên 300 persona. Kết quả đo được
 * ở đó quyết định hình dạng màn này:
 *
 *   Bắt được **38%** biến cố thật, nhưng **93%** những gì nói ra là đúng.
 *
 * Hai con số đó dẫn tới hai luật, và cả hai đều đi ngược bản năng:
 *
 *   KHÔNG HẠ NGƯỠNG ĐỂ BẮT NHIỀU HƠN. Nói sai đắt hơn im lặng. Một dòng bịa làm hỏng
 *   niềm tin vào cả hai mươi lăm dòng còn lại.
 *
 *   PHẢI CÂN LẠI BẰNG TAY. Dữ liệu Mira lệch nặng sang tin xấu: bắt tin xấu 68%, tin vui
 *   chỉ 12%. Để nguyên thì màn này thành bản cáo trạng sáu tháng. Nên tuần tốt tô xanh,
 *   tuần nặng tô vàng, và tuần tốt được ưu tiên giữ lại khi phải cắt bớt.
 */

export type Tone = 'vui' | 'nang';

export interface TuanDangKe {
  /** Số thứ tự tuần trong kỳ, bắt đầu từ 1. */
  readonly so: number;
  readonly batDau: string;
  readonly tone: Tone;
  readonly cau: string;
  readonly keo: number;
  readonly muoi: number;
}

export interface CauChuyen {
  readonly tuan: readonly TuanDangKe[];
  /** Số tuần có đủ dữ liệu để nhìn (ghi từ 3 ngày trở lên). */
  readonly tuanNhinThay: number;
  readonly tongTuan: number;
  /** Chưa đủ dữ liệu thì không đoán. */
  readonly mu: boolean;
}

interface SoTuan {
  batDau: string;
  ngayGhi: number;
  work: number;
  family: number;
  personal: number;
  waste: number;
  golden: number;
}

const TEN: Record<TimeBucket | 'golden', string> = {
  work: 'Công việc',
  family: 'Giờ gia đình',
  personal: 'Giờ cá nhân',
  waste: 'Giờ lãng phí',
  golden: 'Giờ vàng',
};

/** Nhóm nào tăng là tin vui, nhóm nào tăng là tin nặng. */
const TANG_LA_VUI: Record<keyof typeof TEN, boolean> = {
  work: false,
  family: true,
  personal: true,
  waste: false,
  golden: true,
};

const SO_NHOM = ['work', 'family', 'personal', 'waste', 'golden'] as const;

/** Phải nhìn được ít nhất ngần này tuần thì mức thường mới có nghĩa. */
const TOI_THIEU_TUAN = 6;
/** Tuần nào ghi dưới ngần này ngày thì không tính vào mức thường. */
const TOI_THIEU_NGAY = 3;
/** Lệch phải đủ cả hai: ít nhất 40% và ít nhất 2 giờ so với mức thường của chính người đó. */
const NGUONG_TY_LE = 0.4;
const NGUONG_PHUT = 120;
/** Tối đa bao nhiêu tuần được kể. Dài hơn thì không còn là một câu chuyện. */
const TOI_DA_KE = 6;

const thuHai = (ngay: string): string => {
  const d = new Date(`${ngay}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
};

function trungVi(xs: readonly number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const giua = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? (s[giua] ?? 0) : ((s[giua - 1] ?? 0) + (s[giua] ?? 0)) / 2;
}

const gio = (phut: number): string => {
  const h = Math.floor(phut / 60);
  const m = Math.round(phut % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${String(m).padStart(2, '0')}m`;
};

const phanTram = (x: number): string => `${Math.round(Math.abs(x) * 100)}%`;

export function doCauChuyen(
  entries: readonly TimeEntry[],
  moments: readonly Moment[],
): CauChuyen {
  const theoTuan = new Map<string, SoTuan>();
  const ngayCuaTuan = new Map<string, Set<string>>();

  for (const e of entries) {
    const w = thuHai(e.date);
    const t =
      theoTuan.get(w) ??
      { batDau: w, ngayGhi: 0, work: 0, family: 0, personal: 0, waste: 0, golden: 0 };
    t[e.bucket] += e.minutes;
    if (e.golden) t.golden += e.minutes;
    theoTuan.set(w, t);
    const ngay = ngayCuaTuan.get(w) ?? new Set<string>();
    ngay.add(e.date);
    ngayCuaTuan.set(w, ngay);
  }
  for (const [w, t] of theoTuan) t.ngayGhi = ngayCuaTuan.get(w)?.size ?? 0;

  const moi = [...theoTuan.values()].sort((a, b) => a.batDau.localeCompare(b.batDau));
  const nhinThay = moi.filter((t) => t.ngayGhi >= TOI_THIEU_NGAY);

  if (nhinThay.length < TOI_THIEU_TUAN) {
    return { tuan: [], tuanNhinThay: nhinThay.length, tongTuan: moi.length, mu: true };
  }

  const nen: Record<string, number> = {};
  for (const k of SO_NHOM) nen[k] = trungVi(nhinThay.map((t) => t[k]));

  const hat = new Map<string, { keo: number; muoi: number }>();
  for (const m of moments) {
    const w = thuHai(m.date);
    const h = hat.get(w) ?? { keo: 0, muoi: 0 };
    if (m.kind === 'candy') h.keo += 1;
    else h.muoi += 1;
    hat.set(w, h);
  }

  const thoKe: TuanDangKe[] = [];

  for (const t of nhinThay) {
    const phan: { chu: string; vui: boolean }[] = [];

    for (const k of SO_NHOM) {
      const mucThuong = nen[k] ?? 0;
      if (mucThuong <= 0) continue;
      const lech = (t[k] - mucThuong) / mucThuong;
      const cach = t[k] - mucThuong;
      if (Math.abs(lech) < NGUONG_TY_LE || Math.abs(cach) < NGUONG_PHUT) continue;

      const len = cach > 0;
      phan.push({
        chu: `${TEN[k]} ${len ? 'vọt lên' : 'tụt còn'} ${gio(t[k])}, ${
          len ? 'cao hơn' : 'thấp hơn'
        } mức thường ${phanTram(lech)}`,
        vui: len === TANG_LA_VUI[k],
      });
    }

    const h = hat.get(t.batDau) ?? { keo: 0, muoi: 0 };
    if (phan.length === 0) continue;

    const gioNang = phan.some((p) => !p.vui);
    // Hai hạt muối trở lên thì tuần đó là tuần nặng, bất kể số giờ nói gì. Hạt là người
    // dùng tự chấm; số giờ chỉ là thứ nhìn từ bên ngoài. Người ở trong tuần đó nói nặng
    // thì nó nặng.
    const nang = h.muoi >= 2 || gioNang;

    // Nhưng nếu nặng CHỈ vì hạt, phải nói ra. Không thì thẻ tô vàng mà câu toàn tin vui,
    // và người đọc chỉ thấy màu cãi nhau với chữ.
    const cau = `${phan.map((p) => p.chu).join('; ')}.${
      nang && !gioNang ? ` Số giờ thì nhẹ, nhưng tuần đó bạn bỏ ${h.muoi} hạt muối vào hũ.` : ''
    }`;

    thoKe.push({
      so: moi.indexOf(t) + 1,
      batDau: t.batDau,
      tone: nang ? 'nang' : 'vui',
      cau,
      keo: h.keo,
      muoi: h.muoi,
    });
  }

  return {
    tuan: catBot(thoKe),
    tuanNhinThay: nhinThay.length,
    tongTuan: moi.length,
    mu: false,
  };
}

/**
 * Cắt xuống TOI_DA_KE tuần, **giữ lại tuần vui trước**.
 *
 * Không phải để làm đẹp. Bộ dò bắt tin xấu 68% còn tin vui 12%, nên cắt theo thứ tự thời
 * gian là gần như chỉ còn tin xấu — một bản cáo trạng sáu tháng, và đó là sai lệch của
 * công cụ đo chứ không phải của cuộc đời người dùng.
 */
function catBot(tuan: readonly TuanDangKe[]): TuanDangKe[] {
  if (tuan.length <= TOI_DA_KE) return [...tuan];
  const vui = tuan.filter((t) => t.tone === 'vui');
  const nang = tuan.filter((t) => t.tone === 'nang');
  const lay = [...vui.slice(0, Math.ceil(TOI_DA_KE / 2)), ...nang];
  return lay.slice(0, TOI_DA_KE).sort((a, b) => a.so - b.so);
}
