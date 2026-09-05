import {
  CHILD_INDEPENDENCE_AGE,
  DEFAULT_LIFE_EXPECTANCY_YEARS,
  DEFAULT_MONTHLY_CADENCE,
  ageFromBirthYear,
  childHourglass,
  companionshipHourglass,
  usesChildHourglass,
  visitsPerYearFromMonthlyCadence,
} from '../../src/Core/hourglass';

describe('ageFromBirthYear', () => {
  it('trả tuổi khi có năm sinh hợp lệ', () => {
    expect(ageFromBirthYear(1960, 2026)).toEqual({ status: 'ready', value: 66 });
  });

  it('thiếu năm sinh thì không đoán, trả no_data', () => {
    expect(ageFromBirthYear(undefined, 2026)).toEqual({
      status: 'empty',
      reason: 'no_data',
    });
  });

  it('năm sinh ở tương lai là dữ liệu lệch, không phải tuổi âm', () => {
    expect(ageFromBirthYear(2030, 2026)).toEqual({
      status: 'empty',
      reason: 'inconsistent',
    });
  });

  it('năm sinh trước 1900 bị coi là gõ nhầm', () => {
    expect(ageFromBirthYear(1899, 2026)).toEqual({
      status: 'empty',
      reason: 'inconsistent',
    });
  });

  it('năm sinh không nguyên bị coi là gõ nhầm', () => {
    expect(ageFromBirthYear(1960.5, 2026)).toEqual({
      status: 'empty',
      reason: 'inconsistent',
    });
  });

  it('sinh năm nay trả 0 tuổi, đây là số thật chứ không phải thiếu dữ liệu', () => {
    expect(ageFromBirthYear(2026, 2026)).toEqual({ status: 'ready', value: 0 });
  });
});

describe('companionshipHourglass', () => {
  it('bố mẹ 66 tuổi, gặp 4 lần mỗi năm, 2 ngày mỗi lần', () => {
    const result = companionshipHourglass({
      age: 66,
      visitsPerYear: 4,
      daysPerVisit: 2,
    });
    expect(result).toEqual({
      status: 'ready',
      value: {
        kind: 'companionship',
        yearsLeft: 12,
        visitsPerYear: 4,
        daysPerVisit: 2,
        visitsLeft: 48,
        daysTogether: 96,
      },
    });
  });

  it('tuổi thọ sửa được, mặc định là 78', () => {
    const withDefault = companionshipHourglass({
      age: 60,
      visitsPerYear: 2,
      daysPerVisit: 1,
    });
    const explicit = companionshipHourglass({
      age: 60,
      visitsPerYear: 2,
      daysPerVisit: 1,
      lifeExpectancy: DEFAULT_LIFE_EXPECTANCY_YEARS,
    });
    expect(withDefault).toEqual(explicit);
    expect(withDefault).toEqual({
      status: 'ready',
      value: {
        kind: 'companionship',
        yearsLeft: 18,
        visitsPerYear: 2,
        daysPerVisit: 1,
        visitsLeft: 36,
        daysTogether: 36,
      },
    });
  });

  it('đã qua tuổi thọ trung bình thì không hiện 0 lần gặp', () => {
    expect(
      companionshipHourglass({ age: 90, visitsPerYear: 4, daysPerVisit: 2 }),
    ).toEqual({ status: 'empty', reason: 'not_applicable' });
  });

  it('đúng mốc tuổi thọ cũng không hiện 0 lần gặp', () => {
    expect(
      companionshipHourglass({ age: 78, visitsPerYear: 4, daysPerVisit: 2 }),
    ).toEqual({ status: 'empty', reason: 'not_applicable' });
  });

  it('chưa có nhịp gặp thì trả no_data chứ không trả 0', () => {
    expect(
      companionshipHourglass({ age: 66, visitsPerYear: 0, daysPerVisit: 2 }),
    ).toEqual({ status: 'empty', reason: 'no_data' });
  });

  it('chưa có số ngày mỗi lần thì trả no_data', () => {
    expect(
      companionshipHourglass({ age: 66, visitsPerYear: 4, daysPerVisit: 0 }),
    ).toEqual({ status: 'empty', reason: 'no_data' });
  });

  it('tuổi âm là dữ liệu lệch', () => {
    expect(
      companionshipHourglass({ age: -1, visitsPerYear: 4, daysPerVisit: 2 }),
    ).toEqual({ status: 'empty', reason: 'inconsistent' });
  });

  it('tuổi vượt ngưỡng hợp lý là dữ liệu lệch', () => {
    expect(
      companionshipHourglass({ age: 200, visitsPerYear: 4, daysPerVisit: 2 }),
    ).toEqual({ status: 'empty', reason: 'inconsistent' });
  });

  it('tuổi thọ đặt bằng 0 là dữ liệu lệch, không phải hết thời gian', () => {
    expect(
      companionshipHourglass({
        age: 30,
        visitsPerYear: 4,
        daysPerVisit: 2,
        lifeExpectancy: 0,
      }),
    ).toEqual({ status: 'empty', reason: 'inconsistent' });
  });

  it('số lần gặp lẻ được làm tròn về số nguyên', () => {
    const result = companionshipHourglass({
      age: 66,
      visitsPerYear: 5,
      daysPerVisit: 1.5,
    });
    expect(result.status).toBe('ready');
    if (result.status !== 'ready') return;
    expect(result.value.visitsLeft).toBe(60);
    expect(result.value.daysTogether).toBe(90);
  });
});

