/**
 * Đọc một câu tiếng Việt thành ý định có cấu trúc — bằng luật, không gọi mạng.
 *
 * VÌ SAO CÓ TẦNG LUẬT TRƯỚC KHI GỌI LLM
 *
 * Vốn từ của Mira rất hẹp: bốn ô, năm ô tiền, kẹo hoặc muối, và danh mục do chính người
 * dùng đặt. Phần lớn câu người ta gõ là một con số cộng một đơn vị cộng một từ khoá. Gọi
 * LLM cho những câu đó là trả tiền và trả độ trễ cho một việc `RegExp` làm xong trong
 * một mili giây.
 *
 * Quan trọng hơn: tầng luật **chạy được khi chưa có khoá API**. Nếu cả tính năng chỉ sống
 * nhờ LLM thì nó chết ngay lúc chưa cấu hình, và Mira đã có một tính năng như vậy rồi
 * (đăng nhập Google). Hai cái thì quá nhiều.
 *
 * LUẬT CỨNG: HÀM NÀY KHÔNG BAO GIỜ GHI GÌ CẢ.
 * Nó chỉ đọc câu và trả về **đề xuất**. Người dùng duyệt rồi mới ghi. Bài học từ nếp còn
 * nguyên: đây là chỗ máy viết vào nhật ký của người, và một dòng bịa làm hỏng niềm tin
 * vào cả trăm dòng thật.
 *
 * BA THỨ TẦNG NÀY PHẢI TỰ ĐỌC, KHÔNG ĐƯỢC ĐẨY SANG LLM
 *
 * 1. **Ngày.** "hôm qua ngủ 7 tiếng" trước đây đọc ra 420 phút rồi client ghi vào *hôm
 *    nay*. Sai ngày mà không ai báo: tệ hơn hẳn việc nói thẳng là không hiểu. Giờ mỗi ý
 *    chí mang theo `ngay` của chính nó, và client ghi đúng cái đó.
 * 2. **Danh mục của người dùng.** Người dùng đặt tên việc rồi thì tên đó là từ khoá tốt
 *    nhất đang có, tốt hơn mọi danh sách tôi gõ cứng ở dưới. Khớp tên thì lấy luôn ô và
 *    cờ giờ vàng của danh mục, nên câu chat ghi ra mục *đã phân loại* — nếu không thì
 *    màn Thời gian đầy dòng trắng và cái danh mục vừa làm thành vô dụng.
 * 3. **Câu nhiều việc.** "sáng họp 3 tiếng, chiều đón con 30 phút" là cách người ta kể
 *    một ngày. Trước đây nó rơi xuống LLM, tức là chưa có khoá thì chết.
 *
 * VÀ KHI ĐỌC ĐƯỢC MỘT PHẦN THÌ PHẢI NÓI RA PHẦN CÒN LẠI. Mảnh nào có số mà không ai đọc
 * được thì trả về `chuaHieu` kèm nguyên văn mảnh đó. Im lặng bỏ bớt một mảnh có số là
 * làm mất một mục người dùng tưởng đã ghi.
 */
import type { TimeBucket } from '../shared/types/enums';

export type YChi =
  | {
      readonly loai: 'gio';
      readonly bucket: TimeBucket;
      readonly minutes: number;
      readonly ten: string;
      readonly golden: boolean;
      /** YYYY-MM-DD. Suy từ câu ("hôm qua", "thứ 3"), mặc định là ngày client gửi lên. */
      readonly ngay: string;
      /** Danh mục khớp được theo tên, nếu có. */
      readonly danhMucId: string | null;
    }
  | { readonly loai: 'hat'; readonly kind: 'candy' | 'salt'; readonly text: string; readonly ngay: string }
  | {
      readonly loai: 'tien';
      readonly o: OTien;
      readonly vnd: number;
      readonly thang: string;
      /**
       * `true` cộng vào ô đang có, `false` đặt lại ô bằng con số này.
       *
       * Ba ô **dòng chảy** — thu nhập, chi tiêu, trả nợ — là tổng của nhiều lần trong
       * tháng, nên mỗi câu là một lần cộng thêm. Hai ô **mức** — dư nợ, tài sản ròng —
       * là ảnh chụp tại một thời điểm, nên câu sau thay câu trước.
       *
       * Không có cờ này thì "tiêu 350k" ĐÈ chi tiêu cả tháng xuống còn 350 nghìn, xoá
       * mất con số cũ mà không ai báo.
       */
      readonly cong: boolean;
    }
  | { readonly loai: 'khongGhi'; readonly viSao: string }
  | { readonly loai: 'chuaHieu'; readonly doan: string };

