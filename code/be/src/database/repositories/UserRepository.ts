import type { IDatabase } from '../../shared/interfaces/IDatabase';
import { newId } from '../id';

/** 23505 = vi phạm chỉ mục duy nhất của Postgres. Lỗi khác là lỗi thật, phải ném tiếp. */
const laTrungKhoa = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && (error as { code?: string }).code === '23505';

export interface UserRec {
  readonly id: string;
  readonly username: string;
  /** null với người vào bằng Google: họ không có mật khẩu, và không nên giả vờ là có. */
  readonly passwordHash: string | null;
  readonly displayName: string | null;
  readonly email: string | null;
}

interface UserRow {
  id: string;
  username: string;
  password_hash: string | null;
  display_name: string | null;
  email: string | null;
}

const toUser = (row: UserRow): UserRec => ({
  id: row.id,
  username: row.username,
  passwordHash: row.password_hash,
  displayName: row.display_name,
  email: row.email,
});

const COT = 'id, username, password_hash, display_name, email';

const QUERIES = {
  findByUsername: `
    SELECT ${COT} FROM app_user
    WHERE lower(username) = lower($1) AND deleted_at IS NULL
  `,
  findById: `
    SELECT ${COT} FROM app_user
    WHERE id = $1 AND deleted_at IS NULL
  `,
  findByEmail: `
    SELECT ${COT} FROM app_user
    WHERE lower(email) = lower($1) AND deleted_at IS NULL
  `,
  insert: `
    INSERT INTO app_user (id, username, password_hash, display_name, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $5)
    RETURNING ${COT}
  `,
  insertGoogle: `
    INSERT INTO app_user (id, username, password_hash, display_name, email, google_sub, created_at, updated_at)
    VALUES ($1, $2, NULL, $3, $4, $5, $6, $6)
    RETURNING ${COT}
  `,
} as const;

export class UserRepository {
  constructor(private readonly db: IDatabase) {}

  async findByUsername(username: string): Promise<UserRec | null> {
    const row = await this.db.queryOne<UserRow>(QUERIES.findByUsername, [username]);
    return row === null ? null : toUser(row);
  }

  async findById(id: string): Promise<UserRec | null> {
    const row = await this.db.queryOne<UserRow>(QUERIES.findById, [id]);
    return row === null ? null : toUser(row);
  }

  async findByEmail(email: string): Promise<UserRec | null> {
    const row = await this.db.queryOne<UserRow>(QUERIES.findByEmail, [email]);
    return row === null ? null : toUser(row);
  }

  /**
   * Tạo tài khoản từ một danh tính Google đã kiểm.
   *
   * Tên đăng nhập suy từ email và **có thể trùng** — nên thử thêm hậu tố cho tới khi
   * chèn được. Email mới là khoá thật; tên đăng nhập chỉ để hiển thị cho đẹp.
   */
  async createFromGoogle(
    tenGoiY: string,
    displayName: string | null,
    email: string,
    googleSub: string,
  ): Promise<UserRec> {
    const now = new Date().toISOString();
    for (let lan = 0; lan < 12; lan += 1) {
      const username = lan === 0 ? tenGoiY : `${tenGoiY}-${lan + 1}`;
      try {
        const row = await this.db.queryOne<UserRow>(QUERIES.insertGoogle, [
          newId(),
          username,
          displayName,
          email,
          googleSub,
          now,
        ]);
        if (row !== null) return toUser(row);
      } catch (error) {
        if (!laTrungKhoa(error)) throw error;
        // Trùng email nghĩa là có người khác vừa đăng nhập cùng lúc — người gọi tra lại.
        const daCo = await this.findByEmail(email);
        if (daCo !== null) return daCo;
        // Trùng tên đăng nhập: thử tên tiếp theo.
      }
    }
    throw new Error(`Không tạo được tên đăng nhập từ "${tenGoiY}" sau 12 lần thử.`);
  }

  /**
   * Tạo tài khoản. Chỉ mục duy nhất trên `lower(username)` là thứ thật sự chặn trùng tên —
   * kiểm trước khi ghi vẫn có thể lọt khi hai yêu cầu tới cùng lúc, nên bắt cả lỗi của DB.
   */
  async create(username: string, passwordHash: string, displayName: string | null): Promise<UserRec | null> {
    try {
      const row = await this.db.queryOne<UserRow>(QUERIES.insert, [
        newId(),
        username,
        passwordHash,
        displayName,
        new Date().toISOString(),
      ]);
      return row === null ? null : toUser(row);
    } catch (error) {
      if (laTrungKhoa(error)) return null;
      throw error;
    }
  }
}
