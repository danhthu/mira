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
  person_id: string | null;
  note: string | null;
  source: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MomentRow {
  id: string;
  occurred_at: string;
  text: string | null;
  media_uri: string | null;
  media_type: string | null;
  person_ids: string;
  bucket: string | null;
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
  net_income: number;
  monthly_expense: number;
  net_worth: number;
  debt: number;
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
  started_at: string;
  expires_at: string;
  cost_minutes_per_week: number | null;
  cost_amount_per_month: number | null;
  status: string;
  release_reason: string | null;
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
