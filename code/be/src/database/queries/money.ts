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

  insert: `
    INSERT INTO money (
      id, user_id, month,
      net_income, monthly_expense, debt_payment, debt_balance, net_worth,
      created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
    RETURNING *
  `,

  // Repository đọc trước rồi ghi đè toàn bộ năm ô, giống TimeEntryRepository.update:
  // đổi một round trip lấy việc không phải ghép chuỗi SQL động.
  update: `
    UPDATE money
    SET
      net_income      = $2,
      monthly_expense = $3,
      debt_payment    = $4,
      debt_balance    = $5,
      net_worth       = $6,
      updated_at      = $7
    WHERE month = $1 AND user_id = $8 AND deleted_at IS NULL
    RETURNING *
  `,
} as const;
