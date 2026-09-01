# Frontend Architecture

This document describes the architecture of the customer-service booking system. It is the single source of truth for how code is structured, how data flows, and what rules later feature phases must follow.

---

## 1. Layered Architecture

Every feature follows a strict dependency direction. Each layer imports only from the layer directly below it.

```
┌─────────────────────────────────────────────────────────┐
│                    UI / Components                       │
│  Presentational components (props only, no fetching)     │
├─────────────────────────────────────────────────────────┤
│                  Feature Containers                      │
│  Owns data-fetching via hooks, passes props down         │
├─────────────────────────────────────────────────────────┤
│                    Hooks (shared)                        │
│  React Query wrappers, form helpers                     │
├─────────────────────────────────────────────────────────┤
│              API / Services (feature functions)          │
│  Typed query/mutation functions per feature              │
├─────────────────────────────────────────────────────────┤
│                 API / Client (HTTP transport)            │
│  fetch wrapper, Zod validation, mock ↔ real toggle      │
├─────────────────────────────────────────────────────────┤
│                API / Mock (in-memory)                    │
│  Fake responses matching the API contract exactly        │
└─────────────────────────────────────────────────────────┘
```

**Rule:** A feature container may import from `api/services` and from its own co-located presentational components. It must never import from `api/client` or `api/mock` directly. Presentational components must never import from any `api/*` path.

---

## 2. Folder Structure

```
src/
├── api/
│   ├── index.ts              # Public barrel, re-exports service functions + test utils
│   ├── userMessage.ts        # userFacingMessage() + logApiError() helpers
│   ├── client/
│   │   ├── index.ts          # HTTP client: fetch + Zod validation + mock toggle
│   │   └── schemas.ts        # Zod schemas (runtime source of truth)
│   ├── mock/
│   │   └── index.ts          # In-memory mock handlers + setForceError/resetDb
│   └── services/
│       └── index.ts          # Feature-specific API functions + BookingRequestSchema
│
├── components/
│   ├── index.ts              # Barrel: shared, feature-agnostic components
│   ├── BackIcon.tsx          # Chakra icon (createIcon)
│   ├── CheckCircleIcon.tsx   # Chakra icon (createIcon)
│   ├── DevErrorSimulator.tsx # Dev-only trigger for the error boundary
│   ├── ErrorBoundary.tsx     # Class component, last-resort render-error catch
│   └── page-skeletons.tsx    # Route-aware page skeletons (shared + Suspense fallback)
│
├── features/
│   ├── index.ts              # Aggregate barrel of the five feature pages
│   ├── service-list/
│   │   ├── index.ts          # Re-exports ServiceListPage
│   │   ├── ServiceListPage.tsx        # Container
│   │   ├── useServices.ts             # React Query hook + client-side filter/search
│   │   ├── ServiceCard.tsx / ServiceListGrid.tsx / SearchBar.tsx /
│   │   │   CategoryFilter.tsx / ServiceListError.tsx / ServiceListEmpty.tsx
│   │   └── ServiceListPage.test.tsx
│   ├── service-details/
│   │   ├── index.ts
│   │   ├── ServiceDetailsPage.tsx     # Container
│   │   ├── useServiceDetails.ts       # React Query hook
│   │   ├── ServiceDetailsContent.tsx / ServiceDetailsError.tsx
│   │   └── ServiceDetailsPage.test.tsx
│   ├── booking/
│   │   ├── index.ts
│   │   ├── BookingPage.tsx            # Container
│   │   ├── bookingFlow.ts             # Reducer/state machine
│   │   ├── customerDetailsSchema.ts   # Zod form rules from BookingRequestSchema
│   │   ├── useAvailability.ts / useCreateBooking.ts
│   │   ├── BookingDateStep / BookingSlotStep / BookingSlotStepLoading /
│   │   │   CustomerDetailsForm / BookingSummary / BookingStepper /
│   │   │   BookingError / BookingLoading
│   │   └── BookingPage.test.tsx / BookingFlow.test.tsx
│   ├── confirmation/
│   │   ├── index.ts
│   │   ├── ConfirmationPage.tsx       # Container
│   │   ├── ConfirmationCard.tsx
│   │   └── ConfirmationPage.test.tsx
│   └── my-bookings/
│       ├── index.ts
│       ├── MyBookingsPage.tsx         # Container
│       ├── useBookings.ts             # React Query hook
│       ├── MyBookingsEmailPrompt.tsx / BookingsList.tsx / BookingsListLoading.tsx /
│       │   BookingDetails.tsx / BookingDetailsLoading.tsx
│       └── MyBookingsPage.test.tsx
│
├── hooks/
│   ├── index.ts              # Barrel
│   ├── useDebouncedValue.ts  # Debounces a value (e.g. search input)
│   └── useFocusOnMount.ts    # Focuses a ref on mount (e.g. error banners)
│
├── types/
│   └── index.ts              # Shared TypeScript domain types
│
├── test/
│   ├── setup.ts              # Vitest setup (jest-dom matchers)
│   └── fixtures.ts           # Schema-valid test fixtures
│
├── App.tsx                   # Router, Suspense, ErrorBoundary
└── main.tsx                  # Providers: Chakra, React Query, BrowserRouter
```

