import { z } from 'zod';

const isoTimestamp = z
  .string()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: 'must be an ISO 8601 timestamp',
  });

// Giá trị nghiệp vụ chỉ có bốn kiểu vô hướng và mảng chuỗi (person_ids, member_ids,
// shared_modules). Chặn object lồng nhau ngay ở cửa để repository không phải đoán.
const syncValue = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.string()),
]);

export const pushBodySchema = z.object({
  changes: z.array(
    z.object({
      table: z.string().min(1),
      id: z.string().min(1),
      updatedAt: isoTimestamp,
      deletedAt: isoTimestamp.nullable().default(null),
      data: z.record(z.string(), syncValue).default({}),
    }),
  ),
});

export const pullQuerySchema = z.object({
  since: isoTimestamp.optional(),
  limit: z.coerce.number().int().positive().optional(),
});
