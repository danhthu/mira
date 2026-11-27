/**
 * Canh tương phản của bảng màu theo WCAG 2.1.
 *
 * VÌ SAO CẦN MÁY CANH CHỨ KHÔNG CANH BẰNG MẮT
 *
 * Làm giao diện "tươi hơn" gần như luôn có nghĩa là nâng độ rực và độ sáng của màu. Hai
 * thứ đó kéo tương phản chữ xuống, và mắt người rất tệ trong việc nhận ra điều ấy: màn
 * hình trông đẹp trong phòng, rồi ra nắng thì con số không đọc nổi. Người dùng Mira đọc
 * app trên điện thoại giữa ban ngày.
 *
 * NGƯỠNG
 *   4.5 : chữ thường (dưới 18.66px, hoặc dưới 24px nếu không đậm)
 *   3.0 : chữ lớn (>= 18.66px và đậm, hoặc >= 24px)
 *   3.0 : ranh giới của thành phần giao diện — viền, thanh, chấm
 *
 * Chạy: npm run check-colors
 */
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('./src/styles/tokens.css', import.meta.url), 'utf8');

/** Đọc token từ chính file token, để bảng kiểm không bao giờ lệch với bảng màu thật. */
function readToken() {
  const ra = {};
  for (const m of css.matchAll(/^\s*(--[a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8}|var\(--[a-z0-9-]+\));/gm)) {
    ra[m[1]] = m[2];
  }
  // Giải các token trỏ vào token khác.
  for (const k of Object.keys(ra)) {
    let v = ra[k];
    // slice(4, -1): bỏ "var(" ở đầu và ")" ở cuối, giữ lại cả hai gạch của tên token.
    for (let i = 0; i < 5 && v.startsWith('var('); i += 1) v = ra[v.slice(4, -1)] ?? v;
    ra[k] = v;
  }
  return ra;
}

const T = readToken();

const rgb = (hex) => {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
};

/** Độ sáng tương đối theo WCAG. */
const sang = (hex) =>
  rgb(hex)
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);

