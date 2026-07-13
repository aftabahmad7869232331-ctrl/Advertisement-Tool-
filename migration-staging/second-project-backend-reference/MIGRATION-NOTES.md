# Second Project Backend Reference

Source: `C:\Users\Aftab khan\BRICK-MAKER-IDA\backend`

This directory is a read-only migration snapshot. Nothing here is imported by
the current Fastify API or Python AI worker. Review and adapt one module at a
time before moving code into `apps/` or `packages/`.

## Included candidates

- Python configuration, security and logging references
- Request-ID middleware
- Database session/base and repository patterns
- Health route/service/schema
- Time utility
- Docker reference
- Wan2.1 check and installation scripts
- Legacy backend folder documentation and migration note

## Intentionally excluded

- Real `.env` and credentials
- Express monolith and its duplicate copy
- Simulated video-generation endpoints
- Runtime status JSON
- Uploads, logs, caches and generated files
- `codex-backup` files
- Duplicate/empty package marker files
- Live-provider test scripts

## Integration rule

The current project uses Fastify for its main API and a focused Python AI
worker. Do not copy these staged modules directly into runtime locations.
Translate compatible concepts to the current architecture, add tests, and
verify each migration independently.
