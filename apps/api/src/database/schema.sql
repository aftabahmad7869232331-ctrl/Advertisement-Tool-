-- ============================================================
-- BRICKS MAKER ADVERTISEMENT STUDIO
-- PHASE 1 DATABASE SCHEMA
-- ============================================================

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

  language           TEXT NOT NULL DEFAULT 'en',
  status             TEXT NOT NULL DEFAULT 'queued',
  metadata_json      TEXT NOT NULL DEFAULT '{}',

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
