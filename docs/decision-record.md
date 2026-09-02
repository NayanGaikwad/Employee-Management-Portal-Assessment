# Technology Decision Record

Employee Management Portal — Full Stack Developer Technical Assessment

This record documents the technology and architecture decisions made for the assessment, the alternatives considered, and the trade-offs accepted. The goal is to show suitability and justification, not defaulting to what is popular.

## Overview

| Area | Decision | Status |
| --- | --- | --- |
| Frontend framework | Vite + React + TanStack Router | Chosen |
| Language | TypeScript (frontend and backend) | Chosen |
| State management | TanStack Query + Router search params + TanStack Form | Chosen |
| UI approach | shadcn/ui (Tailwind + Radix) | Chosen |
| Component development | Vitest + React Testing Library (no Storybook) | Chosen |
| Form handling | TanStack Form + Zod | Chosen |
| Backend | NestJS + Prisma | Chosen |
| Database | PostgreSQL | Chosen |
| AuthN | JWT + Passport (register + login) | Chosen |
| AuthZ | Permission-based RBAC (Role ↔ Permission) | Chosen |
| Unit/component tests | Vitest + React Testing Library | Chosen |
| Snapshot tests | Vitest/Jest `toMatchSnapshot` (presentational) | Chosen |
| API tests | Postman + Newman | Chosen |
| E2E tests | Playwright | Chosen |
| CI/CD | GitHub Actions (single pipeline) | Chosen |
| Repository | Single mono-repo (`frontend/` + `backend/`) | Chosen |

---

## Frontend framework: Vite + React + TanStack Router

### Decision
Use Vite as the build tool, React as the UI library, and TanStack Router for file-based, fully typed routing. This is a client-side SPA rendered against the REST backend.

### Why
- The application is an internal employee management portal with **no SSR, SEO, or content-publishing needs**. A full-stack meta-framework would add server-side complexity (Server Components, SSR runtime, hydration) with zero benefit for this scope.
- **TanStack Router's typed search params** are a standout fit: the employee list screen drives pagination, search, filter and sort entirely from URL query state (`?page=1&pageSize=20&search=tan&departmentId=3&status=ACTIVE&sort=joiningDate&direction=desc`). `validateSearch` gives compile-time-safe, co-located validation of that URL state — meaning the filter state is shareable, bookmarkable and survives refresh with no extra code.
- The **clean SPA/REST boundary** reinforces the polyglot independence story: the frontend speaks only to versioned HTTP endpoints, so it is fully decoupled from the backend regardless of language.
- Vite gives fast HMR and a lightweight dev experience.

### Alternatives considered
| Option | Considered | Rejected because |
| --- | --- | --- |
| Next.js (App Router) | Yes | Adds SSR/RSC complexity not needed by an internal SPA; routing less type-safe than TanStack; the personal daily stack, but not the best suitability fit here |
| TanStack Start | Yes | SSR/full-stack framework layer; the SPA-routing use case is fully covered by Router alone for a static, externally-API-backed app |
| React Router v7 | Yes | Solid, but TanStack Router's typed search params are a closer match for this URL-state-heavy list screen |

---

## Language: TypeScript

### Decision
Use TypeScript on both the frontend and the backend.

### Why
- Catches a class of errors at compile time across route params, search params, API client boundaries and shared validation schemas.
- One language across the stack removes context-switching and allows the API contract to be represented as shared types where practical.
- TypeScript is strongly preferred by the assessment brief.

---

## State management: TanStack Query + Router search params + TanStack Form

### Decision
Use a layered, role-appropriate approach rather than a single global store.

| Concern | Tool | Rationale |
| --- | --- | --- |
| Server / remote data (employees, departments) | TanStack Query | Caching, background refetch, pending/error states, and invalidation after mutations |
| URL / list filter state | TanStack Router search params | Shareable, bookmarkable, refresh-safe |
| Form field state | TanStack Form | Local, type-safe form state and validation |
| Client-only global state | None needed | No cross-cutting client-only global state exists |

### Why not a global store
A `Redux`/`Zustand`-style store would duplicate state that already lives naturally in the URL (list filters) or the server (entity data). Adding one would be unused complexity, which the rubric penalises under "proportionate technology choices".

---

## UI approach: shadcn/ui

### Decision
Use **shadcn/ui** — a set of accessible, copy-paste components built on Tailwind CSS and Radix UI primitives.

