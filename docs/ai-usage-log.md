# AI Usage Log

Employee Management Portal — Full Stack Developer Technical Assessment

This log records material AI-assisted work performed during the assessment, per the assessment's AI disclosure requirements (Section 11). Each row records the tool, the purpose, a representative prompt/instruction, what output was incorporated, and how it was reviewed, corrected or adapted by the candidate.

- **Tool**: The AI tool or service used.
- **Purpose**: What task the tool supported.
- **Prompt / Instruction**: A representative instruction provided.
- **Output used**: What output was incorporated into the submission.
- **Candidate review**: Corrections, validation, or changes the candidate made before accepting the output.

> Note: This log is a living document and will be appended as the build progresses. Rows marked "pending" will be completed as that work is done.

## Stack and planning

| # | Tool | Purpose | Prompt / Instruction | Output used | Candidate review |
| --- | --- | --- | --- | --- | --- |
| 1 | Claude | Stack planning and architecture discussion | "For this Employee Management Portal assessment, compare Next.js vs Vite + TanStack Router + TanStack Form, considering my Node/TypeScript background and a 12–16 hour deadline." | Compared frameworks; recommended Vite + TanStack Router SPA for this internal-tool scope (no SSR/SEO), with typed search params for the list/filter screen; recommended NestJS + Prisma for the backend and PostgreSQL. | Reviewed the trade-offs against the assessment rubric; agreed with the SPA choice for suitability, kept the monorepo structure, and accepted the documented validation-sync approach. |
| 2 | Claude | Validation alignment analysis | "We're using separate FE/BE validation. Does duplicating validation provide FE/BE independence, and which framework wins on effort: NestJS vs FastAPI?" | Clarified that REST boundary (not duplicated validation) provides independence; recommended keeping schemas field-for-field identical and documented; assessed NestJS as lower-effort for this profile. | Validated the reasoning; adopted the "field-for-field sync, documented" mitigation in the Decision Record and rejected queue/caching as out of scope. |
| 3 | Assistant (opencode) | Architecture decisions: auth, RBAC, deletion, UI/test tooling | "Confirm auth scope, RBAC model, deletion strategy, and shadcn/Storybook/snapshot-test decisions." | Settled: full JWT+Passport auth with a register route and no seeded secrets; permission-based RBAC (Role ↔ Permission, customizable in DB, no management UI); soft-delete for employees and status-retirement for departments; shadcn/ui + React Testing Library component tests + snapshot tests. Storybook was prototyped and then removed (not an assessment requirement), replaced by RTL component tests + snapshots. | Reviewed each against the assessment brief; confirmed the brief requires one documented deletion strategy per entity, and that component development via RTL tests (rather than Storybook) avoids unused complexity. |

## Project scaffolding

| # | Tool | Purpose | Prompt / Instruction | Output used | Candidate review |
| --- | --- | --- | --- | --- | --- |
| 4 | Assistant (opencode) | Backend scaffold generation | Scaffold a NestJS app with Prisma, PostgreSQL, `employees`/`departments` resources, OpenAPI docs, and a `postman/` suite. | Generated the NestJS project (controllers/services/modules for auth, employees, departments), the Prisma service using a `pg` driver adapter, and the Postman/Newman collection + environment. | Verified by building, running the server and exercising every endpoint manually, and running Newman. Adapted the scaffold to the generated project's Vitest setup and `.js`-extension ESM convention. |
| 5 | Assistant (opencode) | Frontend scaffold generation | Generate a Vite + React + TypeScript strict app with TanStack Router file-based routing, TanStack Query, TanStack Form and Tailwind 4, with a hand-written typed API client (no OpenAPI codegen) and a Vite `/api` proxy to the NestJS backend on :3000. | Generated the Vite project, tsconfigs, Tailwind 4 / shadcn-style UI primitives, the typed REST client, the auth context, TanStack Router/Query/Form wiring, and the app bootstrap. | Verified by building, running the dev server, and smoke-testing login + employee list + departments through the real `/api` proxy against the seeded backend; removed the unused triple-slash reference and used `vitest/config` for the shared Vite config. |

## Database schema

