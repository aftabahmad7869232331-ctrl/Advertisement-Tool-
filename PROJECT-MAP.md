# Project Map

## Root Structure

| Path | Responsibility |
|---|---|
| apps/web | Main React frontend |
| apps/api | Main backend API |
| apps/admin | Separate admin dashboard |
| apps/render-worker | Video rendering and VFX processing |
| apps/ai-worker | AI model and text-to-video jobs |
| packages/ui | Shared user-interface components |
| packages/effects | Built-in VFX effects and presets |
| packages/editor-core | Video editing business logic |
| packages/studio-core | Five-segment Studio workflow |
| packages/render-core | Shared render pipeline code |
| packages/shared-types | Shared application types |
| packages/validation | Shared input validation |
| packages/config | Shared configuration |
| packages/utils | Shared utilities |
| infrastructure | Deployment and runtime infrastructure |
| storage | Local development storage locations |
| docs | Project documentation |
| scripts | Setup, test, backup, and cleanup scripts |
| tests | Cross-application tests |

## Application Boundaries

### apps/web

Responsible for:
- Public website
- Video interface
- Studio interface
- Projects
- Templates
- Gallery
- User account interface

Must not contain:
- Direct AI model execution
- FFmpeg render jobs
- Database credentials
- CPU management

### apps/api

Responsible for:
- Authentication
- Users
- Projects
- Upload APIs
- Render job APIs
- Studio job APIs
- Billing
- Admin APIs
- Storage coordination

Must not perform long-running CPU rendering directly.

### apps/render-worker

Responsible for:
- FFmpeg processing
- Built-in effects
- Segment merging
- Preview rendering
- Final rendering
- Render progress
- Retry and cleanup

### apps/ai-worker

Responsible for:
- Wan2.1 execution
- Six-second segment generation
- AI job progress
- Model loading
- CPU and CPU fallback logic

## Shared Packages

Shared packages must not depend directly on application-specific page components.

Applications may import packages.

Packages should not import from apps.

## Storage Rules

| Folder | Use |
|---|---|
| storage/uploads | Temporary uploaded source files |
| storage/projects | Local project data |
| storage/renders | Completed renders |
| storage/previews | Preview files |
| storage/temp | Temporary processing files |
| storage/models | Local AI models |

Storage folders are runtime data locations and must not contain source code.
