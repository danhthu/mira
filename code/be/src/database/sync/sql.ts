import { SYNC_FRAME_COLUMNS, SYNC_TABLES } from './registry';
import type { SyncColumn, SyncTable } from './registry';

const FRAME = SYNC_FRAME_COLUMNS;

// UNION ALL 13 bảng thành một dòng thời gian duy nhất. Tên bảng/cột lấy từ registry
// (hằng số lúc biên dịch), giá trị người dùng chỉ đi qua $1/$2/$3.
function buildPullBranch(table: SyncTable, sincePredicate: string): string {
  const pairs = table.columns
    .map((c) => `'${c.apiField}', ${c.column}`)
    .join(', ');
  const data = pairs === '' ? `'{}'::jsonb` : `jsonb_build_object(${pairs})`;
  return (
    `SELECT '${table.table}'::text AS table_name, ${FRAME.id}, ${FRAME.createdAt}, ` +
    `${FRAME.updatedAt}, ${FRAME.deletedAt}, ${data} AS data ` +
    `FROM ${table.table} WHERE ${FRAME.userId} = $1 AND ${sincePredicate}`
  );
}

function buildPull(sincePredicate: string, tail: string): string {
  const branches = SYNC_TABLES.map((t) => buildPullBranch(t, sincePredicate)).join(
    ' UNION ALL ',
  );
  return (
    `SELECT * FROM (${branches}) AS changes ` +
    `ORDER BY ${FRAME.updatedAt} ASC, table_name ASC, ${FRAME.id} ASC ${tail}`
  );
}

// $1 = userId, $2 = since (NULL = lấy từ đầu), $3 = số hàng tối đa.
// `since` là mốc HỞ (updated_at > since): client gửi lại updatedAt của bản cuối,
// nếu dùng >= thì bản đó quay lại mãi mãi.
export const PULL_SQL = buildPull(
  `($2::text IS NULL OR ${FRAME.updatedAt} > $2)`,
  'LIMIT $3',
);

// $1 = userId, $2 = mốc thời gian chính xác. Dùng khi cả trang dính cùng một
// updated_at — xem SyncRepository.pull.
export const PULL_AT_TIMESTAMP_SQL = buildPull(`${FRAME.updatedAt} = $2`, '');

// Bố cục tham số dùng chung cho cả ba câu ghi bên dưới:
// $1 = id, $2 = user_id, $3 = updated_at, $4 = deleted_at, $5... = cột nghiệp vụ gửi lên.
export const WRITE_FRAME_PARAM_COUNT = 4;

function columnPlaceholders(columns: readonly SyncColumn[]): string[] {
  return columns.map((_c, i) => `$${WRITE_FRAME_PARAM_COUNT + i + 1}`);
}

// UPDATE chạy trước INSERT (không dùng ON CONFLICT DO UPDATE) vì hợp đồng cho phép
// `data` chỉ chứa vài cột: Postgres kiểm NOT NULL trên tuple của INSERT TRƯỚC khi phát
// hiện đụng khoá, nên upsert một câu sẽ hỏng mọi lần cập nhật một phần.
// Mệnh đề updated_at <= $3 là nơi DUY NHẤT quyết định last-write-wins.
export function buildUpdateSql(table: SyncTable, columns: readonly SyncColumn[]): string {
  const placeholders = columnPlaceholders(columns);
  const assignments = [
    `${FRAME.updatedAt} = $3`,
    `${FRAME.deletedAt} = $4`,
    ...columns.map((c, i) => `${c.column} = ${placeholders[i]}`),
  ].join(', ');

  return (
    `UPDATE ${table.table} SET ${assignments} ` +
    `WHERE ${FRAME.id} = $1 AND ${FRAME.userId} = $2 AND ${FRAME.updatedAt} <= $3 ` +
    `RETURNING ${FRAME.id}`
  );
}

export function buildInsertSql(table: SyncTable, columns: readonly SyncColumn[]): string {
  const insertColumns = [
    FRAME.id,
    FRAME.userId,
    FRAME.createdAt,
    FRAME.updatedAt,
    FRAME.deletedAt,
    ...columns.map((c) => c.column),
  ];
  // created_at lấy chung $3 với updated_at: hợp đồng push không mang createdAt.
  const values = ['$1', '$2', '$3', '$3', '$4', ...columnPlaceholders(columns)];

  return (
    `INSERT INTO ${table.table} (${insertColumns.join(', ')}) VALUES (${values.join(', ')}) ` +
    `ON CONFLICT (${FRAME.id}) DO NOTHING RETURNING ${FRAME.id}`
  );
}

// Không lọc user_id: id trùng của người khác cũng tính là đã tồn tại, để push không
// bao giờ đè lên bản ghi ngoài phân vùng của mình.
export function buildExistsSql(table: SyncTable): string {
  return `SELECT 1 AS present FROM ${table.table} WHERE ${FRAME.id} = $1`;
}
