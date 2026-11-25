/**
 * Thói quen. Mira hỗ trợ thói quen nhưng đếm theo tuần, không theo chuỗi ngày —
 * nên entity này cố tình không có trường chuỗi, điểm hay huy hiệu.
 */
export interface Habit {
  readonly id: string;
  readonly title: string;
  /** Số lần mong muốn mỗi tuần, 1–7. */
  readonly targetPerWeek: number;
  readonly startedOn: string;
  readonly endedOn: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}

/** Một lần đã làm. Mỗi thói quen chỉ một lần mỗi ngày (unique index ở migration 003). */
export interface HabitCheck {
  readonly id: string;
  readonly habitId: string;
  readonly date: string;
  readonly createdAt: string;
}
