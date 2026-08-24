-- Toàn bộ schema của Mira. Viết đầy đủ ngay từ đầu, migrate dần theo version.
-- Quy ước: id TEXT (UUID v7), tiền INTEGER (VND), thời lượng INTEGER (phút), ngày TEXT (YYYY-MM-DD).

CREATE TABLE IF NOT EXISTS person (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  role              TEXT NOT NULL CHECK (role IN ('child', 'parent', 'partner', 'friend', 'self', 'other')),
  birth_year        INTEGER,
  distance_km       INTEGER,
  dunbar_ring       INTEGER NOT NULL DEFAULT 50 CHECK (dunbar_ring IN (5, 15, 50)),
  desired_cadence   INTEGER,
  hourglass_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL,
  deleted_at        TEXT
);

CREATE TABLE IF NOT EXISTS time_entry (
  id         TEXT PRIMARY KEY,
  date       TEXT NOT NULL,
  minutes    INTEGER NOT NULL,
  bucket     TEXT NOT NULL CHECK (bucket IN ('work', 'health', 'people', 'learn', 'rest', 'self')),
  person_id  TEXT REFERENCES person (id),
  note       TEXT,
  source     TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'calendar', 'widget')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS moment (
  id         TEXT PRIMARY KEY,
  occurred_at TEXT NOT NULL,
  text       TEXT,
  media_uri  TEXT,
  media_type TEXT CHECK (media_type IN ('photo', 'audio')),
  person_ids TEXT NOT NULL DEFAULT '[]',
  bucket     TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS work_load (
  id                TEXT PRIMARY KEY,
  week_start        TEXT NOT NULL,
  work_minutes      INTEGER NOT NULL DEFAULT 0,
  commute_minutes   INTEGER NOT NULL DEFAULT 0,
  prep_minutes      INTEGER NOT NULL DEFAULT 0,
  recovery_minutes  INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL,
  deleted_at        TEXT
);

CREATE TABLE IF NOT EXISTS money (
  id               TEXT PRIMARY KEY,
  month            TEXT NOT NULL,
  net_income       INTEGER NOT NULL,
  monthly_expense  INTEGER NOT NULL,
  net_worth        INTEGER NOT NULL,
  debt             INTEGER NOT NULL DEFAULT 0,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,
  deleted_at       TEXT
);

CREATE TABLE IF NOT EXISTS expense (
  id          TEXT PRIMARY KEY,
  occurred_at TEXT NOT NULL,
  amount      INTEGER NOT NULL,
  description TEXT,
  bucket      TEXT,
  source_type TEXT NOT NULL DEFAULT 'manual' CHECK (source_type IN ('manual', 'sms', 'notification')),
  confirmed   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  deleted_at  TEXT
);

CREATE TABLE IF NOT EXISTS goal (
  id                     TEXT PRIMARY KEY,
  tier                   TEXT NOT NULL CHECK (tier IN ('identity', 'season', 'rhythm')),
  title                  TEXT NOT NULL,
  started_at             TEXT NOT NULL,
  expires_at             TEXT,
  cost_minutes_per_week  INTEGER,
  cost_amount_per_month  INTEGER,
  status                 TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'renewed', 'expired', 'released')),
  release_reason         TEXT,
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL,
  deleted_at             TEXT
);

CREATE TABLE IF NOT EXISTS health (
  id               TEXT PRIMARY KEY,
  date             TEXT NOT NULL,
  sleep_minutes    INTEGER,
  steps            INTEGER,
  energy_self_rated INTEGER CHECK (energy_self_rated BETWEEN 1 AND 5),
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,
  deleted_at       TEXT
);

CREATE TABLE IF NOT EXISTS mood (
  id          TEXT PRIMARY KEY,
  occurred_at TEXT NOT NULL,
  level       INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  note        TEXT,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  deleted_at  TEXT
);

CREATE TABLE IF NOT EXISTS weight_on_mind (
  id          TEXT PRIMARY KEY,
  text        TEXT NOT NULL,
  written_at  TEXT NOT NULL,
  review_at   TEXT NOT NULL,
  reviewed    BOOLEAN NOT NULL DEFAULT FALSE,
  still_heavy BOOLEAN,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  deleted_at  TEXT
);

CREATE TABLE IF NOT EXISTS item (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  price        INTEGER,
  purchased_at TEXT,
  use_count    INTEGER NOT NULL DEFAULT 0,
  released_at  TEXT,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL,
  deleted_at   TEXT
);

CREATE TABLE IF NOT EXISTS space (
  id             TEXT PRIMARY KEY,
  type           TEXT NOT NULL CHECK (type IN ('pair', 'circle')),
  name           TEXT NOT NULL,
  member_ids     TEXT NOT NULL DEFAULT '[]',
  shared_modules TEXT NOT NULL DEFAULT '[]',
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL,
  deleted_at     TEXT
);

CREATE TABLE IF NOT EXISTS letter (
  id            TEXT PRIMARY KEY,
  week_start    TEXT NOT NULL,
  body          TEXT NOT NULL,
  user_reaction TEXT CHECK (user_reaction IN ('helpful', 'neutral', 'off')),
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  deleted_at    TEXT
);