const tyLe = (a, b) => {
  const [x, y] = [sang(a), sang(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const mau = (k) => {
  const v = T[k];
  if (v === undefined || !v.startsWith('#')) throw new Error(`Không đọc được token ${k}`);
  return v;
};

/** [token chữ, token nền, ngưỡng, nó là chỗ nào trên giao diện] */
const CAN_KIEM = [
  ['--fg', '--screen', 4.5, 'chữ thường trên nền màn'],
  ['--fg', '--surface', 4.5, 'chữ thường trên thẻ'],
  ['--fg-dim', '--surface', 4.5, 'chữ phụ trên thẻ'],
  ['--fg-muted', '--surface', 3.0, 'nhãn nhỏ trên thẻ'],
  ['--fg-muted', '--screen', 3.0, 'nhãn nhỏ trên nền màn'],

  // Ba con số lớn ở đầu màn Nhật ký: 19px đậm → ngưỡng chữ lớn.
  ['--green', '--surface', 3.0, 'số giờ vàng'],
  ['--amber', '--surface', 3.0, 'số lãng phí'],
  ['--deep', '--surface', 3.0, 'số tháng tự do'],

  // Viên ô trên thẻ kết quả: chữ 10.5px đậm → chữ thường.
  ['--family-ink', '--family-soft', 4.5, 'chữ viên Gia đình'],
  ['--waste-ink', '--waste-soft', 4.5, 'chữ viên Lãng phí'],
  ['--work-ink', '--work-soft', 4.5, 'chữ viên Công việc'],
  ['--personal-ink', '--personal-soft', 4.5, 'chữ viên Cá nhân'],

  // Thẻ số có nền nhạt.
  ['--green', '--family-soft', 3.0, 'số giờ vàng trên thẻ nhạt'],
  ['--amber', '--waste-soft', 3.0, 'số lãng phí trên thẻ nhạt'],
  ['--deep', '--work-soft', 3.0, 'số tháng tự do trên thẻ nhạt'],
  ['--fg-dim', '--family-soft', 4.5, 'nhãn trên thẻ Gia đình'],
  ['--fg-dim', '--waste-soft', 4.5, 'nhãn trên thẻ Lãng phí'],
  ['--fg-dim', '--work-soft', 4.5, 'nhãn trên thẻ Công việc'],

  ['--brand', '--surface', 3.0, 'màu thương hiệu trên trắng'],
  ['--brand-ink', '--brand-soft', 4.5, 'chữ trong bóng chat của người dùng'],
  ['--brand', '--screen', 3.0, 'tab đang chọn trên thanh tab'],
  ['--fg-muted', '--screen', 3.0, 'tab không chọn'],
  ['--fg-faint', '--surface', 3.0, 'dấu hỏi của giá trị chưa nhập'],
  ['--candy', '--surface', 3.0, 'viên kẹo'],
  ['--salt', '--surface', 3.0, 'hạt muối'],
  ['--red', '--surface', 3.0, 'chi tiêu trong donut tiền'],
  ['--red-ink', '--red-soft', 4.5, 'mức dư âm trên dải đỏ'],
  ['--fg-dim', '--red-soft', 4.5, 'chữ phụ trên dải mức dư âm'],

  // TÁM MÀU DANH MỤC. Người dùng tự chọn, và chúng tô cả biểu tượng lẫn CON SỐ của dòng
  // — cả hai đều nằm trên nền trắng. Danh sách phải khớp `CATEGORY_COLORS` trong contract:
  // thêm một màu mà quên ở đây là mở đường cho một màu không ai đọc nổi lọt vào bảng chọn.
  ['--work-ink', '--surface', 3.0, 'danh mục màu xanh dương'],
  ['--family-ink', '--surface', 3.0, 'danh mục màu xanh lá'],
  ['--personal-ink', '--surface', 3.0, 'danh mục màu tím'],
  ['--waste-ink', '--surface', 3.0, 'danh mục màu vàng'],
  ['--red', '--surface', 3.0, 'danh mục màu đỏ'],
  ['--navy', '--surface', 3.0, 'danh mục màu than'],
  ['--candy', '--surface', 3.0, 'danh mục màu nâu vàng'],
  ['--salt', '--surface', 3.0, 'danh mục màu xanh xám'],

  // Chữ trắng trên nền đặc.
  ['--surface', '--navy', 4.5, 'chữ trắng trên nền navy'],
  ['--surface', '--brand', 4.5, 'chữ trắng trên nút thương hiệu'],
];

/** Bốn màu tô của bốn ô phải phân biệt được VỚI NHAU trong donut. */
const PHAN_BIET = [
  ['--work', '--family'],
  ['--work', '--personal'],
  ['--work', '--waste'],
  ['--family', '--personal'],
  ['--family', '--waste'],
  ['--personal', '--waste'],
];

/**
 * Năm lát của vòng dòng tiền ở màn Tài chính, theo đúng thứ tự chúng được vẽ.
 *
 * Chỉ kiểm các cặp KỀ NHAU trên vòng — đó là chỗ mắt thật sự phải phân biệt. Hai lát
 * cách nhau một lát thứ ba thì giống màu cũng không sao.
 *
 * VÀ CẢ CẶP ĐẦU–CUỐI, vì vòng thì khép kín: lát Chi tiêu chạm lát Còn lại.
 *
 * Mục kiểm này bắt được một lỗi thật ngay lần chạy đầu. Thứ tự tự nhiên của concept —
 * chi tiêu, đầu tư, lãng phí, trả nợ — đặt --red cạnh --work, tỉ lệ 1,24: dưới ngưỡng.
 * Đổi thứ tự lát thì đạt cả năm cặp. Thứ tự dưới đây PHẢI khớp với `lat` trong
 * `features/money/CashFlow.tsx`.
 */
const VONG_TIEN = ['--red', '--waste', '--work', '--navy', '--family'];
let hong = 0;
console.log('\nTƯƠNG PHẢN CHỮ\n');
for (const [a, b, nguong, o] of CAN_KIEM) {
  const r = tyLe(mau(a), mau(b));
  const dat = r >= nguong;
  if (!dat) hong += 1;
  console.log(
    `  ${dat ? '✓' : '✗'} ${r.toFixed(2).padStart(5)} / ${nguong.toFixed(1)}  ${o}  (${a} trên ${b})`,
  );
}

console.log('\nBỐN Ô CÓ PHÂN BIỆT ĐƯỢC VỚI NHAU KHÔNG\n');
for (const [a, b] of PHAN_BIET) {
  const r = tyLe(mau(a), mau(b));
  // 1.3 là ngưỡng mềm: hai lát donay cạnh nhau mà gần bằng nhau quá thì nhìn ra một mảng.
  const dat = r >= 1.3;
  if (!dat) hong += 1;
  console.log(`  ${dat ? '✓' : '✗'} ${r.toFixed(2).padStart(5)} / 1.30   ${a} ↔ ${b}`);
}

console.log('\nNĂM LÁT VÒNG DÒNG TIỀN, CẶP KỀ NHAU\n');
for (let i = 0; i < VONG_TIEN.length; i += 1) {
  const [a, b] = [VONG_TIEN[i], VONG_TIEN[(i + 1) % VONG_TIEN.length]];
  const r = tyLe(mau(a), mau(b));
  const dat = r >= 1.3;
  if (!dat) hong += 1;
  console.log(`  ${dat ? '✓' : '✗'} ${r.toFixed(2).padStart(5)} / 1.30   ${a} ↔ ${b}`);
}
if (hong > 0) {
  console.log(`\n✗ ${hong} chỗ không đạt. Sửa bảng màu, đừng hạ ngưỡng.\n`);
  process.exit(1);
}
console.log('\n✓ Bảng màu đạt.\n');
