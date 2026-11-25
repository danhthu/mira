/**
 * Đọc câu bằng Claude, cho những câu tầng luật chịu.
 *
 * CHỈ CHẠY KHI TẦNG LUẬT KHÔNG ĐỌC ĐƯỢC. Phần lớn câu là một con số cộng một từ khoá;
 * gọi LLM cho chúng là trả tiền và trả độ trễ cho việc `RegExp` làm trong một mili giây.
 *
 * STRUCTURED OUTPUT, KHÔNG PHẢI "TRẢ VỀ JSON NHÉ". `output_config.format` ràng buộc hình
 * dạng ở phía máy chủ API, nên không có chuyện mô hình trả về văn xuôi rồi mình phải
 * `JSON.parse` trong `try/catch` và đoán xem hỏng ở đâu.
 *
 * MÔ HÌNH MẶC ĐỊNH LÀ `claude-opus-5-5`. Đổi sang model rẻ hơn là quyết định về tiền của
 * Founder, không phải của tôi, nên nó nằm ở biến môi trường `CHAT_MODEL` chứ không bị
 * tôi hạ xuống trong lúc viết. Một câu nhập liệu tốn khoảng 500 token vào và 150 ra, tức
 * cỡ 5 phần nghìn đô mỗi lần.
 *
 * NÓ KHÔNG GHI GÌ CẢ. Trả về đề xuất; người dùng duyệt rồi tầng trên mới ghi.
 */
import Anthropic from '@anthropic-ai/sdk';
import type { BoiCanhDoc, KetQuaDoc, OTien, YChi } from './docCau';
import { TIME_BUCKETS } from '../shared/constants';
import { DomainError } from '../shared/errors';

/** Năm ô tiền, để kiểm lại cái mô hình trả về chứ không tin suông. */
const O_TIEN_HOP_LE: readonly OTien[] = [
  'netIncome',
  'monthlyExpense',
  'debtPayment',
  'debtBalance',
  'netWorth',
];

export interface AiDeps {
  /** Rỗng = chưa cấu hình; tầng trên phải nói thẳng chứ không im lặng bỏ qua. */
  readonly apiKey: string;
  readonly model: string;
}

/**
 * Hình dạng Claude phải trả về. Mô tả từng trường là chỗ dạy mô hình luật của Mira, nên
 * nó phải nói đúng cái sản phẩm đã hứa — nhất là chỗ "không ghi được thì nói".
 */
const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['yChi'],
  properties: {
    yChi: {
      type: 'array',
      description: 'Các việc đọc được từ câu. Rỗng nếu không hiểu.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['loai'],
        properties: {
          loai: { type: 'string', enum: ['gio', 'hat', 'tien', 'khongGhi'] },
          bucket: {
            type: 'string',
            enum: ['work', 'family', 'personal', 'waste'],
            description:
              'Chỉ cho loai=gio. work là việc kiếm tiền và đi lại vì việc; family là người nhà; personal là ngủ, ăn, học, thể thao; waste là điện thoại, mạng xã hội, giải trí thụ động.',
          },
          minutes: { type: 'integer', description: 'Chỉ cho loai=gio. Số phút, 1 tới 1440.' },
          ten: { type: 'string', description: 'Chỉ cho loai=gio. Tên việc, ngắn, viết hoa chữ đầu.' },
          ngay: {
            type: 'string',
            description:
              'Cho loai=gio và loai=hat. YYYY-MM-DD. Suy từ câu: "hôm qua" là ngày trước HÔM NAY, "thứ 3" là thứ 3 gần nhất ĐÃ QUA. Không nói gì về thời điểm thì để đúng HÔM NAY. Không bao giờ trả ngày ở tương lai.',
          },
          danhMuc: {
            type: 'string',
            description:
              'Chỉ cho loai=gio. Tên một danh mục trong DANH MỤC CỦA NGƯỜI DÙNG, chép y hệt, khi việc này đúng là danh mục đó. Không khớp cái nào thì bỏ trống trường này.',
          },
          golden: {
            type: 'boolean',
            description:
              'Chỉ cho loai=gio bucket=family. true khi thật sự có mặt với người nhà, không phải chỉ ở cùng nhà.',
          },
          kind: { type: 'string', enum: ['candy', 'salt'], description: 'Chỉ cho loai=hat. candy là ngày vui, salt là ngày nặng.' },
          text: { type: 'string', description: 'Chỉ cho loai=hat. Nguyên văn câu người dùng.' },
          o: {
            type: 'string',
            enum: ['netIncome', 'monthlyExpense', 'debtPayment', 'debtBalance', 'netWorth'],
            description: 'Chỉ cho loai=tien.',
          },
          vnd: { type: 'integer', description: 'Chỉ cho loai=tien. Số tiền VND nguyên.' },
          thang: {
            type: 'string',
            description: 'Chỉ cho loai=tien. YYYY-MM. "tháng trước" là tháng liền trước, còn lại là tháng của HÔM NAY.',
          },
          viSao: {
            type: 'string',
            description:
              'Chỉ cho loai=khongGhi. Nói với người dùng vì sao Mira không ghi việc này, bằng tiếng Việt, một hai câu, không xin lỗi.',
          },
        },
      },
    },
  },
} as const;

