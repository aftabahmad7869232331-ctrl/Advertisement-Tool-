# Phase 1A — Frontend Shell Migration Lock

## Scope

This phase covers only:

- Frontend entry point
- Application shell
- Providers
- Theme context
- Navigation layout
- Global styles
- Route constants
- Internationalization foundation
- Helmet provider foundation

## Included Files

- src/main.tsx
- src/App.tsx
- src/App.css
- src/index.css
- src/styles.css
- src/ThemeContext.tsx
- src/i18n.ts
- src/vite-env.d.ts
- src/app/AppProviders.tsx
- src/constants/routes.ts
- src/components/Navbar.tsx
- src/components/TopBar.tsx
- src/components/Footer.tsx
- src/styles/*

## Explicitly Deferred

- Three.js
- React Three Fiber
- Drei
- Glass Prism Cube
- Tone.js
- Recharts
- Wan2.1 configuration
- Firebase configuration
- Analytics
- Heavy effects
- Video editor
- Studio generation
- Backend migration

## Rules

1. Files are staged before active migration.
2. apps/web must not be overwritten directly.
3. Existing new-project foundation remains the rollback point.
4. Imports must be audited before integration.
5. Typecheck and build are required after every integration batch.
6. No redesign during migration.
7. No Firebase files or backup files are permitted.
