# Bricks Maker Advertisement Studio — Project Status

> **Last updated:** 12 July 2026  
> **Project root:** `C:\Users\Aftab khan\BRICKS-MAKER-ADVERTISEMENT-STUDIO`  
> **Status:** Frontend VFX Studio activated; database/API/AI-worker foundation working; provider routing and actual generation engine integration pending.

---

## 1. Project Overview

**Bricks Maker Advertisement Studio** is a monorepo-based advertisement creation platform containing:

- Public marketing website
- Project/dashboard pages
- Templates and gallery
- Video editor
- VFX Studio
- AI text-to-video workflow
- Render/export workflow
- Admin application
- API backend
- Render worker
- AI worker
- Shared UI, types, validation, effects and editor packages

### Product direction

The product should be **cloud-first and cost-controlled**:

- Normal editing must remain AI-free wherever possible.
- Paid AI should be used only for generative features.
- Local Wan2.1 should remain an optional fallback.
- Users should be able to connect their own provider keys.
- Provider selection should support `auto` mode.
- Cost limits, rate limits and provider availability must be checked before dispatching a job.

---

## 2. Important Project Locations

### Current main project

```text
C:\Users\Aftab khan\BRICKS-MAKER-ADVERTISEMENT-STUDIO
```

### Old stable project

```text
C:\Users\Aftab khan\BRICK-MAKER-IDA
```

### Old full VFX Studio source

```text
C:\Users\Aftab khan\VIDEO-VFX-STUDIO-FINAL-FRONTEND-BACKEND\VIDEO-VFX-STUDIO-FINAL-FRONTEND-BACKEND
```

### Existing Wan2.1 model

```text
C:\Users\Aftab khan\BRICK-MAKER-IDA\models\wan2.1\Wan2.1-T2V-1.3B
```

### Hugging Face cache copy

```text
C:\Users\Aftab khan\.cache\huggingface\hub\models--Wan-AI--Wan2.1-T2V-1.3B
```

The model should not be duplicated inside the Git repository. It should be connected through an environment variable or internal model-storage path.

---

## 3. Current Confirmed Status

### 3.1 Frontend

Completed:

- Main frontend is running with Vite, React and TypeScript.
- Final VFX Studio frontend was migrated into the current monorepo.
- VFX Studio is activated from `apps/web/src/App.tsx`.
- VFX Studio UI opens successfully.
- Strict TypeScript errors from the migrated VFX frontend were fixed.
- Frontend typecheck and production build passed.
- Firebase dependency was removed from the migrated Studio frontend.
- Existing Studio controls, panels and services were preserved rather than redesigned.
- Templates/Flyer page and other previously migrated public pages are active.
- Git checkpoint for the VFX Studio frontend was created.

Current limitation:

- The UI is active, but many advanced service endpoints are not migrated yet.
- Actual AI video output is not produced yet.
- Advanced panels may still show API errors until their backend modules are migrated.

### 3.2 API backend

Completed:

- Current backend uses **Fastify 5**.
- API health endpoint works.
- SQLite database foundation is initialized with `node:sqlite`.
- Database uses WAL mode, foreign keys and a busy timeout.
- Phase-1 schema was created.
- `ProcessingJobModel` is working.
- `VideoModel` with technical metadata is working.
- `POST /api/video/generate` works.
- `GET /api/video/jobs/:jobId` works.
- Jobs persist in SQLite.
- API response shape matches the current VFX Studio frontend contract.
- API-to-AI-worker dispatch client was created.
- Fastify API successfully sends accepted generation requests to the AI worker.
- API and worker connection test passed.
- Git checkpoints were created for backend/API foundation and API-worker integration.

### 3.3 AI worker

Completed:

- Python 3.11 virtual environment created.
- FastAPI worker foundation created.
- Worker health endpoint works on port `8100`.
- Worker `/generate` request contract works.
- `pyproject.toml` was fixed to UTF-8 without BOM.
- AI worker package installed in editable mode.
- API → AI Worker request flow tested successfully.

Current limitation:

- Worker currently accepts a request but does not run actual Wan2.1 inference.
- Worker does not yet send progress/completion callbacks to the Fastify API.
- Worker does not yet create a video file.

