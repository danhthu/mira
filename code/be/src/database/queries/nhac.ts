export const NHAC_QUERIES = {
  findAll: `
    SELECT * FROM nhac
    WHERE user_id = $1 AND deleted_at IS NULL
    ORDER BY gio ASC, created_at ASC
  `,

  findById: `
    SELECT * FROM nhac
    WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
  `,

  count: `
    SELECT COUNT(*)::INTEGER AS n FROM nhac
    WHERE user_id = $1 AND deleted_at IS NULL
  `,

  insert: `
    INSERT INTO nhac (id, user_id, gio, days, loi, bat, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, TRUE, $6, $6)
    RETURNING *
  `,

  /** `COALESCE` để client gửi thiếu trường nào thì trường đó giữ nguyên. */
  update: `
    UPDATE nhac
    SET gio = COALESCE($3, gio),
        days = COALESCE($4, days),
        loi = COALESCE($5, loi),
        bat = COALESCE($6, bat),
        updated_at = $7
    WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    RETURNING *
  `,

  softDelete: `
    UPDATE nhac SET deleted_at = $3, updated_at = $3
    WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    RETURNING *
  `,

  /**
   * Ngày đã bỏ qua, trong một khoảng.
   *
   * `nhac_bo_qua` không có `deleted_at`: bỏ qua rồi đổi ý thì xoá hẳn hàng, vì ở đây
   * không có lịch sử nào đáng giữ — chỉ là một cái bấm cho đúng một ngày.
   */
  boQuaTrongKhoang: `
    SELECT nhac_id, date FROM nhac_bo_qua
    WHERE user_id = $1 AND date >= $2 AND date <= $3
  `,

  themBoQua: `
    INSERT INTO nhac_bo_qua (nhac_id, user_id, date, created_at)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (nhac_id, date) DO NOTHING
  `,
} as const;
