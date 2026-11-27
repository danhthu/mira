#!/usr/bin/env node
// Mira Growth OS — CLI duy nhất. Chạy: node growth/os/bin/os.mjs <lệnh> [tham số]
// Mọi agent/skill thao tác dữ liệu qua đây, không mở SQLite trực tiếp.
process.removeAllListeners('warning'); // node:sqlite còn gắn nhãn experimental ở Node 22/24
import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { OS_ROOT, DB_PATH, openDb, closeDb, today, audit, loadConfig } from '../lib/db.mjs';
import * as T from '../lib/tasks.mjs';
import * as C from '../lib/campaigns.mjs';
import * as K from '../lib/content.mjs';
import * as X from '../lib/experiments.mjs';
import * as M from '../lib/metrics.mjs';
import * as R from '../lib/report.mjs';
import * as A from '../lib/attribution.mjs';
import * as S from '../lib/scheduler.mjs';

// Lệnh không có subcommand (link, dashboard, audit, budget, status…): argv[3] là cờ → không nuốt làm sub.
const [, , cmd, maybeSub, ...restArgs] = process.argv;
const sub = maybeSub !== undefined && !maybeSub.startsWith('-') ? maybeSub : undefined;
const rest = sub === undefined && maybeSub !== undefined ? [maybeSub, ...restArgs] : restArgs;
// Parser nhỏ: --key value | --key=value | --flag (boolean nếu không có giá trị theo sau). parseArgs non-strict coi option lạ là boolean nên không dùng.
function parse(args) {
  const values = { actor: 'cli' }; const positionals = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!a.startsWith('--')) { positionals.push(a); continue; }
    const eq = a.indexOf('=');
    if (eq > 0) { values[a.slice(2, eq)] = a.slice(eq + 1); continue; }
    const k = a.slice(2);
    if (i + 1 < args.length && !args[i + 1].startsWith('--')) { values[k] = args[++i]; } else { values[k] = true; }
  }
  return { values, positionals };
}
const { values: o, positionals } = parse(rest);
const out = (x) => console.log(o.json ? JSON.stringify(x, null, 2) : typeof x === 'string' ? x : table(x));
const num = (k) => (o[k] === undefined ? undefined : Number(o[k]));

function table(x) {
  if (Array.isArray(x)) {
    if (!x.length) return '(trống)';
    const cols = Object.keys(x[0]).filter((k) => !['description','depends_on','assets','metrics','results','lessons','series','channels'].includes(k));
    return [cols.join(' | '), ...x.map((r) => cols.map((c) => String(r[c] ?? '').slice(0, 60)).join(' | '))].join('\n');
  }
  return Object.entries(x).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('\n');
}

const HELP = `Mira Growth OS CLI — node growth/os/bin/os.mjs <lệnh>

  init                                   tạo DB + thư mục, in trạng thái
  status                                 tóm tắt nhanh (task, content, budget, approvals)
  task add --title --agent [--description --impact --confidence --urgency --effort --deadline --deps T-1,T-2 --expected --sprint --needs-approval]
  task list [--status S --agent A --sprint S1] | task show T-0001 | task history T-0001
  task update T-0001 [--status --actual --evidence --note --deadline --agent --impact ...]
  task overdue | task dup --title "..."
  campaign add --name --platform CH [--objective --audience --budget-usd --daily-cap-usd --start-date --end-date --tracking-link]
  campaign list | campaign show C-0001 | campaign update C-0001 --status RUNNING [--actor founder] [--results --lessons]
  expense add --amount-usd N [--campaign C-0001 --date --note]
  budget                                 trạng thái ngân sách
  approval list | approval request --kind budget|publish|access|code_change --request "..." [--ref C-0001]
  approval decide 3 --status APPROVED|REJECTED [--note]
  content add --topic --channel CH --format F [--hook --cta --body-ref --audience --source-slug --asset-ref]
  content list [--status --channel] | content show K-0001 | content update K-0001 --status REVIEW [--url --utm --metrics '{"views":10}']
  experiment add --hypothesis --channel CH --metric M [--objective --audience --variables --budget-usd --baseline --target --start-date --end-date --campaign]
  experiment list [--open] | experiment decide X-0001 --decision SCALE|ITERATE|STOP|INCONCLUSIVE --results "..."
  metric add --date --platform --channel --metric --value [--source --quality measured|estimated|unattributed --note]
  metric import file.csv | metric sum --metric installs [--from --to --platform --channel]
  link --url https://... --channel CH --campaign NAME [--content --term]
  report daily [--date] | report weekly [--date] | dashboard
  memory state | memory log --file DECISION_LOG|LEARNINGS --text "..."
  sprint md S1                           sinh growth/os/sprints/S1.md từ DB
  run <job> [--force] | runs | jobs
  audit [--limit 50]
`;