**Barrels and lazy loading.** Each folder exposes an `index.ts` barrel for
tidy, feature-agnostic imports. The router does **not** import through the
`features/index.ts` aggregate; it loads each page directly by file path via
`React.lazy()` (see §9) so Vite keeps **one chunk per feature**. The per-feature
barrels re-export that feature's page as its public surface, and the
`features/index.ts` aggregate collects all five pages for convenience. Do not
reroute the `lazy()` imports through an aggregate, as that can collapse all
features into a single chunk. Feature-to-feature _component/hook/state_ imports
remain disallowed regardless (see §3); the barrels re-export pages, which
cross-feature routing already reaches via URL navigation.

### Responsibility per folder

| Folder                | Owns                                                          | Never contains                                   |
| --------------------- | ------------------------------------------------------------- | ------------------------------------------------ |
| `api/client/`         | HTTP transport, response validation, mock/real dispatch       | Business logic, UI code                          |
| `api/mock/`           | In-memory data, artificial delays                             | Real HTTP calls                                  |
| `api/services/`       | One function per endpoint, typed request/response             | Validation logic, UI                             |
| `api/index.ts`        | Public re-exports from `api/services/`                        | Direct client/mock imports                       |
| `components/`         | Reusable, feature-agnostic UI primitives                      | Feature-specific logic, data fetching            |
| `features/*/index.ts` | Re-exports that feature's page as its public surface          | Component/hook/state imports from other features |
| `features/index.ts`   | Aggregate of the five feature pages                           | The router's lazy imports                        |
| `features/*/`         | One feature per folder: container + presentational components | Imports from other features                      |
| `hooks/`              | Shared, feature-agnostic hooks (debounce, focus)              | Feature-specific hooks (stay in `features/`)     |
| `types/`              | Shared domain interfaces and type aliases                     | Runtime logic, Zod schemas                       |

---

## 3. Feature Boundaries

Each feature folder is an isolated unit. Cross-feature communication is limited to URL navigation. One feature never imports another feature's components, hooks, or internal state.

```
service-list ──(link)──► service-details ──(link)──► booking ──(navigate)──► confirmation
                                                                              ▲
my-bookings ──(link)──► booking (re-book) ──────────────────────────────────┘
```

**Isolation rules:**

- `service-list` knows nothing about bookings. It renders a list and links to `service-details`.
- `service-details` reads `:serviceId` from the URL, fetches service data, and links to the booking page.
- `booking` reads `:serviceId` from the URL, owns the booking form, and navigates to `/confirmation` on success. It does not import from `service-details` or `my-bookings`.
- `confirmation` reads query params (`bookingId` from the URL search string or a React Router state prop). It displays a success card. It does not re-fetch or import from `booking`.
- `my-bookings` asks for an email, fetches the booking list, and displays results. It may link to re-book, but does not import from `booking`.

