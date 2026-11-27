import { openDb, nextId, now, audit } from './db.mjs';
import { validChannel } from './campaigns.mjs';

export const CONTENT_FLOW = ['IDEA','RESEARCH','DRAFT','REVIEW','APPROVED','PUBLISHED','MEASURED','REUSED','ARCHIVED'];
// Chuyển trạng thái hợp lệ. ARCHIVED từ bất kỳ đâu. REUSED chỉ sau MEASURED.
const NEXT = {
  IDEA: ['RESEARCH','DRAFT'], RESEARCH: ['DRAFT'], DRAFT: ['REVIEW'], REVIEW: ['APPROVED','DRAFT'],
  APPROVED: ['PUBLISHED','DRAFT'], PUBLISHED: ['MEASURED'], MEASURED: ['REUSED'], REUSED: [], ARCHIVED: []
};

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

// Trùng = cùng chủ đề + cùng kênh, hoặc cùng source_slug + cùng kênh.
export function findDuplicateContent({ topic, channel, source_slug }) {
  const rows = openDb().prepare(`SELECT id, topic, channel, source_slug, status FROM content WHERE status != 'ARCHIVED'`).all();
  return rows.find((r) => r.channel === channel && ((source_slug && r.source_slug === source_slug) || norm(r.topic) === norm(topic)));
}

export function addContent(c) {
  if (!c.topic || !c.channel || !c.format) throw new Error('topic, channel, format bắt buộc');
  validChannel(c.channel);
  const dup = findDuplicateContent(c);
  if (dup && !c.force) throw new Error(`Trùng với ${dup.id} (${dup.status}) trên ${dup.channel}: "${dup.topic}". Dùng --force nếu là biến thể cố ý.`);
  const db = openDb();
  const id = nextId('content', 'K');
  const ts = now();
  db.prepare(`INSERT INTO content (id,topic,channel,format,audience,hook,body_ref,cta,asset_ref,status,source_slug,created_at,updated_at)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, c.topic, c.channel, c.format, c.audience ?? '', c.hook ?? '', c.body_ref ?? '', c.cta ?? '', c.asset_ref ?? '',
         c.status ?? 'IDEA', c.source_slug ?? null, ts, ts);
  return getContent(id);
}

export function getContent(id) {
  const c = openDb().prepare('SELECT * FROM content WHERE id=?').get(id);
  if (!c) throw new Error(`không có content ${id}`);
  c.metrics = JSON.parse(c.metrics);
  return c;
}

export function listContent({ status, channel } = {}) {
  const where = []; const args = [];
  if (status) { where.push('status=?'); args.push(status); }
  if (channel) { where.push('channel=?'); args.push(channel); }
  return openDb().prepare(`SELECT * FROM content ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id`).all(...args)
    .map((c) => ({ ...c, metrics: JSON.parse(c.metrics) }));
}

// Kiểm chất lượng tối thiểu trước REVIEW/APPROVED: có hook, có CTA, có body_ref, không chứa từ cấm theo giọng Mira.
const BANNED = ['nên ', 'phải ', 'hãy ', 'cảnh báo', 'trong thế giới hiện đại', 'không thể phủ nhận', 'hãy cùng', 'tóm lại', '!'];
// "không phải", "không nên" là phủ định mô tả, không phải lời khuyên — bỏ qua trước khi so.
const ALLOWED = ['không phải', 'chưa phải', 'không nên'];
export function qualityIssues(c) {
  const issues = [];
  if (!c.hook) issues.push('thiếu hook');
  if (!c.cta) issues.push('thiếu CTA');
  if (!c.body_ref) issues.push('thiếu body_ref (file nội dung)');
  let text = `${c.hook} ${c.cta}`.toLowerCase();
  for (const a of ALLOWED) text = text.split(a).join(' ');
  for (const w of BANNED) if (text.includes(w)) issues.push(`hook/CTA chứa "${w.trim()}" — trái giọng Mira (docs/00-vision.md)`);
  return issues;
}

export function updateContent(id, patch, actor = 'cli') {
  const cur = getContent(id);
  // CLI truyền mọi cờ, cờ vắng là undefined — bỏ đi để không đè giá trị đã có trong DB.
  patch = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
  const db = openDb();
  if (patch.status && patch.status !== cur.status) {
    if (patch.status !== 'ARCHIVED' && !NEXT[cur.status].includes(patch.status)) {
      throw new Error(`không chuyển được ${cur.status} → ${patch.status}. Hợp lệ: ${NEXT[cur.status].join(', ') || '(không)'}, hoặc ARCHIVED`);
    }
    if (['REVIEW','APPROVED'].includes(patch.status)) {
      const issues = qualityIssues({ ...cur, ...patch });
      if (issues.length) throw new Error(`chưa đạt chất lượng: ${issues.join('; ')}`);
    }
    if (patch.status === 'PUBLISHED') {
      if (!(patch.url ?? cur.url)) throw new Error('PUBLISHED cần --url');
      patch.published_at = patch.published_at ?? now().slice(0, 10);
      audit(actor, 'content.publish', id, patch.url ?? cur.url);
    }
  }
  const cols = ['topic','channel','format','audience','hook','body_ref','cta','asset_ref','status','url','utm','published_at','source_slug'];
  const sets = []; const args = [];
  for (const c of cols) if (patch[c] !== undefined) { sets.push(`${c}=?`); args.push(patch[c]); }
  if (patch.metrics) { sets.push('metrics=?'); args.push(JSON.stringify({ ...cur.metrics, ...patch.metrics })); }
  sets.push('updated_at=?'); args.push(now());
  db.prepare(`UPDATE content SET ${sets.join(', ')} WHERE id=?`).run(...args, id);
  return getContent(id);
}

export function contentSummary() {
  const rows = openDb().prepare('SELECT status, COUNT(*) n FROM content GROUP BY status').all();
  const out = Object.fromEntries(CONTENT_FLOW.map((s) => [s, 0]));
  for (const r of rows) out[r.status] = r.n;
  return out;
}
