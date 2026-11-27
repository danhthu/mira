/**
 * Bộ icon của Mira. **Một nguồn duy nhất, không emoji.**
 *
 * ─────────────────────────────── VÌ SAO BỎ EMOJI ───────────────────────────────
 *
 * Trước đây thanh tab là 📓⏱️💰🎯👤, catalog tiền là 💼🧾📈🕳️🏦. Emoji vẽ bằng phông của
 * MÁY, không phải của app:
 *
 *   • Windows ra Segoe UI Emoji — khối, đậm, nhiều màu chói. iPhone ra Apple Color Emoji —
 *     bóng, bo tròn. Android ra Noto. Cùng một màn hình, ba diện mạo khác hẳn nhau, và
 *     không cái nào hợp với bảng màu đã dựng công.
 *   • Không nhuộm được. Tab đang chọn đổi màu chữ sang `--brand` thì icon vẫn y nguyên,
 *     nên cái đang chọn trông không khác cái không chọn.
 *   • Cỡ và trọng lượng nét lệch nhau giữa các emoji: 🕳️ mảnh hều, 💼 nặng trịch, đứng
 *     cạnh nhau trong một danh sách thì dòng nào cũng như sai cỡ chữ.
 *   • 💰 dùng hai chỗ (tab Tài chính và dải Mức dư), nên hai thứ khác nhau mang cùng
 *     một dấu.
 *
 * SVG nét thì ngược lại: cùng một `viewBox`, cùng một độ dày nét, và `currentColor` nghĩa
 * là icon nhuộm theo chữ bên cạnh nó — miễn phí.
 *
 * ─────────────────────────────── LUẬT VẼ ───────────────────────────────
 *
 * Mọi hình nằm trong `viewBox 0 0 24 24`, chỉ nét không tô, nét 1.7, đầu và góc bo tròn.
 * Sửa một hình thì giữ đúng mấy con số đó, không thì nó lạc ra khỏi cả bộ.
 */
import type { JSX } from 'react';

export type IconName =
  // thanh tab
  | 'journal'
  | 'clock'
  | 'wallet'
  | 'target'
  | 'person'
  // năm ô dòng tiền
  | 'income'
  | 'receipt'
  | 'chart'
  | 'bin'
  | 'bank'
  // bốn nhóm việc
  | 'briefcase'
  | 'home'
  | 'mug'
  | 'hourglass'
  // dấu trong danh sách
  | 'coins'
  | 'arrowIn'
  | 'arrowOut'
  | 'repeat'
  | 'flame'
  | 'jar'
  // hình cho DANH MỤC — người dùng tự chọn, xem `CATEGORY_ICONS` trong contract
  | 'bowl'
  | 'cart'
  | 'car'
  | 'fuel'
  | 'bolt'
  | 'droplet'
  | 'wifi'
  | 'phone'
  | 'school'
  | 'book'
  | 'pill'
  | 'shirt'
  | 'gift'
  | 'plane'
  | 'tool'
  | 'heart'
  | 'music'
  | 'gamepad'
  | 'laptop'
  | 'piggy';

