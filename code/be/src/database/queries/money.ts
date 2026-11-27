export const MONEY_QUERIES = {
  findByMonth: `
    SELECT * FROM money
    WHERE month = $1 AND user_id = $2 AND deleted_at IS NULL
  `,

  findRange: `
    SELECT * FROM money
    WHERE month >= $1 AND month <= $2 AND user_id = $3 AND deleted_at IS NULL
    ORDER BY month ASC
  `,

  // Chỉ còn hai ô MỨC. Năm ô dòng chảy là tổng `money_entry` — xem migration 013.
  insert: `
    INSERT INTO money (id, user_id, month, debt_balance, net_worth, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $6)
    RETURNING *
  `,

  // Repository đọc trước rồi ghi đè cả hai ô, giống TimeEntryRepository.update:
  // đổi một round trip lấy việc không phải ghép chuỗi SQL động.
  update: `
    UPDATE money
    SET debt_balance = $2, net_worth = $3, updated_at = $4
    WHERE month = $1 AND user_id = $5 AND deleted_at IS NULL
    RETURNING *
  `,
} as const;