### 3.4 Git

Completed:

- VFX Studio frontend migration committed.
- Database, jobs and video API foundation committed.
- AI worker foundation committed.
- API-to-worker connection committed.
- Latest known working state was committed before system restart.

---

## 4. Current Architecture

```text
Browser / VFX Studio UI
          |
          | POST /api/video/generate
          v
Fastify API — apps/api
          |
          | 1. Validate request
          | 2. Create SQLite processing job
          | 3. Select provider
          | 4. Dispatch generation
          v
Provider Router
   |              |               |
   |              |               |
Local Wan2.1   Cloud Provider   User-owned API key
   |
   v
Python AI Worker — apps/ai-worker
   |
   | Generate clips / return progress / output URL
   v
Storage + Render Worker + FFmpeg
   |
   v
GET /api/video/jobs/:jobId
   |
   v
Frontend polling and final video result
```

### Current implemented portion

```text
Frontend
   -> Fastify API
   -> SQLite job record
   -> AI Worker request accepted
```

### Still pending

```text
Provider Router
   -> Actual Wan2.1/cloud generation
   -> Job progress callback
   -> Video metadata save
   -> Storage
   -> Export/render
   -> Final URL returned to frontend
```

---

## 5. Database Foundation

### Current Phase-1 tables

#### `projects`

Stores:

- Project ownership
- Name and description
- Language
- Status
- Project metadata JSON
- Created and updated timestamps

#### `processing_jobs`

Stores:

- User and project
- Job type
- Provider and model
- Status and progress
- Stage
- Payload and result JSON
- Error
- Retry count
- Estimated and actual cost
- Created, updated, started and completed timestamps

#### `videos`

Stores:

- User, project and job references
- Title and original filename
- Source type
- Provider and model
- URL, storage key and thumbnail
- Duration
- Width and height
- FPS
- Codec and bitrate
- Format and MIME type
- Quality and aspect ratio
- File size
- Language and status
- Additional metadata JSON
- Created and updated timestamps

### Planned later tables

- `video_prompts`
- `captions`
- `caption_entries`
- `voice_templates`
- `cloned_voices`
- `project_versions`
- `usage_tracking`
- `rate_limits`
- Provider credentials metadata
- Render queue records
- Export records
- Audit logs

Secrets must not be stored directly in plain-text database fields.

---

## 6. Current API Contract

### Health

```http
GET /api/health
```

Expected summary:

```json
{
  "status": "ok",
  "service": "api",
  "database": "ready"
}
```

### Start video generation

```http
POST /api/video/generate
Content-Type: application/json
```

Example request:

```json
{
  "prompts": [
    {
      "id": "prompt-1",
      "text": "A luxury black sports car speeds through a neon-lit futuristic city at night",
      "duration": 6
    }
  ],
  "format": "mp4",
  "quality": "1080p",
  "aspectRatio": "16:9",
  "language": "en"
}
```

Expected accepted response:

```json
{
  "jobId": "generated-uuid",
  "status": "generating",
  "estimatedTime": 15,
  "progress": 1
}
```

### Check job status

```http
GET /api/video/jobs/:jobId
```

Expected in-progress response:

```json
{
  "jobId": "generated-uuid",
  "status": "generating",
  "estimatedTime": 0,
  "progress": 1,
  "stage": "accepted_by_ai_worker"
}
```

Expected completed response after engine integration:

```json
{
  "jobId": "generated-uuid",
  "status": "ready",
  "progress": 100,
  "videoUrl": "/media/videos/final-video.mp4",
  "failedClips": []
}
```

---

## 7. AI Worker Contract

### Health

```http
GET http://127.0.0.1:8100/health
```

### Accept generation request

```http
POST http://127.0.0.1:8100/generate
Content-Type: application/json
```

Example:

```json
{
  "job_id": "test-job-001",
  "prompts": [
    "A luxury black sports car speeds through a neon-lit city at night"
  ],
  "format": "mp4",
  "quality": "1080p",
  "aspect_ratio": "16:9",
  "language": "en",
  "provider": "local-ai-worker",
  "model": "wan2.1"
}
```

Current worker response:

