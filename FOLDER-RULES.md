# Folder Rules

## General Rules

1. Source code must stay inside apps or packages.
2. Runtime files must stay inside storage.
3. Documentation must stay inside docs.
4. Deployment configuration must stay inside infrastructure.
5. Reusable code must not be duplicated across applications.
6. Do not move files without updating imports and documentation.
7. Test after every structural change.
8. Never store API keys, passwords, tokens, or secrets in source files.

## apps

Applications are independently runnable products or processes.

### apps/web
Contains the main public frontend and user-facing product interface.

Allowed:
- Pages
- Routes
- Feature UI
- Frontend state
- API clients
- Browser utilities

Not allowed:
- AI model execution
- FFmpeg processing
- Database credentials
- Server-only secrets
- CPU worker code

### apps/api
Contains the main backend API.

Allowed:
- Routes
- Controllers
- Services
- Authentication
- Database access
- Queue coordination
- Storage coordination

Not allowed:
- React components
- Long-running render execution
- Direct heavy AI generation inside request handlers

### apps/admin
Contains the separate administrative interface.

Allowed:
- User management UI
- Render monitoring UI
- Billing and usage UI
- System health UI

It should consume admin APIs from apps/api.

### apps/render-worker
Contains long-running video processing.

Allowed:
- FFmpeg
- Video transcoding
- Effects processing
- Segment merge
- Preview render
- Final export
- Cleanup jobs

### apps/ai-worker
Contains AI model execution.

Allowed:
- Wan2.1
- Segment generation
- Model loading
- Prompt execution
- AI job progress
- CPU or CPU fallback

## packages

Packages contain reusable code.

### packages/ui
Shared UI components used by more than one frontend application.

Do not move a component here until it is genuinely reusable.

### packages/effects
Built-in effects, effect metadata, presets, previews, and fallbacks.

### packages/editor-core
Pure editing logic such as trim calculations, clip state, timeline rules, and undo history.

### packages/studio-core
Five-segment Studio planning, ordering, consistency, and workflow logic.

### packages/render-core
Shared render instructions, effect translation, FFmpeg helpers, and render contracts.

### packages/shared-types
Shared TypeScript types and API contracts.

### packages/validation
Shared request and data validation schemas.

### packages/config
Shared non-secret configuration.

### packages/utils
Small reusable utilities that do not belong to a specific feature.

## Dependency Direction

Allowed:

apps -> packages

packages -> other packages when justified

Not allowed:

packages -> apps

web -> render-worker internals

web -> ai-worker internals

render-worker -> web

ai-worker -> web

## storage

Storage contains runtime data only.

Do not commit generated files.

- uploads: temporary uploaded files
- projects: local project records
- renders: completed output
- previews: generated previews
- temp: temporary processing files
- models: local AI models

## docs

Documentation must describe the current structure.

When architecture changes, update the relevant documentation in the same task.

## scripts

PowerShell and automation scripts belong here.

Scripts must:
- Validate paths
- Fail safely
- Avoid deleting data without confirmation
- Print clear success or error messages

## tests

Application-specific tests may remain near source files.

Cross-application and system-level tests belong inside the root tests folder.

## Migration Rules

1. Copy, do not move, from the stable project initially.
2. Migrate one module at a time.
3. Do not copy node_modules.
4. Do not copy Python virtual environments.
5. Do not copy caches or build output.
6. Do not copy secret .env files.
7. Test development mode after each migration.
8. Test production build after each completed phase.
9. Keep the old stable project unchanged until migration is verified.
