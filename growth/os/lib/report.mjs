import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { OS_ROOT, openDb, today, loadConfig } from './db.mjs';
import { sumMetric, byChannel, dailySeries } from './metrics.mjs';
import { taskSummary, listTasks, overdueTasks } from './tasks.mjs';
import { contentSummary, listContent } from './content.mjs';
import { budgetStatus, listCampaigns, listApprovals } from './campaigns.mjs';
import { listExperiments } from './experiments.mjs';

const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2));
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

export function snapshot(date = today()) {
  const targets = loadConfig('targets');
  const start = targets.start_date;
  const elapsed = Math.max(0, daysBetween(start, date));
  const remaining = Math.max(0, targets.days - elapsed);
  const inst = (platform, quality) => sumMetric({ metric: 'installs', from: start, to: date, platform, quality });
  const android = inst('android'), ios = inst('ios');
  const pwa = sumMetric({ metric: 'pwa_installs', from: start, to: date });
  const total = android + ios + pwa;
  const daily = sumMetric({ metric: 'installs', from: date, to: date }) + sumMetric({ metric: 'pwa_installs', from: date, to: date });
  const ch = byChannel('installs', start, date);
  const chPwa = byChannel('pwa_installs', start, date);
  for (const [k, v] of Object.entries(chPwa)) { ch[k] ??= { measured: 0, estimated: 0, unattributed: 0 }; for (const q in v) ch[k][q] += v[q]; }
  const { channels } = loadConfig('channels');
  let organic = 0, paid = 0, unknown = 0;
  for (const [k, v] of Object.entries(ch)) {
    const s = v.measured + v.estimated;
    if (k === 'UNKNOWN') unknown += s + v.unattributed; else if (channels[k]?.paid) paid += s; else organic += s;
    if (k !== 'UNKNOWN') unknown += v.unattributed;
  }
  const waitlist = sumMetric({ metric: 'waitlist', from: start, to: date });
  const storeVisitors = { android: sumMetric({ metric: 'store_visitors', from: start, to: date, platform: 'android' }), ios: sumMetric({ metric: 'store_visitors', from: start, to: date, platform: 'ios' }) };
  const budget = budgetStatus();
  const spendPaid = budget.spent_usd;
  const cpi = paid > 0 ? spendPaid / paid : null;
  // Dự báo tuyến tính thô theo nhịp 7 ngày gần nhất — ghi rõ là ước tính.
  const last7From = new Date(new Date(date) - 6 * 86400000).toISOString().slice(0, 10);
  const last7 = sumMetric({ metric: 'installs', from: last7From, to: date }) + sumMetric({ metric: 'pwa_installs', from: last7From, to: date });
  const rate = last7 / 7;
  const forecast = Math.round(total + rate * remaining);
  const milestone = targets.milestones.find((m) => m.day >= elapsed) ?? targets.milestones.at(-1);
  return {
    date, start, elapsed, remaining, target: targets.target_installs,
    installs: { android, ios, pwa, total, daily, progress_pct: Math.round((total / targets.target_installs) * 1000) / 10, remaining: targets.target_installs - total },
    acquisition: { organic, paid, unknown },
    channels: ch, waitlist, storeVisitors,
    store_conversion: {
      android: storeVisitors.android ? android / storeVisitors.android : null,
      ios: storeVisitors.ios ? ios / storeVisitors.ios : null
    },
    retained_d7: sumMetric({ metric: 'retained_d7', from: start, to: date }),
    budget: { ...budget, cpi, campaigns: listCampaigns().filter((c) => ['APPROVED','RUNNING','PAUSED'].includes(c.status)).map((c) => `${c.id} ${c.name} [${c.status}] ${c.spent_usd}/${c.budget_usd} USD`) },
    tasks: taskSummary(), overdue: overdueTasks(date).map((t) => `${t.id} ${t.title} (hạn ${t.deadline}, ${t.agent})`),
    content: contentSummary(),
    content_published_today: listContent({ status: 'PUBLISHED' }).filter((c) => c.published_at === date).length,
    experiments_running: listExperiments({ open: true }).length,
    approvals: listApprovals('PENDING'),
    forecast: { rate_7d: Math.round(rate * 100) / 100, installs_day90_linear: forecast, quality: 'estimated', milestone_next: milestone },
    series: dailySeries('installs', start, date)
  };
}

