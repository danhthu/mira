export const HABIT_QUERIES = {
  findById: `
    SELECT * FROM habit
    WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
  `,

  findActive: `
    SELECT * FROM habit
    WHERE user_id = $1 AND ended_on IS NULL AND deleted_at IS NULL
    ORDER BY started_on ASC
  `,

  /**
   * MỌI thói quen, kể cả đã dừng. Chỉ dùng cho xuất file.
   *
   * Màn Thói quen cố tình chỉ đọc thói quen đang chạy và đúng bảy ngày của tuần đang
   * xem, để không có cách nào tính được chuỗi ngày. Nhưng luật đó vắt sang cả xuất file
   * thì thành mất dữ liệu: xuất rồi nhập lại là mất sạch thói quen đã dừng. Nên đường
   * xuất đi lối riêng.
   */
  findAll: `
    SELECT * FROM habit
    WHERE user_id = $1 AND deleted_at IS NULL
    ORDER BY started_on ASC
  `,

  /**
   * Mọi lần đánh dấu, không giới hạn khoảng. Cũng chỉ dùng cho xuất file.
   *
   * `habit_check` **không có** cột `deleted_at`: bỏ đánh dấu là xoá hẳn hàng, vì một lần
   * đã bỏ thì không còn gì để giữ lại. Đừng thêm `deleted_at IS NULL` vào đây.
   */
  allChecks: `
    SELECT habit_id, date FROM habit_check
    WHERE user_id = $1
    ORDER BY date ASC
  `,

  countActive: `
    SELECT COUNT(*)::INTEGER AS n
    FROM habit
    WHERE user_id = $1 AND ended_on IS NULL AND deleted_at IS NULL
  `,

  insert: `
    INSERT INTO habit (
      id, user_id, title, target_per_week, started_on, ended_on, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, NULL, $6, $6)
    RETURNING *
  `,

  update: `
    UPDATE habit
    SET title = $2, target_per_week = $3, updated_at = $4
    WHERE id = $1 AND user_id = $5 AND ended_on IS NULL AND deleted_at IS NULL
    RETURNING *
  `,

  end: `
    UPDATE habit
    SET ended_on = $2, updated_at = $2
    WHERE id = $1 AND user_id = $3 AND ended_on IS NULL AND deleted_at IS NULL
    RETURNING *
  `,

  // Số lần đã làm trong một khoảng ngày, theo từng thói quen. Chỉ đếm trong tuần đang
  // xem — không có câu nào cộng dồn qua nhiều tuần, vì không có chuỗi nào để cộng.
  checksInRange: `
    SELECT habit_id, date
    FROM habit_check
    WHERE date >= $1 AND date <= $2 AND user_id = $3
    ORDER BY date ASC
  `,

  // ON CONFLICT DO NOTHING dựa trên unique index (habit_id, date): bấm hai lần trong
  // cùng một ngày không thành hai lần làm.
  check: `
    INSERT INTO habit_check (id, habit_id, user_id, date, created_at)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (habit_id, date) DO NOTHING
    RETURNING *
  `,

  uncheck: `
    DELETE FROM habit_check
    WHERE habit_id = $1 AND date = $2 AND user_id = $3
    RETURNING *
  `,
} as const;
