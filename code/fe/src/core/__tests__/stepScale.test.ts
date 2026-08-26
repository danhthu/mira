import { describe, expect, it } from 'vitest';
import { nearestStepIndex, ratioOfStepIndex, stepIndexAtRatio, type StepScale } from '../stepScale';

const SCALE: StepScale = [1, 2, 4, 8, 16];

describe('nearestStepIndex', () => {
  it('trả đúng nấc khi giá trị nằm sẵn trên thang', () => {
    expect(nearestStepIndex(SCALE, 1)).toBe(0);
    expect(nearestStepIndex(SCALE, 8)).toBe(3);
    expect(nearestStepIndex(SCALE, 16)).toBe(4);
  });

  it('kéo giá trị lạ về nấc gần nhất thay vì về nấc đầu', () => {
    expect(nearestStepIndex(SCALE, 7)).toBe(3);
    expect(nearestStepIndex(SCALE, 5)).toBe(2);
  });

  it('hoà nhau thì lấy nấc nhỏ hơn', () => {
    expect(nearestStepIndex(SCALE, 3)).toBe(1);
    expect(nearestStepIndex(SCALE, 6)).toBe(2);
  });

  it('giá trị ngoài thang bám vào hai đầu', () => {
    expect(nearestStepIndex(SCALE, 0)).toBe(0);
    expect(nearestStepIndex(SCALE, -5)).toBe(0);
    expect(nearestStepIndex(SCALE, 999)).toBe(4);
  });

  it('thang một nấc luôn trả về nấc đó', () => {
    expect(nearestStepIndex([30], 3)).toBe(0);
  });
});

describe('stepIndexAtRatio', () => {
  it('chia đều thanh trượt cho các nấc', () => {
    expect(stepIndexAtRatio(5, 0)).toBe(0);
    expect(stepIndexAtRatio(5, 0.25)).toBe(1);
    expect(stepIndexAtRatio(5, 0.5)).toBe(2);
    expect(stepIndexAtRatio(5, 1)).toBe(4);
  });

  it('làm tròn về nấc gần nhất', () => {
    expect(stepIndexAtRatio(5, 0.3)).toBe(1);
    expect(stepIndexAtRatio(5, 0.38)).toBe(2);
  });

  it('kéo ra ngoài thanh vẫn nằm trong khoảng hợp lệ', () => {
    expect(stepIndexAtRatio(5, -2)).toBe(0);
    expect(stepIndexAtRatio(5, 4)).toBe(4);
  });

  it('thang một nấc không chia cho 0', () => {
    expect(stepIndexAtRatio(1, 0.7)).toBe(0);
  });
});

describe('ratioOfStepIndex', () => {
  it('đặt nấc đầu ở 0 và nấc cuối ở 1', () => {
    expect(ratioOfStepIndex(5, 0)).toBe(0);
    expect(ratioOfStepIndex(5, 4)).toBe(1);
    expect(ratioOfStepIndex(5, 2)).toBe(0.5);
  });

  it('thang một nấc không chia cho 0', () => {
    expect(ratioOfStepIndex(1, 0)).toBe(0);
  });

  it('đi vòng qua stepIndexAtRatio thì về đúng nấc cũ', () => {
    for (let index = 0; index < SCALE.length; index += 1) {
      expect(stepIndexAtRatio(SCALE.length, ratioOfStepIndex(SCALE.length, index))).toBe(index);
    }
  });
});
