/**
 * Màu của bốn ô, một chỗ duy nhất.
 *
 * Trước đây bảng này nằm cùng lúc ở `TimeScreen` và `BucketScreen`, chép tay giống hệt
 * nhau. Hai bản chép tay của cùng một sự thật thì sớm muộn cũng lệch, và lúc lệch thì
 * cùng một ô hiện hai màu ở hai màn — người dùng không có cách nào biết màn nào đúng.
 *
 * BA BẢN, DÙNG ĐÚNG CHỖ
 *   MAU_TO    tươi — donut, thanh, chấm. Nền có màu nên không cần lo tương phản chữ.
 *   MAU_CHU   đậm — chữ trên nền trắng. Lấy bản tươi viết chữ thì đọc không ra.
 *   MAU_NEN   nhạt — lót nền thẻ và viên.
 *
 * `npm run kiem-mau` canh cả ba theo WCAG, và canh cả việc bốn màu tô có phân biệt được
 * với nhau trong donut hay không.
 */
import type { TimeBucket } from '@mira/contract';

export const MAU_TO: Record<TimeBucket, string> = {
  work: 'var(--work)',
  family: 'var(--family)',
  personal: 'var(--personal)',
  waste: 'var(--waste)',
};

export const MAU_CHU: Record<TimeBucket, string> = {
  work: 'var(--work-ink)',
  family: 'var(--family-ink)',
  personal: 'var(--personal-ink)',
  waste: 'var(--waste-ink)',
};

export const MAU_NEN: Record<TimeBucket, string> = {
  work: 'var(--work-soft)',
  family: 'var(--family-soft)',
  personal: 'var(--personal-soft)',
  waste: 'var(--waste-soft)',
};
