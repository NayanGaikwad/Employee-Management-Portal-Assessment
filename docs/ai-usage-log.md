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
| 3 | Assistant (opencode) | Architecture decisions: auth, RBAC, deletion, UI/test tooling | "Confirm auth scope, RBAC model, deletion strategy, and shadcn/Storybook/snapshot-test decisions." | Settled: full JWT+Passport auth with a register route and no seeded secrets; permission-based RBAC (Role ↔ Permission, customizable in DB, no management UI); soft-delete for employees and status-retirement for departments; shadcn/ui + Storybook + Vitest snapshot tests. | Reviewed each against the assessment brief; confirmed the brief requires one documented deletion strategy per entity. |

## Project scaffolding

| # | Tool | Purpose | Prompt / Instruction | Output used | Candidate review |
| --- | --- | --- | --- | --- | --- |
| 3 | pending | Frontend scaffold generation | Generate a Vite + React + TypeScript app with TanStack Router file-based routing, TanStack Query, TanStack Form and Tailwind CSS. | *To be recorded when the scaffold is generated.* | *To be verified by running the app, adding routes, and checking generated files against the plan.* |
| 4 | Assistant (opencode) | Backend scaffold generation | Scaffold a NestJS app with Prisma, PostgreSQL, `employees`/`departments` resources, OpenAPI docs, and a `postman/` suite. | Generated the NestJS project (controllers/services/modules for auth, employees, departments), the Prisma service using a `pg` driver adapter, and the Postman/Newman collection + environment. | Verified by building, running the server and exercising every endpoint manually, and running Newman. Adapted the scaffold to the generated project's Vitest setup and `.js`-extension ESM convention. |

## Database schema

| # | Tool | Purpose | Prompt / Instruction | Output used | Candidate review |
| --- | --- | --- | --- | --- | --- |
| 5 | Assistant (opencode) | Prisma schema, migrations and seed | Design the Department, Employee, User, Role, Permission, RolePermission and AuditLog models with FK relationships, unique constraints, enums, indexes, migrations and seed data. | Produced `schema.prisma` (unique email/name, FKs, indexes on email/departmentId/status/joiningDate/deletedAt, `EmploymentStatus`/`DepartmentStatus` enums), two versioned migrations, and idempotent seed + admin-provisioning scripts. | Verified against the assessment's data model and required indexes; applied migrations to dev and test databases and validated seeds by querying the data. |

## Backend API

| # | Tool | Purpose | Prompt / Instruction | Output used | Candidate review |
| --- | --- | --- | --- | --- | --- |
| 6 | Assistant (opencode) | Auth, RBAC, employee/department API + list query | Implement JWT auth (register/login), permission-based RBAC guard, employee list pagination/search/filter/sort, and CRUD with consistent 400/404/409/401/403 error handling. | Implemented auth module (JwtStrategy, Passport), `PermissionsGuard` + decorators, employee/department controllers/services, and a global exception filter producing a consistent error shape. | Verified via 13 unit tests, 13 e2e/integration tests, and a 14-request Newman suite covering create/update/soft-delete, duplicate email, invalid/inactive department, invalid IDs, and 401/403. |

## Frontend screens

| # | Tool | Purpose | Prompt / Instruction | Output used | Candidate review |
| --- | --- | --- | --- | --- | --- |
| 7 | pending | Employee list/detail/create/edit | Build list with URL-driven pagination/filter/sort, detail page, and reusable create/edit form with Zod validation and unsaved-changes handling. | *To be recorded when implemented.* | *To be verified via component tests and Playwright journeys.* |

## Tests

| # | Tool | Purpose | Prompt / Instruction | Output used | Candidate review |
| --- | --- | --- | --- | --- | --- |
| 8 | pending | Test authoring | Write FE unit/component tests, BE unit tests, DB integration test, Postman/Newman collection, and 4 Playwright journeys. | *To be recorded as tests are written.* | *To be verified by executing each test suite in CI and locally.* |

## CI/CD

| # | Tool | Purpose | Prompt / Instruction | Output used | Candidate review |
| --- | --- | --- | --- | --- | --- |
| 9 | pending | CI pipeline | Create a single GitHub Actions workflow that installs, builds, runs unit/API/E2E tests against a test database, and fails on mandatory errors. | *To be recorded when the workflow is written.* | *To be verified by running the pipeline on GitHub.* |

## Deliverables

| # | Tool | Purpose | Prompt / Instruction | Output used | Candidate review |
| --- | --- | --- | --- | --- | --- |
| 10 | In progress | Documentation | Draft the README, technology decision record, ERD/schema notes and AI usage log. | Decision Record and this AI log drafted. | Reviewed for accuracy against the plan; ERD and README to be completed with the build. |
| 11 | pending | Presentation deck | Produce an editable 8–12 slide `.pptx` summarising scope, architecture, tests, CI/CD, trade-offs and AI use. | *To be recorded when the deck is produced.* | *To be reviewed for accuracy and traceability to the submission.* |
| 12 | pending | PROBATION live-change dry-run | Add a PROBATION employment status as a one-line change across DB, API and frontend, covered by one automated test. | *To be recorded when performed.* | *To be verified by running the relevant tests after the change.* |

---

## Candidate review statement

All AI-assisted output was read, understood and where necessary corrected before inclusion. The candidate is prepared to explain every submitted implementation and claim, as required by the assessment. No credentials, personal data, confidential source code or restricted information was uploaded to any public AI tool.