function main() {
  openDb();
  switch (cmd) {
    case undefined: case 'help': case '--help': return console.log(HELP);
    case 'init': {
      for (const d of ['reports/daily','reports/weekly','reports/monthly','logs','dashboard','analytics/imports']) {
        const p = join(OS_ROOT, d); if (!existsSync(p)) { import('node:fs').then((fs) => fs.mkdirSync(p, { recursive: true })); }
      }
      return out({ db: DB_PATH, ...statusObj() });
    }
    case 'status': return out(statusObj());
    case 'task': return task();
    case 'campaign': return campaign();
    case 'expense': return out(C.addExpense({ campaign_id: o.campaign, amount_usd: num('amount-usd'), date: o.date, note: o.note }, o.actor));
    case 'budget': return out(C.budgetStatus());
    case 'approval': return approval();
    case 'content': return content();
    case 'experiment': return experiment();
    case 'metric': return metric();
    case 'link': return out(A.buildLink({ url: o.url, channel: o.channel, campaign: o.campaign, content: o.content, term: o.term }));
    case 'report': {
      const date = o.date ?? today();
      if (sub === 'weekly') return out(`đã ghi ${R.writeWeeklyReport(date)}`);
      const next = o.next ? String(o.next).split('|') : [];
      return out(`đã ghi ${R.writeDailyReport(date, { next })}`);
    }
    case 'dashboard': return out(`đã ghi ${R.writeDashboard(o.date ?? today())}`);
    case 'memory': return memory();
    case 'sprint': return sprint();
    case 'run': return out(S.runJob(sub, { force: !!o.force }));
    case 'runs': return out(S.listRuns(num('limit') ?? 20));
    case 'jobs': return out(S.loadJobsConfig().jobs.map((j) => ({ name: j.name, when: j.when, type: j.type, desc: j.desc })));
    case 'audit': return out(openDb().prepare('SELECT * FROM audit_log ORDER BY id DESC LIMIT ?').all(num('limit') ?? 50));
    default: throw new Error(`lệnh không biết: ${cmd}\n${HELP}`);
  }
}

function statusObj() {
  return { tasks: T.taskSummary(), content: K.contentSummary(), budget: C.budgetStatus(), approvals_pending: C.listApprovals('PENDING').length,
           experiments_open: X.listExperiments({ open: true }).length, overdue: T.overdueTasks().length };
}

function task() {
  switch (sub) {
    case 'add': return out(T.addTask({ title: o.title, description: o.description, agent: o.agent, impact: num('impact'), confidence: num('confidence'),
      urgency: num('urgency'), effort: num('effort'), deadline: o.deadline, deps: o.deps, expected: o.expected, sprint: o.sprint,
      needs_approval: !!o['needs-approval'], status: o.status, force: !!o.force, actor: o.actor }));
    case 'list': return out(T.listTasks({ status: o.status, agent: o.agent, sprint: o.sprint }));
    case 'show': return out(T.getTask(positionals[0]));
    case 'history': return out(T.taskHistory(positionals[0]));
    case 'update': return out(T.updateTask(positionals[0], { status: o.status, actual: o.actual, evidence: o.evidence, note: o.note, deadline: o.deadline,
      agent: o.agent, title: o.title, description: o.description, expected: o.expected, sprint: o.sprint, deps: o.deps === true ? '' : o.deps,
      impact: num('impact'), confidence: num('confidence'), urgency: num('urgency'), effort: num('effort') }, o.actor));
    case 'overdue': return out(T.overdueTasks());
    case 'dup': return out(T.findDuplicate(o.title) ?? 'không trùng');
    default: throw new Error('task add|list|show|history|update|overdue|dup');
  }
}

