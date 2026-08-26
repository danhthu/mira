import { describe, it, expect } from 'vitest';
import { computeReviewAt, REVIEW_AFTER_DAYS } from './reviewSchedule';

describe('computeReviewAt', () => {
  it('đẩy mốc hỏi lại đúng bảy ngày', () => {
    expect(computeReviewAt('2026-08-25T10:00:00.000Z')).toBe(
      '2026-09-01T10:00:00.000Z',
    );
  });

  it('giữ nguyên giờ trong ngày khi bước qua tháng', () => {
    expect(computeReviewAt('2026-08-31T23:30:00.000Z')).toBe(
      '2026-09-07T23:30:00.000Z',
    );
  });

  it('khớp với hằng số công khai', () => {
    expect(REVIEW_AFTER_DAYS).toBe(7);
  });
});
