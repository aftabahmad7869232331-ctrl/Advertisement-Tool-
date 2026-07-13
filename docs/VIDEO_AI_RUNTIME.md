# Video AI Runtime

The Fastify API owns jobs, budgets, usage, storage and delivery. The Python
worker owns a bounded in-process FIFO queue and provider execution. Default
concurrency is one heavy job; Redis is intentionally not required.

## Start on Windows

```powershell
npm run dev:api
npm run dev:ai-worker
npm run dev:web
```

Run each command in a separate PowerShell window. Health endpoints are
`http://127.0.0.1:3000/api/health`, `/api/ready`, and
`http://127.0.0.1:8100/health`.

## Stop

```powershell
Get-NetTCPConnection -LocalPort 3000,5173,8100 -State Listen |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ }
```

Runtime videos are under `apps/api/storage/generated-videos`; worker temporary
files are under `apps/ai-worker/.artifacts/tmp`. Cleanup:

```powershell
npm run cleanup:artifacts
```

