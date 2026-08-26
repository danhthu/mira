const MS_PER_DAY = 86_400_000;

/**
 * Bảy ngày là khoảng cách docs/01-modules.md chốt cho "điều đang đè nặng": đủ xa
 * để cảm giác kịp đổi, đủ gần để người viết còn nhận ra chữ của mình.
 */
export const REVIEW_AFTER_DAYS = 7;

export function computeReviewAt(writtenAt: string): string {
  const written = new Date(writtenAt).getTime();
  return new Date(written + REVIEW_AFTER_DAYS * MS_PER_DAY).toISOString();
}
