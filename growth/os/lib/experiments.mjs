import { openDb, nextId, now, audit } from './db.mjs';
import { validChannel } from './campaigns.mjs';

export const DECISIONS = ['SCALE','ITERATE','STOP','INCONCLUSIVE'];
// Chỉ số "phù phiếm" — không được dùng làm căn cứ SCALE một mình.
const VANITY = ['impressions','likes','views','reach','followers'];

export function addExperiment(x) {
  if (!x.hypothesis || !x.channel || !x.metric) throw new Error('hypothesis, channel, metric bắt buộc');
  validChannel(x.channel);
  const db = openDb();
  const id = nextId('experiments', 'X');
  const ts = now();
  db.prepare(`INSERT INTO experiments (id,hypothesis,objective,channel,audience,variables,budget_usd,metric,baseline,target,start_date,end_date,campaign_id,created_at,updated_at)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, x.hypothesis, x.objective ?? '', x.channel, x.audience ?? '', x.variables ?? '', Number(x.budget_usd ?? 0), x.metric,
         x.baseline ?? '', x.target ?? '', x.start_date ?? null, x.end_date ?? null, x.campaign_id ?? null, ts, ts);
  return getExperiment(id);
}

export function getExperiment(id) {
  const x = openDb().prepare('SELECT * FROM experiments WHERE id=?').get(id);
  if (!x) throw new Error(`không có experiment ${id}`);
  return x;
}

export function listExperiments({ open } = {}) {
  return openDb().prepare(`SELECT * FROM experiments ${open ? 'WHERE decision IS NULL' : ''} ORDER BY id`).all();
}

export function updateExperiment(id, patch) {
  getExperiment(id);
  const cols = ['hypothesis','objective','audience','variables','baseline','target','start_date','end_date','results','campaign_id'];
  const sets = []; const args = [];
  for (const c of cols) if (patch[c] !== undefined) { sets.push(`${c}=?`); args.push(patch[c]); }
  sets.push('updated_at=?'); args.push(now());
  openDb().prepare(`UPDATE experiments SET ${sets.join(', ')} WHERE id=?`).run(...args, id);
  return getExperiment(id);
}

export function decideExperiment(id, decision, results, actor = 'cli') {
  if (!DECISIONS.includes(decision)) throw new Error(`decision phải là ${DECISIONS.join('|')}`);
  const x = getExperiment(id);
  if (!results && !x.results) throw new Error('cần --results trước khi quyết định');
  if (decision === 'SCALE' && VANITY.includes(x.metric.toLowerCase())) {
    throw new Error(`không SCALE dựa trên chỉ số "${x.metric}" — cần installs/waitlist/clicks ra store`);
  }
  openDb().prepare('UPDATE experiments SET decision=?, decided_at=?, results=COALESCE(NULLIF(?,\'\'), results), updated_at=? WHERE id=?')
    .run(decision, now(), results ?? '', now(), id);
  audit(actor, `experiment.${decision}`, id, results ?? '');
  return getExperiment(id);
}
