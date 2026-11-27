/**
 * Nếu nhắm vào người vốn đã có thói quen ghi nhật ký thì khác gì.
 *
 *   node code/tools/nhat-ky.mjs  →  docs/du-lieu-mau/nhat-ky.md
 *
 * Cùng 300 người, cùng nghề, cùng giai đoạn sống, cùng biến cố đời, cùng đối chứng.
 * Khác duy nhất: nhóm này vốn đã ghi chép hằng ngày trước khi biết tới Mira.
 *
 * Giả định về nhóm này (và đây là chỗ cần kiểm bằng người thật):
 *   - Tò mò về chính mình nằm trong khoảng 0,55–1,0 thay vì rải đều
 *   - Kỷ luật nhích lên một chút
 *   - Ma sát nghề chỉ còn 45% tác dụng — họ ghi bất kể đang làm nghề gì
 *   - Hào hứng nhạt chậm hơn 2,2 lần — giữ họ lại là thói quen, không phải cái mới
 *   - Bỏ hạt vào hũ thường xuyên gấp 2,6 lần
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JOBS, CITIES, stagesFor, pick, rng } from './lib/dan-so.mjs';
import { songSauThang, WEEKS } from './lib/nguoi.mjs';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../docs/du-lieu-mau');
const N = 300;

const r0 = rng(424242);
const setup = [];
for (let i = 0; i < N; i += 1) {
  const job = JOBS[i % JOBS.length];
  const stage = pick(r0, stagesFor(job));
  const x = r0();
  const city = x < CITIES[0].share ? CITIES[0] : x < CITIES[0].share + CITIES[1].share ? CITIES[1] : CITIES[2];
  setup.push({ seed: 5_000_000 + i * 97, job, stage, city });
}
const doiChung = setup.map((s) => songSauThang({ ...s, dungApp: false }));

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const median = (xs) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};
const n1 = (x) => x.toFixed(1).replace('.', ',');
const pcf = (x) => `${(x * 100).toFixed(0)}%`;
const tbTuan = (p, f) => mean(p.tuan.map((t) => t[f]));
const cuoiKy = (p, f) => mean(p.tuan.slice(18, 26).map((t) => t[f]));

/** Lặp lại bộ dò của `cau-chuyen.mjs`: chỉ nhìn thứ Mira lưu. */
const NHOM = ['work', 'waste', 'family', 'golden'];
function doBatThuong(p) {
  const nhin = p.tuan.map((t, w) => ({ ...t, w })).filter((t) => t.daysLogged >= 3);
  if (nhin.length < 6) return { mu: true, danhDau: [], nhin: nhin.length };
  const nen = {};
  for (const k of NHOM) nen[k] = median(nhin.map((t) => t[k]));
  const hat = {};
  for (const m of p.moments) if (m.muoi) hat[m.tuan] = (hat[m.tuan] ?? 0) + 1;
  const danhDau = [];
  for (const t of nhin) {
    const co = NHOM.some(
      (k) => nen[k] > 0 && Math.abs((t[k] - nen[k]) / nen[k]) >= 0.4 && Math.abs(t[k] - nen[k]) >= 120,
    );
    if (co || (hat[t.w] ?? 0) >= 2) danhDau.push(t.w);
  }
  return { mu: false, danhDau, nhin: nhin.length };
}
const tuanCuaBienCo = (e) => {
  const a = Math.floor(e.batDau / 7), b = Math.floor((e.batDau + e.ngay - 1) / 7);
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
};

function chay(ten, tuyChon) {
  const app = setup.map((s) => songSauThang({ ...s, dungApp: true, tuyChon }));
  const conLai = app.filter((p) => p.boTuan === null);

  const tk = app.map((p, i) => ((tbTuan(doiChung[i], 'waste') - tbTuan(p, 'waste')) / 60) * WEEKS);

  let bienCo = 0, bat = 0, mu = 0, danhDau = 0;
  for (const p of app) {
    const d = doBatThuong(p);
    if (d.mu) { mu += 1; continue; }
    danhDau += d.danhDau.length;
    const set = new Set(d.danhDau);
    for (const e of p.events) {
      if (p.boTuan !== null && Math.floor(e.batDau / 7) >= p.boTuan) continue;
      bienCo += 1;
      if (tuanCuaBienCo(e).some((w) => set.has(w))) bat += 1;
    }
  }

  const khaHon = app.filter((p, i) => {
    const c = cuoiKy(doiChung[i], 'waste');
    return c > 0 && (cuoiKy(p, 'waste') - c) / c <= -0.05;
  }).length;

  return {
    ten,
    giu12: app.filter((p) => p.boTuan === null || p.boTuan > 12).length / N,
    giu26: conLai.length / N,
    daysLogged: mean(app.map((p) => p.soNgayGhi)),
    hat: mean(app.map((p) => p.moments.length)),
    hatMuoi: mean(app.map((p) => p.moments.filter((m) => m.muoi).length)),
    tkDangKy: mean(tk),
    tkConLai: mean(app.filter((p) => p.boTuan === null).map((p, _, __) => 0)) || mean(
      app.map((p, i) => ({ p, h: ((tbTuan(doiChung[i], 'waste') - tbTuan(p, 'waste')) / 60) * WEEKS }))
        .filter((x) => x.p.boTuan === null)
        .map((x) => x.h),
    ),
    khaHon: khaHon / N,
    mu: mu / N,
    batBienCo: bienCo === 0 ? 0 : bat / bienCo,
    danhDauTB: danhDau / Math.max(1, N - mu),
  };
}

