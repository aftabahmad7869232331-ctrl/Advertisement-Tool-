# Architecture

## Product Scope

Bricks Maker Advertisement Studio contains two main product workflows.

### Video Workflow

Input:
- Existing uploaded video

Maximum duration:
- 30 seconds

Processing:
- Trim
- Text
- Captions
- Music
- Watermark
- Built-in VFX
- Export

### Studio Workflow

Input:
- Master text prompt

Output:
- Five segments
- Six seconds per segment
- Total duration of 30 seconds

Processing:
- Scene planning
- Segment generation
- Segment regeneration
- Segment ordering
- Style consistency
- Built-in effects
- Transitions
- Audio
- Final merge

## Primary Architecture

Frontend
  |
  v
API
  |
  +--> Database and storage
  |
  +--> Render queue --> Render worker
  |
  +--> AI queue -----> AI worker

## Processing Policy

Use this order wherever practical:

1. CSS effect
2. Canvas effect
3. FFmpeg effect
4. WebGL effect
5. Local AI model
6. Paid external AI API

This reduces AI dependency and operating cost.

## Worker Separation

The API must remain responsive.

Long-running work must run outside the API process.

Examples:
- AI generation
- Video transcoding
- Segment merging
- Heavy effects
- Final export

## Frontend Structure

Pages compose screens.

Features contain business-specific UI and state.

Components contain reusable UI.

Services contain API communication.

Shared UI moves into packages/ui only after it is reused across applications.

## Effect Engine

Each effect should define:

- Unique effect ID
- Display name
- Category
- Render method
- Mobile support
- CPU or CPU requirement
- Default settings
- Preview asset
- Fallback effect
- Lazy-load behavior

## Migration Policy

1. Keep the previous project unchanged
2. Audit existing files
3. Copy one module at a time
4. Fix imports
5. Run development test
6. Run production build
7. Record migration result
8. Continue to the next module

Never migrate node_modules, virtual environments, build folders, caches, temporary files, or secret environment files.