const HINH: Record<IconName, JSX.Element> = {
  // ── thanh tab
  journal: (
    <>
      <path d="M5.5 4.2A1.7 1.7 0 0 1 7.2 2.5h11.3v19H7.2a1.7 1.7 0 0 1-1.7-1.7Z" />
      <path d="M9 2.5v19" />
      <path d="M11.8 8h4" />
      <path d="M11.8 12h4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 6.8V12l3.5 2" />
    </>
  ),
  wallet: (
    <>
      <path d="M3.6 8.4A1.9 1.9 0 0 1 5.5 6.5h13a1.9 1.9 0 0 1 1.9 1.9v9.2a1.9 1.9 0 0 1-1.9 1.9h-13a1.9 1.9 0 0 1-1.9-1.9Z" />
      <path d="M3.6 10.2h16.8" />
      <circle cx="16.4" cy="14.6" r="1.15" fill="currentColor" stroke="none" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <circle cx="12" cy="12" r="4.4" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8.3" r="3.8" />
      <path d="M4.8 20.4c0-3.6 3.2-5.6 7.2-5.6s7.2 2 7.2 5.6" />
    </>
  ),

  // ── năm ô dòng tiền
  /** Tiền VÀO: mũi tên rơi xuống khay. */
  income: (
    <>
      <path d="M12 3.4v10.2" />
      <path d="m7.9 9.9 4.1 4.1 4.1-4.1" />
      <path d="M4.3 16.4v2.3a1.9 1.9 0 0 0 1.9 1.9h11.6a1.9 1.9 0 0 0 1.9-1.9v-2.3" />
    </>
  ),
  /** Chi tiêu: tờ hoá đơn, mép dưới răng cưa. */
  receipt: (
    <>
      <path d="M6.6 21V4.3a.8.8 0 0 1 .8-.8h9.2a.8.8 0 0 1 .8.8V21l-2.6-1.7-2.6 1.7-2.6-1.7Z" />
      <path d="M9.6 8.3h4.8" />
      <path d="M9.6 12h4.8" />
    </>
  ),
  /** Đầu tư: đường đi lên, có trục. */
  chart: (
    <>
      <path d="M3.6 3.6v16.8h16.8" />
      <path d="m6.9 16.4 3.8-4.4 2.9 2.4 5.3-6.2" />
      <path d="M15.3 8.2h3.6v3.6" />
    </>
  ),
  /**
   * Lãng phí: thùng rác. Tiền vứt đi.
   *
   * Hai bản trước đều hỏng, và hỏng theo cách đáng ghi lại:
   *
   *   1. "Đồng xu rơi xuống lỗ" — vòng tròn trên, bầu dục dưới. Phóng to 64px mới thấy
   *      nó ra hình NGƯỜI: vòng tròn thành đầu, bầu dục thành vai, gần như trùng icon
   *      `person`. Hai dấu khác nghĩa mà giống nhau thì tệ hơn một dấu xấu.
   *   2. "Giọt rơi xuống miệng cống" — giọt nằm sát vòng tròn kẻ vằn, cả cụm đọc ra một
   *      củ hành. Ẩn dụ đúng mà hình không nói được thì vẫn là hình sai.
   *
   * Thùng rác thì không ai đọc nhầm. Mira định nghĩa lãng phí là "tiêu mà tự thấy không
   * đáng" — vứt đi, đúng nghĩa đen.
   */
  bin: (
    <>
      <path d="M3.8 6.4h16.4" />
      <path d="M9.4 6.4V4.6a1.1 1.1 0 0 1 1.1-1.1h3a1.1 1.1 0 0 1 1.1 1.1v1.8" />
      <path d="m5.8 6.4.9 13a1.9 1.9 0 0 0 1.9 1.8h6.8a1.9 1.9 0 0 0 1.9-1.8l.9-13" />
      <path d="M10.2 10.6v6.4" />
      <path d="M13.8 10.6v6.4" />
    </>
  ),
  /** Trả nợ: nhà băng. */
  bank: (
    <>
      <path d="m3.4 9.6 8.6-5.7 8.6 5.7" />
      <path d="M6 10.4v7.8" />
      <path d="M10 10.4v7.8" />
      <path d="M14 10.4v7.8" />
      <path d="M18 10.4v7.8" />
      <path d="M3.2 20.4h17.6" />
    </>
  ),

  // ── bốn nhóm việc
  briefcase: (
    <>
      <path d="M3.4 9.3a1.9 1.9 0 0 1 1.9-1.9h13.4a1.9 1.9 0 0 1 1.9 1.9v8.9a1.9 1.9 0 0 1-1.9 1.9H5.3a1.9 1.9 0 0 1-1.9-1.9Z" />
      <path d="M8.8 7.4V6a1.9 1.9 0 0 1 1.9-1.9h2.6A1.9 1.9 0 0 1 15.2 6v1.4" />
      <path d="M3.4 13h17.2" />
    </>
  ),
  home: (
    <>
      <path d="m3.8 11.2 8.2-6.8 8.2 6.8" />
      <path d="M6.2 10.3v10.1h11.6V10.3" />
      <path d="M9.9 20.4v-5.6h4.2v5.6" />
    </>
  ),
  /** Cá nhân: ly nóng — ăn, nghỉ, chăm mình. */
  mug: (
    <>
      <path d="M5.3 8.6h11.2v5.9a5.6 5.6 0 0 1-11.2 0Z" />
      <path d="M16.5 10.1h1.8a2.3 2.3 0 0 1 0 4.6h-1.8" />
      <path d="M8.2 3.6v1.9" />
      <path d="M11.9 3.1v2.4" />
      <path d="M15.6 3.6v1.9" />
    </>
  ),
  /** Lãng phí giờ: đồng hồ cát. */
  hourglass: (
    <>
      <path d="M7.2 3.5h9.6" />
      <path d="M7.2 20.5h9.6" />
      <path d="M8.2 3.5v3.6l3.8 4.9 3.8-4.9V3.5" />
      <path d="M8.2 20.5v-3.6l3.8-4.9 3.8 4.9v3.6" />
    </>
  ),

  // ── dấu trong danh sách
  /**
   * Mức dư: hai đồng xu gối nhau.
   *
   * Bản đầu là chồng xu nhìn nghiêng — ba hình bầu dục xếp dọc. Nó đọc ra đúng cái icon
   * **cơ sở dữ liệu**, vì hai thứ vẽ y như nhau. Nhìn thẳng mặt đồng xu thì hết nhầm.
   */
  coins: (
    <>
      <circle cx="9.2" cy="9.2" r="5.7" />
      <circle cx="15.1" cy="15.1" r="5.7" />
    </>
  ),
  arrowIn: (
    <>
      <path d="M12 4.3v11.4" />
      <path d="m7.6 11.3 4.4 4.4 4.4-4.4" />
      <path d="M4.8 20.2h14.4" />
    </>
  ),
  arrowOut: (
    <>
      <path d="M12 19.7V8.3" />
      <path d="m7.6 12.7 4.4-4.4 4.4 4.4" />
      <path d="M4.8 3.8h14.4" />
    </>
  ),
  repeat: (
    <>
      <path d="M4.4 10.2a7.7 7.7 0 0 1 13.1-4.4l2.1 2.1" />
      <path d="M19.6 3.9v4.3h-4.3" />
      <path d="M19.6 13.8a7.7 7.7 0 0 1-13.1 4.4l-2.1-2.1" />
      <path d="M4.4 20.1v-4.3h4.3" />
    </>
  ),
  /** Giờ vàng. Tính năng đang tắt (`GOLDEN_HOURS`), nhưng mục giờ cũ vẫn mang cờ này. */
  flame: (
    <>
      <path d="M12 21.2c3.3 0 6-2.5 6-5.6 0-3.9-3.4-5.9-4.3-10.4-2 1.3-3.3 3.5-3.3 5.5 0 .9.2 1.6.5 2.3-1.1-.4-1.9-1.4-2.3-2.6-1.6 1.4-2.6 3.3-2.6 5.2 0 3.1 2.7 5.6 6 5.6Z" />
    </>
  ),
  // ───────────────────────────────── hình cho danh mục
  //
  // Hai mươi hình đời thường, đủ cho các danh mục một nhà ở Việt Nam hay dùng. Giữ đúng
  // luật vẽ ở đầu file: viewBox 24, chỉ nét, nét 1.7, góc bo tròn.
  //
  // Mỗi hình ở đây đều đã được soi ở cỡ 80px trước khi để lại. Đó không phải cẩn thận
  // thừa: trong cùng phiên này, hai hình trông ổn ở 19px hoá ra ở 80px thì một cái ra
  // hình người, một cái ra icon cơ sở dữ liệu.

  /** Ăn uống. */
  bowl: (
    <>
      <path d="M3.4 10.6h17.2a8.6 8.6 0 0 1-8.6 8.6 8.6 8.6 0 0 1-8.6-8.6Z" />
      <path d="M2.6 21.4h18.8" />
      <path d="M9 7.6V5.2" />
      <path d="M12.5 7.6V4.2" />
      <path d="M16 7.6V5.2" />
    </>
  ),
  /** Chợ búa, mua sắm. */
  cart: (
    <>
      <path d="M2.6 3.4h2.9l2.4 11.2h10.1" />
      <path d="M6.3 6.6h15l-1.8 6.4H7.7" />
      <circle cx="9.4" cy="19.4" r="1.7" />
      <circle cx="17.6" cy="19.4" r="1.7" />
    </>
  ),
  car: (
    <>
      <path d="m4.4 12 1.8-4.8a1.9 1.9 0 0 1 1.8-1.3h8a1.9 1.9 0 0 1 1.8 1.3L19.6 12" />
      <path d="M3.4 12h17.2v5.2H3.4Z" />
      <path d="M5.6 17.2v1.9" />
      <path d="M18.4 17.2v1.9" />
      <circle cx="7.2" cy="14.6" r="1" fill="currentColor" stroke="none" />
      <circle cx="16.8" cy="14.6" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  /** Xăng xe. */
  fuel: (
    <>
      <path d="M4.4 20.8V4.9a1.5 1.5 0 0 1 1.5-1.5h6.6a1.5 1.5 0 0 1 1.5 1.5v15.9" />
      <path d="M3.2 20.8h12.6" />
      <path d="M6.6 6.8h5.2v3.8H6.6Z" />
      <path d="M14 9.4h3.2a1.9 1.9 0 0 1 1.9 1.9v5.2a1.4 1.4 0 0 0 2.8 0V8.2l-2.3-2.4" />
    </>
  ),
  /** Tiền điện. */
  bolt: <path d="M13.4 2.6 4.8 13.4h6l-1.2 8 8.6-10.8h-6Z" />,
  /** Tiền nước. */
  droplet: (
    <path d="M12 2.8c0 0-6.4 6.6-6.4 11.1a6.4 6.4 0 0 0 12.8 0C18.4 9.4 12 2.8 12 2.8Z" />
  ),
  wifi: (
    <>
      <path d="M2.8 8.6a13.4 13.4 0 0 1 18.4 0" />
      <path d="M6.2 12.4a8.6 8.6 0 0 1 11.6 0" />
      <path d="M9.6 16.2a3.8 3.8 0 0 1 4.8 0" />
      <circle cx="12" cy="19.8" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  phone: (
    <>
      <path d="M6.6 3.4h10.8a1.6 1.6 0 0 1 1.6 1.6v14a1.6 1.6 0 0 1-1.6 1.6H6.6A1.6 1.6 0 0 1 5 19V5a1.6 1.6 0 0 1 1.6-1.6Z" />
      <path d="M10.4 17.6h3.2" />
    </>
  ),
  /** Học phí. */
  school: (
    <>
      <path d="m2.6 8.4 9.4-4.6 9.4 4.6-9.4 4.6Z" />
      <path d="M6.6 10.6v5.2c0 1.6 2.4 2.9 5.4 2.9s5.4-1.3 5.4-2.9v-5.2" />
      <path d="M21.4 8.4v5.4" />
    </>
  ),
  book: (
    <>
      <path d="M4.4 4.6a1.6 1.6 0 0 1 1.6-1.6h13V21H6a1.6 1.6 0 0 1-1.6-1.6Z" />
      <path d="M4.4 17.8h14.6" />
      <path d="M8 7h7" />
    </>
  ),
  /** Thuốc men, sức khoẻ. */
  pill: (
    <>
      <path d="M7.4 4.2a4.8 4.8 0 0 1 6.8 0l5.6 5.6a4.8 4.8 0 0 1-6.8 6.8L7.4 11a4.8 4.8 0 0 1 0-6.8Z" />
      <path d="m10.8 7.6 5.6 5.6" />
    </>
  ),
  /** Quần áo. */
  shirt: (
    <>
      <path d="M9 3.4 4 6.2l1.8 4 2-1v10.4h8.4V9.2l2 1 1.8-4-5-2.8Z" />
      <path d="M9 3.4a3 3 0 0 0 6 0" />
    </>
  ),
  /** Quà, hiếu hỉ. */
  gift: (
    <>
      <path d="M3.6 10.4h16.8v3.2H3.6Z" />
      <path d="M5.2 13.6v6a1.4 1.4 0 0 0 1.4 1.4h10.8a1.4 1.4 0 0 0 1.4-1.4v-6" />
      <path d="M12 10.4V21" />
      <path d="M12 10.4c-3.4 0-5-.8-5-2.6a2.6 2.6 0 0 1 5-1c.9-1.8 2.4-2.2 3.8-1.4 1.6.9 1.6 2.9.2 3.9-1 .7-2.4 1.1-4 1.1Z" />
    </>
  ),
  /** Du lịch. */
  plane: (
    <path d="M10.2 3.4a1.5 1.5 0 0 1 2.9 0l1 6.5 6.9 3.4v2.3l-6.9-1.9-.6 3.6 2.5 1.9v1.4l-4.3-1.1-4.3 1.1v-1.4l2.5-1.9-.6-3.6L2.4 15.6v-2.3L9.3 9.9Z" />
  ),
  /** Sửa chữa. */
  tool: (
    <>
      <path d="M14.4 6.6a4 4 0 0 1 5.4-5.1l-2.9 2.9 1.5 1.5 2.9-2.9a4 4 0 0 1-5.1 5.4L8.1 20.2a2.1 2.1 0 1 1-3-3Z" />
      <circle cx="6.5" cy="18.7" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  heart: (
    <path d="M12 20.6s-8.4-4.8-8.4-10.4a4.6 4.6 0 0 1 8.4-2.6 4.6 4.6 0 0 1 8.4 2.6c0 5.6-8.4 10.4-8.4 10.4Z" />
  ),
  music: (
    <>
      <path d="M9.4 18.2V5.6l10-2v12.6" />
      <circle cx="6.6" cy="18.2" r="2.8" />
      <circle cx="16.6" cy="16.2" r="2.8" />
    </>
  ),
  gamepad: (
    <>
      <path d="M6.8 7.4h10.4a4.8 4.8 0 0 1 4.8 4.8v2.2a4 4 0 0 1-7.2 2.4l-.6-.8H9.8l-.6.8a4 4 0 0 1-7.2-2.4v-2.2a4.8 4.8 0 0 1 4.8-4.8Z" />
      <path d="M6.4 11.6v2.8" />
      <path d="M5 13h2.8" />
      <circle cx="17" cy="12.4" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.8" cy="14.6" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  /** Việc ngoài, freelance. */
  laptop: (
    <>
      <path d="M5 5.6h14v10H5Z" />
      <path d="M2.6 18.4h18.8l-1.4-2.8H4Z" />
    </>
  ),
  /** Tiết kiệm. */
  piggy: (
    <>
      <path d="M15.6 6.6a7 7 0 0 1 4.3 4h1.5v4.2h-1.9a7 7 0 0 1-2 2.3v2.3h-3.2v-1.3a7.4 7.4 0 0 1-2.6 0v1.3H8.5v-2.3a7 7 0 0 1 3.9-12.7h5.1" />
      <circle cx="16.6" cy="11.4" r="1" fill="currentColor" stroke="none" />
      <path d="M6.4 10.2a2.4 2.4 0 0 0-2.8 2.4" />
    </>
  ),

  /** Hũ kẹo và muối. */
  jar: (
    <>
      <path d="M8.3 3.5h7.4v2.2H8.3Z" />
      <path d="M6.9 8.2a2.4 2.4 0 0 1 2.4-2.5h5.4a2.4 2.4 0 0 1 2.4 2.5v10a2.4 2.4 0 0 1-2.4 2.3H9.3a2.4 2.4 0 0 1-2.4-2.3Z" />
      <path d="M6.9 12.4h10.2" />
    </>
  ),
};

/**
 * Mọi tên hình đang có, rút thẳng từ bảng vẽ.
 *
 * Không gõ tay một danh sách thứ hai: gõ tay là nó lệch khỏi `HINH` ngay lần thêm hình
 * tiếp theo, mà lệch thì bài kiểm đối chiếu với contract sẽ xanh một cách vô nghĩa.
 */
export const ICON_NAMES = Object.keys(HINH) as readonly IconName[];

/**
 * Một icon.
 *
 * `aria-hidden` mặc định: ở mọi chỗ icon đang dùng, chữ bên cạnh đã nói đúng điều icon
 * nói. Đọc lên hai lần là làm phiền người dùng trình đọc màn hình. Icon nào đứng một mình
 * thì truyền `label`.
 */
export function Icon({
  name,
  size = 22,
  strokeWidth = 1.7,
  label,
}: {
  readonly name: IconName;
  readonly size?: number;
  readonly strokeWidth?: number;
  readonly label?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label === undefined ? true : undefined}
      role={label === undefined ? undefined : 'img'}
      aria-label={label}
      style={{ display: 'block', flex: 'none' }}
    >
      {HINH[name]}
    </svg>
  );
}
