# Bricks Maker Advertisement Studio

Bricks Maker Advertisement Studio is a focused creative SaaS platform for short-form video production.

## Core Product Areas

### Video
Edit uploaded videos up to 30 seconds.

Planned capabilities:
- Upload and preview
- Trim
- Text and captions
- Music and watermark
- Built-in VFX effects
- Preview and export

### Studio
Generate a 30-second video from five 6-second segments.

Planned workflow:
1. Enter a master prompt
2. Create five scene prompts
3. Generate five 6-second segments
4. Regenerate or reorder individual segments
5. Apply built-in effects and transitions
6. Merge into one 30-second output

For videos longer than 30 seconds, users will be directed to a separate future tool.

## Architecture Principles

- Built-in effects first
- AI used only where it adds unique value
- Frontend, API, AI worker, and render worker remain separated
- Shared code lives inside packages
- Heavy modules use lazy loading
- Mobile supports creation, preview, effects, monitoring, and export
- Advanced processing runs through backend workers
- No direct manual editing inside generated output or model folders

## Current Stage

Large-scale architecture foundation.

The previous stable project remains separate and must not be modified during migration.

## Official Product Name

Bricks Maker Advertisement Studio