If two features need the same data (e.g. both need a service list), each calls its own service function. React Query's shared cache deduplicates the underlying request automatically.

---

## 4. Component Responsibilities: Container and Presentational Split

**This is a rule, not an aspiration. Every feature phase must follow it.**

Each feature page is composed of two layers:

### Container (data owner)

- The `*Page.tsx` file (e.g. `ServiceListPage.tsx`) is the container.
- It calls the React Query hook (e.g. `useQuery` with the service-list query).
- It reads `isLoading`, `isError`, `error`, and `data` from the hook.
- It renders the correct presentational component based on the state: `<ServiceListPageSkeleton />`, `<ServiceListError />`, `<ServiceListEmpty />`, or `<ServiceList data={services} />`. Page skeletons are shared via `components/page-skeletons.tsx` so the Suspense fallback and the feature data-loading state render the same skeleton.
- It owns URL param extraction (`useParams`, `useSearchParams`).
- It owns navigation callbacks (`useNavigate`).
- It never renders raw HTML or styling. All visual output is delegated to presentational components.

### Presentational (display only)

- Co-located in the same feature folder (e.g. `ServiceCard.tsx`, `ServiceGrid.tsx`).
- Receives data exclusively via props.
- Contains **zero** `useQuery`, `useMutation`, `useParams`, `useNavigate`, or any hook that touches network/state beyond what it receives.
- May use Chakra components for layout and styling.
- Is independently testable with hardcoded props.

### File layout per feature

```
features/service-list/
├── ServiceListPage.tsx        # Container, owns query, renders presentational
├── ServiceListError.tsx       # Error card with retry
├── ServiceListEmpty.tsx       # Empty state
└── ServiceCard.tsx            # Presentational, receives Service props
```

Not every feature needs all four states as separate files, but the container must handle all four cases (loading, error, empty, success) regardless of how the presentational components are organised.

---

## 5. API / Service Layer Design

### The call chain

```
Container (feature page)
    │
    │  calls service function
    ▼
api/services/index.ts
    │
    │  calls client function
    ▼
api/client/index.ts
    │
    │  reads VITE_USE_MOCK_API
    ├──► true  → api/mock/index.ts (returns in-memory data)
    │
    └──► false → real HTTP fetch()
    │
    │  validates response against Zod schema
    ▼
Typed result returned to caller
```

### HTTP Client (`api/client/index.ts`)

The client exports typed functions that wrap `fetch` and add Zod validation:

```ts
// Conceptual shape, not actual implementation
export async function getServices(
  params?: ServiceListParams,
): Promise<Service[]> {
  const response = await fetch(buildUrl('/api/v1/services', params))
  const json = await response.json()

  if (!response.ok) {
    throw normalizeError(json, response.status)
  }

  return z.array(ServiceSchema).parse(json) // throws ZodError on shape mismatch
}
```

**Key responsibilities:**

1. Build the URL from path + params.
2. Call `fetch` (or delegate to the mock handler when `VITE_USE_MOCK_API=true`).
3. Check `response.ok`. If false, parse the body as `ApiError` and throw it.
4. Parse the success body against the corresponding Zod schema. If the shape doesn't match, throw a `ZodError`. This catches mock/contract drift immediately in development.
5. Return the validated, typed result.

### Mock toggle (`VITE_USE_MOCK_API`)

When the env var is `true`, the client functions call the mock handler directly instead of `fetch`. The mock handler returns the same shaped data (with artificial delays to simulate latency). When `false`, a real HTTP call is made. Swapping to a real backend requires only changing the env var, with no code changes.

### Service functions (`api/services/index.ts`)

One exported function per API endpoint. These are thin wrappers that call the client and are consumed by React Query hooks:

```
getServices()           → GET /api/v1/services
getServiceDetails(id)   → GET /api/v1/services/{id}
getServiceAvailability(id, params) → GET /api/v1/services/{id}/availability
createBooking(data)     → POST /api/v1/bookings
getBookings(email)      → GET /api/v1/bookings
getBookingById(id)      → GET /api/v1/bookings/{id}
```

