import { openDb, nextId, now, today } from './db.mjs';

export const TASK_STATUSES = ['BACKLOG','READY','IN_PROGRESS','BLOCKED','REVIEW','DONE','CANCELLED'];
export const AGENTS = [
  'growth-orchestrator','market-intelligence','aso-specialist','seo-content','social-growth',
  'creative-studio','community-partnerships','paid-acquisition','growth-analytics','founder'
];

export const score = ({ impact = 3, confidence = 0.5, urgency = 3, effort = 3 }) =>
  Math.round(((impact * confidence * urgency) / Math.max(effort, 1)) * 100) / 100;

// Phát hiện trùng: cùng title (bỏ dấu cách/hoa thường) ở trạng thái chưa đóng.
export function findDuplicate(title) {
  const norm = title.toLowerCase().replace(/\s+/g, ' ').trim();
  return openDb()
    .prepare(`SELECT id, title, status FROM tasks WHERE status NOT IN ('DONE','CANCELLED')`)
    .all()
    .find((t) => t.title.toLowerCase().replace(/\s+/g, ' ').trim() === norm);
}

export function addTask(t) {
  if (!t.title) throw new Error('title bắt buộc');
  if (!AGENTS.includes(t.agent)) throw new Error(`agent không hợp lệ: ${t.agent}. Chọn: ${AGENTS.join(', ')}`);
  const dup = findDuplicate(t.title);
  if (dup && !t.force) throw new Error(`Trùng với ${dup.id} (${dup.status}): "${dup.title}". Dùng --force nếu cố ý.`);
  const db = openDb();
  const id = nextId('tasks', 'T');
  const ts = now();
  const deps = Array.isArray(t.deps) ? t.deps : (t.deps ? String(t.deps).split(',').map((s) => s.trim()).filter(Boolean) : []);
  for (const d of deps) {
    if (!db.prepare('SELECT 1 FROM tasks WHERE id=?').get(d)) throw new Error(`dependency không tồn tại: ${d}`);
  }
  const fields = { impact: t.impact ?? 3, confidence: t.confidence ?? 0.5, urgency: t.urgency ?? 3, effort: t.effort ?? 3 };
  db.prepare(`INSERT INTO tasks (id,title,description,agent,priority,impact,confidence,urgency,effort,status,created_at,updated_at,deadline,depends_on,expected,sprint,needs_approval)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, t.title, t.description ?? '', t.agent, score(fields), fields.impact, fields.confidence, fields.urgency, fields.effort,
         t.status ?? 'BACKLOG', ts, ts, t.deadline ?? null, JSON.stringify(deps), t.expected ?? '', t.sprint ?? null, t.needs_approval ? 1 : 0);
  db.prepare('INSERT INTO task_history (task_id,at,from_status,to_status,note,actor) VALUES (?,?,?,?,?,?)')
    .run(id, ts, null, t.status ?? 'BACKLOG', 'created', t.actor ?? 'cli');
  return getTask(id);
}

export function getTask(id) {
  const t = openDb().prepare('SELECT * FROM tasks WHERE id=?').get(id);
  if (!t) throw new Error(`không có task ${id}`);
  t.depends_on = JSON.parse(t.depends_on);
  return t;
}

export function listTasks({ status, agent, sprint } = {}) {
  const where = []; const args = [];
  if (status) { where.push('status=?'); args.push(status); }
  if (agent) { where.push('agent=?'); args.push(agent); }
  if (sprint) { where.push('sprint=?'); args.push(sprint); }
  const sql = `SELECT * FROM tasks ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY
    CASE status WHEN 'IN_PROGRESS' THEN 0 WHEN 'READY' THEN 1 WHEN 'BLOCKED' THEN 2 WHEN 'REVIEW' THEN 3 WHEN 'BACKLOG' THEN 4 ELSE 9 END,
    priority DESC, deadline ASC`;
  return openDb().prepare(sql).all(...args).map((t) => ({ ...t, depends_on: JSON.parse(t.depends_on) }));
}

// Dependency chưa DONE thì không cho sang IN_PROGRESS.
function blockedBy(task) {
  const db = openDb();
  return task.depends_on.filter((d) => db.prepare('SELECT status FROM tasks WHERE id=?').get(d)?.status !== 'DONE');
}

export function updateTask(id, patch, actor = 'cli') {
  const db = openDb();
  const cur = getTask(id);
  const ts = now();
  if (patch.status) {
    if (!TASK_STATUSES.includes(patch.status)) throw new Error(`status không hợp lệ: ${patch.status}`);
    if (patch.status === 'IN_PROGRESS') {
      const b = blockedBy(cur);
      if (b.length) throw new Error(`${id} còn phụ thuộc chưa xong: ${b.join(', ')}`);
    }
    if (patch.status === 'DONE' && !(patch.evidence ?? cur.evidence)) {
      throw new Error('DONE cần --evidence (đường dẫn file hoặc URL kết quả)');
    }
    db.prepare('INSERT INTO task_history (task_id,at,from_status,to_status,note,actor) VALUES (?,?,?,?,?,?)')
      .run(id, ts, cur.status, patch.status, patch.note ?? '', actor);
  }
  const cols = ['title','description','agent','status','deadline','expected','actual','evidence','sprint'];
  const sets = []; const args = [];
  for (const c of cols) if (patch[c] !== undefined) { sets.push(`${c}=?`); args.push(patch[c]); }
  for (const c of ['impact','confidence','urgency','effort']) if (patch[c] !== undefined) { sets.push(`${c}=?`); args.push(patch[c]); }
  if (['impact','confidence','urgency','effort'].some((c) => patch[c] !== undefined)) {
    sets.push('priority=?'); args.push(score({ ...cur, ...patch }));
  }
  if (patch.deps !== undefined) {
    const deps = String(patch.deps).split(',').map((d) => d.trim()).filter(Boolean);
    for (const d of deps) if (!db.prepare('SELECT 1 FROM tasks WHERE id=?').get(d)) throw new Error(`dependency không tồn tại: ${d}`);
    sets.push('depends_on=?'); args.push(JSON.stringify(deps));
    db.prepare('INSERT INTO task_history (task_id,at,from_status,to_status,note,actor) VALUES (?,?,?,?,?,?)')
      .run(id, ts, cur.status, cur.status, `deps: ${cur.depends_on.join(',') || '—'} → ${deps.join(',') || '—'}. ${patch.note ?? ''}`, actor);
  }
  sets.push('updated_at=?'); args.push(ts);
  db.prepare(`UPDATE tasks SET ${sets.join(', ')} WHERE id=?`).run(...args, id);
  return getTask(id);
}

export function overdueTasks(ref = today()) {
  return listTasks().filter((t) => t.deadline && t.deadline < ref && !['DONE','CANCELLED'].includes(t.status));
}

export function taskHistory(id) {
  return openDb().prepare('SELECT * FROM task_history WHERE task_id=? ORDER BY id').all(id);
}

export function taskSummary() {
  const rows = openDb().prepare('SELECT status, COUNT(*) n FROM tasks GROUP BY status').all();
  const out = Object.fromEntries(TASK_STATUSES.map((s) => [s, 0]));
  for (const r of rows) out[r.status] = r.n;
  return out;
}
