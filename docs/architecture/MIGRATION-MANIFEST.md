# Migration Manifest

## Purpose

This document maps the current stable project into the new large-scale architecture.

Source project:

`C:\Users\Aftab khan\BRICK-MAKER-IDA`

Target project:

`C:\Users\Aftab khan\BRICKS-MAKER-ADVERTISEMENT-STUDIO`

## Migration Rules

1. Copy first; do not move.
2. Keep the source project unchanged.
3. Migrate one module at a time.
4. Do not copy node_modules, dist, build, caches, virtual environments, secrets, generated files, or model checkpoints.
5. Run typecheck and build after every migration phase.
6. Record every migrated file and destination.
7. Do not redesign during migration.
8. Do not merge unrelated frontend and backend logic.
9. Shared code moves to packages only when reuse is proven.
10. AI and render execution must remain outside the frontend and API request process.

## Migration Phases

| Phase | Source area | Target area | Status |
|---|---|---|---|
| 1 | Frontend application shell | apps/web | Pending |
| 2 | Layout components | apps/web/src/components/layout | Pending |
| 3 | Public pages | apps/web/src/pages/public | Pending |
| 4 | Video page and editor UI | apps/web/src/features/video | Pending |
| 5 | Studio page and generation UI | apps/web/src/features/studio | Pending |
| 6 | Frontend services and API clients | apps/web/src/services | Pending |
| 7 | Shared frontend types | packages/shared-types | Pending |
| 8 | Reusable UI components | packages/ui | Pending |
| 9 | Existing backend API | apps/api | Pending |
| 10 | Render-related code | apps/render-worker | Pending |
| 11 | AI and Wan2.1 code | apps/ai-worker | Pending |
| 12 | Built-in effects | packages/effects | Pending |
| 13 | Editor business logic | packages/editor-core | Pending |
| 14 | Studio workflow logic | packages/studio-core | Pending |
| 15 | Render contracts and helpers | packages/render-core | Pending |
| 16 | Validation schemas | packages/validation | Pending |
| 17 | Shared configuration | packages/config | Pending |
| 18 | Utilities | packages/utils | Pending |
| 19 | Tests | tests and colocated test files | Pending |
| 20 | Documentation and deployment files | docs and infrastructure | Pending |

## Initial Source-to-Target Map

### Frontend

| Source pattern | Target |
|---|---|
| src/app | apps/web/src/app |
| src/components/layout | apps/web/src/components/layout |
| src/components/common | apps/web/src/components/common |
| src/components/forms | apps/web/src/components/forms |
| src/components/media | apps/web/src/components/media |
| src/pages | apps/web/src/pages |
| src/routes | apps/web/src/app/router |
| src/services | apps/web/src/services |
| src/hooks | apps/web/src/hooks |
| src/context | apps/web/src/context |
| src/styles | apps/web/src/styles |
| src/assets | apps/web/src/assets |
| src/data | apps/web/src/data |
| src/constants | apps/web/src/constants |

### Product Features

| Source area | Target |
|---|---|
| Video page UI and controls | apps/web/src/features/video |
| Studio page UI and controls | apps/web/src/features/studio |
| Projects | apps/web/src/features/projects |
| Templates | apps/web/src/features/templates |
| Gallery | apps/web/src/features/gallery |
| Growth | apps/web/src/features/growth |
| Account | apps/web/src/features/account |
| Billing | apps/web/src/features/billing |

### Backend

| Source area | Target |
|---|---|
| Existing API server | apps/api/src |
| Authentication | apps/api/src/auth |
| Users | apps/api/src/users |
| Projects | apps/api/src/projects |
| Uploads | apps/api/src/uploads |
| Video APIs | apps/api/src/video |
| Studio APIs | apps/api/src/studio |
| Render jobs | apps/api/src/render-jobs |
| Admin APIs | apps/api/src/admin |
| Storage coordination | apps/api/src/storage |
| Queue coordination | apps/api/src/queues |

### Workers

| Source area | Target |
|---|---|
| FFmpeg and render jobs | apps/render-worker/src |
| Segment merge | apps/render-worker/src/jobs |
| Preview render | apps/render-worker/src/jobs |
| Final render | apps/render-worker/src/jobs |
| Wan2.1 execution | apps/ai-worker/src |
| AI segment generation | apps/ai-worker/src/jobs |
| AI pipelines | apps/ai-worker/src/pipelines |
| Model loading | apps/ai-worker/src/models |

### Shared Packages

| Shared responsibility | Target |
|---|---|
| Reusable React components | packages/ui |
| VFX effects and metadata | packages/effects |
| Trim and timeline logic | packages/editor-core |
| Five-segment workflow | packages/studio-core |
| Render contracts and helpers | packages/render-core |
| API and domain types | packages/shared-types |
| Zod schemas | packages/validation |
| Shared constants and config | packages/config |
| Generic helpers | packages/utils |

## Migration Log

| Date | Phase | Source | Destination | Result | Notes |
|---|---|---|---|---|---|

## Approval Checkpoints

Before each migration phase confirm:

- Source files identified
- Target folders prepared
- Import impact reviewed
- Dependencies identified
- No secret files included
- Backup available
- Test command defined
- Rollback path available
