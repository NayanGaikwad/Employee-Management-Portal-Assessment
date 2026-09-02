# Frontend — Employee Management Portal

Vite + React 19 + TypeScript (strict) single-page application for the Employee Management Portal. Renders against the NestJS REST API (`/api`).

## Tech stack
- **Build**: Vite 8, React 19, TypeScript (strict)
- **Routing**: TanStack Router (file-based, typed search params)
- **Server state**: TanStack Query
- **Forms**: TanStack Form + Zod (create/edit reused; field-for-field aligned with the backend DTOs)
- **Styling / UI**: Tailwind 4 + shadcn-style primitives (Radix + `radix-ui`), incl. the `sidebar-16` inset layout
- **Linting**: oxlint (`react/only-export-components` and `react/set-state-in-effect` disabled — see `.oxlintrc.json` and decision record)
- **Testing**: Vitest + React Testing Library (unit/component/snapshot), Playwright (e2e)

## Prerequisites
- Node.js >= 20
- The **backend** running (NestJS on `http://localhost:3000`) — required for the dev proxy and e2e.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment (optional in dev)
```bash
cp .env.example .env   # VITE_API_BASE_URL
```
`VITE_API_BASE_URL`: base URL of the backend **including the `/api` prefix**.
- **Development**: can be left unset (or uncomment `http://localhost:3000/api`). The Vite dev server proxies same-origin `/api` to `http://localhost:3000` (see `vite.config.ts`), so no env is required locally.
- **Production** (e.g. Vercel): **required** — the browser calls the deployed backend directly; there is no Vite proxy at runtime.

### 3. Run the dev server
```bash
npm run dev       # http://localhost:5173
```

Sign in with the `ADMIN_EMAIL`/`ADMIN_PASSWORD` provisioned on the backend, or register a new read-only (`EMPLOYEE_VIEWER`) account.

## Scripts
| Script | Description |
| --- | --- |
| `npm run dev` | Vite dev server on `:5173` (proxies `/api` → `:3000`) |
| `npm run build` | Type-check (`tsc -b`) + production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | oxlint |
| `npm test` | Vitest unit/component/snapshot tests |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:e2e` | Playwright e2e (starts the Vite dev server; requires the backend running) |

## Environment variables
| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Backend base URL incl. `/api`. Unset in dev (proxy); set to the deployed backend in production. |

## Folder structure
```
src/
├── app/            # Router + QueryClient bootstrap
├── components/
│   ├── layout/     # app-shell, page-header, sidebar-16 (app-sidebar, site-header, nav-*)
│   └── ui/         # shadcn-style primitives (button, table, dialog, sidebar, ...)
├── features/       # auth / employees / departments (api, hooks, schemas, components)
├── hooks/          # generic hooks (use-mobile)
├── lib/            # typed API client, auth context, query keys, types, utils
├── routes/         # file-based TanStack Router routes (+ routeTree generated)
└── test/           # Vitest setup, render helper, fixtures
```

## Testing
```bash
npm test            # unit/component (Vitest + RTL) + schema + snapshot tests
npm run test:e2e    # Playwright (authenticated storage-state setup)
```

The Playwright suite runs against a real seeded backend (via the Vite `/api` proxy). It logs in as the seeded admin once and reuses the session via storage state (`e2e/.auth/admin.json`).

## Deployment (Vercel)
The frontend is a static SPA; output lives in `dist/`.
1. Point the Vercel project at the `frontend/` directory (framework preset: Vite).
2. Set an environment variable `VITE_API_BASE_URL` to the **deployed** backend base URL (e.g. `https://your-backend-host/api`). Vite inlines `VITE_*` vars at build time.
3. Ensure the backend allows this origin — configure `CORS_ORIGIN` on the backend as a comma-separated list of allowed origins (see `backend/README.md`).

> The browser calls the deployed backend directly. For local/e2e, the same code paths work through the Vite dev proxy with `VITE_API_BASE_URL` unset.