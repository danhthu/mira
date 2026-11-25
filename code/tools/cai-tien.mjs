/**
 * Mỗi cải tiến mua được bao nhiêu — đo bằng cách chạy lại đúng 300 người đó với từng
 * can thiệp bật lên.
 *
 *   node code/tools/cai-tien.mjs  →  docs/du-lieu-mau/cai-tien.md
 *
 * Mọi kịch bản dùng cùng seed, nên cùng tính cách, cùng biến cố, cùng nghề. Và tất cả đều
 * so với cùng một nhóm đối chứng không cài app. Chênh lệch quy được về đúng can thiệp.
 *
 * Bốn can thiệp lấy thẳng từ kết luận của `doc-hanh-trinh.md`, không phải nghĩ thêm:
 *   - Ma sát ghi chép là thứ quyết định giữ chân (43,8% so với 2,5% theo nghề)
 *   - Luật khai nguồn hiệu quả gấp hơn hai lần chỉ ghi (−5,0% so với −2,3%)
 *   - Bỏ trung bình ở tuần 12,9 — cần một lý do mới để mở app ở tháng thứ ba
 *   - Nhắc nhở là thứ rẻ nhất, đưa vào để xem nó có đáng không
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

const KICH_BAN = [
  { key: 'hien-tai', ten: 'Hiện tại', mo: 'bản chốt như đang có', tuyChon: {} },
  {
    key: 'ma-sat',
    ten: 'Giảm ma sát ghi',
    mo: 'gợi ý theo nếp, một chạm xác nhận — như Beyond Time (N-214)',
    tuyChon: { giamMaSat: 0.5 },
  },
  {
    key: 'muc-tieu',
    ten: 'Mục tiêu vào onboarding',
    mo: 'bắt đặt mục tiêu kèm khai nguồn ngay tuần đầu',
    tuyChon: { epMucTieu: 0.85 },
  },
  {
    key: 'moi-me',
    ten: 'Giữ mới mẻ',
    mo: 'hạt cũ nổi lên, so sánh theo mùa — kéo dài gấp đôi thời gian trước khi nhạt',
    tuyChon: { giuMoiMe: 2 },
  },
  {
    key: 'nhac',
    ten: 'Nhắc khi trượt',
    mo: 'một nhắc nhẹ sau bốn ngày không ghi',
    tuyChon: { nhacTuan: true },
  },
  {
    key: 'hai-dau',
    ten: 'Ma sát + mục tiêu',
    mo: 'hai việc đứng đầu bảng ưu tiên',
    tuyChon: { giamMaSat: 0.5, epMucTieu: 0.85 },
  },
  {
    key: 'tat-ca',
    ten: 'Cả bốn',
    mo: 'làm hết',
    tuyChon: { giamMaSat: 0.5, epMucTieu: 0.85, giuMoiMe: 2, nhacTuan: true },
  },
];

// ─────────────────────────────────────────────────────── đo
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const n1 = (x) => x.toFixed(1).replace('.', ',');
const pcf = (x) => `${(x * 100).toFixed(0)}%`;
const tbTuan = (p, f) => mean(p.tuan.map((t) => t[f]));

function do_(kb) {
  const app = setup.map((s) => songSauThang({ ...s, dungApp: true, tuyChon: kb.tuyChon }));
  const conLai = app.filter((p) => p.boTuan === null);

  // Giờ lãng phí ít hơn cả kỳ so với chính mình ở nhánh không cài app.
  const tietKiem = app.map((p, i) => ((tbTuan(doiChung[i], 'waste') - tbTuan(p, 'waste')) / 60) * WEEKS);
  const tietKiemConLai = app
    .map((p, i) => ({ p, h: ((tbTuan(doiChung[i], 'waste') - tbTuan(p, 'waste')) / 60) * WEEKS }))
    .filter((x) => x.p.boTuan === null)
    .map((x) => x.h);

  const vangTietKiem = app.map((p, i) => ((tbTuan(p, 'golden') - tbTuan(doiChung[i], 'golden')) / 60) * WEEKS);

  return {
    ...kb,
    giu12: app.filter((p) => p.boTuan === null || p.boTuan > 12).length / N,
    giu26: conLai.length / N,
    coMucTieu: app.filter((p) => p.coMucTieu).length / N,
    ngayGhi: mean(app.map((p) => p.soNgayGhi)),
    tkDangKy: mean(tietKiem),
    tkConLai: mean(tietKiemConLai),
    vangDangKy: mean(vangTietKiem),
    boTuan: mean(app.filter((p) => p.boTuan !== null).map((p) => p.boTuan)),
  };
}

const kq = KICH_BAN.map(do_);
const goc = kq[0];
const tang = (x, y) => (y === 0 ? 0 : (x - y) / Math.abs(y));

// ─────────────────────────────────────────────────────── báo cáo
const md = `# Cải tiến nào mua được bao nhiêu

> Sinh bởi \`code/tools/cai-tien.mjs\`. Cùng 300 người, cùng tính cách, cùng biến cố,
> cùng một nhóm đối chứng không cài app. Chỉ khác can thiệp nào được bật.
>
> Vẫn là mô phỏng. Hệ số tác động hành vi lấy từ N-201 và N-202; mức độ của từng can thiệp
> (giảm ma sát 50%, ép mục tiêu lên 85%, kéo dài hào hứng gấp đôi) là **giả định của người
> viết** — đó chính là thứ cần kiểm bằng người thật.

## Bảng chính

**Giờ lấy lại / người đăng ký** là con số quan trọng nhất: nó đã tính cả những người bỏ
giữa chừng. Mọi con số khác dễ làm đẹp hơn nó.

| Kịch bản | Giữ tuần 12 | Giữ tuần 26 | Có mục tiêu | Ngày ghi | Giờ lấy lại / người đăng ký | so với hiện tại |
|---|---|---|---|---|---|---|
${kq
  .map(
    (k) =>
      `| **${k.ten}** | ${pcf(k.giu12)} | ${pcf(k.giu26)} | ${pcf(k.coMucTieu)} | ${n1(k.ngayGhi)} | ` +
      `**${n1(k.tkDangKy)}h** | ${k.key === 'hien-tai' ? '—' : `${k.tkDangKy >= goc.tkDangKy ? '+' : ''}${pcf(tang(k.tkDangKy, goc.tkDangKy))}`} |`,
  )
  .join('\n')}

## Xếp theo đòn bẩy

Mỗi can thiệp riêng lẻ, phần trăm tăng thêm so với bản hiện tại:

| Cải tiến | Giữ chân tuần 26 | Giờ / người đăng ký | Mô tả |
|---|---|---|---|
${kq
  .slice(1, 5)
  .slice()
  .sort((a, b) => b.tkDangKy - a.tkDangKy)
  .map(
    (k) =>
      `| **${k.ten}** | ${pcf(k.giu26)} (${k.giu26 >= goc.giu26 ? '+' : ''}${pcf(tang(k.giu26, goc.giu26))}) | ` +
      `${n1(k.tkDangKy)}h (${k.tkDangKy >= goc.tkDangKy ? '+' : ''}${pcf(tang(k.tkDangKy, goc.tkDangKy))}) | ${k.mo} |`,
  )
  .join('\n')}

## Cộng dồn có bằng tổng không

| | Giờ / người đăng ký | Giữ tuần 26 |
|---|---|---|
| Hiện tại | ${n1(goc.tkDangKy)}h | ${pcf(goc.giu26)} |
| Chỉ giảm ma sát | ${n1(kq[1].tkDangKy)}h | ${pcf(kq[1].giu26)} |
| Chỉ ép mục tiêu | ${n1(kq[2].tkDangKy)}h | ${pcf(kq[2].giu26)} |
| Tổng hai phần tăng nếu cộng thẳng | ${n1(goc.tkDangKy + (kq[1].tkDangKy - goc.tkDangKy) + (kq[2].tkDangKy - goc.tkDangKy))}h | — |
| **Làm cả hai thật** | **${n1(kq[5].tkDangKy)}h** | ${pcf(kq[5].giu26)} |
| **Làm cả bốn** | **${n1(kq[6].tkDangKy)}h** | ${pcf(kq[6].giu26)} |

## Giờ vàng có nhúc nhích không

| Kịch bản | Giờ vàng tăng thêm / người đăng ký |
|---|---|
${kq.map((k) => `| ${k.ten} | ${n1(k.vangDangKy)}h |`).join('\n')}

## Người bỏ thì bỏ lúc nào

| Kịch bản | Tuần bỏ trung bình |
|---|---|
${kq.map((k) => `| ${k.ten} | ${n1(k.boTuan)} |`).join('\n')}
`;

mkdirSync(OUT, { recursive: true });
writeFileSync(resolve(OUT, 'cai-tien.md'), md);

console.log('Kich ban'.padEnd(26) + 'giu12  giu26  mtieu  gio/dangky');
for (const k of kq) {
  console.log(
    k.ten.padEnd(26) +
      pcf(k.giu12).padStart(5) +
      pcf(k.giu26).padStart(7) +
      pcf(k.coMucTieu).padStart(7) +
      (n1(k.tkDangKy) + 'h').padStart(12) +
      (k.key === 'hien-tai' ? '' : `   ${k.tkDangKy >= goc.tkDangKy ? '+' : ''}${pcf(tang(k.tkDangKy, goc.tkDangKy))}`),
  );
}
console.log(`\nDa ghi ${OUT}/cai-tien.md`);
