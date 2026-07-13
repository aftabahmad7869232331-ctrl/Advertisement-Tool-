# Backend Expansion Foundation

## Current runtime boundaries

- `apps/api`: Fastify orchestration, validation, database, storage and delivery
- `apps/ai-worker`: provider inference and temporary artifacts
- `apps/render-worker`: future FFmpeg effects and export execution
- Browser: API-only access; no filesystem, database or worker access

## API foundation

- `app.ts`: reusable Fastify application factory
- `config/environment.ts`: validated non-secret runtime configuration
- `plugins/application.plugin.ts`: request correlation, safe 404 and global errors
- `modules/health`: liveness and dependency readiness endpoints
- `queues/types.ts`: transport-neutral queue contract for later Redis adoption
- `runtime/startupState.ts`: process startup diagnostics

## Operational endpoints

- `GET /api/health`: lightweight process/database liveness
- `GET /api/ready`: database, storage, AI-worker and local-Wan readiness

AI-worker availability is reported by readiness but does not make the API
itself unavailable. This keeps project, account and stored-video APIs usable
when CPU or cloud inference is offline.

## Wan2.1 ownership

Large Wan2.1 installation, model download, CPU drivers and model-path setup are
an operator/user task. Source code must not download or duplicate the model
automatically. The worker consumes `WAN_MODEL_PATH` and reports readiness.

## Before Phase 4

1. User installs the selected Wan2.1 model outside Git.
2. User configures `WAN_MODEL_PATH` locally.
3. Worker `/health` must report `localWanReady: true` before local selection.
4. Phase 4 must preserve cloud BYOK and safe fallback behavior.
