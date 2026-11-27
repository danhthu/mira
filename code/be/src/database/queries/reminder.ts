export const REMINDER_QUERIES = {
  findAll: `
    SELECT * FROM reminder
    WHERE user_id = $1 AND deleted_at IS NULL
    ORDER BY at ASC, created_at ASC
  `,

  findById: `
    SELECT * FROM reminder
    WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
  `,

  count: `
    SELECT COUNT(*)::INTEGER AS n FROM reminder
    WHERE user_id = $1 AND deleted_at IS NULL
  `,

  insert: `
    INSERT INTO reminder (id, user_id, at, days, text, enabled, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, TRUE, $6, $6)
    RETURNING *
  `,

  /** `COALESCE` để client gửi thiếu trường nào thì trường đó giữ nguyên. */
  update: `
    UPDATE reminder
    SET at = COALESCE($3, at),
        days = COALESCE($4, days),
        text = COALESCE($5, text),
        enabled = COALESCE($6, enabled),
        updated_at = $7
    WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    RETURNING *
  `,

  softDelete: `
    UPDATE reminder SET deleted_at = $3, updated_at = $3
    WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    RETURNING *
  `,

  /**
   * Ngày đã bỏ qua, trong một khoảng.
   *
   * `reminder_skip` không có `deleted_at`: bỏ qua rồi đổi ý thì xoá hẳn hàng, vì ở đây
   * không có lịch sử nào đáng giữ — chỉ là một cái bấm cho đúng một ngày.
   */
  skipsInRange: `
    SELECT reminder_id, date FROM reminder_skip
    WHERE user_id = $1 AND date >= $2 AND date <= $3
  `,

  addSkip: `
    INSERT INTO reminder_skip (reminder_id, user_id, date, created_at)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (reminder_id, date) DO NOTHING
  `,
} as const;
