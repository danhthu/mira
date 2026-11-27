import { describe, expect, it } from 'vitest';
import { ownTimeMinutes, ownTimePerMille } from '../ownTime';

const tuan = [
  { bucket: 'work', minutes: 2400 },
  { bucket: 'family', minutes: 600 },
  { bucket: 'personal', minutes: 300 },
  { bucket: 'waste', minutes: 300 },
] as const;

describe('giờ cho mình và gia đình', () => {
  it('cộng gia đình với cá nhân, bỏ công việc và lãng phí', () => {
    expect(ownTimeMinutes(tuan)).toBe(900);
  });

  it('chia cho giờ đã ghi: 900 trên 3600 phút là 25%', () => {
    expect(ownTimePerMille(tuan, 3600)).toBe(250);
  });

  it('chưa ghi giờ nào thì không có số', () => {
    expect(ownTimePerMille([], 0)).toBeNull();
  });

  it('chỉ ghi công việc thì là 0, không phải "chưa biết"', () => {
    expect(ownTimePerMille([{ bucket: 'work', minutes: 480 }], 480)).toBe(0);
  });
});
