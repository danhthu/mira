/**
 * Soi bảng `chat_log` — kho dữ liệu để sau này huấn luyện mô hình tại chỗ.
 *
 *   node xem-chat-log.mjs          — 20 lượt gần nhất
 *   node xem-chat-log.mjs --chiu   — chỉ những câu Mira không đọc nổi
 *   node xem-chat-log.mjs --xuat   — xuất JSONL ra ra/chat-log.jsonl để huấn luyện
 *
 * ⚠ File xuất ra là nhật ký đời sống viết bằng lời của chính chủ. Nó KHÔNG được rời khỏi
 * máy này: không đẩy lên git, không gửi đi đâu để "phân tích", không nạp vào dịch vụ huấn
 * luyện đám mây. Xem migration 009 để biết vì sao.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import pg from 'pg';
import 'dotenv/config';

const db = new pg.Pool({
  host: process.env['DB_HOST'] ?? '127.0.0.1',
  port: Number.parseInt(process.env['DB_PORT'] ?? '5432', 10),
  user: process.env['DB_USER'] ?? 'postgres',
  password: process.env['DB_PASS'],
  database: process.env['DB_NAME'] ?? 'mira_dev',
});

const chiCauChiu = process.argv.includes('--chiu');
const xuat = process.argv.includes('--xuat');

const dieuKien = chiCauChiu ? `WHERE nguon = 'chiu'` : '';
const tran = xuat ? 100000 : 20;

const { rows } = await db.query(
  `SELECT cau, ngay, nguon, ket_qua, created_at
   FROM chat_log ${dieuKien}
   ORDER BY created_at DESC
   LIMIT $1`,
  [tran],
);

const tong = await db.query('SELECT nguon, count(*)::int AS n FROM chat_log GROUP BY nguon');

if (xuat) {
  mkdirSync('ra', { recursive: true });
  const duong = 'ra/chat-log.jsonl';
  writeFileSync(
    duong,
    rows
      .map((r) => JSON.stringify({ cau: r.cau, ngay: r.ngay, nguon: r.nguon, ketQua: r.ket_qua }))
      .join('\n') + '\n',
  );
  console.log(`Đã xuất ${rows.length} lượt ra ${duong}`);
  console.log('⚠ File này là nhật ký riêng tư. Đừng commit, đừng gửi đi đâu.');
} else {
  for (const r of rows) {
    const loai = (r.ket_qua?.yChi ?? []).map((y) => y.loai).join('+') || '—';
    const gio = new Date(r.created_at).toTimeString().slice(0, 5);
    console.log(`${gio}  ${String(r.nguon).padEnd(5)} ${loai.padEnd(12)} ${r.cau}`);
  }
}

console.log('\nTổng:', tong.rows.map((r) => `${r.nguon}=${r.n}`).join('  '));
await db.end();
