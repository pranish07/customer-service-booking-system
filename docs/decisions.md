# Technical Decisions

This document records the key technical decisions made while building the
customer-service booking system and, for each, **what** was chosen, **why** it
was chosen, the **alternatives** considered, and why those alternatives were
rejected. It reflects the actual choices in the codebase — it is not generic
boilerplate.

---

## 1. React Query for server state (vs. manual `fetch` + local state)

**Chosen:** TanStack Query (`useQuery` / `useMutation`). The `api/client`
layer performs raw fetches, but every feature consumes data through a React
Query hook (e.g. `useServices`, `useServiceDetails`, `useAvailability`,
`useCreateBooking`, `useBookings`).

**Why:**

- The app's state is dominated by **server-derived data**: service lists,
  service details, availability slots, and bookings. A booking action must
  immediately be reflected elsewhere (creating a booking invalidates the
  `bookings`, `services`, and `availability` caches — see
  `useCreateBooking.ts`). That cross-screen coherence is exactly what React
  Query's cache + cache invalidation solve for free.
- The requirements called for loading / error / empty / success states on
  every feature. React Query exposes `isLoading`, `isError`, `error`, and
  `data` uniformly, which the container pattern maps directly onto dedicated
  presentational components (see `docs/architecture.md` §8).
- Background refetch, request deduplication, and retry came bundled and are
  tolerant of the mock layer's artificial latency.

**Alternatives considered and rejected:**

- **Raw `fetch` + `useState` per feature.** Would have meant hand-rolling a
  loading/error/data flag triplet in every component, plus manual request
  deduplication and no shared cache across screens. The booking confirmation
  flow alone invalidates three caches after a mutation — that coordination is
  exactly what a hand-rolled approach gets wrong, so it was rejected.
- **A dedicated global client-state store (Redux/Zustand) for API state.**
  Rejected: there is no client state that must be shared across unrelated
  components without going through the URL or the server. All of the app's
  data is either server-derived (React Query), form-scoped (React Hook Form),
  URL-derived (the router), or ephemeral UI state (`useState`/`useReducer`).
  A store would have been a fourth place to look for state with no benefit
  (`docs/architecture.md` §6).

---

## 2. Runtime schema validation with Zod at the client boundary

**Chosen:** Every client function parses its response (and `POST /bookings`
request) against a Zod schema before returning it to the caller. The schemas
live in `api/client/schemas.ts` and are the **single source of runtime truth**;
the TypeScript types are inferred from them via `z.infer<>` and re-exported
for type-only use (`docs/architecture.md` §5).

**Why:**

