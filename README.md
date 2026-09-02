# Employee Management Portal

Full-stack technical assessment: an employee management portal with an `employees` and `departments` module, JWT authentication and permission-based RBAC.

| Part | Stack | Path |
| --- | --- | --- |
| Backend | NestJS 12 + Prisma 7 + PostgreSQL | `backend/` |
| Frontend | Vite + React 19 + TanStack Router + Tailwind 4 | `frontend/` |

Full technology and architecture rationale is recorded in [`docs/decision-record.md`](docs/decision-record.md).

## Backend

REST API at `http://localhost:3000/api`, OpenAPI docs at `http://localhost:3000/api/docs`.

```bash
cd backend
npm install
cp .env.example .env        # DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
createdb employee_portal
npx prisma migrate dev
npm run db:seed             # departments, employees, roles/permissions
npm run db:seed:admin       # elevated account from ADMIN_EMAIL / ADMIN_PASSWORD env
npm run start:dev
```

```bash
npm test          # unit + integration
npm run test:e2e  # e2e against TEST_DATABASE_URL
npm run test:api  # Postman/Newman suite
```

See `backend/README.md` for details.

## Frontend

SPA at `http://localhost:5173` (dev server proxies `/api` → `localhost:3000`).

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run test       # Vitest unit + component + snapshot tests
npm run test:e2e   # Playwright (requires backend running; logs in as admin@example.com)
npm run lint       # oxlint
npm run build      # tsc + vite build
```

Sign in with the `ADMIN_EMAIL`/`ADMIN_PASSWORD` provisioned on the backend, or register a new read-only (`EMPLOYEE_VIEWER`) account.

## CI

A single GitHub Actions pipeline (`.github/workflows/ci.yml`) installs, builds and tests both apps, spins up a test PostgreSQL, runs the Newman API suite and runs the frontend Playwright E2E suite.