export type OTien = 'netIncome' | 'monthlyExpense' | 'debtPayment' | 'debtBalance' | 'netWorth';

export interface KetQuaDoc {
  readonly yChi: readonly YChi[];
  /** 'luat' đọc được bằng luật, 'ai' phải nhờ LLM, 'chiu' không ai đọc được. */
  readonly nguon: 'luat' | 'ai' | 'chiu';
}

/** Danh mục rút gọn, đủ để khớp tên. */
export interface DanhMucGon {
  readonly id: string;
  readonly name: string;
  readonly bucket: TimeBucket;
  readonly golden: boolean;
}

/**
 * Bối cảnh của một lần đọc.
 *
 * `homNay` do **client** gửi lên, không lấy từ đồng hồ máy chủ: máy chủ ở múi giờ nào là
 * chuyện của máy chủ, còn "hôm qua" là hôm qua của người đang gõ.
 */
export interface BoiCanhDoc {
  readonly homNay: string;
  readonly danhMuc: readonly DanhMucGon[];
}

/**
 * Bỏ dấu để so khớp, vì người ta gõ "ngu" lẫn "ngủ".
 *
 * **HẠ CHỮ THƯỜNG TRƯỚC, BỎ DẤU SAU.** "Đ" hoa là U+0110, một ký tự riêng không tách
 * được bằng NFD, nên nó không rơi vào lớp dấu thanh ở dưới. Hạ chữ sau cùng thì `đ` →
 * `d` đã chạy xong từ trước và "Đ" còn nguyên: câu "Đi làm 8 tiếng" ra "đi lam 8 tieng",
 * từ khoá `di lam` không khớp, và cả câu rơi xuống LLM.
 *
 * Mà người ta viết hoa chữ đầu câu — "Đi làm", "Đón con", "Đọc sách" — nên lỗi này ăn
 * đúng vào những câu hay gõ nhất.
 */
const boDau = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd');

/**
 * Từ khoá → ô. Xếp theo thứ tự ưu tiên: cái cụ thể trước cái chung.
 *
 * Danh sách này **cố tình ngắn**. Nhồi hai trăm từ vào đây thì nó bắt đầu đoán sai một
 * cách tự tin, mà đoán sai là thứ đắt nhất ở đây. Câu nào luật không chắc thì đẩy sang
 * LLM, và LLM còn biết nói "tôi không hiểu".
 *
 * Danh mục của người dùng được khớp TRƯỚC danh sách này, vì tên họ tự đặt nói đúng hơn.
 */
const TU_KHOA: ReadonlyArray<readonly [RegExp, TimeBucket, boolean]> = [
  [/\b(hop|lam viec|di lam|cong ty|cong viec|deadline|du an|khach hang|email|bao cao)\b/, 'work', false],
  [/\b(choi voi con|dua con|don con|voi con|voi vo|voi chong|an com cung|ca nha|gia dinh|bo me|ong ba)\b/, 'family', true],
  [/\b(an toi|an trua|an sang|nau com|don nha|nha cua|cham con|cho con)\b/, 'family', false],
  [/\b(dien thoai|facebook|tiktok|youtube|luot|xem phim|game|choi game|mang xa hoi)\b/, 'waste', false],
  [/\b(ngu|tap gym|tap the duc|chay bo|doc sach|hoc|thien|tam|di bo)\b/, 'personal', false],
  [/\b(di xe|di lai|ket xe|tau xe|lai xe)\b/, 'work', false],
];

const VUI = /\b(vui|hanh phuc|tuyet|thich|cuoi|am|de chiu|nhe nhom|thanh cong|dc viec|duoc viec)\b/;
const BUON = /\b(met|buon|te|chan|cang|stress|ap luc|cai nhau|gian|lo|that vong|kiet suc)\b/;

