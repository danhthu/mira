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
import type { KetQuaDoc, YChi } from './docCau';
import { DomainError } from '../shared/errors';

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
trong năm ô trên thì trả loai="khongGhi" kèm viSao nói thẳng. Ví dụ: rút tiền ATM không
làm đổi tài sản ròng vì tiền chỉ đi từ tài khoản sang ví.

ĐỪNG ĐOÁN KHI KHÔNG CHẮC. Câu mơ hồ, thiếu số, hay nói chuyện ngoài ba thứ trên thì trả
yChi rỗng. Một dòng bịa làm hỏng niềm tin vào cả trăm dòng thật; im lặng rẻ hơn nhiều.

Một câu có thể chứa nhiều việc: "sáng họp 3 tiếng, chiều đưa con đi học" là hai mục giờ.`;

const laYChi = (x: unknown): x is YChi => {
  if (typeof x !== 'object' || x === null) return false;
  const y = x as Record<string, unknown>;
  switch (y.loai) {
    case 'gio':
      return (
        typeof y.bucket === 'string' &&
        Number.isInteger(y.minutes) &&
        (y.minutes as number) > 0 &&
        (y.minutes as number) <= 1440 &&
        typeof y.ten === 'string'
      );
    case 'hat':
      return (y.kind === 'candy' || y.kind === 'salt') && typeof y.text === 'string';
    case 'tien':
      return typeof y.o === 'string' && Number.isInteger(y.vnd);
    case 'khongGhi':
      return typeof y.viSao === 'string' && y.viSao.trim() !== '';
    default:
      return false;
  }
};

export async function docBangAi(deps: AiDeps, cau: string): Promise<KetQuaDoc> {
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
    system: HE_THONG,
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

  // Lọc lại ở đây dù đã có schema: schema ràng buộc hình dạng, không ràng buộc rằng
  // `minutes` chỉ xuất hiện cùng `loai: 'gio'`.
  const yChi = ds.filter(laYChi);
  return { yChi, nguon: yChi.length === 0 ? 'chiu' : 'ai' };
}
