import { readFileSync } from 'node:fs';
import { openDb, now, today, loadConfig } from './db.mjs';

const QUALITIES = ['measured','estimated','unattributed'];

// Ghi/ghi đè một số đo. Idempotent theo khoá (date, platform, channel, metric, source).
export function putMetric(m) {
  const { channels, platforms } = loadConfig('channels');
  if (!channels[m.channel]) throw new Error(`channel không hợp lệ: ${m.channel}`);
  if (!platforms.includes(m.platform)) throw new Error(`platform phải là ${platforms.join('|')}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(m.date)) throw new Error('date dạng YYYY-MM-DD');
  if (!QUALITIES.includes(m.quality ?? 'measured')) throw new Error(`quality phải là ${QUALITIES.join('|')}`);
  if (m.quality === 'estimated' && !m.note) throw new Error('số ước tính (estimated) phải có --note giải thích cách ước');
  if (m.metric === 'installs' && m.channel === 'UNKNOWN' && (m.quality ?? 'measured') === 'measured' && m.source !== 'play_console_csv' && m.source !== 'asc_csv') {
    // installs không gán nguồn mà lại ghi "measured" từ nguồn thủ công → ép unattributed
    m.quality = 'unattributed';
  }
  openDb().prepare(`INSERT INTO metrics_daily (date,platform,channel,metric,value,source,quality,note,imported_at)
                    VALUES (?,?,?,?,?,?,?,?,?)
                    ON CONFLICT(date,platform,channel,metric,source) DO UPDATE SET value=excluded.value, quality=excluded.quality, note=excluded.note, imported_at=excluded.imported_at`)
    .run(m.date, m.platform, m.channel, m.metric, Number(m.value), m.source ?? 'manual', m.quality ?? 'measured', m.note ?? '', now());
  return m;
}

// CSV đơn giản: cột date,platform,channel,metric,value,source,quality,note. Không xử lý dấu phẩy trong ngoặc kép (đủ cho export nội bộ).
export function importCsv(path) {
  const lines = readFileSync(path, 'utf8').split(/\r?\n/).filter((l) => l.trim());
  const header = lines.shift().split(',').map((h) => h.trim());
  let n = 0;
  for (const line of lines) {
    const cells = line.split(',');
    const row = Object.fromEntries(header.map((h, i) => [h, (cells[i] ?? '').trim()]));
    putMetric(row); n++;
  }
  return n;
}

export function sumMetric({ metric, from, to = today(), platform, channel, quality }) {
  const where = ['metric=?', 'date<=?']; const args = [metric, to];
  if (from) { where.push('date>=?'); args.push(from); }
  if (platform) { where.push('platform=?'); args.push(platform); }
  if (channel) { where.push('channel=?'); args.push(channel); }
  if (quality) { where.push('quality=?'); args.push(quality); }
  return openDb().prepare(`SELECT COALESCE(SUM(value),0) v FROM metrics_daily WHERE ${where.join(' AND ')}`).get(...args).v;
}

export function byChannel(metric, from, to = today()) {
  const rows = openDb().prepare(`SELECT channel, quality, SUM(value) v FROM metrics_daily WHERE metric=? AND date>=? AND date<=? GROUP BY channel, quality`).all(metric, from, to);
  const out = {};
  for (const r of rows) { out[r.channel] ??= { measured: 0, estimated: 0, unattributed: 0 }; out[r.channel][r.quality] += r.v; }
  return out;
}

export function dailySeries(metric, from, to = today()) {
  return openDb().prepare(`SELECT date, platform, SUM(value) v FROM metrics_daily WHERE metric=? AND date>=? AND date<=? GROUP BY date, platform ORDER BY date`).all(metric, from, to);
}

export function hasData(date, metric) {
  return !!openDb().prepare('SELECT 1 FROM metrics_daily WHERE date=? AND metric=? LIMIT 1').get(date, metric);
}
