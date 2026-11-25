/**
 * Sinh một bộ dữ liệu 26 tuần để **xem thử** màn "Sáu tháng của bạn".
 *
 *   node code/tools/demo-sau-thang.mjs
 *
 * ĐÂY LÀ SỐ BỊA, và cố tình để ở một file riêng mang chữ "demo" trong tên, cạnh file dữ
 * liệu thật. Màn Sáu tháng cần ít nhất sáu tuần mới chịu nói; dữ liệu thật của Founder
 * mới có bốn tuần, nên không có cách nào nhìn thấy màn đó chạy mà không bịa.
 *
 * Nạp xong phải nạp lại `screentime.json` để trả tài khoản về dữ liệu thật:
 *   npm run nap -w mira-be -- danhthu ../../docs/du-lieu-mau/screentime.json --dong-y
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../docs/du-lieu-mau');
const SO_TUAN = 26;

/** Thứ hai cách đây 25 tuần, để tuần cuối là tuần này. */
const goc = new Date();
goc.setUTCHours(0, 0, 0, 0);
goc.setUTCDate(goc.getUTCDate() - ((goc.getUTCDay() + 6) % 7) - 7 * (SO_TUAN - 1));

const ngay = (tuan, i) => {
  const d = new Date(goc);
  d.setUTCDate(d.getUTCDate() + tuan * 7 + i);
  return d.toISOString().slice(0, 10);
};

/** Một chuỗi giả lập có hạt giống, để chạy lại ra cùng kết quả. */
let hat = 20260601;
const r = () => ((hat = (hat * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

const timeEntries = [];
const moments = [];

/** Bốn biến cố cắm vào các tuần cụ thể, để có cái mà dò ra. */
const BIEN_CO = {
  4: { waste: 2.6, note: 'tuần trôi mất' },
  9: { family: 2.4, note: 'nghỉ phép' },
  15: { work: 1.9, family: 0.3, note: 'mùa cao điểm' },
  21: { family: 2.2, waste: 0.4, note: 'tuần nhẹ' },
};

for (let w = 0; w < SO_TUAN; w += 1) {
  const bc = BIEN_CO[w] ?? {};
  for (let i = 0; i < 6; i += 1) {
    const rung = () => 0.88 + r() * 0.24;
    const them = (bucket, phut, golden = false) => {
      const m = Math.round(phut * rung());
      if (m > 0) timeEntries.push({ date: ngay(w, i), minutes: m, bucket, golden, note: null });
    };
    them('work', 460 * (bc.work ?? 1));
    them('waste', 95 * (bc.waste ?? 1));
    them('personal', 55);
    const giaDinh = 95 * (bc.family ?? 1);
    them('family', giaDinh * 0.7, true);
    them('family', giaDinh * 0.3);
  }

  // Hạt rải rác, dày hơn ở tuần có biến cố.
  const soHat = bc.note ? 3 : r() < 0.45 ? 1 : 0;
  for (let k = 0; k < soHat; k += 1) {
    const muoi = (bc.waste ?? 1) > 1.5 || (bc.work ?? 1) > 1.5 ? r() < 0.75 : r() < 0.25;
    moments.push({
      date: ngay(w, Math.floor(r() * 6)),
      kind: muoi ? 'salt' : 'candy',
      text: muoi ? 'Một ngày nặng (số demo)' : 'Một ngày dễ chịu (số demo)',
    });
  }
}

const bo = { timeEntries, moments, money: {}, goals: [], habits: [], habitChecks: [] };
writeFileSync(resolve(OUT, 'demo-sau-thang.json'), JSON.stringify(bo));

console.log(`Đã ghi demo-sau-thang.json: ${timeEntries.length} mục giờ, ${moments.length} hạt, ${SO_TUAN} tuần.`);
console.log('SỐ BỊA. Nạp lại screentime.json sau khi xem xong.');