const HE_THONG = `Bạn đọc câu tiếng Việt của người dùng Mira và trả về việc cần ghi.

MIRA GHI ĐƯỢC ĐÚNG BA THỨ:
1. Giờ, chia vào bốn ô: work, family, personal, waste.
2. Hạt trong hũ: candy (ngày vui) hoặc salt (ngày nặng). Chỉ là một dòng cảm nhận.
3. Tiền, đúng năm ô mỗi tháng: thu nhập ròng, chi tiêu tháng, trả nợ mỗi tháng, dư nợ,
   tài sản ròng.

MIRA KHÔNG PHẢI SỔ THU CHI. Nó không ghi từng giao dịch. Việc nào không làm đổi một
trong năm ô trên thì trả loai="khongGhi" kèm viSao nói thẳng. Ví dụ: chuyển tiền giữa hai
tài khoản của chính người dùng, hay gửi tiết kiệm — tổng tài sản không đổi.

NHƯNG RÚT TIỀN MẶT THÌ VẪN GHI, vào ô monthlyExpense. Người gõ "rút atm 2 triệu" đang nói
họ vừa lấy tiền ra để tiêu, không hỏi một câu kế toán.

ĐỪNG ĐOÁN KHI KHÔNG CHẮC. Câu mơ hồ, thiếu số, hay nói chuyện ngoài ba thứ trên thì trả
yChi rỗng. Một dòng bịa làm hỏng niềm tin vào cả trăm dòng thật; im lặng rẻ hơn nhiều.

Một câu có thể chứa nhiều việc: "sáng họp 3 tiếng, chiều đưa con đi học" là hai mục giờ.`;

const heThong = (bc: BoiCanhDoc): string => {
  const ds =
    bc.danhMuc.length === 0
      ? 'Người dùng chưa đặt danh mục nào. Để trống trường danhMuc.'
      : bc.danhMuc
          .map((d) => `- "${d.name}" (ô ${d.bucket}${d.golden ? ', giờ vàng' : ''})`)
          .join('\n');

  return `${HE_THONG}

HÔM NAY LÀ ${bc.homNay}.

DANH MỤC CỦA NGƯỜI DÙNG — khớp được thì chép đúng tên vào trường danhMuc:
${ds}`;
};


const LA_NGAY = /^\d{4}-\d{2}-\d{2}$/;
const LA_THANG = /^\d{4}-\d{2}$/;

/**
 * Nhận ngày mô hình trả về, nhưng **không bao giờ nhận ngày tương lai**.
 *
 * Màn này là nhật ký: người ta kể việc đã làm. Một mục giờ ở ngày chưa tới làm lệch mọi
 * tổng tuần, và lệch âm thầm — không có chỗ nào trên giao diện báo "mục này ở tương lai".
 * Ngày lạ thì lùi về hôm nay, vì sai ngày còn tệ hơn sai tên việc.
 */
const nhanNgay = (x: unknown, homNay: string): string =>
  typeof x === 'string' && LA_NGAY.test(x) && x <= homNay ? x : homNay;

/**
 * Chuyển một phần tử mô hình trả về thành `YChi`, hoặc `null` nếu không dùng được.
 *
 * Phải lọc lại ở đây dù đã có schema: schema ràng buộc **hình dạng**, không ràng buộc
 * rằng `minutes` chỉ xuất hiện cùng `loai: 'gio'`.
 *
 * Trường thiếu thì **điền mặc định chứ không loại bỏ cả mục**: mô hình quên `ngay` không
 * phải lý do để bỏ luôn ba tiếng người dùng vừa kể.
 */