| # | Tool | Purpose | Prompt / Instruction | Output used | Candidate review |
| --- | --- | --- | --- | --- | --- |
| 6 | Assistant (opencode) | Prisma schema, migrations and seed | Design the Department, Employee, User, Role, Permission, RolePermission and AuditLog models with FK relationships, unique constraints, enums, indexes, migrations and seed data. | Produced `schema.prisma` (unique email/name, FKs, indexes on email/departmentId/status/joiningDate/deletedAt, `EmploymentStatus`/`DepartmentStatus` enums), two versioned migrations, and idempotent seed + admin-provisioning scripts. | Verified against the assessment's data model and required indexes; applied migrations to dev and test databases and validated seeds by querying the data. |

## Backend API

| # | Tool | Purpose | Prompt / Instruction | Output used | Candidate review |
| --- | --- | --- | --- | --- | --- |
| 7 | Assistant (opencode) | Auth, RBAC, employee/department API + list query | Implement JWT auth (register/login), permission-based RBAC guard, employee list pagination/search/filter/sort, and CRUD with consistent 400/404/409/401/403 error handling. | Implemented auth module (JwtStrategy, Passport), `PermissionsGuard` + decorators, employee/department controllers/services, and a global exception filter producing a consistent error shape. | Verified via 13 unit tests, 13 e2e/integration tests, and a 14-request Newman suite covering create/update/soft-delete, duplicate email, invalid/inactive department, invalid IDs, and 401/403. |

## Backend tests

| # | Tool | Purpose | Prompt / Instruction | Output used | Candidate review |
| --- | --- | --- | --- | --- | --- |
| 8 | Assistant (opencode) | Backend test authoring | Write BE unit tests, DB integration/e2e tests and a Postman/Newman API suite. | Produced 13 unit tests and 13 e2e/integration tests against a dedicated test database, plus a 14-request Newman collection exercising auth, CRUD, soft-delete, filtering/search and error paths. | Verified build (`nest build`), `npm test`, `npm run test:e2e` and Newman locally; added a `pretest:e2e` hook that auto-migrates the test database so the suite is reproducible on a fresh machine and in CI. |

## CI/CD

| # | Tool | Purpose | Prompt / Instruction | Output used | Candidate review |
| --- | --- | --- | --- | --- | --- |
| 9 | Assistant (opencode) | CI pipeline | Create a GitHub Actions workflow that installs, builds, runs unit/API/E2E tests against a test database and fails on mandatory errors. | Added `.github/workflows/ci.yml` (Node 22, PostgreSQL 17 service, `prisma generate`, migrate deploy on dev + test DBs, build, unit + e2e tests, seed, Newman API suite). Added a dedicated `frontend` job that installs, lints, builds, runs Vitest and runs the Playwright e2e suite against a seeded backend. | Ran the pipeline on GitHub and iterated on the failures it surfaced (see rows 10 and 11); verified the frontend job invokes e2e within its own Postgres service (both dev + test DBs seeded) so it is reproducible in CI. |
| 10 | Assistant (opencode) | CI fixes for seed scripts | GitHub Action failed where seed scripts could not find `tsx` on PATH / admin email mismatched the Postman environment. | Adjusted CI to invoke the seed scripts via npm (`npm run db:seed`, `npm run db:seed:admin`) so `tsx` resolves, and aligned the seeded admin email with the Newman environment. | Re-ran the pipeline and confirmed the Newman API suite passes in CI. |
| 11 | Assistant (opencode) | CI fix (npm 10 parity) | "github action fail" — `npm ci` errors with `Missing: typescript@5.9.3 from lock file`. | Diagnosed as `tsconfck` (peer `typescript ^5.0.0`) conflicting with TypeScript 6 under npm 10; removed the unused `vite-tsconfig-paths` dev dependency (no path aliases exist) and regenerated the lockfile. | Reproduced with `npx npm@10 ci`; confirmed `npm ci` passes under both npm 10 and npm 11, and that build/lint/13 unit/13 e2e tests remain green. |

## Deployment / containerisation