/**
 * Từ khoá → ô tiền, kèm cờ cộng dồn.
 *
 * Ba ô đầu là **dòng chảy**: tổng của nhiều lần trong tháng, nên cộng. Hai ô cuối là
 * **mức**: ảnh chụp tại một thời điểm, nên đặt lại.
 */
const O_TIEN: ReadonlyArray<readonly [RegExp, OTien, boolean]> = [
  [/\b(thu nhap|luong|nhan luong|ve tay|thuong)\b/, 'netIncome', true],
  [/\b(chi tieu|tieu|chi phi|xai|mua|an uong)\b/, 'monthlyExpense', true],
  [/\b(tra no|tra gop|tra ngan hang)\b/, 'debtPayment', true],
  [/\b(du no|con no|no con|khoan no)\b/, 'debtBalance', false],
  [/\b(tai san|tai san rong|tong tai san|net worth)\b/, 'netWorth', false],
];

/**
 * Rút tiền mặt → cộng vào Chi tiêu tháng.
 *
 * Về kế toán thì rút tiền không làm đổi tài sản ròng: tiền đi từ tài khoản sang ví.
 * Mira từng trả lời đúng như vậy rồi **từ chối ghi**, và Founder bác: người gõ "rút atm
 * 2 triệu" vào một cuốn nhật ký đời sống là đang nói "tôi vừa lấy 2 triệu ra để tiêu",
 * chứ không hỏi một câu kế toán.
 *
 * Phải khớp TRƯỚC `O_TIEN`, vì câu "rút 2 triệu để tiêu" có cả chữ "tiêu".
 */
const RUT_TIEN = /\b(rut tien|rut atm|rut o atm|rut the)\b/;

/**
 * Việc **không làm đổi gì** mà người ta vẫn hay gõ.
 *
 * Rút tiền ở ATM không làm đổi tài sản ròng: tiền đi từ tài khoản sang ví, tổng không
 * đổi. Chuyển khoản giữa hai tài khoản của chính mình cũng vậy. Mira không phải sổ thu
 * chi, nên câu trả lời đúng là nói thẳng chứ không nhét bừa vào một ô nào đó.
 */
const KHONG_GHI: ReadonlyArray<readonly [RegExp, string]> = [
  [
    /\b(chuyen khoan|chuyen tien|nap tien|gui tiet kiem)\b/,
    'Chuyển tiền giữa các tài khoản của bạn không làm đổi tổng tài sản. Mira chỉ cần năm con số mỗi tháng, không cần từng lần chuyển.',
  ],
];

/** "2 triệu" → 2000000, "350k" → 350000, "1,5tr" → 1500000. */
function docTien(cau: string): number | null {
  const m = /(\d+(?:[.,]\d+)?)\s*(trieu|tr|nghin|ngan|k|dong|d)\b/.exec(cau);
  if (m === null) return null;
  const so = Number((m[1] ?? '0').replace(',', '.'));
  const donVi = m[2] ?? '';
  if (!Number.isFinite(so)) return null;
  const nhan = donVi === 'trieu' || donVi === 'tr' ? 1_000_000 : donVi === 'dong' || donVi === 'd' ? 1 : 1_000;
  return Math.round(so * nhan);
}

/** "3 tiếng" → 180, "30 phút" → 30, "1h30" → 90, "1,5h" → 90. */
function docPhut(cau: string): number | null {
  const gioPhut = /(\d+)\s*(?:tieng|gio|h)\s*(\d{1,2})\b/.exec(cau);
  if (gioPhut !== null) {
    return Number(gioPhut[1]) * 60 + Number(gioPhut[2]);
  }
  const gio = /(\d+(?:[.,]\d+)?)\s*(?:tieng|gio|h)\b/.exec(cau);
  if (gio !== null) {
    const so = Number((gio[1] ?? '0').replace(',', '.'));
    return Number.isFinite(so) ? Math.round(so * 60) : null;
  }
  const phut = /(\d+)\s*(?:phut|p)\b/.exec(cau);
  if (phut !== null) return Number(phut[1]);
  return null;
}

