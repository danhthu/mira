export const GOAL_QUERIES = {
  findById: `
    SELECT * FROM goal
    WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
  `,

  findActive: `
    SELECT * FROM goal
    WHERE user_id = $1 AND ended_on IS NULL AND deleted_at IS NULL
    ORDER BY tier, started_on DESC
  `,

  findActiveByTier: `
    SELECT * FROM goal
    WHERE tier = $1 AND user_id = $2 AND ended_on IS NULL AND deleted_at IS NULL
    ORDER BY started_on DESC
  `,

  findAllByTier: `
    SELECT * FROM goal
    WHERE tier = $1 AND user_id = $2 AND deleted_at IS NULL
    ORDER BY started_on DESC
  `,

  findAll: `
    SELECT * FROM goal
    WHERE user_id = $1 AND deleted_at IS NULL
    ORDER BY tier, started_on DESC
  `,

  countActiveByTier: `
    SELECT COUNT(*)::INTEGER AS n
    FROM goal
    WHERE tier = $1 AND user_id = $2 AND ended_on IS NULL AND deleted_at IS NULL
  `,

  // Tổng giờ mỗi tuần mà các mục tiêu đang chạy đòi từ một nhóm việc.
  // Đây là vế "đang cần" của luật khai nguồn.
  sumWeeklyMinutesBySource: `
    SELECT COALESCE(SUM(weekly_minutes), 0)::INTEGER AS minutes
    FROM goal
    WHERE source_bucket = $1 AND user_id = $2 AND ended_on IS NULL AND deleted_at IS NULL
  `,

  insert: `
    INSERT INTO goal (
      id, user_id, tier, title, weekly_minutes, source_bucket,
      started_on, expires_on, ended_on, handed_over_to,
      created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, NULL, $9, $9)
    RETURNING *
  `,

  update: `
    UPDATE goal
    SET title = $2, weekly_minutes = $3, updated_at = $4
    WHERE id = $1 AND user_id = $5 AND ended_on IS NULL AND deleted_at IS NULL
    RETURNING *
  `,

  // WHERE ended_on IS NULL để không kết thúc hai lần.
  end: `
    UPDATE goal
    SET ended_on = $2, handed_over_to = $3, updated_at = $2
    WHERE id = $1 AND user_id = $4 AND ended_on IS NULL AND deleted_at IS NULL
    RETURNING *
  `,

  // Hết 90 ngày thì tầng quý tự hết hạn. Chạy khi đọc danh sách, không cần cron.
  expireDueQuarterGoals: `
    UPDATE goal
    SET ended_on = $1, updated_at = $1
    WHERE tier = 'quarter'
      AND user_id = $2
      AND ended_on IS NULL
      AND expires_on IS NOT NULL
      AND expires_on < $1
      AND deleted_at IS NULL
    RETURNING *
  `,

  softDelete: `
    UPDATE goal
    SET deleted_at = $2, updated_at = $2
    WHERE id = $1 AND user_id = $3
    RETURNING *
  `,
} as const;