```json
{
  "jobId": "test-job-001",
  "status": "accepted",
  "promptCount": 1,
  "provider": "local-ai-worker",
  "model": "wan2.1"
}
```

This currently confirms transport only, not actual generation.

---

## 8. Current Confirmed File and Folder Tree

> This tree is based on the confirmed monorepo structure and the files created during the current work. Generated folders such as `node_modules`, `.venv`, `dist`, caches and large model files are intentionally excluded.

```text
BRICKS-MAKER-ADVERTISEMENT-STUDIO/
|
|-- package.json
|-- package-lock.json
|-- tsconfig.base.json
|-- .gitignore
|-- README.md
|
|-- apps/
|   |
|   |-- web/
|   |   |-- package.json
|   |   |-- tsconfig.json
|   |   |-- vite.config.ts
|   |   |-- index.html
|   |   |
|   |   `-- src/
|   |       |-- App.tsx
|   |       |-- main.tsx
|   |       |-- app/
|   |       |-- assets/
|   |       |-- components/
|   |       |   `-- layout/
|   |       |       |-- Topbar.tsx
|   |       |       |-- Navbar.tsx
|   |       |       |-- FeatureStrip.tsx
|   |       |       |-- Footer.tsx
|   |       |       `-- PageShell.tsx
|   |       |-- constants/
|   |       |-- context/
|   |       |-- data/
|   |       |-- hooks/
|   |       |-- pages/
|   |       |   |-- public/
|   |       |   |-- studio/
|   |       |   |-- HomePage.tsx
|   |       |   |-- DashboardPage.tsx
|   |       |   `-- ProjectsPage.tsx
|   |       |-- routes/
|   |       |-- services/
|   |       |-- styles/
|   |       `-- features/
|   |           `-- vfx-studio/
|   |               |-- components/
|   |               |   |-- Common/
|   |               |   `-- VideoStudio/
|   |               |-- config/
|   |               |-- constants/
|   |               |-- context/
|   |               |   |-- VideoStudioContext.tsx
|   |               |   `-- VideoStudioProvider.tsx
|   |               |-- hooks/
|   |               |-- pages/
|   |               |   `-- VideoStudioPage.tsx
|   |               |-- services/
|   |               |-- styles/
|   |               |-- types/
|   |               `-- utils/
|   |
|   |-- api/
|   |   |-- package.json
|   |   |-- tsconfig.json
|   |   |-- src/
|   |   |   |-- index.ts
|   |   |   |-- database/
|   |   |   |   |-- connection.ts
|   |   |   |   `-- schema.sql
|   |   |   |-- models/
|   |   |   |   |-- ProcessingJob.model.ts
|   |   |   |   `-- Video.model.ts
|   |   |   |-- modules/
|   |   |   |   `-- video/
|   |   |   |       `-- video.routes.ts
|   |   |   `-- services/
|   |   |       |-- aiWorker.client.ts
|   |   |       `-- aiProvider.router.ts      [NEXT / NOT YET CONFIRMED]
|   |   `-- storage/
|   |       `-- video-studio.db               [LOCAL RUNTIME FILE]
|   |
|   |-- admin/
|   |-- render-worker/
|   `-- ai-worker/
|       |-- .gitignore
|       |-- pyproject.toml
|       |-- .env                              [LOCAL CONFIG]
|       `-- src/
|           |-- __init__.py
|           `-- main.py
|
`-- packages/
    |-- ui/
    |-- effects/
    |-- editor-core/
    |-- studio-core/
    |-- render-core/
    |-- shared-types/
    |-- validation/
    |-- config/
    `-- utils/
