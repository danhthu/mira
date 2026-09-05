import {
  EMPTY_SUMMARY,
  HomeSummary,
  countState,
  progressState,
} from '../../src/Home/Models/summary';
import { ModuleKey, buildTiles } from '../../src/Home/Models/tiles';
import { useText } from '../../src/Home/Text';

const text = useText();

const NOTHING: HomeSummary = {
  work: progressState(0, 0),
  habit: progressState(0, 0),
  challenge: countState(0),
  goal: countState(0),
  emotion: countState(0),
  timeMinutes: countState(0),
};

function lineOf(summary: HomeSummary, key: ModuleKey): string {
  return buildTiles(summary, text).filter((entry) => entry.key === key)[0].line;
}

function routeOf(key: ModuleKey) {
  return buildTiles(NOTHING, text).filter((entry) => entry.key === key)[0].route;
}

describe('trạng thái dữ liệu của một ô', () => {
  it('chưa có mục nào trong ngày thì là empty, không phải 0', () => {
    expect(progressState(0, 0).status).toBe('empty');
    expect(countState(0).status).toBe('empty');
  });

  it('có mục thì là ready, kể cả khi chưa làm cái nào', () => {
    const state = progressState(0, 3);
    expect(state.status).toBe('ready');
    expect(state).toHaveProperty('value', { done: 0, total: 3 });
  });

  it('số âm cũng là empty — không ô nào được hiện dấu trừ', () => {
    expect(countState(-1).status).toBe('empty');
    expect(progressState(0, -2).status).toBe('empty');
  });

  it('lúc chưa nạp xong mọi ô đều trống, không ô nào nhấp nháy số', () => {
    Object.values(EMPTY_SUMMARY).forEach((state) => {
      expect(state.status).toBe('empty');
    });
  });
});

describe('giọng của Text/index.ts', () => {
  it('không chuỗi nào có dấu chấm than hay chữ ra lệnh', () => {
    Object.values(text).forEach((value) => {
      expect(value).not.toContain('!');
      expect(value).not.toMatch(/\b(hãy|nên|phải)\b/);
    });
  });

  it('không chuỗi nào rỗng — ô trống chữ là ô không nói gì', () => {
    Object.values(text).forEach((value) => {
      expect(value.trim().length).toBeGreaterThan(0);
    });
  });
});

describe('màn chính không bao giờ hiện số 0', () => {
  it('mọi ô lúc chưa có dữ liệu đều là câu trung tính', () => {
    buildTiles(NOTHING, text).forEach((entry) => {
      expect(entry.line).not.toMatch(/(^|\D)0(\D|$)/);
      expect(entry.line.length).toBeGreaterThan(0);
    });
  });

  it('không câu nào có dấu chấm than hay chữ "hãy" — giọng của 00-vision', () => {
    const summary: HomeSummary = {
      work: progressState(1, 4),
      habit: progressState(2, 5),
      challenge: countState(2),
      goal: countState(3),
      emotion: countState(1),
      timeMinutes: countState(150),
    };
    buildTiles(summary, text).forEach((entry) => {
      expect(entry.line).not.toContain('!');
      expect(entry.line).not.toMatch(/\b(hãy|nên|phải)\b/);
      expect(entry.title[0]).toBe(entry.title[0].toUpperCase());
    });
  });
});

describe('ô Công việc', () => {
  it('còn việc thì đếm phần chưa xong', () => {
    expect(lineOf({ ...NOTHING, work: progressState(2, 5) }, 'work')).toBe(
      'còn 3 việc hôm nay',
    );
  });

  it('xong hết thì không hiện "còn 0"', () => {
    expect(lineOf({ ...NOTHING, work: progressState(4, 4) }, 'work')).toBe(
      'việc hôm nay đã xong',
    );
  });

  it('chưa có việc nào thì mời chứ không trách', () => {
    expect(lineOf(NOTHING, 'work')).toBe('chưa có việc nào hôm nay');
  });
});