function campaign() {
  switch (sub) {
    case 'add': return out(C.addCampaign({ name: o.name, platform: o.platform, objective: o.objective, audience: o.audience, budget_usd: num('budget-usd'),
      daily_cap_usd: num('daily-cap-usd'), start_date: o['start-date'], end_date: o['end-date'], tracking_link: o['tracking-link'] }));
    case 'list': return out(C.listCampaigns());
    case 'show': return out(C.getCampaign(positionals[0]));
    case 'update': return out(C.updateCampaign(positionals[0], { status: o.status, results: o.results, lessons: o.lessons, name: o.name, note: o.note,
      tracking_link: o['tracking-link'], start_date: o['start-date'], end_date: o['end-date'] }, o.actor));
    default: throw new Error('campaign add|list|show|update');
  }
}

function approval() {
  switch (sub) {
    case 'list': return out(C.listApprovals(o.status ?? 'PENDING'));
    case 'request': return out(C.requestApproval(o.kind, o.ref, o.request));
    case 'decide': return out(C.decideApproval(Number(positionals[0]), o.status, o.note));
    default: throw new Error('approval list|request|decide');
  }
}

function content() {
  switch (sub) {
    case 'add': return out(K.addContent({ topic: o.topic, channel: o.channel, format: o.format, hook: o.hook, cta: o.cta, body_ref: o['body-ref'],
      audience: o.audience, source_slug: o['source-slug'], asset_ref: o['asset-ref'], status: o.status, force: !!o.force }));
    case 'list': return out(K.listContent({ status: o.status, channel: o.channel }));
    case 'show': return out(K.getContent(positionals[0]));
    case 'update': return out(K.updateContent(positionals[0], { status: o.status, url: o.url, utm: o.utm, hook: o.hook, cta: o.cta, body_ref: o['body-ref'],
      asset_ref: o['asset-ref'], metrics: o.metrics ? JSON.parse(o.metrics) : undefined, published_at: o['published-at'] }, o.actor));
    default: throw new Error('content add|list|show|update');
  }
}

function experiment() {
  switch (sub) {
    case 'add': return out(X.addExperiment({ hypothesis: o.hypothesis, channel: o.channel, metric: o.metric, objective: o.objective, audience: o.audience,
      variables: o.variables, budget_usd: num('budget-usd'), baseline: o.baseline, target: o.target, start_date: o['start-date'], end_date: o['end-date'], campaign_id: o.campaign }));
    case 'list': return out(X.listExperiments({ open: !!o.open }));
    case 'show': return out(X.getExperiment(positionals[0]));
    case 'update': return out(X.updateExperiment(positionals[0], { results: o.results, baseline: o.baseline, target: o.target, end_date: o['end-date'] }));
    case 'decide': return out(X.decideExperiment(positionals[0], o.decision, o.results, o.actor));
    default: throw new Error('experiment add|list|show|update|decide');
  }
}

function metric() {
  switch (sub) {
    case 'add': return out(M.putMetric({ date: o.date ?? today(), platform: o.platform, channel: o.channel ?? 'UNKNOWN', metric: o.metric, value: o.value,
      source: o.source ?? 'manual', quality: o.quality, note: o.note }));
    case 'import': return out(`đã nạp ${M.importCsv(positionals[0])} dòng`);
    case 'sum': return out({ metric: o.metric, value: M.sumMetric({ metric: o.metric, from: o.from, to: o.to, platform: o.platform, channel: o.channel }) });
    default: throw new Error('metric add|import|sum');
  }
}

