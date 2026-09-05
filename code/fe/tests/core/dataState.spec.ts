import {
  emptyMetric,
  hasValue,
  learningMetric,
  mapMetric,
  metricByCoverage,
  readyMetric,
} from '../../src/Core/dataState';

describe('metricByCoverage', () => {
  it('đủ mẫu thì ready', () => {
    expect(metricByCoverage(10, 7, 7)).toEqual({ status: 'ready', value: 10 });
  });

  it('thiếu mẫu thì learning và nói rõ còn thiếu bao nhiêu', () => {
    expect(metricByCoverage(10, 3, 7)).toEqual({
      status: 'learning',
      value: 10,
      samplesHave: 3,
      samplesNeed: 7,
    });
  });
});

describe('hasValue', () => {
  it('empty không có giá trị', () => {
    expect(hasValue(emptyMetric<number>('no_data'))).toBe(false);
  });

  it('learning vẫn hiện được, kèm chú thích', () => {
    expect(hasValue(learningMetric(1, 2, 3))).toBe(true);
  });

  it('ready có giá trị', () => {
    expect(hasValue(readyMetric(1))).toBe(true);
  });
});

describe('mapMetric', () => {
  it('giữ nguyên lý do rỗng', () => {
    expect(mapMetric(emptyMetric<number>('divide_by_zero'), (n) => n * 2)).toEqual({
      status: 'empty',
      reason: 'divide_by_zero',
    });
  });

  it('trạng thái learning đi theo giá trị được rút ra', () => {
    expect(mapMetric(learningMetric(5, 2, 3), (n) => n * 2)).toEqual({
      status: 'learning',
      value: 10,
      samplesHave: 2,
      samplesNeed: 3,
    });
  });

  it('ready vẫn là ready', () => {
    expect(mapMetric(readyMetric(5), (n) => n * 2)).toEqual({
      status: 'ready',
      value: 10,
    });
  });
});
