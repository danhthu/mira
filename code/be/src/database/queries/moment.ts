export const MOMENT_QUERIES = {
  findAll: `
    SELECT * FROM moment
    WHERE deleted_at IS NULL
    ORDER BY occurred_at DESC
  `,

  findById: `
    SELECT * FROM moment
    WHERE id = $1 AND deleted_at IS NULL
  `,

  findByDateRange: `
    SELECT * FROM moment
    WHERE occurred_at >= $1 AND occurred_at <= $2 AND deleted_at IS NULL
    ORDER BY occurred_at DESC
  `,

  findByBucket: `
    SELECT * FROM moment
    WHERE bucket = $1 AND deleted_at IS NULL
    ORDER BY occurred_at DESC
  `,

  insert: `
    INSERT INTO moment (
      id, occurred_at, text, media_uri, media_type,
      person_ids, bucket,
      created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `,

  update: `
    UPDATE moment
    SET
      occurred_at = $2,
      text        = $3,
      media_uri   = $4,
      media_type  = $5,
      person_ids  = $6,
      bucket      = $7,
      updated_at  = $8
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING *
  `,

  softDelete: `
    UPDATE moment
    SET deleted_at = $2, updated_at = $2
    WHERE id = $1
    RETURNING *
  `,
} as const;