- TypeScript types are **compile-time only** — they erase at build time and
  cannot protect against a mismatched mock or a real server returning a
  differently-shaped object. In a project with an in-memory mock that must
  faithfully mirror an API contract (see decision #3), a `z.parse()` is the
  only way to catch contract drift *at runtime, in development*, where it's
  cheap to fix.
- The `booking` request schema is deliberately reused for **both** the client
  form validation (via `customerDetailsSchema`, which `BookingRequestSchema.pick`s
  the field rules) *and* the server contract, so client and server validation
  cannot silently diverge.

**What happens on failure:** when `z.parse()` throws a `ZodError`,
`normalizeError` in `api/client/index.ts:31` maps each issue path/message into
an `ApiError` with code `INTERNAL_ERROR` and message
`"Response did not match the expected schema."` — so a contract-drift bug
surfaces as a normalised, logged error rather than a silent wrong render
(verified by `src/api/schemaValidation.test.ts`).

**Alternatives considered and rejected:**

- **Trust TS types alone.** Rejected for the reason above: types give you
  compile-time confidence only and do nothing at runtime. The whole point of a
  mock in this build is to be a proxy for a future backend, so treating its
  output as unverified would let drift go unnoticed.
- **A hand-written runtime guard (`instanceof` / `typeof` checks) per
  endpoint.** Rejected: it duplicated the shape description in two places
  (types + guards) with no way to keep them in sync; Zod lets the schema be the
  single source and derive the type.

---

## 3. The `VITE_USE_MOCK_API` toggle and in-memory mock design

**Chosen:** The client reads `VITE_USE_MOCK_API` from the environment
(`isMock()` in `api/client/index.ts:22`). When `true`, the client functions
call `api/mock` handlers directly; when `false`, they issue a real `fetch()` to
`/api/v1/...`. Swapping backends is a single env change with zero code changes.
Mock mode is on by default via `.env` (`.env.example` documents it).

**Why:**

- The project has no backend yet, but the architecture should be ready for
  one. Routing through an env toggle at the client boundary means features and
  React Query hooks never care whether they're talking to a mock or a real API
  — they always call `api/services` functions.
- Because mock responses flow through the **same** `withErrorNormalization`
  and Zod-parse pipeline as real HTTP responses (`api/client/index.ts`), the
  mock exercises the production validation path instead of bypassing it. This
  is a deliberate design payoff of decision #2.

**How the mock is shaped:**
- In-memory seed data (`servicesDb`, availability, bookings) matching the
  contract exactly, with the custom `id()` helper producing stable ids
  (`svc_01`, `bkg_01`).
- Artificial delays simulate network latency (which is why the Vitest
  `testTimeout` is 20s).
- A `setForceError(code)` utility lets the browser console or tests force a
  specific error (e.g. `SLOT_UNAVAILABLE`) to exercise error branches
  end-to-end without a real backend. It also exposes `resetDb()` for test
  isolation.

**Alternatives considered and rejected:**

- **No mock at all — build against a placeholder HTTP server.**
  Rejected: it adds a second process and network stack to a phase whose goal
  is frontend UI + flows. An in-process mock keeps `npm run dev` a single
  command with no external dependencies.
- **Hard-code mock data directly into feature components/hooks.**
  Rejected: it couples the UI to mock data shape, makes the mock/real swap
  invasive, and bypasses validation. Placing the mock behind the client keeps
  the layering clean (`docs/architecture.md` §1) — features import only from
  `api/services`, never from `api/mock` or `api/client`.
- **A MSW (Mock Service Worker) approach.** Considered, but rejected for this
  phase: MSW is best when you need to intercept *real `fetch` calls* at the
  network level. Here the client already has an explicit branch (`isMock()`),
  so an in-process mock is simpler and keeps the "real HTTP transport"
  (`fetchJson`) code path separate and testable in its own right.

---

## 4. React Hook Form + Zod for the booking form (vs. manual form state)

**Chosen:** The customer/address step of the booking flow is a React Hook Form
controlled via `@hookform/resolvers/zod`, backed by `customerDetailsSchema`
(derived from `BookingRequestSchema`, decision #2). Fields are rendered with
Chakra `Controller` components, and errors surface through `FormErrorMessage`.

**Why:**

- Validation rules already exist as the Zod `BookingRequestSchema` (the same
  schema the server validates against). Reusing it via `zodResolver` means the
  form's rules can never drift from the API contract — one source of truth.
- RHF manages field registration, dirty/touched tracking, and re-render
  isolation, which manual `useState` per field does not: a keystroke in one
  input doesn't re-render the others.
- The form needs "edit details" (returning to a previously filled form) after
  a successful summary step — RHF's `defaultValues` makes pre-filling the
  saved customer from `bookingFlow` state trivial.

**Alternatives considered and rejected:**

- **Manual `useState` for every field + hand-written validation/handlers.**
  Rejected: it would duplicate field rules (contradicting decision #2's
  single-source goal), require manual error-state tracking per field, and
  re-render the whole form on every keystroke.
- **A heavier form library or raw controlled inputs without a validation
  resolver.** Rejected: not needed. RHF + Zod resolver is the lightest
  combination that gives declarative, schema-driven validation.

---

## 5. A reducer/state-machine for the multi-step booking flow (vs. scattered `useState`)

**Chosen:** The booking wizard (`date → slot → details → summary`) is driven by
a single reducer in `bookingFlow.ts` exposing `BookingFlowState` and a small
set of actions (`SELECT_DATE`, `SELECT_SLOT`, `SET_CUSTOMER`, `GO_BACK`,
`RETURN_TO_SLOT`).

**Why:**

- The steps **share state**: a chosen `date` feeds the availability query, a
  chosen `slot` must appear in the summary, and the customer details carry
  into the confirm step. That coupling is state-machine-shaped, not
  independent-state-shaped.
- **Transitions have side effects that must be explicit.** Selecting a new
  date *clears the slot* (so you can never book a slot from a different day);
  `GO_BACK` computes the exact previous step; `RETURN_TO_SLOT` (used after a
  `409` slot-taken conflict) drops the selected slot so the user re-picks
  another time. Containing these invariants in one reducer makes them
  unit-testable and impossible to break by other `useState` calls drifting out
  of sync.
- The reducer is a pure function, so the whole flow can be unit-tested in
  isolation without rendering the UI.

**Alternatives considered and rejected:**

- **Several independent `useState` values (one per step + selected date/slot +
  customer) and imperative choreography.**
  Rejected: nothing would enforce the invariants (e.g. clearing the slot on
  date change, correct back-navigation), and the flow logic would be scattered
  across the page component and hard to test.
- **A formal XState machine / a third-party finite-state-machine library.**
  Rejected: overkill for a five-step linear wizard. The reducer's `switch` over
  a `BookingStep` union captures the needed guarantees with zero new
  dependency and full type safety.
- **Lifting all flow state into a global store.** Rejected: this state lives
  entirely inside one feature page, so it doesn't belong in a shared store
  (consistent with decision #1's "no global store" reasoning).

---

## 6. Error-normalization strategy: the `ApiError` shape, ErrorBoundary vs. per-feature states

**Chosen:** A two-tier error strategy.

1. **Per-feature data states (primary).** Every data error is a React Query
   `isError` state rendered inside its own feature via a dedicated
   `FeatureError` presentational component (`role="alert"`, auto-focused) with
   a "Try again" retry — *not* an exception thrown to a global boundary.
   Loading/empty/error/success are handled explicitly in every container
   (`docs/architecture.md` §8).
2. **One normalised error shape.** All of `api/client`'s error sources — the
   mock handler's rejection, an HTTP non-2xx, a Zod schema mismatch, or a
   network failure — are funneled through `normalizeError` into a single
   `ApiError = { error: { code, message, details? } }`. Features never handle
   raw `Error`, `ZodError`, or `fetch` failures; they pattern-match on
   `error.code` (e.g. `SLOT_UNAVAILABLE`, `DUPLICATE_BOOKING` →
   "Time no longer available"; `VALIDATION_ERROR` → field errors).
3. **ErrorBoundary as a last resort only.** The class-based `ErrorBoundary`
   wraps the router and catches **render-time** exceptions that React Query
   and try/catch cannot (`docs/architecture.md` §7). It is explicitly not a
   substitute for per-feature error handling.
4. **UI copy vs. telemetry split.** `userFacingMessage()` returns friendly,
   non-technical copy for the screen, while the machine-readable `error.code`
   is logged via `logApiError()` in the global `QueryCache.onError` telemetry
   hook (`main.tsx`), so the cause stays diagnosable without exposing raw
   server text to users. `DevErrorSimulator` (dev only, `?__boom`) makes the
   ErrorBoundary path reachable for testing.

**Why:**

- Distinguishing **data errors** (expected, recoverable: 404 / 409 / 500) from
  **render errors** (unexpected bugs) leads to different handling. The former
  belong in the feature UI with a retry; the latter belong in the boundary.
  Collapsing them into one global boundary would lose the in-context retry and
  the per-field detail needed for a 409/validation.
- Normalising everything to `ApiError` keeps features simple (one error type to
  read) and gives a stable machine code for telemetry, while the 
  `ErrorBoundary` provides a safety net for genuine crashes.

**Alternatives considered and rejected:**

- **Handle every error via the ErrorBoundary (let data errors throw).**
  Rejected: data errors are normal control flow, not bugs. A global boundary
  offers no in-context retry button, no field-level details for validation
  errors, and would reset the whole page instead of just the failed query.
- **Let raw `Error`/`ZodError`/`fetch` failure objects propagate to
  components.**
  Rejected: it produces inconsistent handling per feature and forces components
  to know about transport details (HTTP status, Zod internals). The single
  `ApiError` shape + `code`-based branching keeps features transport-agnostic.
- **A global client-state store for error toasts instead of per-feature
  error components.**
  Rejected: toasts are disruptive for full-page data loads; an inline, focused
  error state with a retry button is better UX than a global toast, and it
  keeps error display co-located with the data it describes.

---

## Document index

- `docs/architecture.md` — code structure, layering, container/presentational
  split, state and error-handling patterns.
- `docs/api-contract.md` — the HTTP contract the client and mock implement.
- `docs/setup.md` — prerequisites, install, env config, and running tests.
