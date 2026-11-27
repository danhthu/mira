// Chạy: node --test growth/os/tests/
// Dùng DB test riêng (GROWTH_OS_DB) — không đụng growth.sqlite thật.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'mira-os-'));
process.env.GROWTH_OS_DB = join(dir, 'test.sqlite');
process.env.GROWTH_OS_LOGS = join(dir, 'logs');
process.removeAllListeners('warning');

const T = await import('../lib/tasks.mjs');
const C = await import('../lib/campaigns.mjs');
const K = await import('../lib/content.mjs');
const X = await import('../lib/experiments.mjs');
const M = await import('../lib/metrics.mjs');
const R = await import('../lib/report.mjs');
const S = await import('../lib/scheduler.mjs');
const A = await import('../lib/attribution.mjs');
const { openDb, closeDb } = await import('../lib/db.mjs');

before(() => openDb());
after(() => { closeDb(); rmSync(dir, { recursive: true, force: true }); });

test('task: tạo, điểm ưu tiên, trùng, phụ thuộc, DONE cần evidence', () => {
  const a = T.addTask({ title: 'Audit listing', agent: 'aso-specialist', impact: 4, confidence: 0.8, urgency: 4, effort: 2 });
  assert.equal(a.id, 'T-0001');
  assert.equal(a.priority, 6.4);
  assert.throws(() => T.addTask({ title: 'audit  listing', agent: 'aso-specialist' }), /Trùng với T-0001/);
  assert.throws(() => T.addTask({ title: 'x', agent: 'nobody' }), /agent không hợp lệ/);
  const b = T.addTask({ title: 'Viết mô tả store', agent: 'aso-specialist', deps: 'T-0001' });
  assert.throws(() => T.updateTask(b.id, { status: 'IN_PROGRESS' }), /phụ thuộc chưa xong/);
  assert.throws(() => T.updateTask(a.id, { status: 'DONE' }), /evidence/);
  T.updateTask(a.id, { status: 'DONE', evidence: 'growth/os/docs/x.md' });
  assert.equal(T.updateTask(b.id, { status: 'IN_PROGRESS' }).status, 'IN_PROGRESS');
  assert.equal(T.taskHistory(a.id).length, 2);
});

test('task: quá hạn', () => {
  T.addTask({ title: 'Trễ', agent: 'seo-content', deadline: '2026-01-01' });
  assert.ok(T.overdueTasks('2026-10-13').some((t) => t.title === 'Trễ'));
});

test('campaign: trả phí phải chờ duyệt, chỉ founder duyệt, trần campaign', () => {
  assert.throws(() => C.addCampaign({ name: 'to', platform: 'META_ADS', budget_usd: 50 }), /vượt trần mỗi campaign/);
  assert.throws(() => C.addCampaign({ name: 'x', platform: 'NOPE' }), /taxonomy/);
  const c = C.addCampaign({ name: 'FB test góc C', platform: 'META_ADS', budget_usd: 20, daily_cap_usd: 3 });
  assert.equal(c.status, 'PENDING_APPROVAL');
  assert.equal(C.listApprovals().length, 1);
  assert.throws(() => C.updateCampaign(c.id, { status: 'RUNNING' }), /APPROVED trước/);
  assert.throws(() => C.updateCampaign(c.id, { status: 'APPROVED' }, 'cli'), /Chỉ founder/);
  assert.equal(C.updateCampaign(c.id, { status: 'APPROVED' }, 'founder').approved_by, 'founder');
  assert.equal(C.listApprovals().length, 0);
  assert.equal(C.updateCampaign(c.id, { status: 'RUNNING' }).status, 'RUNNING');
  const org = C.addCampaign({ name: 'Threads organic', platform: 'THREADS' });
  assert.equal(org.status, 'DRAFT');
});

test('expense: không vượt budget campaign, không vượt tổng 100', () => {
  assert.throws(() => C.addExpense({ campaign_id: 'C-0002', amount_usd: 1 }), /chưa được duyệt/);
  C.addExpense({ campaign_id: 'C-0001', amount_usd: 15 });
  assert.throws(() => C.addExpense({ campaign_id: 'C-0001', amount_usd: 6 }), /Vượt budget campaign/);
  assert.throws(() => C.addExpense({ amount_usd: 90 }), /Vượt tổng ngân sách/);
  assert.equal(C.budgetStatus().spent_usd, 15);
});