// sprint md S1 → growth/os/sprints/S1.md sinh từ DB (nguồn sự thật là DB, file chỉ để đọc/commit).
function sprint() {
  if (sub !== 'md') throw new Error('sprint md <S1>');
  const id = positionals[0]; if (!id) throw new Error('thiếu mã sprint');
  const rows = T.listTasks({ sprint: id });
  if (!rows.length) throw new Error(`không có task sprint ${id}`);
  const byAgent = {};
  for (const t of rows) (byAgent[t.agent] ??= []).push(t);
  const NL = '\n';
  const line = (t) => `| ${t.id} | ${t.title} | ${t.priority} | ${t.deadline ?? ''} | ${t.status} | ${t.depends_on.join(', ') || '—'} | ${t.needs_approval ? 'Founder' : ''} | ${t.expected} |`;
  const md = `# Sprint ${id} — kế hoạch 14 ngày (sinh từ DB ${today()})

Nguồn sự thật: \`node growth/os/bin/os.mjs task list --sprint ${id}\`. File này chỉ để đọc; sửa task bằng CLI rồi chạy lại \`sprint md ${id}\`.

Tổng: ${rows.length} task · READY ${rows.filter((t) => t.status === 'READY').length} · BACKLOG ${rows.filter((t) => t.status === 'BACKLOG').length} · cần Founder ${rows.filter((t) => t.needs_approval).length}

## Theo ưu tiên (Priority Score = impact × confidence × urgency / effort)

| ID | Việc | Điểm | Hạn | Trạng thái | Phụ thuộc | Duyệt | Kết quả mong đợi |
|---|---|---|---|---|---|---|---|
${rows.map(line).join(NL)}

## Theo agent
${Object.entries(byAgent).map(([a, ts]) => `
### ${a} (${ts.length})
${ts.map((t) => `- ${t.id} [${t.status}] ${t.title} — hạn ${t.deadline ?? '—'}`).join(NL)}`).join(NL)}

## Thứ tự bắt đầu
1. Task READY không phụ thuộc, không cần credential: làm ngay (research, product-analysis, duyệt bài, CSV thử).
2. Task \`founder\`: hỏi trong báo cáo ngày đầu tiên; mỗi cái mở khoá một nhánh (domain → landing/widget; social → lịch đăng/thử nghiệm).
3. Task phụ thuộc chuyển READY khi dependency DONE (CLI chặn IN_PROGRESS nếu chưa).
`;
  const dir = join(OS_ROOT, 'sprints');
  const p = join(dir, `${id}.md`);
  writeFileSync(p, md, 'utf8');
  return out(`đã ghi ${p}`);
}

function memory() {
  const dir = join(OS_ROOT, 'memory');
  switch (sub) {
    case 'state': {
      // Cập nhật khối "Số liệu tự động" trong CURRENT_STATE.md từ snapshot; phần còn lại do CGO viết tay.
      const p = join(dir, 'CURRENT_STATE.md');
      const s = R.snapshot();
      const block = `<!-- AUTO:BEGIN -->
_Cập nhật tự động ${s.date} bởi \`os memory state\` — đừng sửa tay trong khối này._
- Ngày ${s.elapsed}/90 · installs ${s.installs.total}/${s.target} (Android ${s.installs.android}, iOS ${s.installs.ios}, PWA ${s.installs.pwa}) · waitlist ${s.waitlist}
- Task: ${s.tasks.IN_PROGRESS} đang làm · ${s.tasks.READY + s.tasks.BACKLOG} chờ · ${s.tasks.BLOCKED} kẹt · ${s.tasks.DONE} xong · quá hạn ${s.overdue.length}
- Ngân sách: chi ${s.budget.spent_usd}/${s.budget.total_usd} USD · chờ duyệt ${s.approvals.length}
- Thử nghiệm mở: ${s.experiments_running} · nội dung đã đăng: ${s.content.PUBLISHED + s.content.MEASURED + s.content.REUSED}
<!-- AUTO:END -->`;
      let txt = existsSync(p) ? readFileSync(p, 'utf8') : '# CURRENT_STATE\n\n<!-- AUTO:BEGIN -->\n<!-- AUTO:END -->\n';
      txt = /<!-- AUTO:BEGIN -->[\s\S]*<!-- AUTO:END -->/.test(txt) ? txt.replace(/<!-- AUTO:BEGIN -->[\s\S]*<!-- AUTO:END -->/, block) : txt + '\n' + block + '\n';
      writeFileSync(p, txt, 'utf8');
      return out(`đã cập nhật ${p}`);
    }
    case 'log': {
      const file = o.file ?? 'LEARNINGS';
      if (!['DECISION_LOG','LEARNINGS'].includes(file)) throw new Error('--file DECISION_LOG|LEARNINGS');
      const p = join(dir, `${file}.md`);
      appendFileSync(p, `\n- **${today()}** (${o.actor}) ${o.text}\n`, 'utf8');
      audit(o.actor, `memory.${file}`, null, o.text);
      return out(`đã ghi vào ${p}`);
    }
    default: throw new Error('memory state|log');
  }
}

try { main(); } catch (e) { console.error(`LỖI: ${e.message}`); process.exitCode = 1; } finally { closeDb(); }
