# Backend Folder Concepts

This backend is the API and server layer for Bricks Maker Advertisement Pro. Its job is to power AI generation, campaign data, authentication/session flows, media placeholders, analytics summaries, monitoring, support tickets, and the Wan2.1 video engine bridge.

## Current backend structure

```txt
backend/
  server.ts
  media-ai.ts
  main.py
  requirements.txt
  tsconfig.json
  wan21-status.json
  routes/
  services/
  scripts/
  test_gemini.py
  test_openai.py
```

## Folder responsibilities

### `server.ts`

Main Express server. It currently owns:

- API routing
- Gemini/Imagen endpoints
- auth/session mock endpoints
- campaign CRUD endpoints
- analytics summary endpoint
- media placeholder endpoint
- subscriptions endpoint
- support ticket endpoint
- monitoring endpoint
- Wan2.1 status/install/run/generate endpoints
- Vite middleware for frontend serving in development
- static frontend serving in production

This file is working, but it is now large. The next backend polish should split it into dedicated modules.

### `routes`

Python/FastAPI route folder from earlier backend experiments. Keep only if Python backend remains part of the plan.

Future Express concept:

```txt
backend/routes/
  auth.routes.ts
  campaigns.routes.ts
  analytics.routes.ts
  ai.routes.ts
  media.routes.ts
  support.routes.ts
  wan21.routes.ts
```

### `services`

Python service folder from earlier backend experiments.

Future Express concept:

```txt
backend/services/
  auth.service.ts
  campaign.service.ts
  ai.service.ts
  media.service.ts
  monitoring.service.ts
  support.service.ts
  wan21.service.ts
```

Services should contain business logic. Routes should stay thin.

### `scripts`

Operational scripts for local engines and checks.

Current concepts:

- `check-wan21.js` = quick local Wan2.1 status check.
- `install-wan21.ps1` = Windows install helper.
- `install-wan21.sh` = Linux/macOS install helper.

### `media-ai.ts`

Media/AI related backend concept file. This can become part of `services/ai.service.ts` or `routes/ai.routes.ts` when we split the server.

### `main.py`, `routes/*.py`, `services/*.py`

Python backend pieces. These should either become a separate Python microservice or be removed after the Express backend fully replaces them.

Do not mix Python and Express routes unless the architecture intentionally uses two backend services.

## Current API concepts

### Core

- `GET /api/health`

### Auth/session

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/oauth/callback`
- `GET /api/users/me`
- API key and 2FA mock endpoints

### Campaigns

- `GET /api/campaigns`
- `POST /api/campaigns`
- `GET /api/campaigns/:id`
- `PUT /api/campaigns/:id`
- `PATCH /api/campaigns/:id`
- `DELETE /api/campaigns/:id`

### AI generation

- `POST /api/generate-ad-copy`
- `POST /api/suggest-ad-copy`
- `POST /api/generate-logo`
- `POST /api/generate-ad-image`
- `POST /api/generate-pamphlet`

### Wan2.1 video engine

- `GET /api/wan21/status`
- `POST /api/wan21/install`
- `POST /api/wan21/run-check`
- `POST /api/wan21/reset`
- `POST /api/wan21/generate`

### Monitoring/support/media

- `POST /api/monitoring/events`
- `POST /api/monitoring/errors`
- `GET /api/support/tickets`
- `POST /api/support/tickets`
- `PATCH /api/support/tickets/:id`
- `POST /api/media`
- `GET /api/subscriptions`

## Recommended future backend organization

When we polish backend properly, use this target:

```txt
backend/
  server.ts
  app.ts
  config/
    env.ts
  middleware/
    auth.ts
    errors.ts
    rateLimit.ts
  routes/
    auth.routes.ts
    campaigns.routes.ts
    analytics.routes.ts
    ai.routes.ts
    media.routes.ts
    support.routes.ts
    wan21.routes.ts
  services/
    auth.service.ts
    campaign.service.ts
    analytics.service.ts
    ai.service.ts
    media.service.ts
    support.service.ts
    wan21.service.ts
  storage/
    memory.store.ts
    file.store.ts
    database.store.ts
  types/
    api.ts
    campaign.ts
    user.ts
  scripts/
```

Next real backend step: replace in-memory maps with persistent storage. Good options:

1. Firebase/Firestore because frontend already has Firebase code.
2. SQLite for local desktop/offline development.
3. JSON file store as a simple temporary persistence layer.