| # | Tool | Purpose | Prompt / Instruction | Output used | Candidate review |
| --- | --- | --- | --- | --- | --- |
| 12 | Assistant (opencode) | Docker image for Render | Create a container for the backend so Render reads all env vars and applies migrations and seed on startup. | Added `backend/Dockerfile` (multi-stage, `node:22-alpine`, `prisma generate` inside the build, minimal `--omit=dev` runtime) and `backend/.dockerignore`; moved `prisma`/`dotenv`/`tsx` to `dependencies` and added `"engines": { "node": ">=22" }`. | Confirmed the lockfile marks `prisma`/`dotenv`/`tsx` as production deps so `npm ci --omit=dev` keeps the CLI and seed runner; verified Dockerfile command syntax and env-sensitivity (all values from `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`, `ADMIN_*`). |
| 13 | Assistant (opencode) | Admin auto-provisioning on deploy | Seed the admin on deploy when credentials are present. | Extended the Docker `CMD` so every startup runs `migrate deploy` → reference seed → admin seed (guarded on `ADMIN_EMAIL`/`ADMIN_PASSWORD` being set) → `node dist/main`. | Simulated all env branches (both set / neither / only one set) and confirmed the app still boots when creds are absent; seed scripts are idempotent so deploys are safe. |
| 14 | pending | CD gating | Make Render deploy only after the GitHub job succeeds. | *Planned but not yet implemented: disable Render auto-deploy and add a deploy-hook step to the CI workflow that runs only on a green `main` job.* | *To be verified by pushing to main and observing a CI-triggered deploy.* |

## Frontend screens

| # | Tool | Purpose | Prompt / Instruction | Output used | Candidate review |
| --- | --- | --- | --- | --- | --- |
| 15 | Assistant (opencode) | Employee list/detail/create/edit | Build list with URL-driven pagination/filter/sort, detail page, and reusable create/edit form with Zod validation and unsaved-changes handling. | Implemented the employee list (search-param-filtered with draft state + debounce), detail page, reusable create/edit form (Zod schema shared across create/edit), live department options, delete confirmation and soft-delete wiring, status-options constants as the single source of truth, and login/register forms. 401 login errors surface the backend's "Invalid credentials" message. | Verified via component tests and a dev-server smoke test through the real backend proxy; fixed a real routing bug where the `$employeeId` parent rendered the detail directly with no `<Outlet/>`, hiding the edit child — converted it to a layout so `/:id` and `/:id/edit` both render correctly. |
| 16 | Assistant (opencode) | Frontend tests | Write FE unit/component tests and Playwright journeys. | Produced 30 Vitest tests (schema, form validation, table, filters, badge snapshot) across 5 files, plus 15 Playwright e2e tests (auth/login/redirect, list + search/status filters + empty state, create/validate/duplicate/edit/soft-delete, departments) with a storage-state auth setup. | Verified `npm test` (30 passing), `npm run test:e2e` (15 passing) against the live seeded backend, `npm run lint` (0 warnings) and `npm run build`; added `pointer-events-polyfill` + jsdom stubs so RTL renders the Radix/TanStack components reliably. |

## Deliverables

| # | Tool | Purpose | Prompt / Instruction | Output used | Candidate review |
| --- | --- | --- | --- | --- | --- |
| 17 | Assistant (opencode) | Documentation | Draft the README, technology decision record, ERD/schema notes and AI usage log. | Wrote `docs/decision-record.md`, `docs/ai-usage-log.md`, `docs/ERD` (Excalidraw diagram), `backend/README.md` and a root `README.md` tying both apps together. | Reviewed against the plan; refreshed the decision record and this log as auth, RBAC, soft-delete, Prisma driver adapter, deployment, CI/CD, and the Storybook-to-RTL change settled. |
| 18 | cancelled | PROBATION live-change dry-run | Add a PROBATION employment status as a one-line change across DB, API and frontend, covered by one automated test. | *Cancelled:* the dry-run was attempted and fully reverted — the committed baseline keeps `EmploymentStatus` as ACTIVE/INACTIVE with only the two original migrations. | Verified the schema and databases (dev + test) were reset to ACTIVE/INACTIVE and the test suite remained green without the experiment. |
| 19 | pending | Presentation deck | Produce an editable 8–12 slide `.pptx` summarising scope, architecture, tests, CI/CD, trade-offs and AI use. | *To be recorded when the deck is produced.* | *To be reviewed for accuracy and traceability to the submission.* |

---

## Candidate review statement

All AI-assisted output was read, understood and where necessary corrected before inclusion. The candidate is prepared to explain every submitted implementation and claim, as required by the assessment. No credentials, personal data, confidential source code or restricted information was uploaded to any public AI tool.