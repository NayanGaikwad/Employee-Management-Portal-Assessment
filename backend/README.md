# Backend — Employee Management Portal API

NestJS + TypeScript + Prisma + PostgreSQL REST API for the Employee Management Portal.

## Tech stack
- **Runtime/Framework**: Node.js, NestJS 12 (TypeScript, strict)
- **ORM**: Prisma 7 (driver adapter, `@prisma/adapter-pg`)
- **Database**: PostgreSQL 17
- **Auth**: JWT via `@nestjs/jwt` + Passport (`passport-jwt`), bcrypt password hashing
- **Validation**: `class-validator` + `class-transformer` (global `ValidationPipe`)
- **Docs**: OpenAPI/Swagger at `/api/docs`
- **Testing**: Vitest (unit + e2e), Postman/Newman (API), Supertest

## Prerequisites
- Node.js >= 20 (tested on 22/25)
- PostgreSQL running locally on `localhost:5432` (Homebrew default, user `nayangaikwad`, no password)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# edit .env for your DATABASE_URL, JWT_SECRET, etc.
```
Example local `DATABASE_URL`:
```
postgresql://nayangaikwad@localhost:5432/employee_portal?schema=public
```

### 3. Create the databases
Only the **dev** database is needed to run. The **test** database is used by the e2e suite.
```bash
createdb employee_portal        # dev
createdb employee_portal_test   # test (for e2e)
```

### 4. Apply migrations and generate client
```bash
npx prisma migrate dev      # applies migrations to dev DB + regenerates client
npx prisma generate
```

### 5. Seed reference data (departments, employees, roles/permissions)
```bash
npm run db:seed
```

### 6. Provision an administrator (credentials from env, never committed)
```bash
npm run db:seed:admin   # uses ADMIN_EMAIL / ADMIN_PASSWORD from .env
```
> This is the intended way to create elevated accounts — no default/known credentials are seeded in source.

## Run
```bash
npm run start:dev     # http://localhost:3000
```
- API base path: `http://localhost:3000/api`
- Swagger docs: `http://localhost:3000/api/docs`

## Register / login
Public endpoints:
```bash
POST /api/auth/register   { "email": "user@example.com", "password": "Password@123" }
POST /api/auth/login      { "email": "...", "password": "..." }
```
All `/employees` and `/departments` routes require `Authorization: Bearer <token>`.
New registrations get the `EMPLOYEE_VIEWER` role (read-only). The `ADMIN` role (all permissions) is created via `npm run db:seed:admin`.

## API summary
| Method | Endpoint | Permission |
| --- | --- | --- |
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| GET | `/api/employees` | `employees:read` |
| GET | `/api/employees/:id` | `employees:read` |
| POST | `/api/employees` | `employees:create` |
| PATCH | `/api/employees/:id` | `employees:update` |
| DELETE | `/api/employees/:id` | `employees:delete` |
| GET | `/api/departments` | `departments:read` |
| GET | `/api/departments/:id` | `departments:read` |

List query parameters: `page`, `pageSize`, `search` (name/email), `departmentId`, `status` (`ACTIVE`/`INACTIVE`), `sort` (`name`/`joiningDate`), `direction` (`asc`/`desc`).

### Error handling
Consistent JSON error shape via a global exception filter:
```json
{ "statusCode": 404, "message": "Employee with id 123 not found", "error": "Not Found", "timestamp": "...", "path": "/api/employees/123" }
```
| Scenario | Status |
| --- | --- |
| Invalid request data | 400 |
| Employee / department not found | 404 |
| Duplicate email | 409 |
| Invalid / inactive department | 400 |
| Unauthorized (missing/invalid token) | 401 |
| Forbidden (missing permission) | 403 |
| Unexpected error | 500 (non-sensitive) |

## Deletion strategy
- **Employees**: **soft-delete** — `DELETE /api/employees/:id` sets `deletedAt`; the row is preserved and excluded from normal queries.
- **Departments**: cannot be deleted while they still have employees (referential integrity). Retire them by setting `status = INACTIVE`. Inactive departments are not selectable for new employees.

## Authorization (RBAC)
Permissions are stored in the DB (`Permission` ↔ `Role` many-to-many) and enforced at request time:
- `employees:read`, `employees:create`, `employees:update`, `employees:delete`
- `departments:read`
- Seeded roles: `ADMIN` (all), `EMPLOYEE_VIEWER` (read-only).
- Roles/permissions are data-driven and customizable in the DB (no management UI in scope).

## Transactions
Employee create/update/soft-delete each write a correlated `AuditLog` row inside a single Prisma `$transaction`. If any step fails, all changes roll back.

## Tests
```bash
npm test                # unit tests (Vitest) — auth + employees services
npm run test:e2e        # e2e + database integration (uses employee_portal_test)
npm run test:api        # Postman/Newman API suite (server must be running)
```

### API suite (Postman/Newman)
```bash
# with the server running:
newman run postman/employee-portal.postman_collection.json \
  -e postman/employee-portal.postman_environment.json
```
The collection covers: register, admin login (captures token), paginated list, search/filter, create, reject invalid data, reject duplicate email, update, soft-delete, invalid employee/department ids, 401 (no token), and 403 (viewer denied create).

## Environment variables (`.env`)
| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Dev database connection string |
| `JWT_SECRET` | JWT signing secret (never commit a real one) |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `1h`) |
| `PORT` | HTTP port (default `3000`) |
| `CORS_ORIGIN` | Allowed frontend origin |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used only by `npm run db:seed:admin` |
