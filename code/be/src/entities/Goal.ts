export type GoalTier = 'identity' | 'season' | 'rhythm';
export type GoalStatus = 'active' | 'renewed' | 'expired' | 'released';

export interface Goal {
  readonly id: string;
  readonly tier: GoalTier;
  readonly title: string;
  readonly startedAt: string;
  readonly expiresAt: string;
  readonly costMinutesPerWeek: number | null;
  readonly costAmountPerMonth: number | null;
  readonly status: GoalStatus;
  readonly releaseReason: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
