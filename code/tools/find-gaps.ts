/**
 * Soi những câu người ta SẼ gõ nếu khung chat là lối nhập duy nhất.
 *
 * Khác `mo-phong-chat.ts` ở chỗ: bài kia đo *ghi mới* có đọc được không. Bài này hỏi
 * những việc còn lại — sửa, xoá, tạo danh mục, khai nếp, đặt mục tiêu — những việc hôm
 * nay chỉ làm được bằng cách chạm nút ở màn khác.
 *
 * Không có đáp án đúng/sai ở đây. Chỉ in ra Mira hiện hiểu thành gì, để nhìn tận mắt.
 */
import { parseByRules } from '../be/src/services/parseSentence';

const bc = { homNay: '2026-11-25', categories: [] };

const NHOM: ReadonlyArray<readonly [string, readonly string[]]> = [
  [
    'Sửa một mục đã ghi',
    ['sửa mục họp thành 3 tiếng', 'họp hồi nãy là 3 tiếng chứ không phải 2', 'đổi họp sang gia đình'],
  ],
  ['Xoá một mục cũ', ['xoá mục thể dục', 'bỏ mục họp sáng nay', 'xoá cái vừa ghi']],
  ['Tạo danh mục', ['tạo danh mục Dự án A', 'thêm danh mục họp khách hàng vào công việc']],
  ['Khai nếp (việc lặp)', ['khai nếp đi làm 8 tiếng mỗi ngày', 'ngày nào tôi cũng đi làm 8 tiếng']],
  ['Đặt mục tiêu', ['đặt mục tiêu học tiếng anh 100 giờ', 'mục tiêu quý này chạy 50km']],
  ['Bật/tắt lời nhắc đã có', ['tắt lời nhắc 21h', 'bật lại nhắc buổi sáng']],
  ['Ngày cụ thể', ['ngày 3/11 họp 2 tiếng', '3/11 họp 2 tiếng', '20/11 đi ăn cưới 3 tiếng']],
];

console.log('\n═══ NHỮNG CÂU CHAT CHƯA XỬ LÝ ĐƯỢC ═══\n');

for (const [ten, ds] of NHOM) {
  console.log(`── ${ten}`);
  for (const c of ds) {
    const r = parseByRules(c, bc);
    const y = r.yChi[0];
    let t: string;
    if (y === undefined) t = 'chịu';
    else if (y.kind === 'time') t = `GHI MỤC MỚI: "${y.name}" ${y.minutes}m ${y.bucket} ngày ${y.date}`;
    else if (y.kind === 'question') t = `coi là câu hỏi (${y.code})`;
    else if (y.kind === 'reminder') t = `ĐẶT NHẮC ${y.at}`;
    else if (y.kind === 'grain') t = `bỏ vào hũ (${y.kind})`;
    else if (y.kind === 'money') t = `GHI TIỀN ${y.cell}`;
    else t = y.kind;
    console.log(`   "${c}"`);
    console.log(`      → ${t}`);
  }
  console.log('');
}
