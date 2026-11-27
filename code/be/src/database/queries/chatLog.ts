export const CHAT_LOG_QUERIES = {
  insert: `
    INSERT INTO chat_log (id, user_id, sentence, date, source, result)
    VALUES ($1, $2, $3, $4, $5, $6)
  `,

  /**
   * Đọc theo khoảng thời gian, MỚI NHẤT TRƯỚC.
   *
   * Có trần `$4` vì bảng này chỉ có lớn lên: mỗi câu gõ là một hàng, không bao giờ gộp.
   * Không chặn thì một lời gọi vô ý kéo về cả năm nhật ký.
   */
  findRange: `
    SELECT id, sentence, date, source, result, created_at
    FROM chat_log
    WHERE user_id = $1 AND date >= $2 AND date <= $3
    ORDER BY created_at DESC
    LIMIT $4
  `,

  /**
   * Chỉ những câu Mira KHÔNG đọc nổi.
   *
   * Đây là truy vấn đáng giá nhất của bảng: mỗi hàng là một lỗ trong `parse-rules.json`, và
   * cũng là một mẫu huấn luyện. Xem `docs/12-mo-hinh-mira.md` §6.
   */
  findChiu: `
    SELECT id, sentence, date, source, result, created_at
    FROM chat_log
    WHERE user_id = $1 AND source = 'chiu'
    ORDER BY created_at DESC
    LIMIT $2
  `,
} as const;
