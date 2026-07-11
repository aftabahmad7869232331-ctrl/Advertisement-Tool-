# Environment Variables

## General Policy

1. `.env.example` is committed.
2. `.env` is never committed.
3. Secrets must never be stored in frontend variables.
4. Browser-accessible values must use the approved `VITE_` prefix.
5. Every environment variable must be documented here.
6. Applications must validate required environment variables at startup.
7. Production secrets must come from the deployment platform or secret manager.
8. Workers and the API should receive only the variables they require.

## Environment Files

Recommended local files:

- `.env`
- `apps/web/.env.local`
- `apps/api/.env`
- `apps/render-worker/.env`
- `apps/ai-worker/.env`

During the initial migration, one root `.env` may be used for local development.

As applications become independently deployable, each application should receive its own environment configuration.

## Public Frontend Variables

Only values safe for browser exposure may use `VITE_`.

Allowed examples:

- Application display name
- API base URL
- Public feature flags
- Duration limits
- Public asset URLs

Not allowed:

- Database credentials
- JWT secrets
- API keys
- Cloud credentials
- Queue credentials
- Admin secrets

## Required Core Variables

### Frontend

- `VITE_API_BASE_URL`
- `VITE_MAX_VIDEO_DURATION_SECONDS`
- `VITE_STUDIO_SEGMENT_COUNT`
- `VITE_STUDIO_SEGMENT_DURATION_SECONDS`

### API

- `API_PORT`
- `CORS_ORIGIN`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `REDIS_URL`

### Render Worker

- `REDIS_URL`
- `RENDER_QUEUE_NAME`
- `FFMPEG_PATH`
- `FFPROBE_PATH`
- `RENDER_DIRECTORY`
- `TEMP_DIRECTORY`

### AI Worker

- `REDIS_URL`
- `AI_QUEUE_NAME`
- `AI_MODEL_PATH`
- `GPU_ENABLED`
- `CPU_FALLBACK_ENABLED`

## Secret Handling

Never:

- Paste keys in source code
- Add keys to screenshots
- Commit `.env`
- Put server secrets in `VITE_` variables
- Store secrets inside documentation examples

Use placeholder values in documentation.

## Validation

Each application should fail at startup with a clear message when a required variable is missing.

Example message:

`DATABASE_URL is required for apps/api`

Do not silently use unsafe production defaults.

## Development Defaults

Safe development defaults may be used for:

- Ports
- Local folder paths
- Feature flags
- Queue names
- Duration limits

Secrets must never receive real default values.

## Production Rules

Production should use:

- Secret manager
- Managed database credentials
- Managed Redis credentials
- Restricted service accounts
- Separate values per environment
- Key rotation
- Audit logging

## Environment Separation

Recommended environments:

- development
- test
- staging
- production

Do not share production credentials with development or testing.