const kq = [
  chay('Dân số chung', {}),
  chay('Dân số chung + cả bốn cải tiến', { giamMaSat: 0.5, epMucTieu: 0.85, giuMoiMe: 2, nhacTuan: true }),
  chay('Người hay ghi nhật ký', { nhatKy: true }),
  chay('Người hay ghi nhật ký + cả bốn cải tiến', {
    nhatKy: true, giamMaSat: 0.5, epMucTieu: 0.85, giuMoiMe: 2, nhacTuan: true,
  }),
];
const goc = kq[0];

const md = `# Nếu nhắm vào người vốn đã ghi nhật ký

> Sinh bởi \`code/tools/nhat-ky.mjs\`. Cùng 300 người, cùng nghề, cùng giai đoạn sống, cùng
> biến cố đời, cùng nhóm đối chứng. Khác duy nhất: nhóm này đã ghi chép hằng ngày từ trước.

## Giả định về nhóm này

Mọi phân tích trước đều chỉ về một chỗ: **chi phí ghi chép là nút thắt**. Người đã có thói
quen viết nhật ký là nhóm **đã trả trước phần chi phí đó**. Năm giả định:

| | Dân số chung | Hay ghi nhật ký |
|---|---|---|
| Tò mò về chính mình | rải đều 0–1 | **0,55–1,0** |
| Kỷ luật | rải đều | nhích lên một chút |
| Ma sát nghề cản | 100% | **45%** — họ ghi bất kể làm nghề gì |
| Hào hứng nhạt | mốc gốc | **chậm hơn 2,2 lần** — giữ họ là thói quen, không phải cái mới |
| Bỏ hạt vào hũ | mốc gốc | **thường xuyên gấp 2,6 lần** |

Đây là **giả định của người viết**, không phải số đo. Chúng hợp lý về hướng nhưng độ lớn thì
cần người thật.

---

## Bảng chính

| | Giữ tuần 12 | Giữ tuần 26 | Ngày ghi | Giờ lấy lại / người đăng ký | Khá hơn rõ rệt |
|---|---|---|---|---|---|
${kq
  .map(
    (k) =>
      `| **${k.ten}** | ${pcf(k.giu12)} | **${pcf(k.giu26)}** | ${n1(k.daysLogged)} | **${n1(k.tkDangKy)}h** | ${pcf(k.khaHon)} |`,
  )
  .join('\n')}

So với dân số chung hiện tại:

| | Giữ tuần 26 | Giờ / người đăng ký |
|---|---|---|
| Làm cả bốn cải tiến trên dân số chung | ${pcf(kq[1].giu26)} (×${n1(kq[1].giu26 / goc.giu26)}) | ${n1(kq[1].tkDangKy)}h (×${n1(kq[1].tkDangKy / goc.tkDangKy)}) |
| **Không cải tiến gì, chỉ đổi nhóm nhắm** | **${pcf(kq[2].giu26)}** (×${n1(kq[2].giu26 / goc.giu26)}) | **${n1(kq[2].tkDangKy)}h** (×${n1(kq[2].tkDangKy / goc.tkDangKy)}) |
| Cả hai | ${pcf(kq[3].giu26)} (×${n1(kq[3].giu26 / goc.giu26)}) | ${n1(kq[3].tkDangKy)}h (×${n1(kq[3].tkDangKy / goc.tkDangKy)}) |

## Hũ và khả năng kể chuyện

| | Hạt / người | Hạt muối | Không đủ dữ liệu để kể | Bắt được biến cố | Tuần đánh dấu / người |
|---|---|---|---|---|---|
${kq
  .map(
    (k) =>
      `| ${k.ten} | **${n1(k.hat)}** | ${n1(k.hatMuoi)} | ${pcf(k.mu)} | ${pcf(k.batBienCo)} | ${n1(k.danhDauTB)} |`,
  )
  .join('\n')}
`;

mkdirSync(OUT, { recursive: true });
writeFileSync(resolve(OUT, 'nhat-ky.md'), md);

console.log(''.padEnd(38) + 'giu12  giu26  ngayghi  gio/dk  khahon   hat   mu');
for (const k of kq) {
  console.log(
    k.ten.padEnd(38) +
      pcf(k.giu12).padStart(5) + pcf(k.giu26).padStart(7) +
      n1(k.daysLogged).padStart(9) + (n1(k.tkDangKy) + 'h').padStart(8) +
      pcf(k.khaHon).padStart(8) + n1(k.hat).padStart(7) + pcf(k.mu).padStart(6),
  );
}
console.log(`\nDa ghi ${OUT}/nhat-ky.md`);
