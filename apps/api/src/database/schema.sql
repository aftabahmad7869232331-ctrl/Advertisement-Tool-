-- ============================================================
-- BRICKS MAKER ADVERTISEMENT STUDIO
-- PHASE 1 DATABASE SCHEMA
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id             TEXT PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash  TEXT NOT NULL,
  password_salt  TEXT NOT NULL,
  first_name     TEXT NOT NULL DEFAULT '',
  last_name      TEXT NOT NULL DEFAULT '',
  role           TEXT NOT NULL DEFAULT 'user',
  status         TEXT NOT NULL DEFAULT 'active',
  email_verified_at TEXT,
  created_at     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at  TEXT
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id                  TEXT PRIMARY KEY,
  user_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token_hash   TEXT NOT NULL UNIQUE,
  refresh_token_hash  TEXT NOT NULL UNIQUE,
  access_expires_at   TEXT NOT NULL,
  refresh_expires_at  TEXT NOT NULL,
  revoked_at          TEXT,
  created_at          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at        TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_active
ON auth_sessions(user_id, revoked_at, refresh_expires_at);

CREATE TABLE IF NOT EXISTS auth_action_tokens (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose     TEXT NOT NULL,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TEXT NOT NULL,
  used_at     TEXT,
  created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_action_tokens_user_purpose
ON auth_action_tokens(user_id, purpose, used_at, expires_at);

CREATE TABLE IF NOT EXISTS projects (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL DEFAULT 'default',
  name           TEXT NOT NULL,
  description    TEXT,
  language       TEXT NOT NULL DEFAULT 'en',
  status         TEXT NOT NULL DEFAULT 'draft',
  metadata_json  TEXT NOT NULL DEFAULT '{}',
  created_at     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO projects (
  id,
  user_id,
  name,
  description,
  status
)
VALUES (
  'default-project',
  'default',
  'Default Studio Project',
  'Local development project',
  'draft'
);

CREATE TABLE IF NOT EXISTS processing_jobs (
  id                  TEXT PRIMARY KEY,
  user_id             TEXT NOT NULL DEFAULT 'default',
  project_id          TEXT REFERENCES projects(id) ON DELETE SET NULL,
  job_type            TEXT NOT NULL,
  provider            TEXT,
  model               TEXT,
  status              TEXT NOT NULL DEFAULT 'pending',
  progress            INTEGER NOT NULL DEFAULT 0,
  stage               TEXT,
  priority            INTEGER NOT NULL DEFAULT 0,
  payload_json        TEXT NOT NULL DEFAULT '{}',
  result_json         TEXT,
  error               TEXT,
  retry_count         INTEGER NOT NULL DEFAULT 0,
  max_retries         INTEGER NOT NULL DEFAULT 3,
  estimated_cost_usd  REAL NOT NULL DEFAULT 0,
  actual_cost_usd     REAL NOT NULL DEFAULT 0,
  created_at          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at          TEXT,
  completed_at        TEXT
);

CREATE TABLE IF NOT EXISTS videos (
  id                 TEXT PRIMARY KEY,
  user_id            TEXT NOT NULL DEFAULT 'default',
  project_id         TEXT NOT NULL DEFAULT 'default-project'
                     REFERENCES projects(id) ON DELETE CASCADE,
  job_id             TEXT REFERENCES processing_jobs(id) ON DELETE SET NULL,

  title              TEXT,
  original_filename  TEXT,
  source_type        TEXT NOT NULL DEFAULT 'generated',
  provider           TEXT,
  model              TEXT,

  url                TEXT NOT NULL,
  storage_key        TEXT,
  storage_provider   TEXT,
  sha256              TEXT,
  thumbnail_url      TEXT,

  duration           REAL NOT NULL DEFAULT 0,
  width              INTEGER NOT NULL DEFAULT 0,
  height             INTEGER NOT NULL DEFAULT 0,
  fps                REAL NOT NULL DEFAULT 0,
  codec              TEXT,
  bitrate            INTEGER NOT NULL DEFAULT 0,

  format             TEXT NOT NULL DEFAULT 'mp4',
  mime_type          TEXT NOT NULL DEFAULT 'video/mp4',
  quality            TEXT NOT NULL DEFAULT '1080p',
  aspect_ratio       TEXT NOT NULL DEFAULT '16:9',
  file_size          INTEGER NOT NULL DEFAULT 0,
  file_size_bytes    INTEGER,
  duration_seconds   REAL,

  language           TEXT NOT NULL DEFAULT 'en',
  status             TEXT NOT NULL DEFAULT 'queued',
  metadata_json      TEXT NOT NULL DEFAULT '{}',

  is_temporary       INTEGER NOT NULL DEFAULT 0,
  expires_at         TEXT,
  saved_at           TEXT,

  created_at         TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_user
ON projects(user_id);

CREATE INDEX IF NOT EXISTS idx_jobs_status
ON processing_jobs(status);

CREATE INDEX IF NOT EXISTS idx_jobs_project
ON processing_jobs(project_id);

CREATE INDEX IF NOT EXISTS idx_jobs_user_created
ON processing_jobs(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_videos_project
ON videos(project_id);

CREATE INDEX IF NOT EXISTS idx_videos_job
ON videos(job_id);

CREATE INDEX IF NOT EXISTS idx_videos_user_created
ON videos(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_videos_status
ON videos(status);

CREATE TABLE IF NOT EXISTS ai_usage_events (
  job_id TEXT PRIMARY KEY REFERENCES processing_jobs(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, model TEXT NOT NULL, credential_source TEXT NOT NULL,
  estimated_cost_usd REAL, actual_cost_usd REAL, duration_requested REAL NOT NULL,
  status TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  client_scope TEXT NOT NULL, idempotency_key TEXT NOT NULL, request_hash TEXT NOT NULL,
  job_id TEXT NOT NULL REFERENCES processing_jobs(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (client_scope, idempotency_key)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_videos_unique_job
ON videos(job_id) WHERE job_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS workspace_records (
  collection TEXT NOT NULL,
  id TEXT NOT NULL,
  data_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (collection, id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_records_updated
ON workspace_records(collection, updated_at DESC);

CREATE TABLE IF NOT EXISTS workspace_actions (
  id TEXT PRIMARY KEY,
  page TEXT NOT NULL,
  action TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS credit_accounts (
  user_id             TEXT PRIMARY KEY,
  available_credits   REAL NOT NULL DEFAULT 0 CHECK (available_credits >= 0),
  reserved_credits    REAL NOT NULL DEFAULT 0 CHECK (reserved_credits >= 0),
  total_spent_credits REAL NOT NULL DEFAULT 0 CHECK (total_spent_credits >= 0),
  created_at          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS credit_reservations (
  job_id            TEXT PRIMARY KEY REFERENCES processing_jobs(id) ON DELETE CASCADE,
  user_id           TEXT NOT NULL REFERENCES credit_accounts(user_id) ON DELETE CASCADE,
  reserved_credits  REAL NOT NULL CHECK (reserved_credits > 0),
  captured_credits  REAL NOT NULL DEFAULT 0 CHECK (captured_credits >= 0),
  status            TEXT NOT NULL DEFAULT 'reserved',
  created_at        TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_credit_reservations_user_status
ON credit_reservations(user_id, status);

CREATE TABLE IF NOT EXISTS credit_ledger (
  id                TEXT PRIMARY KEY,
  user_id           TEXT NOT NULL REFERENCES credit_accounts(user_id) ON DELETE CASCADE,
  job_id            TEXT REFERENCES processing_jobs(id) ON DELETE SET NULL,
  event_type        TEXT NOT NULL,
  amount_credits    REAL NOT NULL,
  balance_after     REAL NOT NULL,
  reserved_after    REAL NOT NULL,
  metadata_json     TEXT NOT NULL DEFAULT '{}',
  idempotency_key   TEXT NOT NULL UNIQUE,
  created_at        TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_user_created
ON credit_ledger(user_id, created_at DESC);
