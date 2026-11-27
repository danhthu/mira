import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lifeRate, itemHours, roundThousand, formatVnd, formatHours } from './life-rate-core.mjs';

// Ví dụ xuyên suốt: 30 triệu, 60 giờ thật mỗi tuần (48 + 7 + 5).
const base = { netIncome: 30_000_000, workHoursPerWeek: 48, commuteHoursPerWeek: 7, prepHoursPerWeek: 3, recoveryHoursPerWeek: 2 };

test('30tr / 60h -> 115.385, hiển thị 115.000đ', () => {
  const r = lifeRate(base);
  assert.equal(r.status, 'ok');
  assert.equal(r.realWorkHoursPerWeek, 60);
  assert.ok(Math.abs(r.lifeRate - 115384.615) < 0.01);
  assert.equal(Math.round(r.lifeRate), 115385);
  assert.equal(formatVnd(roundThousand(r.lifeRate)), '115.000đ');
});

test('tỷ giá trên hợp đồng 48h -> ~144.231 và chênh ~20%', () => {
  const r = lifeRate(base);
  assert.equal(Math.round(r.contractRate), 144231);
  assert.ok(Math.abs(r.gapPercent - 20) < 0.01);
});

test('25tr / 115.385 ≈ 217 giờ', () => {
  const r = lifeRate(base);
  const h = itemHours(25_000_000, r.lifeRate);
  assert.equal(Math.round(h), 217);
  assert.equal(formatHours(h), '217');
});

test('biên: tổng giờ = 0 -> cần nhập giờ, không trả 0', () => {
  const r = lifeRate({ netIncome: 30_000_000, workHoursPerWeek: 0, commuteHoursPerWeek: 0, prepHoursPerWeek: 0, recoveryHoursPerWeek: 0 });
  assert.equal(r.status, 'need-hours');
  assert.equal(r.lifeRate, undefined);
});

test('biên: thu nhập 0 hoặc âm -> không hiện chỉ số', () => {
  for (const netIncome of [0, -5_000_000, '', NaN]) {
    const r = lifeRate({ ...base, netIncome });
    assert.equal(r.status, 'need-income');
    assert.equal(r.lifeRate, undefined);
  }
});

test('chỉ có giờ đi lại, không có giờ hợp đồng -> có tỷ giá, không có so sánh', () => {
  const r = lifeRate({ netIncome: 10_000_000, commuteHoursPerWeek: 10 });
  assert.equal(r.status, 'ok');
  assert.equal(r.contractRate, null);
  assert.equal(r.gapPercent, null);
});

test('itemHours: thiếu dữ kiện -> null', () => {
  assert.equal(itemHours(0, 115385), null);
  assert.equal(itemHours(1000, 0), null);
});

test('số nhập kiểu Việt "30.000.000" được đọc đúng', () => {
  const r = lifeRate({ ...base, netIncome: '30.000.000' });
  assert.equal(Math.round(r.lifeRate), 115385);
});

test('life-rate.html chứa đúng mã của core (chạy build-life-rate.mjs nếu lệch)', async () => {
  const { readFileSync } = await import('node:fs');
  const core = readFileSync(new URL('./life-rate-core.mjs', import.meta.url), 'utf8').replace(/^export /gm, '');
  const html = readFileSync(new URL('./life-rate.html', import.meta.url), 'utf8');
  assert.ok(html.includes(core));
});

test('giọng: phần chữ hiển thị không có dấu chấm than, nên, phải, hãy', async () => {
  const { readFileSync } = await import('node:fs');
  const html = readFileSync(new URL('./life-rate.template.html', import.meta.url), 'utf8');
  const body = html.split('<script')[0].split('</style>')[1];
  assert.ok(!/!|\b(nên|phải|hãy)\b/i.test(body));
});