React Query hooks in `hooks/` or co-located in `features/*/` call these service functions inside their `queryFn` or `mutationFn`.

---

## 6. State Management

### What goes where

| Concern                                                        | Tool                                                      | Why                                                                                                                                                                                             |
| -------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Server state** (services, availability, bookings)            | TanStack Query (`useQuery`, `useMutation`)                | Automatic caching, deduplication, background refetch, optimistic updates, retry. No manual cache invalidation code.                                                                             |
| **Form state** (booking form fields, validation)               | React Hook Form + Zod resolver (`@hookform/resolvers`)    | Declarative validation, minimal re-renders, integrates directly with Zod schemas from `api/client/schemas.ts`.                                                                                  |
| **Local UI state** (modals, toggles, input focus)              | `useState` / `useReducer` in the component that owns it   | Simple, colocated, no prop-drilling overhead.                                                                                                                                                   |
| **URL state** (selected service, filter, booking confirmation) | React Router (`useParams`, `useSearchParams`, `navigate`) | Shareable, bookmarkable, back-button friendly.                                                                                                                                                  |
| **Global store**                                               | None                                                      | No global client state is needed. Server state is managed by React Query's cache. Form state is scoped to the form. There is no cross-cutting client state that warrants a Redux/Zustand store. |

### Why no global store

Every piece of state in this app is either:

- **Server-derived**: React Query owns it.
- **Form-scoped**: React Hook Form owns it.
- **URL-derived**: React Router owns it.
- **Ephemeral UI**: local `useState` owns it.

There is no state that needs to be shared across unrelated components without going through the URL or server. Adding a global store would create a fourth place to look for state with no corresponding benefit.

---

## 7. Error Handling Strategy

### Error taxonomy

| Category             | Source                                             | HTTP codes                  | Client handling                                                                                                      |
| -------------------- | -------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Validation error** | Request body/params fail server validation         | `400`                       | Surface field-level errors from `error.details` in the form UI.                                                      |
| **Not found**        | Resource doesn't exist                             | `404`                       | Show a "not found" message. For services, link back to the list.                                                     |
| **Conflict**         | Slot already booked or duplicate booking           | `409`                       | Show a toast with the `error.message`. Prompt user to retry with different input.                                    |
| **Server error**     | Unexpected backend failure                         | `500`                       | Show an error card with a "Retry" button. Use React Query's exponential backoff.                                     |
| **Schema mismatch**  | Mock data or API response doesn't match Zod schema | N/A (thrown by `z.parse()`) | Caught in development only. Surfaces as an `ErrorBoundary` crash or console error, and signals a contract drift bug. |
| **Render error**     | Unhandled exception in a component                 | N/A                         | Caught by the top-level `ErrorBoundary`.                                                                             |

### The error flow

```
Mock/HTTP response
    │
    ├─ response.ok === false
    │   │
    │   ▼
    │  Client parses body as ApiError
    │   │
    │   ▼
    │  Throws ApiError { error: { code, message, details } }
    │
    ├─ response.ok === true, but z.parse() fails
    │   │
    │   ▼
    │  Throws ZodError (contract drift, dev-only bug)
    │
    ▼
React Query catches the thrown error in queryFn/mutationFn
    │
    ▼
useQuery / useMutation exposes `error` (typed as ApiError | Error)
    │
    ▼
Container reads `isError` and `error`
    │
    ├─ if error is ApiError → render <FeatureError error={error} />
    │                          (surface code, message, field details)
    │
    └─ if error is ZodError or unexpected → render generic error card
                                            (and log to console in dev)
```

### ErrorBoundary (last resort)

The class-based `ErrorBoundary` in `src/components/ErrorBoundary.tsx` wraps the entire router. It catches **render-time exceptions**, which are errors that occur during React's rendering phase and cannot be caught by React Query or try/catch.

It is **not** a substitute for per-feature error handling. Every feature must handle its own loading/error/empty states explicitly. The ErrorBoundary exists only for:

- Unexpected bugs in component code (e.g. accessing `undefined.foo`).
- Errors thrown by Chakra or other libraries during render.

