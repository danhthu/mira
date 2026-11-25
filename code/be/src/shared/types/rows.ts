export interface PersonRow {
  id: string;
  name: string;
  role: string;
  birth_year: number | null;
  distance_km: number | null;
  dunbar_ring: number;
  desired_cadence: number | null;
  hourglass_enabled: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TimeEntryRow {
  id: string;
  date: string;
  minutes: number;
  bucket: string;
  golden: boolean;
  note: string | null;
  source: string;
  nep_id: string | null;
  danh_muc_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MomentRow {
  id: string;
  date: string;
  kind: string;
  text: string | null;
  revisit_at: string | null;
  revisit_answer: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WorkLoadRow {
  id: string;
  week_start: string;
  work_minutes: number;
  commute_minutes: number;
  prep_minutes: number;
  recovery_minutes: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MoneyRow {
  id: string;
  month: string;
  net_income: number | null;
  monthly_expense: number | null;
  debt_payment: number | null;
  debt_balance: number | null;
  net_worth: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ExpenseRow {
  id: string;
  occurred_at: string;
  amount: number;
  description: string;
  bucket: string | null;
  source_type: string;
  confirmed: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface GoalRow {
  id: string;
  tier: string;
  title: string;
  weekly_minutes: number;
  source_bucket: string;
  started_on: string;
  expires_on: string | null;
  ended_on: string | null;
  handed_over_to: string | null;
  cost_amount_per_month: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface HabitRow {
  id: string;
  title: string;
  target_per_week: number;
  started_on: string;
  ended_on: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface HealthRow {
  id: string;
  date: string;
  sleep_minutes: number | null;
  steps: number | null;
  energy_self_rated: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MoodRow {
  id: string;
  occurred_at: string;
  level: number;
  note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WeightOnMindRow {
  id: string;
  text: string;
  written_at: string;
  review_at: string;
  reviewed: boolean;
  still_heavy: boolean | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ItemRow {
  id: string;
  name: string;
  price: number | null;
  purchased_at: string | null;
  use_count: number;
  released_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SpaceRow {
  id: string;
  type: string;
  name: string;
  member_ids: string;
  shared_modules: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface LetterRow {
  id: string;
  week_start: string;
  body: string;
  user_reaction: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
