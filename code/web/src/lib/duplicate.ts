/**
 * Phát hiện mục giờ ghi trùng trong cùng một ngày.
 *
 * Founder gõ "thể dục 20 phút", rồi gõ lại "thẻ dục 20 phút" — sai một dấu — và Mira ghi
 * cả hai thành hai mục riêng. Nhìn vào sổ thì hôm đó tập 40 phút, mà thật ra là 20.
 *
 * Sai dấu không phải chuyện hiếm: gõ tiếng Việt trên điện thoại, "ể" và "ẻ" nằm cạnh
 * nhau. Và Mira ghi tự động — không có bước bấm nút để người ta kịp thấy mình vừa ghi
 * hai lần.
 *
 * **Ghi vẫn ghi, nhưng phải nói ra.** Chặn hẳn thì sai với người tập hai buổi 20 phút
 * thật trong ngày; im lặng thì sổ sai mà không ai biết. Nói ra rồi để nút Hoàn tác ngay
 * đó là đường ở giữa: một cú chạm khi nhầm, không cú nào khi cố ý.
 */

/**
 * Bỏ dấu để so khớp. **Hạ chữ thường TRƯỚC, bỏ dấu SAU.**
 *
 * "Đ" hoa là U+0110, một ký tự riêng không tách được bằng NFD, nên nó không rơi vào lớp
 * dấu thanh. Hạ chữ sau cùng thì "Đi bộ" ra "Đi bo" và không khớp được với "đi bộ".
 * Tầng luật dưới máy chủ từng dính đúng lỗi này.
 */
export const stripDiacritics = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();

/** Đủ để nhận ra hai mục là một: cùng ngày, cùng tên, cùng số phút, cùng ô. */
export interface HourKey {
  readonly date: string;
  readonly minutes: number;
  readonly bucket: string;
  /** Tên tự gõ, hoặc id danh mục khi mục thuộc một danh mục. */
  readonly note: string | null;
  readonly categoryId: string | null;
}

/**
 * Chữ ký của một mục giờ.
 *
 * Mục có danh mục thì ký bằng **id danh mục**, không phải tên: tên có thể đổi, id thì
 * không. Mục tự gõ thì ký bằng tên đã bỏ dấu — đó là chỗ bắt được "thể dục" ≡ "thẻ dục".
 */
export function entrySignature(x: HourKey): string {
  const ten = x.categoryId !== null ? `#${x.categoryId}` : stripDiacritics(x.note ?? '');
  return `${x.date}|${x.bucket}|${x.minutes}|${ten}`;
}
