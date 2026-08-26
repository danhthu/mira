export const PERSON_QUERIES = {
  findAll: `
    SELECT * FROM person
    WHERE deleted_at IS NULL
    ORDER BY name
  `,

  findById: `
    SELECT * FROM person
    WHERE id = $1 AND deleted_at IS NULL
  `,

  insert: `
    INSERT INTO person (
      id, name, role, birth_year, distance_km,
      dunbar_ring, desired_cadence, hourglass_enabled,
      created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `,

  update: `
    UPDATE person
    SET
      name              = $2,
      role              = $3,
      birth_year        = $4,
      distance_km       = $5,
      dunbar_ring       = $6,
      desired_cadence   = $7,
      hourglass_enabled = $8,
      updated_at        = $9
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING *
  `,

  softDelete: `
    UPDATE person
    SET deleted_at = $2, updated_at = $2
    WHERE id = $1
    RETURNING *
  `,
} as const;
