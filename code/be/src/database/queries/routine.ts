export const ROUTINE_QUERIES = {
  findActive: `
    SELECT * FROM routine
    WHERE user_id = $1 AND ended_on IS NULL AND deleted_at IS NULL
    ORDER BY created_at ASC
  `,

  findAll: `
    SELECT * FROM routine
    WHERE user_id = $1 AND deleted_at IS NULL
    ORDER BY created_at ASC
  `,

  findById: `
    SELECT * FROM routine
    WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
  `,

  countActive: `
    SELECT COUNT(*)::INTEGER AS n FROM routine
    WHERE user_id = $1 AND ended_on IS NULL AND deleted_at IS NULL
  `,

  insert: `
    INSERT INTO routine (id, user_id, title, bucket, minutes, golden, days, started_on, category_id, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
    RETURNING *
  `,

  end: `
    UPDATE routine SET ended_on = $3, updated_at = $3
    WHERE id = $1 AND user_id = $2 AND ended_on IS NULL AND deleted_at IS NULL
    RETURNING *
  `,

  /**
   * Ngày đã bỏ qua trong khoảng. Tương đương EXDATE.
   * `routine_skip` không có `deleted_at`: bỏ qua rồi đổi ý thì xoá hẳn hàng.
   */
  skipsInRange: `
    SELECT routine_id, date FROM routine_skip
    WHERE user_id = $1 AND date >= $2 AND date <= $3
  `,

  addSkip: `
    INSERT INTO routine_skip (routine_id, user_id, date, created_at)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (routine_id, date) DO NOTHING
  `,

  removeSkip: `
    DELETE FROM routine_skip WHERE routine_id = $1 AND user_id = $2 AND date = $3
  `,

  /** Hàng giờ do nếp sinh ra trong khoảng, để biết ngày nào đã sinh rồi. */
  generatedInRange: `
    SELECT routine_id, date FROM time_entry
    WHERE user_id = $1 AND routine_id IS NOT NULL AND date >= $2 AND date <= $3
      AND deleted_at IS NULL
  `,
} as const;