### Why
- **Accessible by default**: Radix primitives provide keyboard interaction, focus management and ARIA roles, directly supporting the assessment's accessibility expectations.
- **Tailwind-based and fully customisable**: components are source-controlled in the app (no runtime dependency or style-engine overhead) and can be themed/adapted to a coherent design rather than adopt a heavy component library's opinionated look.
- **Fast and consistent**: pre-built, tested components (table, pagination, badges, forms, dialogs, selects) cover the required screens without reinventing primitives.
- Responsive behaviour is straightforward with Tailwind's breakpoint utilities.

### Alternatives considered
| Option | Considered | Rejected because |
| --- | --- | --- |
| Plain CSS / CSS modules | Yes | More boilerplate for consistent theming, responsiveness and accessible primitives |
| Material UI / full component library | Yes | Heavier dependency with opinionated theming that fights custom design; less hand-crafted and less demonstrable |
| Hand-rolled `ui/` components | Yes | More implementation effort for accessibility and polish than copying vetted shadcn/ui primitives |

## Component development: Vitest + React Testing Library (Storybook removed)

### Decision
Develop and verify components with **React Testing Library** component tests (plus a small set of presentational snapshot tests). **Storybook was considered, prototyped and then removed** — it is not required by the assessment, which is scoped to an internal portal implementation rather than a component-library deliverable.

### Why RTL over Storybook
- The required presentational states (loading, empty, error, filters, forms) are exercised directly through rendered component tests, which assert real behaviour (validation, interaction, role-based rendering) rather than just inviting manual inspection.
- Component tests run headlessly in the same CI job as the unit tests — there is no extra build layer, dependency or separate dev server to maintain.
- The assessment asks for a balanced testing strategy; Storybook's "living documentation" value does not map to any explicit rubric requirement, so dropping it avoids unused complexity (the rubric penalises over-engineering).

### Trade-off
Isolation-based visual exploration of components is sacrificed. Where a component depends on router/query/toast context it is tested within those providers via test helpers rather than Storybook decorators. Full journeys remain covered by Playwright.

---

## Form handling: TanStack Form + Zod

### Decision
Use TanStack Form for form state and Zod for validation.

### Why
- TanStack Form provides type-safe field state, submit handling and duplicate-submission prevention out of the box.
- A single Zod schema is the **single source of truth** for both create and edit forms (the brief requires a reusable form implementation for create/edit).
- Field-level validation messages, disabled/loading states while saving, and server-side error surfacing map directly to the required form behaviours.

---

## Backend: NestJS + Prisma

### Decision
Use NestJS for the API and Prisma as the ORM talking to PostgreSQL.

### Why
- **NestJS enforces controller/service/repository layering** by its module/DI/decorator structure, which directly maps to the rubric's "clear separation between transport/controller, business/service and data-access".
- TypeScript end-to-end keeps a single toolchain and language across frontend and backend.
- `@nestjs/swagger` provides OpenAPI documentation with modest decoration, satisfying the documentation requirement.
- **Prisma** provides versioned migrations, a typed client, and its schema doubles as the source for the ERD. Constraints and indexes (unique email, department FKs, indexes on email/departmentId/status/joiningDate) are declared in the schema and applied through generated migrations. Prisma 7 uses **driver adapters** (`@prisma/adapter-pg` over `pg`), which keeps a single connection pool consistent with the runtime.

### Model set (RBAC + soft-delete + audit)
- `User` (email unique, bcrypt `passwordHash`, role FK)
- `Role` ↔ `Permission` many-to-many via `RolePermission`
- `Department` (unique name, status)
- `Employee` (unique email, department FK, status, `deletedAt?` for soft-delete, indexes)
- `AuditLog` (entity/action/actor, written transactionally with employee writes)

### Alternatives considered
| Option | Considered | Rejected because |
| --- | --- | --- |
| Express | Yes | Leaves layering and validation to be imposed manually; more risk of logic leaking into handlers under time pressure |
| Python FastAPI + SQLAlchemy + Alembic | Yes | Legitimate and explicitly accepted, but adds a second toolchain/language, two test runners and two CI configs; Alembic setup is more manual. Polyglot independence is provided by the REST boundary regardless of language |
| TypeORM | Yes | First-class with NestJS and familiar from JPA-style patterns; Prisma chosen for cleaner migration diffing and a single schema source for the ERD |

---

## Database: PostgreSQL

### Decision
Use PostgreSQL as the relational database.

