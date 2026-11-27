import type {
  ApiError,
  AuthResponse,
  GoogleCredentials,
  Category,
  CategoryCreate,
  ParseResult,
  Routine,
  Reminder,
  RoutineCreate,
  RoutineDay,
  Credentials,
  User,
  Goal,
  GoalBudget,
  GoalCreate,
  GoalEnd,
  GoalTier,
  GoalUpdate,
  Habit,
  HabitCreate,
  HabitWeek,
  Moment,
  MomentCreate,
  MomentUpdate,
  MoneyDerived,
  MoneyMonth,
  MoneyMonthUpdate,
  CategoryColor,
  CategoryIcon,
  MoneyCategory,
  MoneyCategoryCreate,
  MoneyEntry,
  MoneyEntryCreate,
  MoneyEntryUpdate,
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
      call<{ gio: number; hat: number; thang: number; mucTieu: number; thoiQuen: number; lanDanhDau: number; nep: number; categories: number }>(
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

    // ───────────────────────────────────────── đọc câu
    /** Đọc một câu thành đề xuất. KHÔNG ghi gì cả. */
    /**
     * Đọc một câu thành đề xuất. **Không ghi gì cả.**
     *
     * `ngay` là hôm nay **theo đồng hồ người dùng**, bắt buộc gửi: "hôm qua" là hôm qua
     * của người đang gõ, không phải của múi giờ máy chủ.
     */
    doc: (cau: string, ngay: string) => call<ParseResult>('POST', '/parse', { cau, ngay }),

    // ───────────────────────────────────────── danh mục
    listCategories: () => call<Category[]>('GET', '/categories'),
    createCategory: (dm: CategoryCreate) => call<Category>('POST', '/categories', dm),
    renameCategory: (
      id: string,
      body: { name: string; golden?: boolean; icon?: CategoryIcon | null; color?: CategoryColor | null },
    ) =>
      call<Category>('PATCH', `/categories/${id}`, body),
    /** Cất đi, không xoá: mục giờ cũ còn trỏ về nó. */
    archiveCategory: (id: string) => call<Category>('POST', `/categories/${id}/archive`),

    // ───────────────────────────────────────── nhắc
    //
    // `from`/`to` là khoảng ngày cần biết đã bỏ qua những hôm nào. Thực tế client chỉ
    // cần đúng hôm nay, nhưng để khoảng thì màn thiết lập hiện được lịch sử mà không
    // phải thêm route.
    listReminders: (from: string, to: string) =>
      call<{ reminders: Reminder[]; skips: { reminderId: string; date: string }[] }>(
        'GET',
        `/reminders${query({ from, to })}`,
      ),
    createReminder: (reminder: { at: string; days: string; text?: string | null }) =>
      call<Reminder>('POST', '/reminders', reminder),
    updateReminder: (id: string, patch: { at?: string; days?: string; text?: string | null; enabled?: boolean }) =>
      call<Reminder>('PATCH', `/reminders/${id}`, patch),
    deleteReminder: (id: string) => call<void>('DELETE', `/reminders/${id}`),
    /** Bỏ qua ĐÚNG MỘT NGÀY. Tắt hẳn là `updateReminder(id, { enabled: false })`. */
    skipReminder: (id: string, date: string) => call<void>('POST', `/reminders/${id}/skip`, { date }),

    // ───────────────────────────────────────── nếp
    listRoutines: () => call<Routine[]>('GET', '/routines'),
    createRoutine: (nep: RoutineCreate) => call<Routine>('POST', '/routines', nep),
    /** Chạy mọi nếp tới ngày này. Gọi lại nhiều lần không sinh trùng. */
    runRoutines: (date: string) => call<RoutineDay[]>('POST', '/routines/run', { date }),
    endRoutine: (id: string) => call<Routine>('POST', `/routines/${id}/end`),
    skipRoutineDay: (id: string, date: string) => call<void>('POST', `/routines/${id}/skip`, { date }),
    unskipRoutineDay: (id: string, date: string) => call<void>('POST', `/nep/${id}/label-lai`, { date }),

    // ───────────────────────────────────────── hũ
    listMoments: (from: string, to: string) =>
      call<Moment[]>('GET', `/moments${query({ from, to })}`),
    createMoment: (moment: MomentCreate) => call<Moment>('POST', '/moments', moment),
    /** Sửa chữ, hoặc đổi kẹo ↔ muối. Hạt muối đã trả lời câu hỏi lại thì máy chủ từ chối. */
    updateMoment: (id: string, patch: MomentUpdate) =>
      call<Moment>('PATCH', `/moments/${id}`, patch),
    /** Xoá mềm. Cần cho nút Hoàn tác của màn chat, vì chat ghi tự động. */
    deleteMoment: (id: string) => call<void>('DELETE', `/moments/${id}`),
    momentsDue: (on: string) => call<Moment[]>('GET', `/moments/due${query({ on })}`),
    answerRevisit: (id: string, answer: SaltAnswer) =>
      call<Moment>('POST', `/moments/${id}/revisit`, { answer }),

    // ───────────────────────────────────────── tài chính
    getMoney: (month: string) => call<MoneyResponse>('GET', `/money/${month}`),
    /** CHỈ hai ô mức. Năm ô dòng chảy là tổng các khoản — máy chủ từ chối nếu gửi lên. */
    saveMoney: (month: string, patch: MoneyMonthUpdate) =>
      call<MoneyResponse>('PUT', `/money/${month}`, patch),

    // ───────────────────────────────────────── danh mục tiền
    listMoneyCategories: () => call<MoneyCategory[]>('GET', '/money-categories'),
    createMoneyCategory: (dm: MoneyCategoryCreate) =>
      call<MoneyCategory>('POST', '/money-categories', dm),
    renameMoneyCategory: (
      id: string,
      body: { name: string; icon?: CategoryIcon | null; color?: CategoryColor | null },
    ) =>
      call<MoneyCategory>('PATCH', `/money-categories/${id}`, body),
    /** Cất đi, không xoá: khoản cũ còn trỏ về nó. */
    archiveMoneyCategory: (id: string) =>
      call<MoneyCategory>('POST', `/money-categories/${id}/archive`),

    // ───────────────────────────────────────── khoản tiền
    listMoneyEntries: (from: string, to: string) =>
      call<MoneyEntry[]>('GET', `/money-entries${query({ from, to })}`),
    createMoneyEntry: (e: MoneyEntryCreate) => call<MoneyEntry>('POST', '/money-entries', e),
    updateMoneyEntry: (id: string, patch: MoneyEntryUpdate) =>
      call<MoneyEntry>('PATCH', `/money-entries/${id}`, patch),
    deleteMoneyEntry: (id: string) => call<void>('DELETE', `/money-entries/${id}`),

    // ───────────────────────────────────────── mục tiêu
    listGoals: (tier?: GoalTier, includeEnded = false) =>
      call<Goal[]>(
        'GET',
        `/goals${query({ tier, includeEnded: includeEnded ? 'true' : undefined })}`,
      ),
    createGoal: (goal: GoalCreate) => call<Goal>('POST', '/goals', goal),
    /** Sửa tên và số giờ. Chỉ mục tiêu đang chạy; đã kết thúc là lịch sử. */
    updateGoal: (id: string, patch: GoalUpdate) => call<Goal>('PATCH', `/goals/${id}`, patch),
    /** Xoá hẳn — "tôi gõ nhầm". Khác `endGoal` — "tôi đã theo đuổi nó, giờ thôi". */
    deleteGoal: (id: string) => call<void>('DELETE', `/goals/${id}`),
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
