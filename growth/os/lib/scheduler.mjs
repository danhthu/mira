// Scheduler: chạy job xác định (không cần LLM) với lock, retry, log, idempotent.
// Job cần LLM (planning, viết bài) KHÔNG chạy ở đây — chúng được gọi qua Claude Code scheduled task
// với prompt nêu trong scheduler/jobs.json (field "claude_prompt"). Xem scheduler/README.md.
import { readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { OS_ROOT, openDb, now, today } from './db.mjs';
import { writeDailyReport, writeWeeklyReport, writeDashboard, snapshot } from './report.mjs';
import { overdueTasks } from './tasks.mjs';
import { hasData } from './metrics.mjs';

const LOG_DIR = process.env.GROWTH_OS_LOGS || join(OS_ROOT, 'logs');

export function log(job, msg) {
  mkdirSync(LOG_DIR, { recursive: true });
  appendFileSync(join(LOG_DIR, `${today()}.log`), `${now()} [${job}] ${msg}\n`, 'utf8');
}

export function acquireLock(name, ttlSec = 1800) {
  const db = openDb();
  const t = Date.now();
  const cur = db.prepare('SELECT * FROM locks WHERE name=?').get(name);
  if (cur && new Date(cur.expires_at).getTime() > t) return null; // còn khoá sống
  const owner = `${process.pid}-${t}`;
  db.prepare('INSERT OR REPLACE INTO locks (name,owner,acquired_at,expires_at) VALUES (?,?,?,?)')
    .run(name, owner, new Date(t).toISOString(), new Date(t + ttlSec * 1000).toISOString());
  return owner;
}

export function releaseLock(name, owner) {
  openDb().prepare('DELETE FROM locks WHERE name=? AND owner=?').run(name, owner);
}

// Mỗi job chạy tối đa 1 lần thành công/ngày (idempotent) trừ khi --force.
function ranTodaySuccessfully(job) {
  return !!openDb().prepare(`SELECT 1 FROM runs WHERE job=? AND status='OK' AND started_at LIKE ? LIMIT 1`).get(job, `${today()}%`);
}

export const JOBS = {
  // 07:00 — thu số. Không có integration thật thì chỉ kiểm tra xem hôm qua đã có số chưa và nhắc.
  'collect-metrics': () => {
    const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const missing = ['installs', 'pageviews', 'waitlist'].filter((m) => !hasData(y, m));
    const dash = writeDashboard();
    return `dashboard=${dash}; thiếu số ngày ${y}: ${missing.join(', ') || 'không'}${missing.length ? ' → cần nạp tay (os metric add / metric import) hoặc nối integration' : ''}`;
  },
  // 18:00 — kiểm việc: quá hạn, task chờ review, lock hết hạn.
  'verify-tasks': () => {
    const od = overdueTasks();
    openDb().prepare('DELETE FROM locks WHERE expires_at < ?').run(now());
    return `quá hạn: ${od.length}${od.length ? ' — ' + od.map((t) => t.id).join(',') : ''}`;
  },
  // 20:00 — báo cáo ngày + dashboard.
  'daily-report': () => `report=${writeDailyReport()}; dashboard=${writeDashboard()}`,
  // Thứ Sáu — báo cáo tuần (phần số; phần phân tích do skill weekly-growth-review điền).
  'weekly-report': () => `report=${writeWeeklyReport()}`,
  // Kiểm sức khoẻ hệ thống (dùng cho test & cron watchdog).
  'healthcheck': () => { const s = snapshot(); return `ok elapsed=${s.elapsed} installs=${s.installs.total}`; }
};

export function runJob(job, { force = false, maxAttempts = 3 } = {}) {
  if (!JOBS[job]) throw new Error(`job không tồn tại: ${job}. Có: ${Object.keys(JOBS).join(', ')}`);
  const db = openDb();
  if (!force && ranTodaySuccessfully(job)) {
    db.prepare('INSERT INTO runs (job,started_at,finished_at,status,output) VALUES (?,?,?,?,?)').run(job, now(), now(), 'SKIPPED', 'đã chạy OK hôm nay');
    log(job, 'SKIPPED (đã chạy OK hôm nay)');
    return { status: 'SKIPPED' };
  }
  const owner = acquireLock(`job:${job}`);
  if (!owner) {
    db.prepare('INSERT INTO runs (job,started_at,finished_at,status,output) VALUES (?,?,?,?,?)').run(job, now(), now(), 'SKIPPED', 'đang bị khoá bởi tiến trình khác');
    log(job, 'SKIPPED (lock)');
    return { status: 'SKIPPED', reason: 'lock' };
  }
  let attempt = 0, lastErr;
  try {
    while (attempt < maxAttempts) {
      attempt++;
      const started = now();
      const r = db.prepare('INSERT INTO runs (job,started_at,status,attempt) VALUES (?,?,?,?)').run(job, started, 'RUNNING', attempt);
      try {
        const out = String(JOBS[job]() ?? '');
        db.prepare(`UPDATE runs SET finished_at=?, status='OK', output=? WHERE id=?`).run(now(), out, r.lastInsertRowid);
        log(job, `OK (lần ${attempt}) ${out}`);
        return { status: 'OK', output: out, attempt };
      } catch (e) {
        lastErr = e;
        db.prepare(`UPDATE runs SET finished_at=?, status='FAILED', error=? WHERE id=?`).run(now(), String(e.stack ?? e), r.lastInsertRowid);
        log(job, `FAILED (lần ${attempt}) ${e.message}`);
      }
    }
  } finally {
    releaseLock(`job:${job}`, owner);
  }
  notifyFailure(job, lastErr);
  return { status: 'FAILED', error: lastErr?.message, attempt };
}

// Thông báo thất bại: ghi file ALERTS.md để Founder/CGO thấy ở lần mở tiếp. Nối Telegram qua skill telegram-report-bot nếu được cấu hình.
export function notifyFailure(job, err) {
  const p = join(LOG_DIR, 'ALERTS.md');
  mkdirSync(LOG_DIR, { recursive: true });
  appendFileSync(p, `- ${now()} job **${job}** thất bại sau retry: ${err?.message ?? err}\n`, 'utf8');
}

export function listRuns(limit = 20) {
  return openDb().prepare('SELECT * FROM runs ORDER BY id DESC LIMIT ?').all(limit);
}

export function loadJobsConfig() {
  return JSON.parse(readFileSync(join(OS_ROOT, 'scheduler', 'jobs.json'), 'utf8'));
}
