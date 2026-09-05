import {
  DEFAULT_QUIET_TIME,
  QuietTimeSettings,
  isQuietAt,
  quietReasonAt,
  readQuietTime,
} from '../../src/Hourglass/Models/quietTime';

const at = (isoLocal: string) => new Date(isoLocal);

const settings = (patch: Partial<QuietTimeSettings>): QuietTimeSettings => ({
  ...DEFAULT_QUIET_TIME,
  ...patch,
});

describe('mặc định', () => {
  it('giới nghiêm bật sẵn lúc 21h', () => {
    expect(DEFAULT_QUIET_TIME.curfewEnabled).toBe(true);
    expect(DEFAULT_QUIET_TIME.curfewHour).toBe(21);
  });

  it('ngày trắng tắt sẵn theo 05-v1-spec', () => {
    expect(DEFAULT_QUIET_TIME.whiteDayEnabled).toBe(false);
  });
});

describe('giới nghiêm buổi tối', () => {
  it('sau giờ giới nghiêm là yên tĩnh', () => {
    expect(quietReasonAt(settings({}), at('2026-09-09T21:30:00'))).toBe('curfew');
  });

  it('đúng giờ giới nghiêm đã tính là yên tĩnh', () => {
    expect(quietReasonAt(settings({}), at('2026-09-09T21:00:00'))).toBe('curfew');
  });

  it('trước giờ giới nghiêm thì không', () => {
    expect(quietReasonAt(settings({}), at('2026-09-09T20:59:00'))).toBeNull();
  });

  it('khoảng yên tĩnh chạy qua nửa đêm tới 5h sáng', () => {
    expect(quietReasonAt(settings({}), at('2026-09-10T02:00:00'))).toBe('curfew');
    expect(quietReasonAt(settings({}), at('2026-09-10T05:00:00'))).toBeNull();
  });

  it('tắt giới nghiêm thì nửa đêm cũng không yên tĩnh', () => {
    expect(
      quietReasonAt(settings({ curfewEnabled: false }), at('2026-09-10T02:00:00')),
    ).toBeNull();
  });

  it('giới nghiêm đặt sớm hơn 5h sáng thì khoảng chạy liền một mạch', () => {
    const early = settings({ curfewHour: 3 });
    expect(quietReasonAt(early, at('2026-09-10T03:30:00'))).toBe('curfew');
    expect(quietReasonAt(early, at('2026-09-10T06:00:00'))).toBeNull();
    expect(quietReasonAt(early, at('2026-09-10T22:00:00'))).toBeNull();
  });
});

describe('ngày trắng', () => {
  // 2026-09-13 là chủ nhật.
  it('phủ cả ngày khi bật', () => {
    const white = settings({ whiteDayEnabled: true, whiteDayWeekday: 0 });
    expect(quietReasonAt(white, at('2026-09-13T10:00:00'))).toBe('white_day');
  });

  it('không ảnh hưởng ngày khác', () => {
    const white = settings({
      whiteDayEnabled: true,
      whiteDayWeekday: 0,
      curfewEnabled: false,
    });
    expect(quietReasonAt(white, at('2026-09-14T10:00:00'))).toBeNull();
  });

  it('thắng giới nghiêm khi cả hai cùng đúng', () => {
    const white = settings({ whiteDayEnabled: true, whiteDayWeekday: 0 });
    expect(quietReasonAt(white, at('2026-09-13T22:00:00'))).toBe('white_day');
  });

  it('isQuietAt là dạng rút gọn của quietReasonAt', () => {
    expect(isQuietAt(settings({}), at('2026-09-09T22:00:00'))).toBe(true);
    expect(isQuietAt(settings({}), at('2026-09-09T12:00:00'))).toBe(false);
  });
});

describe('đọc lại cấu hình đã lưu', () => {
  it('lấy giá trị hợp lệ', () => {
    expect(
      readQuietTime({
        curfewEnabled: false,
        curfewHour: 22,
        whiteDayEnabled: true,
        whiteDayWeekday: 6,
      }),
    ).toEqual({
      curfewEnabled: false,
      curfewHour: 22,
      whiteDayEnabled: true,
      whiteDayWeekday: 6,
    });
  });

  it('bỏ qua giờ ngoài khoảng và thứ ngoài tuần', () => {
    expect(readQuietTime({ curfewHour: 99, whiteDayWeekday: 12 })).toEqual(
      DEFAULT_QUIET_TIME,
    );
  });

  it('bản ghi rỗng cho lại mặc định', () => {
    expect(readQuietTime({})).toEqual(DEFAULT_QUIET_TIME);
  });
});
