# File Naming Rules

## TypeScript and React

| File type | Naming pattern | Example |
|---|---|---|
| React component | PascalCase.tsx | VideoPreview.tsx |
| Page component | PascalCasePage.tsx | StudioPage.tsx |
| Layout component | PascalCase.tsx | Navbar.tsx |
| Hook | useCamelCase.ts | useRenderProgress.ts |
| Service | kebab-case.service.ts | render-job.service.ts |
| Controller | kebab-case.controller.ts | studio.controller.ts |
| Route | kebab-case.routes.ts | studio.routes.ts |
| Repository | kebab-case.repository.ts | project.repository.ts |
| Schema | kebab-case.schema.ts | render-job.schema.ts |
| Types | kebab-case.types.ts | studio.types.ts |
| Constants | kebab-case.constants.ts | render.constants.ts |
| Utility | kebab-case.ts | format-duration.ts |
| Test | matching-name.test.ts | studio.service.test.ts |
| Styles | matching-name.module.css | VideoPreview.module.css |

## Folders

Use kebab-case for folders.

Correct:

- render-worker
- shared-types
- studio-core
- video-editor
- render-jobs

Avoid:

- RenderWorker
- shared_types
- Studio Core
- renderJobs

## React Rules

1. One main exported component per component file.
2. Component names must match file names.
3. Page components must end with Page.
4. Hooks must begin with use.
5. Do not put API calls directly inside large page components.
6. Do not mix backend code into frontend files.
7. Avoid generic names such as helper.ts, common.ts, data.ts, or utils2.ts.

## Backend Module Pattern

Example:

studio/
├── studio.controller.ts
├── studio.service.ts
├── studio.repository.ts
├── studio.routes.ts
├── studio.schema.ts
├── studio.types.ts
└── studio.service.test.ts

## Effect Naming

Each effect must use a stable lowercase identifier.

Example effect ID:

cube-transition

Recommended files:

cube-transition/
├── CubeTransition.ts
├── cube-transition.metadata.ts
├── cube-transition.schema.ts
├── cube-transition.preview.webp
└── cube-transition.test.ts

## Environment Variables

Use uppercase snake case.

Examples:

API_PORT
DATABASE_URL
RENDER_QUEUE_URL
AI_MODEL_PATH
UPLOAD_DIRECTORY

Frontend-exposed variables must use the approved frontend prefix only.

Never place secrets in frontend environment variables.

## Documentation

Use uppercase kebab-style names for important root documentation.

Examples:

PROJECT-MAP.md
RENDER-PIPELINE.md
EFFECT-REGISTRY.md

## Prohibited Naming

Do not create files named:

final.ts
final-final.ts
new.ts
new2.ts
copy.ts
temp-code.ts
latest.ts
working.ts
backup-component.tsx

Use version control and proper descriptive names instead.
