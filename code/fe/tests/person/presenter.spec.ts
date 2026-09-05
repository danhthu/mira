import { emptyMetric, learningMetric, readyMetric } from '../../src/Core/dataState';
import {
  cadenceName,
  personCardView,
  roleName,
} from '../../src/Person/Models/presenter';
import { useText } from '../../src/Person/Text';

const text = useText();

describe('nhãn vai và nhịp gặp', () => {
  it('mỗi vai có một tên tiếng Việt', () => {
    expect(roleName('child', text)).toBe('con');
    expect(roleName('parent', text)).toBe('bố mẹ');
    expect(roleName('partner', text)).toBe('bạn đời');
    expect(roleName('friend', text)).toBe('bạn thân');
    expect(roleName('self', text)).toBe('bản thân');
    expect(roleName('other', text)).toBe('người khác');
  });

  it('nhịp dày nhất hiện thành chữ, không thành "30 lần một tháng"', () => {
    expect(cadenceName(30, text)).toBe('hằng ngày');
    expect(cadenceName(2, text)).toBe('2 lần một tháng');
  });
});

describe('thẻ một người', () => {
  it('chưa có giờ nào thì không hiện số, kèm câu trung tính và một lối đi', () => {
    const view = personCardView(
      {
        name: 'Mẹ',
        weekMinutes: emptyMetric<number>('no_data'),
        lastMet: null,
        daysSinceLastMet: null,
      },
      text,
    );
    expect(view.hours).toBeNull();
    expect(view.hoursUnit).toBeNull();
    expect(view.notes).toContain('chưa ghi giờ nào tuần này');
    expect(view.notes).toContain('màn hôm nay có nút bắt đầu đếm');
    expect(view.notes.join(' ')).not.toContain('0');
  });

  it('không câu nào dùng "nên", "phải", "hãy" hay dấu chấm than', () => {
    const view = personCardView(
      {
        name: 'Mẹ',
        weekMinutes: emptyMetric<number>('no_data'),
        lastMet: null,
        daysSinceLastMet: null,
        desiredCadence: 2,
      },
      text,
    );
    const all = view.notes.join(' ');
    expect(all).not.toMatch(/\bnên\b|\bphải\b|\bhãy\b|!/);
  });

  it('dưới một giờ hiện phút, không hiện "0,0 h"', () => {
    const view = personCardView(
      {
        name: 'Bi',
        weekMinutes: readyMetric(15),
        lastMet: '2026-09-05',
        daysSinceLastMet: 0,
      },
      text,
    );
    expect(view.hours).toBe('15');
    expect(view.hoursUnit).toBe('phút');
  });

  it('từ một giờ trở lên hiện giờ với dấu phẩy thập phân', () => {
    const view = personCardView(
      {
        name: 'Bi',
        weekMinutes: readyMetric(90),
        lastMet: '2026-09-04',
        daysSinceLastMet: 1,
      },
      text,
    );
    expect(view.hours).toBe('1,5');
    expect(view.hoursUnit).toBe('h');
    expect(view.notes).toContain('ở cùng hôm qua');
  });

  it('trạng thái đang tính vẫn hiện số kèm chú thích độ phủ', () => {
    const view = personCardView(
      {
        name: 'Bi',
        weekMinutes: learningMetric(120, 3, 7),
        lastMet: '2026-09-01',
        daysSinceLastMet: 4,
        desiredCadence: 30,
      },
      text,
    );
    expect(view.hours).toBe('2,0');
    expect(view.notes).toContain('đang tính · có 3/7 ngày');
    expect(view.notes).toContain('ở cùng 4 ngày trước');
    expect(view.notes).toContain('muốn gặp hằng ngày');
  });

  it('chưa có lần nào được ghi thì nói thẳng, không hiện số ngày', () => {
    const view = personCardView(
      {
        name: 'Bố',
        weekMinutes: readyMetric(60),
        lastMet: null,
        daysSinceLastMet: null,
      },
      text,
    );
    expect(view.notes).toContain('chưa có lần nào được ghi');
  });
});
