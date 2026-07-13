# Video AI Testing

## Safe mocked verification

```powershell
$env:AI_WORKER_SIMULATOR='true'
npm run test --workspace=@bricks-maker/api
apps\ai-worker\.venv\Scripts\python.exe -m pytest apps\ai-worker\tests -q
npm run typecheck --workspace=@bricks-maker/web
npm run build --workspace=@bricks-maker/web
```

The suites cover provider mocks, queue concurrency/limits, cancellation safety,
idempotency conflicts, budget policy, artifact checksum/idempotency and Range
delivery. They make no paid inference request.

## Optional authorized live request

Never run this without an explicitly authorized token and model:

```powershell
$env:RUN_LIVE_HF_TEST='true'
$headers = @{ 'x-ai-provider-key'='<temporary-token>'; 'Idempotency-Key'="live-$([guid]::NewGuid())" }
$body = @{ prompts=@('A short safe test scene'); provider='huggingface'; duration=2 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:3000/api/video/generate `
  -Headers $headers -ContentType application/json -Body $body
```

This command is documentation only and is not executed by automated tests.