const layYChi = (x: unknown, bc: BoiCanhDoc): YChi | null => {
  if (typeof x !== 'object' || x === null) return null;
  const y = x as Record<string, unknown>;

  switch (y.loai) {
    case 'gio': {
      if (
        typeof y.bucket !== 'string' ||
        !Number.isInteger(y.minutes) ||
        (y.minutes as number) <= 0 ||
        (y.minutes as number) > 1440 ||
        typeof y.ten !== 'string'
      ) {
        return null;
      }
      // Danh mục: chỉ nhận tên khớp đúng một danh mục đang có. Mô hình bịa ra một tên
      // thì bỏ cờ, không tạo danh mục mới — tạo danh mục là việc người dùng tự làm.
      const ten = typeof y.danhMuc === 'string' ? y.danhMuc.trim().toLowerCase() : '';
      const dm = ten === '' ? undefined : bc.danhMuc.find((d) => d.name.trim().toLowerCase() === ten);

      // Ô phải là một trong bốn ô thật. Mô hình trả ô lạ thì bỏ cả mục: không có ô thì
      // không biết ghi vào đâu, và đoán một ô là đoán sai chỗ đắt nhất.
      const bucket = dm?.bucket ?? (TIME_BUCKETS.find((b) => b === y.bucket) ?? null);
      if (bucket === null) return null;

      return {
        loai: 'gio',
        bucket,
        minutes: y.minutes as number,
        ten: dm?.name ?? y.ten,
        golden: dm !== undefined ? dm.golden : y.golden === true,
        ngay: nhanNgay(y.ngay, bc.homNay),
        danhMucId: dm?.id ?? null,
      };
    }
    case 'hat':
      if ((y.kind !== 'candy' && y.kind !== 'salt') || typeof y.text !== 'string') return null;
      return { loai: 'hat', kind: y.kind, text: y.text, ngay: nhanNgay(y.ngay, bc.homNay) };
    case 'tien': {
      const o = O_TIEN_HOP_LE.find((k) => k === y.o);
      if (o === undefined || !Number.isInteger(y.vnd)) return null;
      const thang = typeof y.thang === 'string' && LA_THANG.test(y.thang) ? y.thang : bc.homNay.slice(0, 7);
      // Ba ô dòng chảy cộng dồn, hai ô mức đặt lại. Không để mô hình tự chọn: đoán sai
      // chiều này là đè mất con số cũ của cả tháng.
      const cong = o === 'netIncome' || o === 'monthlyExpense' || o === 'debtPayment';
      return { loai: 'tien', o, vnd: y.vnd as number, thang, cong };
    }
    case 'khongGhi':
      if (typeof y.viSao !== 'string' || y.viSao.trim() === '') return null;
      return { loai: 'khongGhi', viSao: y.viSao };
    default:
      return null;
  }
};

export async function docBangAi(deps: AiDeps, cau: string, bc: BoiCanhDoc): Promise<KetQuaDoc> {
  if (deps.apiKey === '') {
    throw new DomainError(
      'bad_request',
      503,
      'Máy chủ chưa cấu hình ANTHROPIC_API_KEY nên chưa đọc được câu này. Vẫn ghi tay được ở màn Thời gian.',
    );
  }

  const client = new Anthropic({ apiKey: deps.apiKey });

  const res = await client.messages.create({
    model: deps.model,
    max_tokens: 1024,
    system: heThong(bc),
    output_config: {
      effort: 'low',
      format: { type: 'json_schema', schema: SCHEMA },
    },
    messages: [{ role: 'user', content: cau }],
  });

  // Mô hình có thể từ chối vì lý do an toàn; đó là HTTP 200 nên phải kiểm trước khi đọc.
  if (res.stop_reason === 'refusal') {
    return { yChi: [], nguon: 'chiu' };
  }

  const text = res.content.find((b) => b.type === 'text');
  if (text === undefined || text.type !== 'text') return { yChi: [], nguon: 'chiu' };

  let raw: unknown;
  try {
    raw = JSON.parse(text.text);
  } catch {
    return { yChi: [], nguon: 'chiu' };
  }

  const ds = (raw as { yChi?: unknown }).yChi;
  if (!Array.isArray(ds)) return { yChi: [], nguon: 'chiu' };

  const yChi = ds.map((x) => layYChi(x, bc)).filter((y): y is YChi => y !== null);
  return { yChi, nguon: yChi.length === 0 ? 'chiu' : 'ai' };
}