Its current behaviour (alert + "Try again" button that resets state) is a scaffold. A later phase may add error-tracking integration via `componentDidCatch`.

---

## 8. Loading / Empty / Error / Success States

Every data-fetching feature page must handle exactly four states. The pattern is consistent across all features. No feature should invent its own state management.

### Representation

React Query provides `status` on every query result. The container maps it to the appropriate presentational component:

```ts
// Conceptual pattern used in every feature container
function ServiceListPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  if (isLoading)       return <ServiceListPageSkeleton />;
  if (isError)         return <ServiceListError error={error} />;
  if (data.length === 0) return <ServiceListEmpty />;
  return <ServiceList services={data} />;
}
```

| State       | React Query flag                                          | Container renders                | Presentational component                  |
| ----------- | --------------------------------------------------------- | -------------------------------- | ----------------------------------------- |
| **Loading** | `isLoading === true`                                      | `<FeatureLoading />`             | Chakra `Skeleton` or `Spinner`            |
| **Error**   | `isError === true`                                        | `<FeatureError error={error} />` | `Alert` with error message + retry button |
| **Empty**   | `data.length === 0` (arrays) or `data === null` (singles) | `<FeatureEmpty />`               | Illustration + helper text                |
| **Success** | `isSuccess === true && data.length > 0`                   | `<Feature data={data} />`        | The actual content (cards, forms, tables) |

### Why this pattern

- **Consistency:** Users see the same skeleton/error/empty shapes across every feature. No cognitive load learning new patterns.
- **Testability:** Each state is a separate component with a clear prop contract. Tests can render each state in isolation.
- **No duplication:** The loading/error/empty components are feature-specific but follow the same structural pattern. Shared primitives (Chakra `Spinner`, `Alert`, `Skeleton`) come from `components/`.

### Mutation states (booking form)

The booking form uses `useMutation` which provides its own status flags:

| State          | Flag                                | UI behaviour                                   |
| -------------- | ----------------------------------- | ---------------------------------------------- |
| **Idle**       | `isPending === false && !submitted` | Form is editable, submit button enabled        |
| **Submitting** | `isPending === true`                | Submit button disabled, skeleton shown         |
| **Success**    | `isSuccess === true`                | Navigate to `/confirmation?bookingId={id}`     |
| **Error**      | `isError === true`                  | Surface error below the form, re-enable submit |

---

## 9. Route-Level Code Splitting

### What is lazy-loaded

Every feature page is wrapped with `React.lazy()` in `App.tsx`:

```ts
const ServiceListPage = lazy(
  () => import('@/features/service-list/ServiceListPage'),
)
```

This means each feature is a separate JavaScript chunk. The initial bundle contains only the router, providers, and the landing page (service list). Other features load on demand when the user navigates to them.

### Why

- **Smaller initial bundle:** The user downloads only what they need to see the service list. Booking, confirmation, and my-bookings code loads only when those routes are visited.
- **Better LCP:** The landing page renders faster because it doesn't carry the weight of unused features.
- **Cache-friendly:** Each chunk is independently cacheable by the browser.

### Suspense fallback UX

A single `<Suspense>` boundary in `App.tsx` covers all lazy routes. While a chunk loads, the user sees a centered `Spinner` at full viewport height (`minH="60vh"`).

**Behaviour:**

- First visit to a route shows a brief spinner (typically under 200ms on a warm cache, 0.5-2s on a cold one).
- Subsequent visits → instant (chunk is cached by Vite/bundler).
- No skeleton shimmer during code-split loading. Only a spinner appears. This is intentional: the spinner represents _code loading_, not _data loading_. Data loading has its own skeleton inside the feature's `isLoading` state.

### What is NOT lazy-loaded

- `App.tsx` (router + Suspense + ErrorBoundary): must be in the main bundle.
- `main.tsx` (providers): must run immediately.
- `src/components/ErrorBoundary.tsx`: must be synchronously available.
- Shared components in `src/components/`: loaded eagerly with the main bundle (they are small).