```

---

## 9. Runtime Ports

```text
Frontend Vite:       5173
Frontend fallback:   5174
Fastify API:         3000
Python AI Worker:    8100
```

---

## 10. Commands to Start After Restart

Open separate PowerShell windows.

### Shell 1 — AI Worker

```powershell
cd "C:\Users\Aftab khan\BRICKS-MAKER-ADVERTISEMENT-STUDIO\apps\ai-worker"
.\.venv\Scripts\Activate.ps1
python -m uvicorn src.main:app --host 127.0.0.1 --port 8100
```

### Shell 2 — Fastify API

```powershell
cd "C:\Users\Aftab khan\BRICKS-MAKER-ADVERTISEMENT-STUDIO"
npm run dev --workspace=@bricks-maker/api
```

### Shell 3 — Web frontend

```powershell
cd "C:\Users\Aftab khan\BRICKS-MAKER-ADVERTISEMENT-STUDIO"
npm run dev:web
```

### Health checks

```powershell
Invoke-RestMethod http://127.0.0.1:3000/api/health
Invoke-RestMethod http://127.0.0.1:8100/health
```

---

## 11. Configuration Strategy

### API environment

Recommended:

```env
API_HOST=127.0.0.1
API_PORT=3000
AI_WORKER_URL=http://127.0.0.1:8100
SQLITE_DB_PATH=C:\Users\Aftab khan\BRICKS-MAKER-ADVERTISEMENT-STUDIO\apps\api\storage\video-studio.db
AI_PROVIDER=auto
ALLOW_PAID_CLOUD=false
DAILY_AI_BUDGET_USD=0
MONTHLY_AI_BUDGET_USD=0
```

### AI worker environment

```env
WAN_MODEL_PATH=C:\Users\Aftab khan\BRICK-MAKER-IDA\models\wan2.1\Wan2.1-T2V-1.3B
AI_WORKER_HOST=127.0.0.1
AI_WORKER_PORT=8100
```

Do not commit real provider keys.

---

## 12. Provider Router Plan

### Supported provider names

```text
auto
local-wan
huggingface
google
openai
```

### `auto` selection order

1. Use a user-owned API key when available and allowed.
2. Use local Wan2.1 when the local worker and runtime are available.
3. Use a free or low-cost configured cloud provider.
4. Use paid cloud only when explicitly allowed and within budget.
5. Reject the request when no safe provider is available.

### Required checks

- Requested provider
- User-owned key availability
- Local worker availability
- Local model availability
- CPU/runtime availability
- Paid-cloud permission
- Estimated job cost
- Remaining daily/monthly budget
- Provider rate limit
- Model capability
- Requested duration/resolution
- Provider health

### Recommended adapter structure

```text
services/providers/
|-- provider.types.ts
|-- localWan.provider.ts
|-- huggingFace.provider.ts
|-- google.provider.ts
|-- openAI.provider.ts
`-- providerRouter.ts
```

---

## 13. What Should Remain AI-Free

- Trim
- Crop
- Resize
- Merge
- Split
- Reorder clips
- Text and titles
- Watermark
- Audio volume
- Format conversion
- Thumbnail extraction
- Built-in transitions
- Built-in VFX
- Templates
- Caption editing
- Timeline editing
- Normal export

---

## 14. Features That May Use AI

- Text-to-video
- Image-to-video
- Generative background replacement
- Script generation
- Voice generation/cloning
- Automatic dubbing
- Lip-sync
- Generative B-roll
- Style transfer
- Generative VFX
- Prompt enhancement

Each paid feature must record provider, model, duration, estimated cost and actual cost.

---

## 15. Old VFX Backend Migration Map

### Already adapted

```text
Old Express route                         Current Fastify module
---------------------------------------------------------------------------
POST /api/video/generate                 implemented
GET  /api/video/jobs/:jobId              implemented
ProcessingJob model                      migrated/adapted
Video model                              migrated with expanded metadata
SQLite connection                        migrated/adapted
```

### Pending route groups

```text
/api/video/upload
/api/video/edit
/api/video/:id DELETE
/api/video/merge
/api/video/export
/api/video/export/formats
/api/video/export/estimate
/api/voice
/api/captions
/api/script
/api/watermark
/api/music
/api/regenerate
/api/lipsync
/api/dub
/api/config
/api/timeline
/api/titles
/api/vfx
/api/ai-vfx
/api/pro
/api/distribute
/api/settings
/api/animations
```

Migrate module by module rather than copying the old Express backend blindly.

---

## 16. Work Completed in Order