describe('ô Thói quen', () => {
  it('chưa làm cái nào thì đếm số thói quen của ngày', () => {
    expect(lineOf({ ...NOTHING, habit: progressState(0, 3) }, 'habit')).toBe(
      'hôm nay có 3 thói quen',
    );
  });

  it('làm được một phần thì nói cả hai con số', () => {
    expect(lineOf({ ...NOTHING, habit: progressState(2, 4) }, 'habit')).toBe(
      'đã làm 2 trong 4 thói quen hôm nay',
    );
  });

  it('làm hết thì đổi câu, không hiện "còn 0"', () => {
    expect(lineOf({ ...NOTHING, habit: progressState(3, 3) }, 'habit')).toBe(
      'đã làm cả 3 thói quen hôm nay',
    );
  });

  it('chưa có thói quen nào thì là câu trung tính', () => {
    expect(lineOf(NOTHING, 'habit')).toBe('chưa có thói quen nào hôm nay');
  });
});

describe('ô Thử thách, Mục tiêu, Cảm xúc', () => {
  it('đếm số đang theo', () => {
    expect(lineOf({ ...NOTHING, challenge: countState(2) }, 'challenge')).toBe(
      'đang theo 2 thử thách',
    );
    expect(lineOf({ ...NOTHING, goal: countState(3) }, 'goal')).toBe(
      'đang theo 3 mục tiêu',
    );
    expect(lineOf({ ...NOTHING, emotion: countState(1) }, 'emotion')).toBe(
      'hôm nay đã ghi 1 lần',
    );
  });

  it('trống thì mỗi ô có câu riêng, không ô nào hiện dấu gạch', () => {
    expect(lineOf(NOTHING, 'challenge')).toBe('chưa có thử thách nào');
    expect(lineOf(NOTHING, 'goal')).toBe('chưa có mục tiêu nào');
    expect(lineOf(NOTHING, 'emotion')).toBe('chưa ghi cảm xúc hôm nay');
  });
});

describe('ô Thời gian', () => {
  it('từ một giờ trở lên thì hiện giờ', () => {
    expect(lineOf({ ...NOTHING, timeMinutes: countState(150) }, 'time')).toBe(
      'hôm nay đã ghi 2,5 giờ',
    );
  });

  it('dưới một giờ thì hiện phút — "0,2 giờ" trông như chưa ghi gì', () => {
    expect(lineOf({ ...NOTHING, timeMinutes: countState(15) }, 'time')).toBe(
      'hôm nay đã ghi 15 phút',
    );
  });

  it('chưa ghi gì thì là câu trung tính', () => {
    expect(lineOf(NOTHING, 'time')).toBe('chưa ghi giờ nào hôm nay');
  });
});

describe('đích điều hướng khớp route đã đăng ký ở MainScreen', () => {
  it('tám ô, không ô nào trùng khoá', () => {
    const keys = buildTiles(NOTHING, text).map((entry) => entry.key);
    expect(keys.length).toBe(8);
    expect(new Set(keys).size).toBe(8);
  });

  it('bốn module Batify trỏ đúng tên route', () => {
    expect(routeOf('work').name).toBe('WorkAppModal');
    expect(routeOf('habit').name).toBe('HabitAppModal');
    expect(routeOf('challenge').name).toBe('ChallengerApp');
    expect(routeOf('trading').name).toBe('Trading');
  });

  it('ba module còn lại và cài đặt cũng có route', () => {
    expect(routeOf('emotion').name).toBe('EmotionApp');
    expect(routeOf('goal').name).toBe('GoalApp');
    expect(routeOf('time').name).toBe('TimeApp');
    expect(routeOf('setting').name).toBe('SettingApp');
  });

  it('chỉ Cài đặt cần tham số màn con', () => {
    expect(routeOf('setting').params).toEqual({ screen: 'Setting' });
    expect(routeOf('work').params).toBeUndefined();
  });
});
