# Setup & Development

This document covers prerequisites, installation, environment configuration,
how to run the app, how the in-process mock API works, and how to run tests.

---

## Prerequisites

- **Node.js 18+** and **npm** (the project is a Vite + React + TypeScript SPA).
- No database or separate backend is required — the app runs in **mock-API
  mode** by default (see below), so everything runs in a single process.

## Installation

```bash
npm install
```

## Configuration (`VITE_USE_MOCK_API`)

The app talks to a backend only if you point it at one. This is controlled by a
single environment variable read at the client boundary
(`src/api/client/index.ts`):

| `VITE_USE_MOCK_API` | Behaviour                                                        |
|---------------------|------------------------------------------------------------------|
| `true` (default)    | Client calls the in-process mock handlers — no network/server.   |
| `false`             | Client issues real `fetch()` calls to `/api/v1/...` (your server). |

By default `.env` sets `VITE_USE_MOCK_API=true`. To run against a real backend,
set it to `false` (and serve the API at the same origin, or adjust the base
URL in `src/api/client/index.ts`). `.env.example` documents the available
variables. Env vars are read via Vite's `import.meta.env`; changes require a
dev-server restart.

Swapping backends requires **no code changes** — features always call
`api/services` functions, which the client routes to mock or real based on
this toggle.

## Running the app

```bash
npm run dev     # start the Vite dev server (default: http://localhost:5173)
npm run build   # type-check (tsc -b) then production-build
npm run preview # preview the production build
```

## How the mock API runs

The mock is **in-process** — there is no separate server to start. When
`VITE_USE_MOCK_API=true`:

- `api/client` calls `api/mock` handlers directly instead of `fetch`. The
  handlers return the same shape the real API would, seeded from in-memory
  data (`servicesDb`, availability slots, bookings).
- Artificial delays are added to simulate network latency, which is why the
  Vitest `testTimeout` is generous (20s).
- Mock responses still flow through the **real validation pipeline** (Zod
  schema parsing + error normalization), so the mock exercises production
  code paths rather than bypassing them.
- Two test/debug utilities are exposed (`src/api/mock/index.ts`):
  - `setForceError(code)` — force the mock to return a specific error (e.g.
    `SLOT_UNAVAILABLE`) for every subsequent request, for demoing error
    branches. Pass `null` to clear.
  - `resetDb()` — restore the in-memory seed data (used in test isolation).

Call these from the browser devtools console or from tests.

## Scripts

| Command          | Purpose                                              |
|------------------|------------------------------------------------------|
| `npm run dev`    | Start the dev server                                 |
| `npm run build`  | Type-check (`tsc -b`) then production-build          |
| `npm run preview`| Preview the production build                         |
| `npm run lint`   | ESLint over `ts,tsx` (zero warnings allowed)         |
| `npm run format` | Prettier formatting of `src/**`                      |
| `npm run test`   | Run tests in watch mode                              |
| `npm run test:run` | Run the full test suite once and exit             |
| `npm run test:ui`  | Run tests with the Vitest UI                         |

## Running tests

The project uses **Vitest** with **React Testing Library**.

- Run the whole suite once:

  ```bash
  npm run test:run
  ```

- Run a single file (fast feedback while working on a feature):

  ```bash
  npx vitest run src/features/booking/BookingPage.test.tsx
  ```

- Run tests matching a name pattern:

  ```bash
  npx vitest run -t "confirmation"
  ```

- During development, `npm run test` runs in watch mode and re-runs affected
  tests as you edit.

### Test layout & conventions

Test files live next to the code they cover (e.g.
`src/features/service-list/ServiceListPage.test.tsx`). Shared, schema-valid
fixtures for mocked API responses live in `src/test/fixtures.ts`.

**Mocking the API layer.** Component and hook tests mock `@/api/services`
(the layer features import from), not the raw in-memory mock server. This keeps
tests decoupled from seeded mock data and lets each case control the exact
response/error. The one exception is the runtime schema-validation test
(`src/api/schemaValidation.test.ts`), which intentionally mocks `@/api/mock`
to force a malformed payload and prove the real client-side Zod validation
surfaces it as an `ApiError`.

The test environment uses `jsdom` with `globals: true` and a `testTimeout` of
`20s` (see `vite.config.ts`) — the generous timeout accommodates the mock
layer's artificial network delay.

## Document index

- `docs/architecture.md` — code structure and layering.
- `docs/api-contract.md` — the HTTP contract the client and mock implement.
- `docs/decisions.md` — the technical decisions behind these choices.
