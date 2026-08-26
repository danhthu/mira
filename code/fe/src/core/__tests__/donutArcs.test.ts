import { describe, expect, it } from 'vitest';
import { buildDonutArcs } from '../donutArcs';

describe('buildDonutArcs', () => {
  it('trả mảng rỗng khi không có giá trị dương nào', () => {
    expect(buildDonutArcs([])).toEqual([]);
    expect(buildDonutArcs([{ value: 0, color: '#000' }])).toEqual([]);
    expect(buildDonutArcs([{ value: -5, color: '#000' }])).toEqual([]);
  });

  it('chia đôi vòng tròn cho hai giá trị bằng nhau', () => {
    const arcs = buildDonutArcs([
      { value: 1, color: '#a' },
      { value: 1, color: '#b' },
    ]);

    expect(arcs).toEqual([
      { color: '#a', startDeg: 0, sweepDeg: 180 },
      { color: '#b', startDeg: 180, sweepDeg: 180 },
    ]);
  });

  it('chẻ cung lớn hơn 180° thành nhiều mảnh đều nhau', () => {
    const arcs = buildDonutArcs([
      { value: 3, color: '#a' },
      { value: 1, color: '#b' },
    ]);

    expect(arcs).toEqual([
      { color: '#a', startDeg: 0, sweepDeg: 135 },
      { color: '#a', startDeg: 135, sweepDeg: 135 },
      { color: '#b', startDeg: 270, sweepDeg: 90 },
    ]);
  });

  it('không sinh cung nào vượt quá 180°', () => {
    const arcs = buildDonutArcs([
      { value: 99, color: '#a' },
      { value: 1, color: '#b' },
    ]);

    for (const arc of arcs) {
      expect(arc.sweepDeg).toBeLessThanOrEqual(180);
    }
  });

  it('bỏ qua giá trị âm thay vì để nó làm lệch tỷ lệ phần còn lại', () => {
    const arcs = buildDonutArcs([
      { value: 1, color: '#a' },
      { value: -4, color: '#b' },
      { value: 1, color: '#c' },
    ]);

    expect(arcs.map((arc) => arc.color)).toEqual(['#a', '#c']);
    expect(arcs.map((arc) => arc.sweepDeg)).toEqual([180, 180]);
  });

  it('phủ đúng trọn một vòng, không hở không chồng', () => {
    const arcs = buildDonutArcs([
      { value: 7, color: '#a' },
      { value: 11, color: '#b' },
      { value: 2, color: '#c' },
    ]);

    let cursorDeg = 0;
    for (const arc of arcs) {
      expect(arc.startDeg).toBeCloseTo(cursorDeg, 10);
      cursorDeg += arc.sweepDeg;
    }

    expect(cursorDeg).toBeCloseTo(360, 10);
  });
});
