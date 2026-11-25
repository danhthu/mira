import type { GoalRow } from '../../shared/types/rows';
import type { GoalTier, TimeBucket } from '../../shared/types/enums';
import type { Goal } from '../../entities/Goal';

export function toGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    // CHECK constraint ở migration 002 giới hạn tier và source_bucket.
    tier: row.tier as GoalTier,
    title: row.title,
    weeklyMinutes: row.weekly_minutes,
    sourceBucket: row.source_bucket as TimeBucket,
    startedOn: row.started_on,
    expiresOn: row.expires_on,
    endedOn: row.ended_on,
    handedOverTo: row.handed_over_to,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}
