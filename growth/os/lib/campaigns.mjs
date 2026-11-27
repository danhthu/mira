import { openDb, nextId, now, today, audit, loadConfig } from './db.mjs';

const CAMPAIGN_STATUSES = ['DRAFT','PENDING_APPROVAL','APPROVED','RUNNING','PAUSED','STOPPED','DONE'];

export function validChannel(ch) {
  const { channels } = loadConfig('channels');
  if (!channels[ch]) throw new Error(`channel không có trong taxonomy: ${ch}. Hợp lệ: ${Object.keys(channels).join(', ')}`);
  return ch;
}

export function addCampaign(c) {
  if (!c.name) throw new Error('name bắt buộc');
  validChannel(c.platform);
  const budget = loadConfig('budget');
  const b = Number(c.budget_usd ?? 0);
  if (b > budget.max_single_campaign_usd) throw new Error(`budget ${b} vượt trần mỗi campaign ${budget.max_single_campaign_usd} USD`);
  const cap = Number(c.daily_cap_usd ?? 0);
  if (cap > budget.max_daily_cap_usd) throw new Error(`daily cap ${cap} vượt trần ${budget.max_daily_cap_usd} USD/ngày`);
  const db = openDb();
  const id = nextId('campaigns', 'C');
  const ts = now();
  const { channels } = loadConfig('channels');
  const status = channels[c.platform].paid ? 'PENDING_APPROVAL' : (c.status ?? 'DRAFT');
  db.prepare(`INSERT INTO campaigns (id,name,objective,audience,platform,assets,tracking_link,budget_usd,daily_cap_usd,start_date,end_date,status,created_at,updated_at)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, c.name, c.objective ?? '', c.audience ?? '', c.platform, JSON.stringify(c.assets ?? []), c.tracking_link ?? '',
         b, cap, c.start_date ?? null, c.end_date ?? null, status, ts, ts);
  if (status === 'PENDING_APPROVAL') {
    db.prepare('INSERT INTO approvals (kind,ref_id,request,requested_at) VALUES (?,?,?,?)')
      .run('budget', id, `Duyệt campaign trả phí "${c.name}" trên ${c.platform}: ${b} USD, cap ${cap} USD/ngày`, ts);
  }
  return getCampaign(id);
}

export function getCampaign(id) {
  const c = openDb().prepare('SELECT * FROM campaigns WHERE id=?').get(id);
  if (!c) throw new Error(`không có campaign ${id}`);
  c.assets = JSON.parse(c.assets);
  c.spent_usd = spentFor(id);
  return c;
}

export function listCampaigns() {
  return openDb().prepare('SELECT id FROM campaigns ORDER BY id').all().map((r) => getCampaign(r.id));
}

export function updateCampaign(id, patch, actor = 'cli') {
  const cur = getCampaign(id);
  if (patch.status && !CAMPAIGN_STATUSES.includes(patch.status)) throw new Error(`status không hợp lệ: ${patch.status}`);
  if (patch.status === 'APPROVED') {
    if (actor !== 'founder') throw new Error('Chỉ founder được APPROVED. Dùng --actor founder khi Founder đã duyệt bằng lời/chat.');
    patch.approved_by = 'founder'; patch.approved_at = now();
    openDb().prepare(`UPDATE approvals SET status='APPROVED', decided_at=?, decided_by='founder' WHERE ref_id=? AND status='PENDING'`).run(now(), id);
  }
  if (patch.status === 'RUNNING') {
    const { channels } = loadConfig('channels');
    if (channels[cur.platform].paid && !['APPROVED','PAUSED'].includes(cur.status)) {
      throw new Error(`campaign trả phí phải APPROVED trước khi RUNNING (hiện ${cur.status})`);
    }
  }
  const cols = ['name','objective','audience','tracking_link','start_date','end_date','status','results','lessons','approved_by','approved_at'];
  const sets = []; const args = [];
  for (const c of cols) if (patch[c] !== undefined) { sets.push(`${c}=?`); args.push(patch[c]); }
  if (patch.assets) { sets.push('assets=?'); args.push(JSON.stringify(patch.assets)); }
  sets.push('updated_at=?'); args.push(now());
  openDb().prepare(`UPDATE campaigns SET ${sets.join(', ')} WHERE id=?`).run(...args, id);
  if (patch.status) audit(actor, `campaign.${patch.status}`, id, patch.note ?? '');
  return getCampaign(id);
}

export function spentFor(campaignId) {
  return openDb().prepare('SELECT COALESCE(SUM(amount_usd),0) s FROM expenses WHERE campaign_id=?').get(campaignId).s;
}

export function totalSpent() {
  return openDb().prepare('SELECT COALESCE(SUM(amount_usd),0) s FROM expenses').get().s;
}

// Cổng ngân sách: không bao giờ vượt tổng, không chi cho campaign chưa duyệt, không vượt budget campaign.
export function addExpense({ campaign_id, amount_usd, date = today(), note = '' }, actor = 'cli') {
  const amt = Number(amount_usd);
  if (!(amt > 0)) throw new Error('amount_usd phải > 0');
  const budget = loadConfig('budget');
  if (totalSpent() + amt > budget.total_usd) {
    throw new Error(`Vượt tổng ngân sách ${budget.total_usd} USD (đã chi ${totalSpent()}, muốn thêm ${amt})`);
  }
  if (campaign_id) {
    const c = getCampaign(campaign_id);
    if (!['APPROVED','RUNNING','PAUSED','STOPPED','DONE'].includes(c.status)) throw new Error(`campaign ${campaign_id} chưa được duyệt (${c.status})`);
    if (c.spent_usd + amt > c.budget_usd) throw new Error(`Vượt budget campaign ${campaign_id}: ${c.budget_usd} USD (đã chi ${c.spent_usd})`);
  }
  openDb().prepare('INSERT INTO expenses (campaign_id,date,amount_usd,note,recorded_at) VALUES (?,?,?,?,?)')
    .run(campaign_id ?? null, date, amt, note, now());
  audit(actor, 'expense.add', campaign_id ?? null, `${amt} USD ${note}`);
  return budgetStatus();
}

export function budgetStatus() {
  const budget = loadConfig('budget');
  const spent = totalSpent();
  const approved = openDb().prepare(`SELECT COALESCE(SUM(budget_usd),0) s FROM campaigns WHERE status IN ('APPROVED','RUNNING','PAUSED')`).get().s;
  return { total_usd: budget.total_usd, approved_usd: approved, spent_usd: spent, remaining_usd: budget.total_usd - spent };
}

export function listApprovals(status = 'PENDING') {
  return openDb().prepare('SELECT * FROM approvals WHERE status=? ORDER BY id').all(status);
}

export function requestApproval(kind, ref_id, request) {
  const db = openDb();
  db.prepare('INSERT INTO approvals (kind,ref_id,request,requested_at) VALUES (?,?,?,?)').run(kind, ref_id ?? null, request, now());
  return db.prepare('SELECT * FROM approvals ORDER BY id DESC LIMIT 1').get();
}

export function decideApproval(id, status, note = '') {
  if (!['APPROVED','REJECTED'].includes(status)) throw new Error('status phải là APPROVED hoặc REJECTED');
  openDb().prepare(`UPDATE approvals SET status=?, decided_at=?, decided_by='founder', note=? WHERE id=?`).run(status, now(), note, id);
  audit('founder', `approval.${status}`, String(id), note);
  return openDb().prepare('SELECT * FROM approvals WHERE id=?').get(id);
}
