import {
  PeopleEntryLike,
  PersonLike,
  daysBetween,
  entriesOfPerson,
  groupByRole,
  lastMetDate,
  weekCoverage,
  weeklyMinutesOf,
} from '../../src/Person/Models/people';

const entries: PeopleEntryLike[] = [
  { date: '2026-09-01', minutes: 60, bucket: 'people', personId: 'a' },
  { date: '2026-09-02', minutes: 30, bucket: 'people', personId: 'a' },
  { date: '2026-09-02', minutes: 90, bucket: 'people', personId: 'b' },
  { date: '2026-09-02', minutes: 45, bucket: 'waste' },
  { date: '2026-09-03', minutes: 20, bucket: 'work', personId: 'a' },
];

describe('lọc bản ghi theo người', () => {
  it('chỉ lấy khoang people của đúng người đó', () => {
    expect(entriesOfPerson(entries, 'a')).toEqual([entries[0], entries[1]]);
  });

  it('bản ghi khoang work gắn cùng người vẫn bị loại', () => {
    expect(entriesOfPerson(entries, 'a').some((e) => e.bucket === 'work')).toBe(false);
  });

  it('người chưa có bản ghi nào trả mảng rỗng', () => {
    expect(entriesOfPerson(entries, 'c')).toEqual([]);
  });
});

describe('giờ ở cùng trong tuần', () => {
  it('chưa có bản ghi nào thì rỗng, không phải 0', () => {
    const state = weeklyMinutesOf([], 3);
    expect(state.status).toBe('empty');
    if (state.status === 'empty') expect(state.reason).toBe('no_data');
  });

  it('tuần chưa đủ bảy ngày thì đang tính, giá trị giữ nguyên không ngoại suy', () => {
    const state = weeklyMinutesOf(entriesOfPerson(entries, 'a'), 3);
    expect(state.status).toBe('learning');
    if (state.status === 'learning') {
      expect(state.value).toBe(90);
      expect(state.samplesHave).toBe(3);
      expect(state.samplesNeed).toBe(7);
    }
  });

  it('đủ bảy ngày thì sẵn sàng', () => {
    const state = weeklyMinutesOf(entriesOfPerson(entries, 'b'), 7);
    expect(state).toEqual({ status: 'ready', value: 90 });
  });
});

describe('lần ở cùng gần nhất', () => {
  it('lấy ngày lớn nhất', () => {
    expect(lastMetDate(entriesOfPerson(entries, 'a'))).toBe('2026-09-02');
  });

  it('chưa có lần nào thì null', () => {
    expect(lastMetDate([])).toBeNull();
  });

  it('đếm ngày qua UTC nên không lệch vì múi giờ', () => {
    expect(daysBetween('2026-09-02', '2026-09-05')).toBe(3);
    expect(daysBetween('2026-09-05', '2026-09-05')).toBe(0);
    expect(daysBetween('2026-12-30', '2027-01-02')).toBe(3);
  });
});

describe('gom theo vai', () => {
  const people: PersonLike[] = [
    { id: '1', name: 'Bi', role: 'child' },
    { id: '2', name: 'Mẹ', role: 'parent' },
    { id: '3', name: 'Bo', role: 'child' },
  ];

  it('nhóm theo thứ tự cố định, không xếp hạng theo số giờ', () => {
    expect(groupByRole(people).map((g) => g.role)).toEqual(['child', 'parent']);
  });

  it('giữ nguyên thứ tự người trong nhóm', () => {
    expect(groupByRole(people)[0].people.map((p) => p.name)).toEqual(['Bi', 'Bo']);
  });

  it('nhóm rỗng biến mất', () => {
    expect(groupByRole([]).length).toBe(0);
  });
});

describe('độ phủ của tuần', () => {
  it('đếm số ngày khác nhau có bản ghi', () => {
    expect(weekCoverage(entries)).toBe(3);
  });
});
