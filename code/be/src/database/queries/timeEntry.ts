export const TIME_ENTRY_QUERIES = {
  findAll: `
    SELECT * FROM time_entry
    WHERE user_id = $1 AND deleted_at IS NULL
    ORDER BY date DESC, created_at DESC
  `,

  findById: `
    SELECT * FROM time_entry
    WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
  `,

  findByDate: `
    SELECT * FROM time_entry
    WHERE date = $1 AND user_id = $2 AND deleted_at IS NULL
    ORDER BY created_at DESC
  `,

  findByDateRange: `
    SELECT * FROM time_entry
    WHERE date >= $1 AND date <= $2 AND user_id = $3 AND deleted_at IS NULL
    ORDER BY date DESC, created_at DESC
  `,

  // Tổng phút theo nhóm việc trong một khoảng ngày. Trả về đúng những nhóm có
  // dữ liệu; tầng service tự điền 0 cho nhóm còn thiếu để donut luôn đủ bốn lát.
  sumByBucket: `
    SELECT bucket, SUM(minutes)::INTEGER AS minutes
    FROM time_entry
    WHERE date >= $1 AND date <= $2 AND user_id = $3 AND deleted_at IS NULL
    GROUP BY bucket
  `,

  sumGolden: `
    SELECT COALESCE(SUM(minutes), 0)::INTEGER AS minutes
    FROM time_entry
    WHERE date >= $1 AND date <= $2 AND user_id = $3 AND golden = TRUE AND deleted_at IS NULL
  `,

  /**
   * Đếm số ngày KHÁC NHAU có ghi. Cần để biết hai tuần có so được với nhau không:
   * tuần mới 3 ngày so với tuần cũ 7 ngày thì mọi tổng đều giảm, không phải vì khá hơn.
   */
  countDays: `
    SELECT COUNT(DISTINCT date)::INTEGER AS days
    FROM time_entry
    WHERE date >= $1 AND date <= $2 AND user_id = $3 AND deleted_at IS NULL
  `,

  insert: `
    INSERT INTO time_entry (
      id, user_id, date, minutes, bucket,
      golden, note, source,
      created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `,

  update: `
    UPDATE time_entry
    SET
      date       = $2,
      minutes    = $3,
      bucket     = $4,
      golden     = $5,
      note       = $6,
      updated_at = $7
    WHERE id = $1 AND user_id = $8 AND deleted_at IS NULL
    RETURNING *
  `,

  softDelete: `
    UPDATE time_entry
    SET deleted_at = $2, updated_at = $2
    WHERE id = $1 AND user_id = $3
    RETURNING *
  `,
} as const;
