-- Mira Growth OS — lược đồ SQLite
-- Chạy bởi lib/db.mjs khi mở DB (idempotent: CREATE IF NOT EXISTS).
-- Không chứa dữ liệu thật của người dùng app — chỉ dữ liệu vận hành growth.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------- tasks
CREATE TABLE IF NOT EXISTS tasks (
  id            TEXT PRIMARY KEY,                 -- T-0001
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  agent         TEXT NOT NULL,                    -- tên agent trong .claude/agents
  priority      REAL NOT NULL DEFAULT 1,          -- Priority Score = impact*confidence*urgency/effort
  impact        INTEGER NOT NULL DEFAULT 3,       -- 1..5
  confidence    REAL NOT NULL DEFAULT 0.5,        -- 0..1
  urgency       INTEGER NOT NULL DEFAULT 3,       -- 1..5
  effort        INTEGER NOT NULL DEFAULT 3,       -- 1..5
  status        TEXT NOT NULL DEFAULT 'BACKLOG'
                CHECK (status IN ('BACKLOG','READY','IN_PROGRESS','BLOCKED','REVIEW','DONE','CANCELLED')),
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  deadline      TEXT,                             -- YYYY-MM-DD
  depends_on    TEXT NOT NULL DEFAULT '[]',       -- JSON array task ids
  expected      TEXT NOT NULL DEFAULT '',
  actual        TEXT NOT NULL DEFAULT '',
  evidence      TEXT NOT NULL DEFAULT '',         -- đường dẫn file / URL
  sprint        TEXT,                             -- S1, S2...
  needs_approval INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS task_history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id     TEXT NOT NULL REFERENCES tasks(id),
  at          TEXT NOT NULL,
  from_status TEXT,
  to_status   TEXT,
  note        TEXT NOT NULL DEFAULT '',
  actor       TEXT NOT NULL DEFAULT 'cli'
);

-- ------------------------------------------------------------ campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id            TEXT PRIMARY KEY,                 -- C-0001
  name          TEXT NOT NULL,
  objective     TEXT NOT NULL DEFAULT '',
  audience      TEXT NOT NULL DEFAULT '',
  platform      TEXT NOT NULL,                    -- channel taxonomy
  assets        TEXT NOT NULL DEFAULT '[]',       -- JSON array content ids / paths
  tracking_link TEXT NOT NULL DEFAULT '',
  budget_usd    REAL NOT NULL DEFAULT 0,
  daily_cap_usd REAL NOT NULL DEFAULT 0,
  start_date    TEXT,
  end_date      TEXT,
  status        TEXT NOT NULL DEFAULT 'DRAFT'
                CHECK (status IN ('DRAFT','PENDING_APPROVAL','APPROVED','RUNNING','PAUSED','STOPPED','DONE')),
  approved_by   TEXT,
  approved_at   TEXT,
  results       TEXT NOT NULL DEFAULT '',
  lessons       TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id TEXT REFERENCES campaigns(id),
  date        TEXT NOT NULL,
  amount_usd  REAL NOT NULL,
  note        TEXT NOT NULL DEFAULT '',
  recorded_at TEXT NOT NULL
);