test('content: workflow, trùng, chất lượng giọng Mira, PUBLISHED cần url', () => {
  const k = K.addContent({ topic: 'Một giờ đời bạn giá bao nhiêu', channel: 'FACEBOOK_ORGANIC', format: 'post', source_slug: 'mot-gio-doi-ban-gia-bao-nhieu' });
  assert.equal(k.status, 'IDEA');
  assert.throws(() => K.addContent({ topic: 'khác', channel: 'FACEBOOK_ORGANIC', format: 'post', source_slug: 'mot-gio-doi-ban-gia-bao-nhieu' }), /Trùng/);
  assert.throws(() => K.updateContent(k.id, { status: 'PUBLISHED' }), /không chuyển được IDEA/);
  K.updateContent(k.id, { status: 'DRAFT' });
  assert.throws(() => K.updateContent(k.id, { status: 'REVIEW' }), /thiếu hook/);
  assert.throws(() => K.updateContent(k.id, { status: 'REVIEW', hook: 'Hãy tính ngay!', cta: 'x', body_ref: 'f.md' }), /trái giọng/);
  K.updateContent(k.id, { status: 'REVIEW', hook: 'Lương 30 triệu, một giờ đời bạn 115 nghìn', cta: 'thử máy tính', body_ref: 'growth/content/vi/01.md' });
  K.updateContent(k.id, { status: 'APPROVED' });
  assert.throws(() => K.updateContent(k.id, { status: 'PUBLISHED' }), /cần --url/);
  const p = K.updateContent(k.id, { status: 'PUBLISHED', url: 'https://facebook.com/x' });
  assert.ok(p.published_at);
  // cờ vắng (undefined) không đè dữ liệu cũ; "không phải" không bị coi là lời khuyên
  const k2 = K.addContent({ topic: 'Giờ kẹt xe không phải giờ nghỉ', channel: 'BLOG', format: 'blog', hook: 'Giờ kẹt xe không phải giờ nghỉ', cta: 'thử máy tính', body_ref: 'x.md', status: 'DRAFT' });
  assert.equal(K.updateContent(k2.id, { status: 'REVIEW', hook: undefined, cta: undefined, body_ref: undefined }).hook, 'Giờ kẹt xe không phải giờ nghỉ');
});

test('experiment: không SCALE bằng chỉ số phù phiếm, cần results', () => {
  const x = X.addExperiment({ hypothesis: 'Góc C CTR cao hơn B', channel: 'META_ADS', metric: 'impressions' });
  assert.throws(() => X.decideExperiment(x.id, 'SCALE', 'nhiều view'), /phù phiếm|không SCALE/);
  const y = X.addExperiment({ hypothesis: 'Góc C ra waitlist rẻ hơn', channel: 'META_ADS', metric: 'waitlist' });
  assert.throws(() => X.decideExperiment(y.id, 'STOP'), /cần --results/);
  assert.equal(X.decideExperiment(y.id, 'ITERATE', '12 email, 0.9 USD/email').decision, 'ITERATE');
});

test('metrics: idempotent, ước tính cần note, snapshot không cộng waitlist vào installs', () => {
  M.putMetric({ date: '2026-10-13', platform: 'android', channel: 'BLOG', metric: 'installs', value: 3, source: 'play_console_csv' });
  M.putMetric({ date: '2026-10-13', platform: 'android', channel: 'BLOG', metric: 'installs', value: 4, source: 'play_console_csv' });
  assert.equal(M.sumMetric({ metric: 'installs', from: '2026-10-13', to: '2026-10-13' }), 4);
  assert.throws(() => M.putMetric({ date: '2026-10-13', platform: 'ios', channel: 'SEO', metric: 'installs', value: 2, quality: 'estimated' }), /note/);
  M.putMetric({ date: '2026-10-13', platform: 'pwa', channel: 'FACEBOOK_ORGANIC', metric: 'pwa_installs', value: 2, source: 'manual' });
  M.putMetric({ date: '2026-10-13', platform: 'web', channel: 'BLOG', metric: 'waitlist', value: 50, source: 'manual' });
  const s = R.snapshot('2026-10-13');
  assert.equal(s.installs.total, 6);
  assert.equal(s.waitlist, 50);
  assert.equal(s.acquisition.organic, 6);
  const md = R.dailyReport('2026-10-13');
  assert.match(md, /Tổng: 6/);
  assert.match(md, /KHÔNG cộng vào installs\): 50/);
});

test('attribution: UTM theo taxonomy', () => {
  const l = A.buildLink({ url: 'https://mira.trady360.com/blog/x', channel: 'TIKTOK', campaign: 'hook3' });
  assert.match(l, /utm_source=tiktok/); assert.match(l, /utm_medium=social/);
  assert.throws(() => A.buildLink({ url: 'https://x.y', channel: 'NOPE', campaign: 'a' }), /không hợp lệ/);
});

test('scheduler: lock, idempotent theo ngày, retry + alert khi fail', () => {
  const r1 = S.runJob('healthcheck');
  assert.equal(r1.status, 'OK');
  assert.equal(S.runJob('healthcheck').status, 'SKIPPED');
  assert.equal(S.runJob('healthcheck', { force: true }).status, 'OK');
  const owner = S.acquireLock('job:healthcheck');
  assert.ok(owner);
  assert.equal(S.runJob('healthcheck', { force: true }).reason, 'lock');
  S.releaseLock('job:healthcheck', owner);
  S.JOBS['boom'] = () => { throw new Error('nổ'); };
  const f = S.runJob('boom', { maxAttempts: 2 });
  assert.equal(f.status, 'FAILED'); assert.equal(f.attempt, 2);
  assert.throws(() => S.runJob('khong-co'), /job không tồn tại/);
});
