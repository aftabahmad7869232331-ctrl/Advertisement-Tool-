import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

const defaultDatabasePath = path.resolve(
  currentDirectory,
  '../../storage/video-studio.db',
);

const databasePath = path.resolve(
  process.env.SQLITE_DB_PATH ?? defaultDatabasePath,
);

const schemaPath = path.resolve(currentDirectory, 'schema.sql');

fs.mkdirSync(path.dirname(databasePath), {
  recursive: true,
});

export const db = new DatabaseSync(databasePath);

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA busy_timeout = 5000;');

let initialized = false;

export function initializeDatabase(): void {
  if (initialized) {
    return;
  }

  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Database schema file nahi mila: ${schemaPath}`);
  }

  const schema = fs.readFileSync(schemaPath, 'utf8');

  db.exec(schema);

  const columns = db.prepare('PRAGMA table_info(videos)').all() as Array<{ name: string }>;
  const existing = new Set(columns.map((column) => column.name));
  const additions = [
    ['storage_provider', 'TEXT'],
    ['sha256', 'TEXT'],
    ['file_size_bytes', 'INTEGER'],
    ['duration_seconds', 'REAL'],
  ] as const;
  for (const [name, type] of additions) {
    if (!existing.has(name)) db.exec(`ALTER TABLE videos ADD COLUMN ${name} ${type}`);
  }
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_videos_unique_job ON videos(job_id) WHERE job_id IS NOT NULL;');

  initialized = true;

  console.log(`[database] SQLite ready: ${databasePath}`);
}

export function closeDatabase(): void {
  db.close();
}