### Why
- Required relationships map directly onto relational modelling: `Department` → `Employee` foreign key, unique email, unique department name, status enums, timestamps.
- Prisma's PostgreSQL support is first-class with async via `pg` pooling.
- Referential integrity, unique constraints and indexes support the required data-integrity scenarios.

---

## Authentication: JWT + Passport (register + login)

### Decision
Use **JWT** via `@nestjs/jwt` with a **Passport** `passport-jwt` strategy, and **bcrypt** for password hashing.

### Details
- `POST /auth/register` — create an account with email + password; assigns the default `EMPLOYEE_VIEWER` role. **No seeded/known credentials** exist in source.
- `POST /auth/login` — verifies credentials, signs a JWT carrying `sub`, `email`, `roleId`, `roleName`.
- Elevated accounts are provisioned via a documented `npm run db:seed:admin` script that reads `ADMIN_EMAIL`/`ADMIN_PASSWORD` from environment variables (never committed). This satisfies "no credentials or secrets committed" while keeping the demoable.
- `JwtAuthGuard` is registered globally; `@Public()` bypasses it for `register`/`login`.

### Why JWT + Passport
JWT is stateless and standard for an SPA talking to a REST API; Passport provides the well-trodden strategy interface. bcrypt hashing (with salt) is the recommended default for password storage. The auth/authorisation requirement is implemented (not just documented).

---

## Authorization: permission-based RBAC

### Decision
Implement a **customizable, data-driven RBAC** model rather than hard-coded roles.

### Design
- Permissions are `module:action` strings stored in the DB (`Permission`), e.g. `employees:create`, `employees:read`, `employees:update`, `employees:delete`, `departments:read`.
- Roles relate to permissions many-to-many (`Role` ↔ `RolePermission` ↔ `Permission`), so roles are freely customizable in the database.
- The `PermissionsGuard` resolves the current user's role → the role's current permissions **at request time** and enforces `@RequirePermissions('employees:delete')`. This means permission/role changes apply immediately without re-issuing tokens.
- Seeded roles: `ADMIN` (all permissions) and `EMPLOYEE_VIEWER` (read-only). Adding a role is a DB insert + permission bind.

### Scope decision
Roles and permissions are customizable **in the database**; a full role-management admin UI is **out of scope** to keep the take-home proportionate (the rubric penalises over-engineering). This is documented as a future improvement.

### Mapping to routes
`/employees` use `employees:*`, `/departments` use `departments:read`. Unauthorized (no/invalid token) → 401; forbidden (missing permission) → 403.

---

## Deletion strategy: soft-delete (employees) + status retirement (departments)

The assessment requires choosing and documenting **one** strategy per entity.

### Employees — soft-delete
`DELETE /employees/:id` sets `deletedAt = now()` rather than removing the row. All normal queries filter `deletedAt IS NULL`.
- **Why**: preserves history and auditability, records are recoverable, and it is lower-risk than physical delete. The `deletedAt` index supports the soft-delete filter.
- **Documented behaviour**: soft-deleted employees disappear from list/detail and attribute-like actions (update/delete again) return 404.

### Departments — reactivate via status, no physical delete while employees exist
- A department cannot be physically deleted while it still has employees (referential integrity). It is retired by setting `status = INACTIVE`.
- **Inactive departments** are not selectable for new employees. **Existing employees in an inactive department are left unchanged (kept `ACTIVE`)** — a documented trade-off, since reassigning or auto-deactivating them would be surprising and destructive.
- On the backend, creating/assigning an employee to an inactive department is rejected with a meaningful 400.

### Transactions
Employee create/update/soft-delete each write a correlated `AuditLog` row inside a single Prisma `$transaction`. If any step fails, all changes roll back — a concrete demonstration of transaction awareness.

---

## Testing strategy

| Level | Tool | Scope |
| --- | --- | --- |
| Backend unit | Vitest | Service logic, validation, error handling — 13+ tests |
| Database integration | Vitest + Supertest | Repository/API behaviour against a real test Postgres (unique email, FK, error statuses) |
| API | Postman + Newman | Pagination, search/filter, create, reject invalid/duplicate, update, delete/deactivate, invalid IDs, 401/403 |
| Frontend unit/component | Vitest + React Testing Library | Validation, loading/empty/error states, interaction — 30 tests incl. a pure schema suite and snapshots |
| Snapshot tests | Vitest `toMatchSnapshot` | Presentational components (type/status badges) to catch unintended UI drift |
| End-to-end | Playwright | Five critical journeys: auth/login; list/search/filter; create; edit; soft-delete; plus departments |

