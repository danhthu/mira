export const MOMENT_QUERIES = {
  findAll: `
    SELECT * FROM moment
    WHERE user_id = $1 AND deleted_at IS NULL
    ORDER BY date DESC, created_at DESC
  `,

  findById: `
    SELECT * FROM moment
    WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
  `,

  findByDateRange: `
    SELECT * FROM moment
    WHERE date >= $1 AND date <= $2 AND user_id = $3 AND deleted_at IS NULL
    ORDER BY date DESC, created_at DESC
  `,

  findByKind: `
    SELECT * FROM moment
    WHERE kind = $1 AND user_id = $2 AND deleted_at IS NULL
    ORDER BY date DESC, created_at DESC
  `,

  // Hạt muối tới hạn hỏi lại và chưa từng được trả lời. Mira hỏi đúng một lần,
  // nên hạt đã có revisit_answer không bao giờ quay lại danh sách này.
  findDueForRevisit: `
    SELECT * FROM moment
    WHERE kind = 'salt'
      AND user_id = $2
      AND revisit_at IS NOT NULL
      AND revisit_at <= $1
      AND revisit_answer IS NULL
      AND deleted_at IS NULL
    ORDER BY revisit_at ASC
  `,

  insert: `
    INSERT INTO moment (
      id, user_id, date, kind, text,
      revisit_at, revisit_answer,
      created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, NULL, $7, $7)
    RETURNING *
  `,

  // `revisit_answer IS NULL` là một ràng buộc, không phải thừa: hạt muối đã được hỏi lại
  // và đã trả lời thì nó là lịch sử — đổi chữ hay đổi loại lúc đó là sửa lại một câu
  // người dùng đã nói về quá khứ của chính mình.
  update: `
    UPDATE moment
    SET text = $2, kind = $3, revisit_at = $4, updated_at = $5
    WHERE id = $1 AND user_id = $6 AND revisit_answer IS NULL AND deleted_at IS NULL
    RETURNING *
  `,

  // Chỉ ghi được khi revisit_answer còn NULL — chính câu WHERE này là thứ bảo đảm
  // "hỏi một lần", không cần kiểm tra thêm ở tầng trên.
  answerRevisit: `
    UPDATE moment
    SET revisit_answer = $2, updated_at = $3
    WHERE id = $1 AND user_id = $4 AND kind = 'salt' AND revisit_answer IS NULL AND deleted_at IS NULL
    RETURNING *
  `,

  softDelete: `
    UPDATE moment
    SET deleted_at = $2, updated_at = $2
    WHERE id = $1 AND user_id = $3
    RETURNING *
  `,
} as const;
