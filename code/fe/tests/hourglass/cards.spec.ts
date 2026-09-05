import { BuildCardInput, buildCard, visibleCards } from '../../src/Hourglass/Models/cards';
import { PersonRow } from '../../src/Hourglass/Models/people';
import { PersonHourglassConfig } from '../../src/Hourglass/Models/store';

const mother: PersonRow = {
  id: 'p1',
  name: 'Mẹ',
  role: 'parent',
  birthYear: 1960,
  hourglassEnabled: true,
};

const config: PersonHourglassConfig = {
  monthlyCadence: 2,
  daysPerVisit: 2,
  targetWeeklyHours: 0,
  hidden: false,
};

const input = (patch: Partial<BuildCardInput>): BuildCardInput => ({
  person: mother,
  config,
  currentWeeklyHours: 0,
  currentYear: 2026,
  quietReason: null,
  ...patch,
});

describe('card của người thân', () => {
  it('có số lần gặp còn lại và một hành động', () => {
    const card = buildCard(input({}));
    expect(card.state).toEqual({
      status: 'ready',
      value: {
        kind: 'companionship',
        yearsLeft: 12,
        visitsPerYear: 24,
        daysPerVisit: 2,
        visitsLeft: 288,
        daysTogether: 576,
      },
    });
    expect(card.cadence).toEqual({ visitsPerYear: 24, daysPerVisit: 2 });
    expect(card.action).toBe('plan_contact');
  });

  it('đã hẹn rồi thì hành động đổi thành dời lịch, không mất hành động', () => {
    const card = buildCard(
      input({ config: { ...config, plannedContactDate: '2026-09-20' } }),
    );
    expect(card.action).toBe('postpone_contact');
    expect(card.plannedContactDate).toBe('2026-09-20');
  });

  it('thiếu năm sinh thì không có con số, hành động là nhập năm sinh', () => {
    const card = buildCard(input({ person: { ...mother, birthYear: undefined } }));
    expect(card.state).toEqual({ status: 'needs_birth_year' });
    expect(card.action).toBe('enter_birth_year');
  });

  it('năm sinh lệch cũng không hiện số 0', () => {
    const card = buildCard(input({ person: { ...mother, birthYear: 2050 } }));
    expect(card.state).toEqual({ status: 'unavailable', reason: 'inconsistent' });
    expect(card.action).toBe('plan_contact');
  });

  it('chưa có nhịp gặp thì card vẫn còn hành động', () => {
    const card = buildCard(
      input({ config: { ...config, monthlyCadence: 0, daysPerVisit: 0 } }),
    );
    expect(card.state).toEqual({ status: 'unavailable', reason: 'no_data' });
    expect(card.action).toBe('plan_contact');
  });

  it('trong giới nghiêm thì con số nghỉ, hành động ở lại', () => {
    const card = buildCard(input({ quietReason: 'curfew' }));
    expect(card.state).toEqual({ status: 'quiet', reason: 'curfew' });
    expect(card.action).toBe('plan_contact');
  });

  it('thiếu năm sinh thắng giới nghiêm: lối nhập vẫn phải mở', () => {
    const card = buildCard(
      input({ person: { ...mother, birthYear: undefined }, quietReason: 'white_day' }),
    );
    expect(card.state).toEqual({ status: 'needs_birth_year' });
  });
});

describe('card của con', () => {
  const child: PersonRow = {
    id: 'p2',
    name: 'Bo',
    role: 'child',
    birthYear: 2020,
    hourglassEnabled: true,
  };
  const childConfig: PersonHourglassConfig = {
    monthlyCadence: 30,
    daysPerVisit: 1,
    targetWeeklyHours: 14,
    hidden: false,
  };

  it('dùng công thức quỹ giờ, không có dòng nhịp gặp', () => {
    const card = buildCard(
      input({
        person: child,
        config: childConfig,
        currentWeeklyHours: 10,
      }),
    );
    expect(card.cadence).toBeNull();
    expect(card.state).toEqual({
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

  it('chưa ghi giờ nào thì không hiện 0 giờ', () => {
    const card = buildCard(
      input({ person: child, config: childConfig, currentWeeklyHours: 0 }),
    );
    expect(card.state).toEqual({ status: 'unavailable', reason: 'no_data' });
  });
});

describe('visibleCards — ràng buộc cứng #4', () => {
  const off: PersonRow = { ...mother, id: 'p3', name: 'Bố', hourglassEnabled: false };

  it('người chưa bật không có card', () => {
    const cards = visibleCards([input({}), input({ person: off })]);
    expect(cards.map((card) => card.personId)).toEqual(['p1']);
  });

  it('card đã ẩn không hiện lại', () => {
    const cards = visibleCards([input({ config: { ...config, hidden: true } })]);
    expect(cards).toEqual([]);
  });

  it('không ai bật thì danh sách rỗng', () => {
    expect(visibleCards([input({ person: off })])).toEqual([]);
  });
});
