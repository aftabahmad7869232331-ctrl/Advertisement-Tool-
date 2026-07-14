# Frontend ↔ Backend Wiring Status

Last updated: 2026-07-14

## Wired and available

| Frontend feature | Backend/runtime |
|---|---|
| Register, login, refresh, logout | Auth API and SQLite sessions |
| Email verification/password reset | Auth action tokens; Resend adapter awaiting production key |
| Credit balance and ledger | Credit ledger API |
| Credit estimate/reserve/capture/refund | Generation and credit services |
| CPU/GPU status badges | `/api/ready`, refreshed every 30 seconds |
| Generation limits/cost note | `/api/config/limits` |
| Video upload and temporary retention | Media upload API |
| Video generation and job polling/cancel | Video job API |
| Trim/edit/merge | FFmpeg media API |
| Timeline render | Timeline API |
| Titles and VFX | FFmpeg media API |
| Caption generation and burning | AI worker + FFmpeg routes |
| Background removal | Client-side MediaPipe |
| Watermark upload/apply | Media API with bearer authentication |
| Music list/apply | Media API |
| Voice list/preview/generate/merge | AI worker + media API |
| English/Hindi auto-dub | Dub API |
| Analytics | Local usage analytics API |
| Image generation | Local AI image route |
| Project auto-save | Workspace project storage |

## Honest unavailable states

The Studio displays a `Module not installed` state instead of fake progress for:

- AI VFX
- Pro Studio batch tools
- External publishing
- Version-history/rate-limit settings UI
- Video regeneration
- Lip Sync

Voice cloning inputs are disabled with a configuration message until a cloning model/provider is installed. Normal English/Hindi voice generation remains available.

## Current runtime result

- CPU API/database/storage: ready
- GPU worker: offline
- Local Wan runtime: not ready
- Paid cloud provider: disabled
- Current generation provider: local/open-source
- Maximum configured clips: 5 × 6 seconds = 30 seconds

## Verification

- API tests pass twice consecutively: 9 files, 26 tests each run.
- API and web TypeScript checks pass.
- API and web production builds pass.