### Why this split
Coverage belongs where the risk lives: fast unit/component tests for behaviour and validation, a database/API integration test for the data layer, an executable API suite for the contract, snapshot tests to guard presentational components, and a small E2E suite for the critical journeys. This matches the brief's emphasis on a balanced strategy over sheer volume.

### Note on test tooling
The current NestJS CLI ships with **Vitest** rather than Jest. We use Vitest across the backend (unit + e2e) and the frontend (component + snapshot), which keeps a single, consistent test runner per codebase and satisfies the assessment's open testing-tooling requirement.

---

## CI/CD: GitHub Actions (single pipeline)

### Decision
One GitHub Actions workflow that: installs both sets of dependencies → builds frontend and backend → runs frontend unit tests → runs backend unit tests → connects to a test PostgreSQL database → runs API tests (Newman) → runs selected Playwright tests → publishes test results and fails on any mandatory step.

### Why single repo + single pipeline
- The brief asks for one coherent pipeline covering both apps.
- One clone + one README + one compose file gives the review panel the smoothest reproduce/run experience.
- A single linear commit history reads well against the "logical progress" requirement.

---

## Repository strategy

### Decision
Single mono-repo with two independently runnable apps:

```
employee-portal/
├── frontend/          # Vite + React + TanStack Router
├── backend/           # NestJS + Prisma
├── docker-compose.yml # PostgreSQL (and optionally both services)
├── .github/workflows/ # single CI pipeline
└── README.md
```

### Why not two separate repos
Two repos would mean two CI pipelines, two READMEs, and a harder reviewer experience within the assessment's demo constraints. A production deployment would likely split frontend and backend once they gain independent release cadences and team ownership — documented as a future consideration.

---

## Validation alignment across the language boundary

The frontend and backend run different validation libraries (Zod on TS frontend, Prisma/DB + DTO validation on NestJS backend). The REST API contract is the boundary that provides FE/BE independence.

- The shared Zod schema and the backend DTO field rules are kept **field-for-field identical by design**, documented in one place (`employeeSchema.ts` ↔ backend DTOs).
- This is a deliberate, documented duplication across the language boundary rather than an unexplained gap: same required fields, same email format, same date format, same status values.
- The PROBATION live-change is designed to be a one-line addition in each layer (DB enum, backend validation, frontend select), which keeps the layers trivially in sync.

---

## Queue and caching — deliberately out of scope

No async workload exists in the current scope (no bulk uploads, notifications, report generation or background processing). A queue would therefore be unjustified complexity.

Caching is a closer call but still not implemented: the department list (low write, high read) would be a future Redis/in-memory candidate with invalidation on create/update.

Both are documented as forward-looking production considerations, not implemented, to avoid over-engineering the take-home.

---

## Trade-offs and limitations

- **No SSR/SEO** — irrelevant for an internal authenticated portal; documented by design.
- **Duplicated validation across FE/BE** — accepted and mitigated by keeping schemas field-for-field identical in one documented place.
- **Single repo** — chosen for scope/reviewer convenience; production would likely split.
- **Auth is implemented but role-management UI is not** — RBAC is data-driven and customizable in the DB; a role/permission admin UI would be added for production-grade administration.
- **Soft-delete chosen over physical/status-deactivation** — single documented strategy per the brief; legacy rows accumulate and are excluded from all normal queries.
- **Storybook was prototyped and removed** — not required by the assessment; component development is covered by RTL component tests plus snapshot tests (see the Component development section).
- **Snapshot tests guard presentational drift but are not a substitute for behaviour tests** — kept focused on stable, presentational components.
- **No queue/caching** — future considerations only, per above.
- **Scaled testing volume** — a balanced suite is provided rather than exhaustive coverage, matching the brief's emphasis on meaningful tests over repetition.

## Future improvements
- Split frontend/backend repos and pipelines once release cadences diverge.
- Add a role/permission management admin UI.
- Add refresh-token rotation and an explicit logout strategy.
- Add rate limiting and lockout on the login endpoint.
- Add Redis/in-memory caching for department lookups (low write, high read).
- Add a queue if audit logging or notifications are introduced.
- Generate client types from the backend OpenAPI spec to close the validation-drift gap structurally.