function bestWorst(ch) {
  const rows = Object.entries(ch).filter(([k]) => k !== 'UNKNOWN').map(([k, v]) => [k, v.measured + v.estimated]).sort((a, b) => b[1] - a[1]);
  if (!rows.length || rows[0][1] === 0) return { best: 'chưa có dữ liệu', worst: 'chưa có dữ liệu' };
  return { best: `${rows[0][0]} (${rows[0][1]})`, worst: `${rows.at(-1)[0]} (${rows.at(-1)[1]})` };
}

const chLine = (ch, k) => { const v = ch[k]; return v ? `${v.measured}${v.estimated ? ` (+${v.estimated} ước)` : ''}${v.unattributed ? ` (+${v.unattributed} không gán)` : ''}` : '0'; };

export function dailyReport(date = today(), { next = [], insights = {} } = {}) {
  const s = snapshot(date);
  const bw = bestWorst(s.channels);
  const dataNote = s.installs.total === 0 && s.waitlist === 0 ? '\n> Chưa có số đo nào được nạp. Mọi số 0 dưới đây là "chưa đo", không phải "bằng không".\n' : '';
  return `# MIRA GROWTH – BÁO CÁO NGÀY

Ngày: ${s.date}
Ngày đã qua: ${s.elapsed} / ${loadConfig('targets').days}
Ngày còn lại: ${s.remaining}
${dataNote}
## MỤC TIÊU
1.000 người dùng mới (installs Android + iOS + PWA). Cột mốc kế tiếp: ngày ${s.forecast.milestone_next.day} → ${s.forecast.milestone_next.cumulative_installs} (${s.forecast.milestone_next.phase})

## THỰC TẾ
- Google Play: ${s.installs.android}
- App Store: ${s.installs.ios}
- PWA: ${s.installs.pwa}
- Tổng: ${s.installs.total}
- Installs hôm nay: ${s.installs.daily}
- Tiến độ: ${s.installs.progress_pct}%
- Còn thiếu: ${s.installs.remaining}
- Waitlist (chỉ số dẫn đường, KHÔNG cộng vào installs): ${s.waitlist}
- Lượt xem store: Android ${s.storeVisitors.android} · iOS ${s.storeVisitors.ios}
- Chuyển đổi store: Android ${s.store_conversion.android == null ? 'n/a' : (s.store_conversion.android * 100).toFixed(1) + '%'} · iOS ${s.store_conversion.ios == null ? 'n/a' : (s.store_conversion.ios * 100).toFixed(1) + '%'}

## NGUỒN
- Organic: ${s.acquisition.organic}
- Paid: ${s.acquisition.paid}
- Không rõ / không gán được: ${s.acquisition.unknown}

## HIỆU QUẢ KÊNH (installs, số đo thật trước, ước tính ghi riêng)
- SEO: ${chLine(s.channels, 'SEO')}
- Blog: ${chLine(s.channels, 'BLOG')}
- Facebook: ${chLine(s.channels, 'FACEBOOK_ORGANIC')}
- TikTok: ${chLine(s.channels, 'TIKTOK')}
- YouTube: ${chLine(s.channels, 'YOUTUBE')}
- Threads: ${chLine(s.channels, 'THREADS')}
- Reddit: ${chLine(s.channels, 'REDDIT')}
- Cộng đồng: ${chLine(s.channels, 'COMMUNITY')}
- Đối tác: ${chLine(s.channels, 'PARTNERSHIP')}
- Newsletter: ${chLine(s.channels, 'NEWSLETTER')}
- Google Ads: ${chLine(s.channels, 'GOOGLE_ADS')}
- Meta Ads: ${chLine(s.channels, 'META_ADS')}

## NGÂN SÁCH
- Trần: ${s.budget.total_usd} USD
- Đã duyệt: ${s.budget.approved_usd} USD
- Đã chi: ${s.budget.spent_usd} USD
- Còn: ${s.budget.remaining_usd} USD
- CPI (paid): ${s.budget.cpi == null ? 'n/a (chưa có install trả phí)' : s.budget.cpi.toFixed(2) + ' USD'}
- Campaign: ${s.budget.campaigns.length ? s.budget.campaigns.join('; ') : 'không có campaign đang chạy'}

## THỰC THI
- Task xong: ${s.tasks.DONE} · đang làm: ${s.tasks.IN_PROGRESS} · chờ: ${s.tasks.READY + s.tasks.BACKLOG} · kẹt: ${s.tasks.BLOCKED} · chờ duyệt: ${s.tasks.REVIEW}
- Quá hạn: ${s.overdue.length ? s.overdue.join('; ') : 'không'}
- Nội dung đăng hôm nay: ${s.content_published_today} (tổng đã đăng: ${s.content.PUBLISHED + s.content.MEASURED + s.content.REUSED})
- Thử nghiệm đang chạy: ${s.experiments_running}

## PHÁT HIỆN
- Kênh tốt nhất: ${insights.best ?? bw.best}
- Kênh kém nhất: ${insights.worst ?? bw.worst}
- Phát hiện chính: ${insights.key ?? '(CGO điền sau khi đọc số)'}
- Nút thắt chính: ${insights.bottleneck ?? (s.overdue.length ? 'task quá hạn' : s.tasks.BLOCKED ? 'task bị chặn' : '(CGO điền)')}

## DỰ BÁO (ước tính tuyến tính, nhịp 7 ngày gần nhất)
- Nhịp: ${s.forecast.rate_7d} installs/ngày
- Dự báo ngày 90: ${s.forecast.installs_day90_linear} / ${s.target}

## VIỆC TIẾP THEO
${(next.length ? next : ['(CGO điền)', '', '']).map((n, i) => `- Ưu tiên ${i + 1}: ${n}`).join('\n')}

## CẦN FOUNDER
${s.approvals.length ? s.approvals.map((a) => `- [#${a.id} ${a.kind}] ${a.request}`).join('\n') : '- Không có yêu cầu duyệt đang chờ'}
`;
}

export function writeDailyReport(date = today(), opts) {
  const dir = join(OS_ROOT, 'reports', 'daily');
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `${date}.md`);
  writeFileSync(path, dailyReport(date, opts), 'utf8');
  return path;
}

export function weeklyReport(endDate = today()) {
  const s = snapshot(endDate);
  const from = new Date(new Date(endDate) - 6 * 86400000).toISOString().slice(0, 10);
  const wk = byChannel('installs', from, endDate);
  const wl = sumMetric({ metric: 'waitlist', from, to: endDate });
  const pv = sumMetric({ metric: 'pageviews', from, to: endDate });
  const done = listTasks({ status: 'DONE' }).filter((t) => t.updated_at.slice(0, 10) >= from);
  const xs = listExperiments().filter((x) => (x.decided_at ?? '').slice(0, 10) >= from);
  const pub = listContent().filter((c) => (c.published_at ?? '') >= from && (c.published_at ?? '') <= endDate);
  return `# MIRA GROWTH – BÁO CÁO TUẦN (${from} → ${endDate})

## Tổng
- Installs tích luỹ: ${s.installs.total} / ${s.target} (${s.installs.progress_pct}%) — tuần này: ${Object.values(wk).reduce((a, v) => a + v.measured + v.estimated + v.unattributed, 0)}
- Waitlist tuần: ${wl} · Pageviews tuần: ${pv}
- Dự báo ngày 90 (tuyến tính): ${s.forecast.installs_day90_linear}

## Kênh tuần này
${Object.keys(wk).length ? Object.entries(wk).map(([k, v]) => `- ${k}: ${v.measured} đo · ${v.estimated} ước · ${v.unattributed} không gán`).join('\n') : '- chưa có số đo theo kênh'}

## Nội dung đã đăng (${pub.length})
${pub.map((c) => `- ${c.id} [${c.channel}/${c.format}] ${c.topic} → ${c.url}`).join('\n') || '- không'}

## Thử nghiệm đã quyết (${xs.length})
${xs.map((x) => `- ${x.id} ${x.decision}: ${x.hypothesis} — ${x.results}`).join('\n') || '- không'}

## Task xong (${done.length})
${done.map((t) => `- ${t.id} ${t.title} (${t.agent})`).join('\n') || '- không'}

## Ngân sách
- Đã chi ${s.budget.spent_usd} / ${s.budget.total_usd} USD · CPI ${s.budget.cpi == null ? 'n/a' : s.budget.cpi.toFixed(2)}

## Kế hoạch tuần sau
- (CGO điền bằng skill weekly-growth-review)

## Cần Founder
${s.approvals.length ? s.approvals.map((a) => `- [#${a.id}] ${a.request}`).join('\n') : '- không'}
`;
}

export function writeWeeklyReport(endDate = today()) {
  const dir = join(OS_ROOT, 'reports', 'weekly');
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `${endDate}.md`);
  writeFileSync(path, weeklyReport(endDate), 'utf8');
  return path;
}

// Dashboard tĩnh: Markdown + JSON để agent/người đọc không cần mở SQLite.
export function writeDashboard(date = today()) {
  const s = snapshot(date);
  const dir = join(OS_ROOT, 'dashboard');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'snapshot.json'), JSON.stringify(s, null, 2), 'utf8');
  const md = `# Mira Growth — Dashboard (${s.date})

| Mục | Giá trị |
|---|---|
| Installs tổng / mục tiêu | ${s.installs.total} / ${s.target} (${s.installs.progress_pct}%) |
| Android · iOS · PWA | ${s.installs.android} · ${s.installs.ios} · ${s.installs.pwa} |
| Organic · Paid · Không rõ | ${s.acquisition.organic} · ${s.acquisition.paid} · ${s.acquisition.unknown} |
| Waitlist | ${s.waitlist} |
| Retained D7 | ${s.retained_d7} |
| Ngân sách chi / trần | ${s.budget.spent_usd} / ${s.budget.total_usd} USD |
| Task DONE / tổng | ${s.tasks.DONE} / ${Object.values(s.tasks).reduce((a, b) => a + b, 0)} |
| Nội dung PUBLISHED | ${s.content.PUBLISHED + s.content.MEASURED + s.content.REUSED} |
| Thử nghiệm mở | ${s.experiments_running} |
| Dự báo ngày 90 (ước) | ${s.forecast.installs_day90_linear} |

## Installs theo kênh
| Kênh | Đo | Ước | Không gán |
|---|---|---|---|
${Object.entries(s.channels).map(([k, v]) => `| ${k} | ${v.measured} | ${v.estimated} | ${v.unattributed} |`).join('\n') || '| (chưa có) | | | |'}

## Chuỗi ngày (installs)
${s.series.length ? s.series.map((r) => `- ${r.date} ${r.platform}: ${r.v}`).join('\n') : '- chưa có'}

## Chờ Founder
${s.approvals.map((a) => `- [#${a.id} ${a.kind}] ${a.request}`).join('\n') || '- không'}

_Sinh bởi \`node growth/os/bin/os.mjs dashboard\`. Số 0 khi chưa nạp dữ liệu nghĩa là "chưa đo"._
`;
  writeFileSync(join(dir, 'README.md'), md, 'utf8');
  return join(dir, 'README.md');
}
