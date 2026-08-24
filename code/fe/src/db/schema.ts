import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const person = sqliteTable('person', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role', {
    enum: ['child', 'parent', 'partner', 'friend', 'self', 'other'],
  }).notNull(),
  birthYear: integer('birth_year'),
  distanceKm: integer('distance_km'),
  dunbarRing: integer('dunbar_ring').notNull().default(50),
  desiredCadence: integer('desired_cadence'),
  hourglassEnabled: integer('hourglass_enabled', { mode: 'boolean' })
    .notNull()
    .default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

export const timeEntry = sqliteTable('time_entry', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  minutes: integer('minutes').notNull(),
  bucket: text('bucket', {
    enum: ['work', 'health', 'people', 'learn', 'rest', 'self'],
  }).notNull(),
  personId: text('person_id'),
  note: text('note'),
  source: text('source', { enum: ['manual', 'calendar', 'widget'] })
    .notNull()
    .default('manual'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

export const workLoad = sqliteTable('work_load', {
  id: text('id').primaryKey(),
  weekStart: text('week_start').notNull(),
  workMinutes: integer('work_minutes').notNull().default(0),
  commuteMinutes: integer('commute_minutes').notNull().default(0),
  prepMinutes: integer('prep_minutes').notNull().default(0),
  recoveryMinutes: integer('recovery_minutes').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

export const money = sqliteTable('money', {
  id: text('id').primaryKey(),
  month: text('month').notNull(),
  netIncome: integer('net_income').notNull().default(0),
  monthlyExpense: integer('monthly_expense').notNull().default(0),
  netWorth: integer('net_worth').notNull().default(0),
  debt: integer('debt').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

export const expense = sqliteTable('expense', {
  id: text('id').primaryKey(),
  occurredAt: text('occurred_at').notNull(),
  amount: integer('amount').notNull(),
  description: text('description').notNull(),
  bucket: text('bucket'),
  sourceType: text('source_type', { enum: ['manual', 'sms', 'notification'] })
    .notNull()
    .default('manual'),
  confirmed: integer('confirmed', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

export const goal = sqliteTable('goal', {
  id: text('id').primaryKey(),
  tier: text('tier', { enum: ['identity', 'season', 'rhythm'] }).notNull(),
  title: text('title').notNull(),
  startedAt: text('started_at').notNull(),
  expiresAt: text('expires_at'),
  costMinutesPerWeek: integer('cost_minutes_per_week'),
  costAmountPerMonth: integer('cost_amount_per_month'),
  status: text('status', {
    enum: ['active', 'renewed', 'expired', 'released'],
  })
    .notNull()
    .default('active'),
  releaseReason: text('release_reason'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

export const moment = sqliteTable('moment', {
  id: text('id').primaryKey(),
  occurredAt: text('occurred_at').notNull(),
  text: text('text'),
  mediaUri: text('media_uri'),
  mediaType: text('media_type', { enum: ['photo', 'audio'] }),
  personIds: text('person_ids').notNull().default('[]'),
  bucket: text('bucket', {
    enum: ['work', 'health', 'people', 'learn', 'rest', 'self'],
  }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

export const health = sqliteTable('health', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  sleepMinutes: integer('sleep_minutes'),
  steps: integer('steps'),
  energySelfRated: integer('energy_self_rated'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

export const mood = sqliteTable('mood', {
  id: text('id').primaryKey(),
  occurredAt: text('occurred_at').notNull(),
  level: integer('level').notNull(),
  note: text('note'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

export const weightOnMind = sqliteTable('weight_on_mind', {
  id: text('id').primaryKey(),
  text: text('text').notNull(),
  writtenAt: text('written_at').notNull(),
  reviewAt: text('review_at').notNull(),
  reviewed: integer('reviewed', { mode: 'boolean' }).notNull().default(false),
  stillHeavy: integer('still_heavy', { mode: 'boolean' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

export const item = sqliteTable('item', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: integer('price'),
  purchasedAt: text('purchased_at'),
  useCount: integer('use_count').notNull().default(0),
  releasedAt: text('released_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

export const space = sqliteTable('space', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['pair', 'circle'] }).notNull(),
  name: text('name').notNull(),
  memberIds: text('member_ids').notNull().default('[]'),
  sharedModules: text('shared_modules').notNull().default('[]'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

export const letter = sqliteTable('letter', {
  id: text('id').primaryKey(),
  weekStart: text('week_start').notNull(),
  body: text('body').notNull(),
  userReaction: text('user_reaction', { enum: ['helpful', 'neutral', 'off'] }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

export type Person = typeof person.$inferSelect;
export type TimeEntry = typeof timeEntry.$inferSelect;
export type WorkLoad = typeof workLoad.$inferSelect;
export type Money = typeof money.$inferSelect;
export type Expense = typeof expense.$inferSelect;
export type Goal = typeof goal.$inferSelect;
export type Moment = typeof moment.$inferSelect;
export type Health = typeof health.$inferSelect;
export type Mood = typeof mood.$inferSelect;
export type WeightOnMind = typeof weightOnMind.$inferSelect;
export type Item = typeof item.$inferSelect;
export type Space = typeof space.$inferSelect;
export type Letter = typeof letter.$inferSelect;