-- -------------------------------------------------------------- content
CREATE TABLE IF NOT EXISTS content (
  id            TEXT PRIMARY KEY,                 -- K-0001
  topic         TEXT NOT NULL,
  channel       TEXT NOT NULL,                    -- channel taxonomy
  format        TEXT NOT NULL,                    -- blog | short-video | post | thread | letter | tool
  audience      TEXT NOT NULL DEFAULT '',
  hook          TEXT NOT NULL DEFAULT '',
  body_ref      TEXT NOT NULL DEFAULT '',         -- đường dẫn file nội dung chính
  cta           TEXT NOT NULL DEFAULT '',
  asset_ref     TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'IDEA'
                CHECK (status IN ('IDEA','RESEARCH','DRAFT','REVIEW','APPROVED','PUBLISHED','MEASURED','REUSED','ARCHIVED')),
  url           TEXT NOT NULL DEFAULT '',
  utm           TEXT NOT NULL DEFAULT '',
  published_at  TEXT,
  metrics       TEXT NOT NULL DEFAULT '{}',       -- JSON {views, clicks, ...}
  source_slug   TEXT,                             -- slug bài blog gốc nếu tái sử dụng
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

-- ---------------------------------------------------------- experiments
CREATE TABLE IF NOT EXISTS experiments (
  id          TEXT PRIMARY KEY,                   -- X-0001
  hypothesis  TEXT NOT NULL,
  objective   TEXT NOT NULL DEFAULT '',
  channel     TEXT NOT NULL,
  audience    TEXT NOT NULL DEFAULT '',
  variables   TEXT NOT NULL DEFAULT '',
  budget_usd  REAL NOT NULL DEFAULT 0,
  metric      TEXT NOT NULL,                      -- success metric
  baseline    TEXT NOT NULL DEFAULT '',
  target      TEXT NOT NULL DEFAULT '',
  start_date  TEXT,
  end_date    TEXT,
  results     TEXT NOT NULL DEFAULT '',
  decision    TEXT CHECK (decision IN (NULL,'SCALE','ITERATE','STOP','INCONCLUSIVE')),
  decided_at  TEXT,
  campaign_id TEXT REFERENCES campaigns(id),
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

-- -------------------------------------------------------------- metrics
-- Một dòng = một số đo trong một ngày. quality phân biệt số đo thật / ước / không gán nguồn.
CREATE TABLE IF NOT EXISTS metrics_daily (
  date      TEXT NOT NULL,                        -- YYYY-MM-DD
  platform  TEXT NOT NULL,                        -- android | ios | pwa | web | all
  channel   TEXT NOT NULL,                        -- channel taxonomy, UNKNOWN nếu không gán được
  metric    TEXT NOT NULL,                        -- store_visitors | installs | first_open | active | retained_d7 | waitlist | sessions | pageviews | clicks | spend_usd ...
  value     REAL NOT NULL,
  source    TEXT NOT NULL,                        -- play_console_csv | asc_csv | ga4 | manual | estimate ...
  quality   TEXT NOT NULL DEFAULT 'measured'
            CHECK (quality IN ('measured','estimated','unattributed')),
  note      TEXT NOT NULL DEFAULT '',
  imported_at TEXT NOT NULL,
  PRIMARY KEY (date, platform, channel, metric, source)
);

-- ------------------------------------------------------------ approvals
CREATE TABLE IF NOT EXISTS approvals (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  kind        TEXT NOT NULL,                      -- budget | publish | access | code_change | other
  ref_id      TEXT,                               -- campaign/content/task id
  request     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
  requested_at TEXT NOT NULL,
  decided_at  TEXT,
  decided_by  TEXT,
  note        TEXT NOT NULL DEFAULT ''
);

-- --------------------------------------------------------- scheduler
CREATE TABLE IF NOT EXISTS runs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  job         TEXT NOT NULL,
  started_at  TEXT NOT NULL,
  finished_at TEXT,
  status      TEXT NOT NULL CHECK (status IN ('RUNNING','OK','FAILED','SKIPPED')),
  attempt     INTEGER NOT NULL DEFAULT 1,
  output      TEXT NOT NULL DEFAULT '',
  error       TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS locks (
  name        TEXT PRIMARY KEY,
  owner       TEXT NOT NULL,
  acquired_at TEXT NOT NULL,
  expires_at  TEXT NOT NULL
);

-- --------------------------------------------------------- audit log
-- Mọi hành động hướng ra ngoài (publish, chi tiền, gửi outreach) phải ghi vào đây.
CREATE TABLE IF NOT EXISTS audit_log (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  at        TEXT NOT NULL,
  actor     TEXT NOT NULL,
  action    TEXT NOT NULL,
  ref_id    TEXT,
  detail    TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_agent ON tasks(agent);
CREATE INDEX IF NOT EXISTS idx_metrics_date ON metrics_daily(date);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
