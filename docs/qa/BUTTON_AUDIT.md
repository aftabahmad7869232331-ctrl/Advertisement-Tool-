# Brick-Maker UI Button & Page QA

Last updated: 2026-07-14 22:48 IST

## Test policy

- Every result must be marked as `PASS`, `FAIL`, `BLOCKED`, or `PENDING`.
- A page returning HTTP 200 is only a route/load check; it is not considered a visual or button PASS.
- Actions that require credentials, payments, external publishing, GPU models, or a user file are recorded separately.
- Bugs fixed during QA must be re-tested before being marked PASS.

## Runtime baseline

| Check | Result | Evidence |
|---|---|---|
| Frontend dev server | PASS | `http://localhost:5173` returned HTTP 200 |
| API server | PASS | `/api/health` returned `status: ok`, database ready |
| API automated tests | PASS | 9 files, 26 tests |
| API TypeScript | PASS | `tsc --noEmit` |
| Web TypeScript | PASS | `tsc --noEmit` |
| API production build | PASS | TypeScript build completed |
| Web production build | PASS | Vite production build completed |
| In-app visual browser | BLOCKED | No browser session is currently attached to Codex |

## Route load sweep

The following URLs returned the SPA shell with HTTP 200:

`/`, `/dashboard`, `/projects`, `/studio`, `/templates`, `/video`, `/gallery`, `/growth`, `/premium`, `/support`, `/login`, `/pricing`, `/settings`

Note: `/dashboard`, `/pricing`, and `/settings` need browser-level content verification because the application route map currently uses `/`, `/premium`, and does not expose a dedicated Settings page.

## Page inventory

| Page | Direct buttons in primary component | Visual/button status |
|---|---:|---|
| Home/Dashboard | 8 | PENDING |
| Projects | 6 | PENDING |
| Video Studio | 115 across feature components | PENDING |
| Templates/Creative Studio | 19 | PENDING |
| Video/Reel editor | 21 across feature components | PENDING |
| Gallery | 30 | PENDING |
| Growth/Analytics | 12 | PENDING |
| Premium/Credits | 11 | PENDING |
| Support | 15 | PENDING |
| Login/Register/Reset | 7 | PENDING |
| Language/Captions | 5 | PENDING |
| Motion/Animation | 3 | PENDING |

## Video Studio feature panels to test

- Prompt generation and credit estimate
- Import video
- Template selection
- Timeline controls
- Titles
- VFX and AI VFX
- Regeneration
- Lip Sync
- Auto-Dub
- Voice generation
- Captions
- Background removal
- Watermark
- Music mixing
- Export
- Analytics
- Publishing
- Settings/version save
- Temporary-video `Keep permanently`

## Static handler scan

- No explicit empty `onClick={() => {}}` handler found.
- No permanently `disabled={true}` button found.
- No button source marker containing `TODO`, `not implemented`, or `Coming Soon` found.
- This scan does not replace runtime clicking; handlers can still fail through an API or state error.

## Frontend/backend wiring update — 2026-07-14

- Studio now shows live `CPU Ready/Offline` and `GPU Ready/Connected/Offline` badges.
- Studio authentication display/logout now uses the real AuthService session.
- Ready media services send authenticated requests.
- Watermark XHR upload now includes the bearer token.
- Generation estimator now has a real `/api/config/limits` endpoint.
- Project auto-save now uses workspace storage instead of the missing version-history endpoint.
- Voice cloning is disabled with an honest configuration message; normal voice generation remains available.
- Current live check: CPU ready, GPU offline, local Wan not ready.

## Known external prerequisites

| Feature | Requirement | Status |
|---|---|---|
| Real AI video generation | GPU worker / Wan provider | Environment pending |
| Lip Sync | Model/provider | Environment pending |
| External publishing | Platform OAuth credentials | Credentials pending |
| Payment buttons | Razorpay/Stripe credentials | Not implemented yet |
| Production email delivery | Resend API key and verified sender | Credentials pending |

## Next browser pass

1. Attach/open the Codex in-app browser.
2. Test global navigation and mobile/desktop menus.
3. Test Login → Create Account → Logout → Login.
4. Test each page's non-destructive buttons.
5. Test state-changing local actions with disposable QA data.
6. Record console errors and network failures.
7. Fix reproducible local bugs and re-test.

## Home page card wiring — 2026-07-14

- `Start Creating` and the bottom `Open Studio` CTA open the real Video Studio.
- `Explore Templates` opens the real template/flyer designer.
- All eight Popular Category cards open the template designer with the matching category preselected.
- Restaurant, Festival, Corporate, and Retail display names are mapped to their real editor category values.
- Studio preview mini-cards are actionable: Create and Export open Studio; Customize opens Templates.
- Recent live campaign cards retain working Pause/Activate and Edit actions.
- Prebuilt project `Use` actions open Studio.
- Web TypeScript typecheck and production build pass.
- Visual click verification remains pending until an in-app browser session is available.