// ── ngày: bốn hàm chuỗi, không kéo thư viện ngày tháng vào

const themNgay = (ngay: string, so: number): string => {
  const d = new Date(`${ngay}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + so);
  return d.toISOString().slice(0, 10);
};

/** Thứ theo ISO: thứ hai là 1, chủ nhật là 7. */
const thuIso = (ngay: string): number => {
  const d = new Date(`${ngay}T00:00:00Z`);
  return ((d.getUTCDay() + 6) % 7) + 1;
};

/** Xa nhất cho phép lùi. Quá một năm thì gần như chắc là gõ sai, không phải ý thật. */
const TOI_DA_LUI = 365;

/**
 * Tách cụm chỉ ngày ra khỏi mảnh câu, trả về số ngày lùi và mảnh đã sạch.
 *
 * Phải **cắt cụm đó khỏi câu** rồi mới đọc số giờ và số tiền: "3 ngày trước họp 2 tiếng"
 * có hai con số, và nếu để nguyên thì có lúc "3" bị đọc thành thời lượng.
 */
function tachNgay(manh: string): { readonly lui: number | null; readonly conLai: string } {
  const cat = (re: RegExp, lui: number) => ({ lui, conLai: manh.replace(re, ' ') });

  if (/\bhom nay\b/.test(manh)) return cat(/\bhom nay\b/g, 0);
  if (/\bhom qua\b/.test(manh)) return cat(/\bhom qua\b/g, 1);
  if (/\btoi qua\b/.test(manh)) return cat(/\btoi qua\b/g, 1);
  if (/\bhom kia\b/.test(manh)) return cat(/\bhom kia\b/g, 2);

  const soNgay = /\b(\d+)\s*ngay truoc\b/.exec(manh);
  if (soNgay !== null) {
    const n = Number(soNgay[1]);
    if (Number.isFinite(n) && n >= 0 && n <= TOI_DA_LUI) return cat(/\b\d+\s*ngay truoc\b/g, n);
  }

  return { lui: null, conLai: manh };
}

/**
 * "thứ 3" là thứ 3 **gần nhất đã qua**, kể cả hôm nay.
 *
 * Người ta kể lại việc đã làm, không hẹn việc sắp làm — màn này là nhật ký. Hiểu ngược
 * chiều là ghi vào tương lai, và một mục giờ ở ngày chưa tới thì mọi tổng tuần đều lệch.
 */
function tachThu(manh: string, homNay: string): { readonly ngay: string | null; readonly conLai: string } {
  const m = /\bthu ([2-7])\b/.exec(manh);
  const dich = m !== null ? Number(m[1]) - 1 : /\bchu nhat\b/.test(manh) ? 7 : null;
  if (dich === null) return { ngay: null, conLai: manh };

  const lui = (thuIso(homNay) - dich + 7) % 7;
  return {
    ngay: themNgay(homNay, -lui),
    conLai: manh.replace(/\bthu [2-7]\b/g, ' ').replace(/\bchu nhat\b/g, ' '),
  };
}

/** "tháng trước" → tháng liền trước của `thang` (YYYY-MM). */
function thangTruoc(thang: string): string {
  const nam = Number(thang.slice(0, 4));
  const thg = Number(thang.slice(5, 7));
  return thg === 1 ? `${nam - 1}-12` : `${nam}-${String(thg - 1).padStart(2, '0')}`;
}

/**
 * Cắt phần số, đơn vị và cụm chỉ thời điểm ra khỏi câu để lấy tên việc.
 *
 * Mỗi lớp ký tự phải chứa cả dạng **không dấu**. Người ta gõ "2 tieng" nhiều ngang gõ
 * "2 tiếng", và thiếu chữ `e` trần trong `ti[ếêe]ng` thì tên việc ra "Hop 2 tieng" —
 * thẻ hiện "Hop 2 tieng · 2h · Công việc", lặp lại chính nó.
 */
function tenViec(goc: string): string {
  const sach = goc
    // `(?![\p{L}])` thay cho `\b`: chữ `h` trần mà chốt bằng `\b` thì trong "thứ 6 họp"
    // nó ăn luôn "6 h" của "họp" — vì "ọ" không phải `\w`, nên `\b` sau "h" lại đúng.
    // Tên việc ra "Thứ ọp", và cụm "thứ 6" ở dưới không còn gì để cắt.
    .replace(/\d+(?:[.,]\d+)?\s*(?:ti[ếêe]ng|gi[ờo]|h|ph[úu]t|p)(?![\p{L}])/giu, ' ')
    .replace(/\b\d+\s*ng[àa]y tr[uư][ớo]c\b/gi, ' ')
    .replace(/\bth[ứu] [2-7]\b/gi, ' ')
    .replace(/\bch[ủu] nh[ậa]t\b/gi, ' ')
    .replace(
      /\b(h[ôo]m nay|h[ôo]m qua|h[ôo]m kia|t[ốo]i qua|s[áa]ng nay|chi[ềe]u nay|t[ốo]i nay|s[áa]ng|chi[ềe]u|t[ốo]i|nay)\b/gi,
      ' ',
    )
    .replace(/\s+/g, ' ')
    .trim();
  if (sach === '') return 'Ghi tay';
  return sach.charAt(0).toUpperCase() + sach.slice(1);
}

/**
 * Khớp danh mục theo tên.
 *
 * Tên dài khớp trước tên ngắn: có cả "Họp" và "Họp khách hàng" thì câu "họp khách hàng 1
 * tiếng" phải vào cái cụ thể hơn.
 *
 * Tên dưới ba ký tự thì bỏ qua. Một danh mục tên "A" sẽ khớp gần như mọi câu, và một cú
 * khớp sai đưa giờ vào sai ô — đắt hơn hẳn việc bỏ sót.
 */
const TEN_TOI_THIEU = 3;

function khopDanhMuc(manh: string, ds: readonly DanhMucGon[]): DanhMucGon | null {
  let thang: DanhMucGon | null = null;
  let dai = 0;
  for (const dm of ds) {
    const ten = boDau(dm.name.trim());
    if (ten.length < TEN_TOI_THIEU || ten.length <= dai) continue;
    if (manh.includes(ten)) {
      thang = dm;
      dai = ten.length;
    }
  }
  return thang;
}

/** Số lượng mảnh tối đa trong một câu. Dài hơn thế thì là đoạn văn, để LLM đọc. */
const TOI_DA_MANH = 6;

/**
 * Tách câu thành mảnh.
 *
 * Chỉ tách ở dấu phẩy, chấm phẩy và chữ "rồi". **Không tách ở "và"**: "chơi với con và
 * vợ 1 tiếng" mà tách ra thì mảnh đầu không có số giờ, mảnh sau còn "vợ 1 tiếng" không
 * khớp từ khoá nào — tách sai làm mất nguyên một mục.
 *
 * DẤU PHẨY GIỮA HAI CHỮ SỐ LÀ DẤU THẬP PHÂN, KHÔNG PHẢI DẤU NGẮT. Người Việt viết "1,5h".
 * Tách ở đó thì "họp 1,5h" thành "họp 1" và "5h", và cả câu chết.
 */
const tachManh = (cau: string): readonly string[] =>
  cau
    .split(/;|\br[ồo]i\b|(?<!\d),|,(?!\d)/i)
    .map((s) => s.trim())
    .filter((s) => s !== '')
    .slice(0, TOI_DA_MANH);

interface KetQuaManh {
  readonly y: YChi | null;
  /** Có chữ số nhưng không đọc được: phải nói ra, không được im lặng bỏ. */
  readonly coSo: boolean;
}

function docMotManh(goc: string, bc: BoiCanhDoc): KetQuaManh {
  const coSo = /\d/.test(goc);
  const thoNgay = boDau(goc);

  // Cắt cụm chỉ ngày TRƯỚC khi đọc số, để con số của ngày không bị đọc thành thời lượng.
  const { lui, conLai: sauLui } = tachNgay(thoNgay);
  const { ngay: ngayThu, conLai: manh } = tachThu(sauLui, bc.homNay);
  const ngay = ngayThu ?? (lui === null ? bc.homNay : themNgay(bc.homNay, -lui));

  // Tiền: cần cả từ khoá ô lẫn số tiền. Thiếu một trong hai thì không đoán.
  const tien = docTien(manh);
  if (tien !== null) {
    const thang = /\bthang truoc\b/.test(manh) ? thangTruoc(bc.homNay.slice(0, 7)) : bc.homNay.slice(0, 7);

    // Rút tiền khớp trước, vì "rút 2 triệu để tiêu" có cả chữ "tiêu".
    if (RUT_TIEN.test(manh)) {
      return { y: { loai: 'tien', o: 'monthlyExpense', vnd: tien, thang, cong: true }, coSo };
    }
    for (const [re, o, cong] of O_TIEN) {
      if (re.test(manh)) return { y: { loai: 'tien', o, vnd: tien, thang, cong }, coSo };
    }
  }

  // Giờ: cần thời lượng, cộng với một danh mục khớp tên HOẶC một từ khoá.
  const phut = docPhut(manh);
  if (phut !== null && phut > 0 && phut <= 1440) {
    const dm = khopDanhMuc(manh, bc.danhMuc);
    if (dm !== null) {
      return {
        y: {
          loai: 'gio',
          bucket: dm.bucket,
          minutes: phut,
          ten: dm.name,
          golden: dm.golden,
          ngay,
          danhMucId: dm.id,
        },
        coSo,
      };
    }
    for (const [re, bucket, vang] of TU_KHOA) {
      if (re.test(manh)) {
        return {
          y: {
            loai: 'gio',
            bucket,
            minutes: phut,
            ten: tenViec(goc),
            golden: vang,
            ngay,
            danhMucId: null,
          },
          coSo,
        };
      }
    }
  }

  return { y: null, coSo };
}

/**
 * Đọc một câu. Trả `nguon: 'chiu'` khi luật không chắc — lúc đó tầng trên gọi LLM.
 */
export function docBangLuat(cauGoc: string, bc: BoiCanhDoc): KetQuaDoc {
  const cauSach = cauGoc.trim();
  if (cauSach === '') return { yChi: [], nguon: 'chiu' };

  const caCau = boDau(cauSach);

  // Việc không ghi được phải chặn TRƯỚC mọi thứ khác: "rút atm 2 triệu" có số tiền, và
  // nếu không chặn thì luật tiền bên dưới sẽ nhét nó vào một ô nào đó.
  for (const [re, viSao] of KHONG_GHI) {
    if (re.test(caCau)) return { yChi: [{ loai: 'khongGhi', viSao }], nguon: 'luat' };
  }

  const manh = tachManh(cauSach);
  const yChi: YChi[] = [];
  const boSot: string[] = [];

  for (const m of manh) {
    const r = docMotManh(m, bc);
    if (r.y !== null) yChi.push(r.y);
    else if (r.coSo) boSot.push(m);
  }

  // Hạt: chỉ nhận khi KHÔNG đọc được giờ hay tiền, và xét trên CẢ CÂU chứ không từng
  // mảnh. "mệt quá, cả ngày căng thẳng" là một hạt muối, không phải hai — mà hũ muối có
  // nhịp hỏi lại 42 ngày, nên nhân đôi một hạt là làm nhiễu đúng chỗ đang đếm.
  if (yChi.length === 0) {
    const { lui, conLai } = tachNgay(caCau);
    const ngay = lui === null ? bc.homNay : themNgay(bc.homNay, -lui);
    if (VUI.test(conLai)) return { yChi: [{ loai: 'hat', kind: 'candy', text: cauSach, ngay }], nguon: 'luat' };
    if (BUON.test(conLai)) return { yChi: [{ loai: 'hat', kind: 'salt', text: cauSach, ngay }], nguon: 'luat' };
    return { yChi: [], nguon: 'chiu' };
  }

  // Đọc được một phần thì nói ra phần còn lại. Mảnh có số mà bỏ đi lặng lẽ là làm mất
  // một mục người dùng tưởng đã ghi.
  for (const b of boSot) yChi.push({ loai: 'chuaHieu', doan: b });

  return { yChi, nguon: 'luat' };
}