1. Monorepo foundation prepared.
2. Public frontend pages migrated.
3. Final VFX Studio frontend audited.
4. VFX Studio migrated into `apps/web/src/features/vfx-studio`.
5. Missing frontend dependencies installed.
6. Firebase removed.
7. Strict TypeScript errors fixed.
8. VFX Studio activated in `App.tsx`.
9. Frontend typecheck/build passed.
10. VFX Studio UI opened successfully.
11. Old backend dependencies audited.
12. Phase-1 SQLite schema created.
13. SQLite connection created.
14. API health/database check passed.
15. ProcessingJob model created.
16. Video metadata model created.
17. Fastify video generation/status routes created.
18. API route tests passed.
19. Python FastAPI worker foundation created.
20. Worker environment/dependencies installed.
21. Worker health/generation-contract tests passed.
22. Fastify AI worker client created.
23. API-to-worker dispatch added.
24. Live API → worker request test passed.
25. Current stable work committed to Git.

---

## 17. Immediate Next Work

### Next exact milestone

**Provider Router Foundation**

1. Create provider types.
2. Add `auto` selection.
3. Add local-worker health check.
4. Add budget policy.
5. Store selected provider/model in job records.
6. Return a clear error when no safe provider exists.
7. Add router tests.

### After provider router

1. Add worker progress callback/polling contract.
2. Add worker task state.
3. Connect existing Wan2.1 path.
4. Verify Torch/CUDA/runtime dependencies.
5. Run a low-resolution 6-second local test.
6. Save generated output and metadata.
7. Mark SQLite job done/error.
8. Return final `videoUrl` to the frontend.

---

## 18. Full Roadmap

### Phase A — Frontend completion

- Complete remaining 2–3 page migrations.
- Keep Topbar and Navbar separate.
- Keep `App.tsx` clean.
- Complete visual checks.
- Apply final polish after functionality is stable.
- Integrate the final animation pack at the end.

### Phase B — Provider and job architecture

- Provider router
- Cost rules
- Rate limiting
- User-owned keys
- Provider health checks
- Retries and cancellation
- Progress stages
- Restart recovery

### Phase C — Local Wan2.1 integration

- Read `WAN_MODEL_PATH`
- Validate model files
- Detect CUDA/CPU
- Install compatible Torch/Diffusers/runtime
- Lazy model loading
- Memory cleanup
- Low-resolution 6-second test
- Multi-clip generation
- Failed-clip tracking

### Phase D — Cloud providers

- Hugging Face adapter
- Google adapter
- OpenAI-compatible adapter where applicable
- Capability map
- Cost estimates
- BYOK encryption
- Failover rules

### Phase E — Render and FFmpeg

- Upload storage
- Metadata extraction
- Thumbnail generation
- Transcoding
- Merge
- Timeline render
- Captions burn-in
- Watermark
- Audio mixing
- Export/download

### Phase F — Remaining Studio modules

- Voice Lab
- Captions
- Titles
- Music
- Watermark
- Lip-sync
- Auto-dub
- AI VFX
- Video regeneration
- Distribution
- Settings
- Animation modules

### Phase G — Admin and business controls

- User management
- Usage dashboard
- Provider-cost dashboard
- Daily/monthly budgets
- Queue view
- Failed jobs/retries
- Storage usage
- Plan limits
- Audit logs

### Phase H — Security

- Authentication decision
- No Firebase unless explicitly reconsidered
- Secure sessions
- Ownership checks
- Signed URLs
- Key encryption
- Upload validation
- CORS allowlist
- Rate limiting
- Secret rotation

### Phase I — Testing

- API unit tests
- Provider-router tests
- Database tests
- Worker contract tests
- FFmpeg tests
- Frontend service tests
- End-to-end generation
- Restart recovery
- Cost-limit tests
- Provider outage tests

### Phase J — Deployment

- Web/API/worker deployment
- CPU worker deployment
- Object storage
- Managed database migration
- Queue service
- Monitoring/logging
- Backup/restore
- Domain/SSL
- Staged tests: 100 users, then 500, then scale upward

---

## 19. Scalability Plan

### Development

```text
SQLite
Local filesystem
Single Fastify API
Single AI Worker
Optional local Wan2.1
```

### Early production

```text
Managed API
Object storage
Managed relational database
Job queue
Separate render worker
Cloud AI providers
Limited local/private worker
```

### Larger scale

