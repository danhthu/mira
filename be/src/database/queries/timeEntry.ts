export const TIME_ENTRY_QUERIES = {
  findAll: `
    SELECT * FROM time_entry
    WHERE deleted_at IS NULL
    ORDER BY date DESC, created_at DESC
  `,

  findById: `
    SELECT * FROM time_entry
    WHERE id = $1 AND deleted_at IS NULL
  `,

  findByDate: `
    SELECT * FROM time_entry
    WHERE date = $1 AND deleted_at IS NULL
    ORDER BY created_at DESC
  `,

  findByPersonId: `
    SELECT * FROM time_entry
    WHERE person_id = $1 AND deleted_at IS NULL
    ORDER BY date DESC
  `,

  findByDateRange: `
    SELECT * FROM time_entry
    WHERE date >= $1 AND date <= $2 AND deleted_at IS NULL
    ORDER BY date DESC, created_at DESC
  `,

  insert: `
    INSERT INTO time_entry (
      id, date, minutes, bucket,
      person_id, note, source,
      created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `,

  update: `
    UPDATE time_entry
    SET
      date      = $2,
      minutes   = $3,
      bucket    = $4,
      person_id = $5,
      note      = $6,
      updated_at = $7
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING *
  `,

  softDelete: `
    UPDATE time_entry
    SET deleted_at = $2, updated_at = $2
    WHERE id = $1
    RETURNING *
  `,
} as const;
