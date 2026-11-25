import type {
  ApiError,
  AuthResponse,
  GoogleCredentials,
  DanhMuc,
  DanhMucCreate,
  Nep,
  NepCreate,
  NgayCuaNep,
  Credentials,
  User,
  Goal,
  GoalBudget,
  GoalCreate,
  GoalEnd,
  GoalTier,
  Habit,
  HabitCreate,
  HabitWeek,
  Moment,
  MomentCreate,
  MoneyDerived,
  MoneyMonth,
  MoneyMonthUpdate,
  SaltAnswer,
  TimeEntry,
  TimeEntryCreate,
  TimeEntryUpdate,
  WeekSummary,
} from '@mira/contract';

/** Lỗi từ máy chủ, mang nguyên mã của hợp đồng để UI quyết cách hiển thị. */
export class MiraApiError extends Error {
  constructor(
    readonly code: ApiError['code'],
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'MiraApiError';
  }
}

export interface ClientOptions {
  readonly baseUrl: string;
  /** Cho phép thay fetch khi test. */
  readonly fetch?: typeof globalThis.fetch;
  /**
   * Lấy token của phiên hiện tại. Là hàm chứ không phải chuỗi, để client luôn dùng token
   * mới nhất sau khi đăng nhập lại mà không phải dựng lại client.
   */
  readonly token?: () => string | null;
}

export interface MoneyResponse {
  readonly month: MoneyMonth;
  readonly derived: MoneyDerived;
}

export function createClient(options: ClientOptions) {
  const doFetch = options.fetch ?? globalThis.fetch;
  const base = options.baseUrl.replace(/\/$/, '');

  async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
    const token = options.token?.() ?? null;
    const headers: Record<string, string> = {};
    if (body !== undefined) headers['content-type'] = 'application/json';
    if (token !== null) headers.authorization = `Bearer ${token}`;

    const response = await doFetch(`${base}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const error = payload as ApiError | null;
      throw new MiraApiError(
        error?.code ?? 'bad_request',
        response.status,
        error?.message ?? `Máy chủ trả ${response.status}`,
      );
    }

    return payload as T;
  }

  const query = (params: Record<string, string | undefined>): string => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) search.set(key, value);
    }
    const text = search.toString();
    return text === '' ? '' : `?${text}`;
  };

  return {
    health: () => call<{ ok: boolean }>('GET', '/health'),

    // ───────────────────────────────────────── tài khoản
    google: (body: GoogleCredentials) => call<AuthResponse>('POST', '/auth/google', body),
    login: (body: Credentials) => call<AuthResponse>('POST', '/auth/login', body),
    me: () => call<User>('GET', '/auth/me'),

    /** Bản sao lưu đầy đủ do máy chủ gom. Một lần gọi thay cho hơn bốn mươi vòng mạng. */
    exportAll: () => call<Record<string, unknown>>('GET', '/export'),

    /** Nhập cả bộ, thay toàn bộ dữ liệu đang có của tài khoản này. */
    importAll: (snapshot: unknown) =>
      call<{ gio: number; hat: number; thang: number; mucTieu: number; thoiQuen: number; lanDanhDau: number; nep: number; danhMuc: number }>(
        'POST',
        '/import',
        snapshot,
      ),

    // ───────────────────────────────────────── thời gian
    listTimeEntries: (from: string, to: string) =>
      call<TimeEntry[]>('GET', `/time-entries${query({ from, to })}`),
    createTimeEntry: (entry: TimeEntryCreate) => call<TimeEntry>('POST', '/time-entries', entry),
    updateTimeEntry: (id: string, patch: TimeEntryUpdate) =>
      call<TimeEntry>('PATCH', `/time-entries/${id}`, patch),
    deleteTimeEntry: (id: string) => call<void>('DELETE', `/time-entries/${id}`),
    weekSummary: (weekStart: string) =>
      call<WeekSummary>('GET', `/time-entries/week${query({ weekStart })}`),

    // ───────────────────────────────────────── danh mục
    listDanhMuc: () => call<DanhMuc[]>('GET', '/danh-muc'),
    createDanhMuc: (dm: DanhMucCreate) => call<DanhMuc>('POST', '/danh-muc', dm),
    renameDanhMuc: (id: string, body: { name: string; golden?: boolean }) =>
      call<DanhMuc>('PATCH', `/danh-muc/${id}`, body),
    /** Cất đi, không xoá: mục giờ cũ còn trỏ về nó. */
    catDanhMuc: (id: string) => call<DanhMuc>('POST', `/danh-muc/${id}/cat`),

    // ───────────────────────────────────────── nếp
    listNep: () => call<Nep[]>('GET', '/nep'),
    createNep: (nep: NepCreate) => call<Nep>('POST', '/nep', nep),
    /** Chạy mọi nếp tới ngày này. Gọi lại nhiều lần không sinh trùng. */
    chayNep: (date: string) => call<NgayCuaNep[]>('POST', '/nep/chay', { date }),
    endNep: (id: string) => call<Nep>('POST', `/nep/${id}/end`),
    tuChoiNep: (id: string, date: string) => call<void>('POST', `/nep/${id}/tu-choi`, { date }),
    nhanLaiNep: (id: string, date: string) => call<void>('POST', `/nep/${id}/nhan-lai`, { date }),

    // ───────────────────────────────────────── hũ
    listMoments: (from: string, to: string) =>
      call<Moment[]>('GET', `/moments${query({ from, to })}`),
    createMoment: (moment: MomentCreate) => call<Moment>('POST', '/moments', moment),
    momentsDue: (on: string) => call<Moment[]>('GET', `/moments/due${query({ on })}`),
    answerRevisit: (id: string, answer: SaltAnswer) =>
      call<Moment>('POST', `/moments/${id}/revisit`, { answer }),

    // ───────────────────────────────────────── tài chính
    getMoney: (month: string) => call<MoneyResponse>('GET', `/money/${month}`),
    saveMoney: (month: string, patch: MoneyMonthUpdate) =>
      call<MoneyResponse>('PUT', `/money/${month}`, patch),

    // ───────────────────────────────────────── mục tiêu
    listGoals: (tier?: GoalTier, includeEnded = false) =>
      call<Goal[]>(
        'GET',
        `/goals${query({ tier, includeEnded: includeEnded ? 'true' : undefined })}`,
      ),
    createGoal: (goal: GoalCreate) => call<Goal>('POST', '/goals', goal),
    endGoal: (id: string, body: GoalEnd) => call<Goal>('POST', `/goals/${id}/end`, body),
    goalBudget: (weekStart: string) =>
      call<GoalBudget>('GET', `/goals/budget${query({ weekStart })}`),

    // ───────────────────────────────────────── thói quen
    habitWeek: (weekStart: string) =>
      call<HabitWeek[]>('GET', `/habits/week${query({ weekStart })}`),
    createHabit: (habit: HabitCreate) => call<Habit>('POST', '/habits', habit),
    checkHabit: (id: string, date: string, done: boolean) =>
      call<void>('POST', `/habits/${id}/check`, { date, done }),
    endHabit: (id: string) => call<Habit>('POST', `/habits/${id}/end`),
  };
}

export type MiraClient = ReturnType<typeof createClient>;
