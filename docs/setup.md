# Setup & Development

## Prerequisites

- **Node.js 18+** and **npm** (the project is a Vite + React + TypeScript SPA).
- The app runs in **mock-API mode** by default (see `.env`:
  `VITE_USE_MOCK_API=true`), so no backend is required to develop or test.

## Install & run

```bash
npm install        # install dependencies
npm run dev        # start the Vite dev server (default: http://localhost:5173)
```

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
