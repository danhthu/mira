import type { IDatabase } from '../../shared/interfaces/IDatabase';
import { CHAT_LOG_QUERIES } from '../queries/chatLog';
import { newId } from '../id';

export interface ChatLogRec {
  readonly id: string;
  readonly cau: string;
  readonly ngay: string;
  readonly source: string;
  readonly ketQua: unknown;
  readonly createdAt: string;
}

interface ChatLogRow {
  id: string;
  cau: string;
  ngay: Date | string;
  source: string;
  ket_qua: unknown;
  created_at: Date | string;
}

/** `DATE` về từ `pg` là `Date` của JS; cắt lấy YYYY-MM-DD chứ đừng qua múi giờ. */
const dateString = (v: Date | string): string =>
  typeof v === 'string' ? v.slice(0, 10) : v.toISOString().slice(0, 10);

const toRec = (r: ChatLogRow): ChatLogRec => ({
  id: r.id,
  cau: r.cau,
  ngay: dateString(r.ngay),
  source: r.source,
  ketQua: r.ket_qua,
  createdAt: typeof r.created_at === 'string' ? r.created_at : r.created_at.toISOString(),
});

/** Trần mặc định khi đọc. Bảng chỉ lớn lên, nên đọc phải luôn có trần. */
const TRAN = 500;

export class ChatLogRepository {
  constructor(private readonly db: IDatabase) {}

  /**
   * Ghi lại một lượt trò chuyện.
   *
   * **Không bao giờ được làm hỏng lời gọi `/doc`.** Người dùng gõ một câu để ghi nhật ký;
   * nếu kho dữ liệu huấn luyện trục trặc thì đó là việc của chúng ta, không phải của họ.
   * Nên lỗi ở đây được nuốt — xem chỗ gọi trong `routes.ts`.
   */
  async add(userId: string, cau: string, ngay: string, source: string, ketQua: unknown): Promise<void> {
    await this.db.query(CHAT_LOG_QUERIES.insert, [
      newId(),
      userId,
      cau,
      ngay,
      source,
      JSON.stringify(ketQua),
    ]);
  }

  async findRange(userId: string, from: string, to: string, cap = TRAN): Promise<ChatLogRec[]> {
    const r = await this.db.query<ChatLogRow>(CHAT_LOG_QUERIES.findRange, [userId, from, to, cap]);
    return r.rows.map(toRec);
  }

  /** Những câu Mira không đọc nổi — lỗ trong bộ luật, và mẫu huấn luyện. */
  async findChiu(userId: string, cap = TRAN): Promise<ChatLogRec[]> {
    const r = await this.db.query<ChatLogRow>(CHAT_LOG_QUERIES.findChiu, [userId, cap]);
    return r.rows.map(toRec);
  }
}