```text
Load-balanced APIs
Managed PostgreSQL
Redis/cloud queue
Multiple render workers
Multiple CPU workers
Provider failover
Central cost controls
Per-tenant limits
Metrics/tracing
```

SQLite is suitable for the current foundation, not the final 10,000-user high-concurrency database.

---

## 20. Risks and Controls

### AI cost risk

- AI-free editing
- BYOK
- Provider router
- Budget limits
- Duration/resolution caps
- Confirmation before paid jobs
- Usage logging

### CPU memory risk

- Lazy loading
- Low-resolution default
- One local generation at a time
- Model unloading
- Queue
- Cloud fallback

### Backend complexity risk

- Module-by-module migration
- Fastify-native modules
- Shared types
- Separate workers
- Small Git checkpoints

### Repository risk

Do not commit:

- Models
- `.venv`
- Runtime databases
- Generated media
- Provider keys

---

## 21. Git Rules

Recommended exclusions:

```gitignore
node_modules/
dist/
.venv/
.env
*.db
*.db-wal
*.db-shm
storage/videos/
storage/audio/
storage/exports/
models/
.cache/
__pycache__/
*.pyc
```

Commit after each stable milestone:

```powershell
git add -A
git commit -m "clear milestone message"
git status
git log --oneline -5
```

---

## 22. Definition of Done for Real Video Generation

- Frontend sends a valid prompt.
- Fastify validates it.
- Provider router selects a provider.
- Job is saved in SQLite.
- Worker starts actual generation.
- Progress updates appear.
- Worker creates a playable video.
- Metadata is extracted.
- Video record is saved.
- Job becomes `done`.
- Status endpoint returns `ready`.
- Frontend receives `videoUrl`.
- Video plays in VFX Studio.
- Failure returns a clear error.
- Cost/provider/model are recorded.
- Typecheck/tests pass.
- Git checkpoint is created.

---

## 23. Exact Tree Refresh Command

Run from the project root to generate the exact latest local tree while excluding heavy/generated folders:

```powershell
cd "C:\Users\Aftab khan\BRICKS-MAKER-ADVERTISEMENT-STUDIO"

$Exclude = @(
  ".git",
  "node_modules",
  "dist",
  ".venv",
  "__pycache__",
  ".cache"
)

function Show-ProjectTree {
  param(
    [string]$Path,
    [string]$Prefix = ""
  )

  $Items = Get-ChildItem -LiteralPath $Path -Force |
    Where-Object { $Exclude -notcontains $_.Name } |
    Sort-Object @{ Expression = { -not $_.PSIsContainer } }, Name

  for ($i = 0; $i -lt $Items.Count; $i++) {
    $Item = $Items[$i]
    $IsLast = $i -eq ($Items.Count - 1)
    $Branch = if ($IsLast) { "`-- " } else { "|-- " }

    "$Prefix$Branch$($Item.Name)"

    if ($Item.PSIsContainer) {
      $ChildPrefix = if ($IsLast) { "$Prefix    " } else { "$Prefix|   " }
      Show-ProjectTree -Path $Item.FullName -Prefix $ChildPrefix
    }
  }
}

$Root = Get-Location
$Tree = @(
  $Root.Path
  Show-ProjectTree -Path $Root.Path
)

$Tree | Set-Content ".\PROJECT_TREE.txt" -Encoding UTF8
$Tree
```

---

## 24. Working Rules

- Give only one exact implementation step at a time.
- Do not redesign working pages without approval.
- Before design/architecture changes, review advantages, disadvantages, risks, performance, cost, scalability and maintenance.
- Keep Topbar and Navbar separate.
- Keep `App.tsx` clean.
- Avoid Firebase.
- Use Fastify for the main API.
- Use Python worker for model inference.
- Keep heavy engines separate from the web frontend.
- Use Git checkpoints after stable milestones.
- Prioritize cost control and maintainability.

---

## 25. Current One-Line Summary

**The VFX Studio frontend, SQLite metadata foundation, Fastify video job API, Python AI-worker contract and API-to-worker connection are working; the next unconfirmed task is the cost-aware provider router, followed by real Wan2.1/cloud generation, progress updates, storage and export.**