describe('childHourglass', () => {
  it('con 6 tuổi, 10 giờ mỗi tuần, mong muốn 14 giờ', () => {
    const result = childHourglass({
      childAge: 6,
      currentWeeklyHours: 10,
      targetWeeklyHours: 14,
    });
    expect(result).toEqual({
      status: 'ready',
      value: {
        kind: 'child',
        yearsLeft: 12,
        hoursLeft: 6240,
        hoursIfMore: 8736,
        targetWeeklyHours: 14,
      },
    });
  });

  it('con đã 18 tuổi thì công thức dừng, không hiện 0 giờ', () => {
    expect(
      childHourglass({
        childAge: CHILD_INDEPENDENCE_AGE,
        currentWeeklyHours: 10,
        targetWeeklyHours: 14,
      }),
    ).toEqual({ status: 'empty', reason: 'not_applicable' });
  });

  it('chưa ghi giờ nào thì trả no_data chứ không trả 0 giờ còn lại', () => {
    expect(
      childHourglass({ childAge: 6, currentWeeklyHours: 0, targetWeeklyHours: 14 }),
    ).toEqual({ status: 'empty', reason: 'no_data' });
  });

  it('giờ âm là dữ liệu lệch', () => {
    expect(
      childHourglass({ childAge: 6, currentWeeklyHours: -1, targetWeeklyHours: 14 }),
    ).toEqual({ status: 'empty', reason: 'inconsistent' });
  });

  it('tuổi âm là dữ liệu lệch', () => {
    expect(
      childHourglass({ childAge: -2, currentWeeklyHours: 10, targetWeeklyHours: 14 }),
    ).toEqual({ status: 'empty', reason: 'inconsistent' });
  });

  it('con mới sinh có đủ 18 năm phía trước', () => {
    const result = childHourglass({
      childAge: 0,
      currentWeeklyHours: 20,
      targetWeeklyHours: 20,
    });
    expect(result.status).toBe('ready');
    if (result.status !== 'ready') return;
    expect(result.value.yearsLeft).toBe(18);
    expect(result.value.hoursLeft).toBe(18720);
  });
});

describe('nhịp gặp theo vai', () => {
  it('đổi lần mỗi tháng sang lần mỗi năm', () => {
    expect(visitsPerYearFromMonthlyCadence(2)).toBe(24);
  });

  it('mặc định của bố mẹ là 2 lần mỗi tháng theo 05-v1-spec', () => {
    expect(DEFAULT_MONTHLY_CADENCE.parent).toBe(2);
  });

  it('chỉ vai con dùng công thức quỹ giờ tới 18 tuổi', () => {
    expect(usesChildHourglass('child')).toBe(true);
    expect(usesChildHourglass('parent')).toBe(false);
    expect(usesChildHourglass('friend')).toBe(false);
  });
});
