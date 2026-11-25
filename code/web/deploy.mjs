/**
 * Build → deploy → **kiểm thật** bản live.
 *
 * VÌ SAO CẦN MỘT LỆNH RIÊNG THAY VÌ GÕ `npx wrangler deploy`
 *
 * Ngày 25/11/2026 bản live trắng màn hình sau một lần deploy trông như thành công.
 * Wrangler in "Success", mọi file 200, mà app không chạy. Nguyên do:
 *
 *   Cloudflare phục vụ kiểu SPA — đường dẫn không có thật thì trả `index.html` kèm mã
 *   200. Giữa lúc đẩy file và lúc lật bản kê, một yêu cầu `/assets/index-ABC.js` rơi vào
 *   nhánh "không thấy" và nhận HTML. `_headers` đặt `/assets/*` là `immutable, 1 năm`,
 *   nên biên **ghim bản HTML sai ấy dưới tên file JS**. Trình duyệt từ chối chạy một
 *   module có kiểu `text/html`, và màn hình trắng.
 *
 * Yêu cầu làm hỏng chính là **lệnh kiểm chạy ngay sau deploy**. Kiểm quá sớm thì không
 * phát hiện lỗi — nó TẠO ra lỗi.
 *
 * Nên thứ tự ở đây là cố ý, đừng rút gọn:
 *   1. Đợi, cho các biên lật xong bản kê.
 *   2. Hỏi `index.html` xem nó đang trỏ vào file nào.
 *   3. Thử file đó bằng **URL có đuôi phá cache** trước. Lần này chắc chắn đi tới gốc,
 *      nên nó nói đúng rằng file đã lên hay chưa, mà không ghi gì vào cache.
 *   4. Chỉ khi bước 3 xanh mới gọi **URL trần**. Gọi sớm hơn là tự tay đầu độc.
 *
 * BƯỚC 4 PHẢI GỌI TRẦN, KHÔNG ĐƯỢC `cache: 'no-store'`.
 * Bản đầu của file này dùng `no-store` cho cả bước 4, và nó báo xanh cho một trang đang
 * vỡ: `no-store` đi vòng qua cache biên, nên nó không bao giờ nhìn thấy chỗ hỏng. Phải
 * xin đúng cái trình duyệt xin thì mới biết trình duyệt nhận được gì.
 *
 * Bước 4 nhận HTML nghĩa là biên đã ghim bản hỏng cho URL ấy. Lúc đó script **tự build
 * lại và deploy lại**: tên file mang mã lần build nên vòng sau là một bộ URL khác, chưa
 * ai đầu độc (xem `vite.config.ts`).
 */
import { execFileSync } from 'node:child_process';

const GOC = 'https://mira.joybit.one';
const CHO_LAT_BAN_KE_MS = 10_000;
const SO_LAN_THU = 6;
const CACH_NHAU_MS = 4_000;
/** Số vòng build-lại-deploy-lại khi biên đã ghim bản hỏng cho bộ URL vừa ra. */
const SO_VONG = 3;

const nghi = (ms) => new Promise((r) => setTimeout(r, ms));
const noi = (...a) => console.log(...a);

function chay(lenh, dsThamSo) {
  execFileSync(lenh, dsThamSo, { stdio: 'inherit', shell: process.platform === 'win32' });
}

/**
 * Trả về kiểu nội dung và 40 ký tự đầu — đủ để biết nó là JS hay là HTML trá hình.
 *
 * `boCache` CHỈ dùng cho bước 3. Bước 4 phải gọi trần: `no-store` đi vòng qua cache biên
 * nên nó không bao giờ nhìn thấy chỗ hỏng, và bản đầu của file này đã báo xanh cho một
 * trang đang vỡ đúng vì thế.
 */
async function soi(duongDan, boCache = false) {
  const res = await fetch(`${GOC}${duongDan}`, boCache ? { cache: 'no-store' } : undefined);
  const chu = await res.text();
  return { ma: res.status, kieu: res.headers.get('content-type') ?? '', dau: chu.slice(0, 40) };
}

const laHtml = (r) => r.kieu.includes('text/html') || r.dau.trimStart().startsWith('<!doctype');

/** Một vòng: build, deploy, kiểm. Trả về true nếu bản live chạy được. */
async function motVong(vong) {
  noi(`\n━━━ Vòng ${vong}/${SO_VONG} ━━━`);
  noi('\n▸ Build');
  chay('npm', ['run', 'build']);

  noi('\n▸ Deploy');
  chay('npx', ['wrangler', 'deploy']);

  noi(`\n▸ Đợi ${CHO_LAT_BAN_KE_MS / 1000}s cho các biên lật bản kê`);
  await nghi(CHO_LAT_BAN_KE_MS);

  const trang = await fetch(`${GOC}/?kiem=${Date.now()}`, { cache: 'no-store' });
  const html = await trang.text();
  const dsFile = [...html.matchAll(/\/assets\/[A-Za-z0-9._-]+/g)].map((m) => m[0]);
  if (dsFile.length === 0) {
    noi('✗ index.html trên live không trỏ vào asset nào. Dừng.');
    process.exit(1);
  }
  noi(`\n▸ index.html đang trỏ vào: ${dsFile.join(', ')}`);

  // Bước 3: phá cache, nên lần gọi này đi tới gốc và KHÔNG ghi gì vào biên.
  noi('\n▸ Kiểm qua URL phá cache (không đụng vào cache)');
  for (const f of dsFile) {
    let xong = false;
    for (let lan = 1; lan <= SO_LAN_THU; lan += 1) {
      const r = await soi(`${f}?phacache=${Date.now()}`, true);
      if (!laHtml(r)) {
        noi(`  ✓ ${f} → ${r.ma} ${r.kieu}`);
        xong = true;
        break;
      }
      noi(`  … ${f} còn trả HTML, thử lại (${lan}/${SO_LAN_THU})`);
      await nghi(CACH_NHAU_MS);
    }
    if (!xong) {
      noi(`\n✗ ${f} không lên tới gốc. ĐỪNG gọi URL trần — gọi bây giờ là ghi bản hỏng vào cache.`);
      process.exit(1);
    }
  }

  // Bước 4: giờ mới được chạm vào URL thật.
  noi('\n▸ Kiểm qua URL thật (đúng cái trình duyệt sẽ xin)');
  let hong = false;
  for (const f of dsFile) {
    const r = await soi(f);
    if (laHtml(r)) {
      noi(`  ✗ ${f} → trả về HTML. Biên đang giữ bản hỏng cho đúng URL này.`);
      hong = true;
    } else {
      noi(`  ✓ ${f} → ${r.ma} ${r.kieu}`);
    }
  }

  if (hong) {
    noi('\n✗ Biên đang ghim bản hỏng cho URL này: trình duyệt sẽ nhận HTML ở chỗ chờ JS/CSS.');
    return false;
  }

  noi('\n✓ Bản live chạy được.\n');
  return true;
}

async function main() {
  for (let vong = 1; vong <= SO_VONG; vong += 1) {
    if (await motVong(vong)) return;
    if (vong < SO_VONG) noi('\n▸ Build lại để đổi sang bộ URL khác, rồi deploy lại.');
  }
  noi(`\n✗ Thử ${SO_VONG} vòng vẫn hỏng. Dừng, để khỏi báo xanh cho một trang đang vỡ.`);
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
