# Video AI Security

- BYOK uses `x-ai-provider-key` only in request memory.
- Provider keys, worker tokens and authorization/cookie headers are redacted.
- Worker callbacks, cancellation and artifact upload require
  `x-ai-worker-token`.
- Server-paid cloud is disabled by default and requires configured cost data.
- Usage records contain provider/model/source/cost/duration, never credentials.
- Idempotency hashes exclude headers and therefore exclude BYOK values.
- Until authentication exists, idempotency and active-job limits are scoped to
  client IP. A production identity must replace this temporary scope.
- Video delivery uses opaque IDs and ranged API streaming, never local paths.

Validate a BYOK credential without storing it:

```powershell
$headers = @{ 'x-ai-provider-key' = '<temporary-token>' }
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:3000/api/video/providers/validate `
  -Headers $headers -ContentType application/json -Body '{"provider":"huggingface"}'
```

