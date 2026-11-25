export const NEP_QUERIES = {
  findActive: `
    SELECT * FROM nep
    WHERE user_id = $1 AND ended_on IS NULL AND deleted_at IS NULL
    ORDER BY created_at ASC
  `,

  findAll: `
    SELECT * FROM nep
    WHERE user_id = $1 AND deleted_at IS NULL
    ORDER BY created_at ASC
  `,

  findById: `
    SELECT * FROM nep
    WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
  `,

  countActive: `
    SELECT COUNT(*)::INTEGER AS n FROM nep
    WHERE user_id = $1 AND ended_on IS NULL AND deleted_at IS NULL
  `,

  insert: `
    INSERT INTO nep (id, user_id, title, bucket, minutes, golden, days, started_on, danh_muc_id, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
    RETURNING *
  `,

  end: `
    UPDATE nep SET ended_on = $3, updated_at = $3
    WHERE id = $1 AND user_id = $2 AND ended_on IS NULL AND deleted_at IS NULL
    RETURNING *
  `,

  /**
   * Ngày đã bỏ qua trong khoảng. Tương đương EXDATE.
   * `nep_bo_qua` không có `deleted_at`: bỏ qua rồi đổi ý thì xoá hẳn hàng.
   */
  boQuaTrongKhoang: `
    SELECT nep_id, date FROM nep_bo_qua
    WHERE user_id = $1 AND date >= $2 AND date <= $3
  `,

  themBoQua: `
    INSERT INTO nep_bo_qua (nep_id, user_id, date, created_at)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (nep_id, date) DO NOTHING
  `,

  xoaBoQua: `
    DELETE FROM nep_bo_qua WHERE nep_id = $1 AND user_id = $2 AND date = $3
  `,

  /** Hàng giờ do nếp sinh ra trong khoảng, để biết ngày nào đã sinh rồi. */
  daSinhTrongKhoang: `
    SELECT nep_id, date FROM time_entry
    WHERE user_id = $1 AND nep_id IS NOT NULL AND date >= $2 AND date <= $3
      AND deleted_at IS NULL
  `,
} as const;
