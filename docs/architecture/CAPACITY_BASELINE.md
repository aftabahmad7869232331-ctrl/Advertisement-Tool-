# Current Capacity Baseline

Last updated: 2026-07-14

These are conservative engineering limits based on the current architecture, not a completed load-test result.

## Current local/single-server configuration

| Workload | Current practical capacity |
|---|---:|
| Active users browsing normal pages | 25-50 conservative beta target |
| Simultaneous lightweight API requests | Roughly 20-50 |
| Simultaneous FFmpeg edits/exports | 1-2 recommended |
| Simultaneous real AI jobs | 1 |
| AI jobs waiting in worker queue | 20 |
| Active generation jobs per user | 2 |
| Protected generation requests per IP | 30/minute |
| Maximum video upload | 500 MB per file |

## Important constraints

- API runs as one Node.js process.
- SQLite is in WAL mode with a 5-second busy timeout, but remains a single-server write bottleneck.
- AI worker concurrency is 1.
- Render worker concurrency is 1.
- Queue is in-process, so it is not durable across a worker restart.
- FFmpeg processing currently runs on the API machine and can consume CPU/RAM needed by web requests.
- Media storage is local disk.
- Current `.env` uses the AI simulator; real GPU throughput is not measured yet.

## Safe beta launch limit

- Start with no more than 25 simultaneously active users.
- Allow one AI generation at a time and queue the rest.
- Allow no more than two active jobs per user.
- Monitor CPU, RAM, disk, request latency, queue wait time, and failed jobs.

## Scale target after cloud migration

Moving to Postgres, Redis/durable queues, object storage, multiple API replicas, and multiple GPU workers can support hundreds of active web users. AI throughput will then scale approximately with the number and speed of GPU workers rather than the number of API instances.

## Required validation

Run staged load tests at 10, 25, 50, 100, and 250 virtual users before publishing a final production capacity claim.

