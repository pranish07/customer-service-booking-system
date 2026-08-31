# API Contract — Booking Module

This document defines the complete HTTP API contract for the customer-service booking system. All endpoints are versioned under `/api/v1/`. Every request and response body uses `application/json`.

## Runtime Enforcement

Corresponding Zod schemas live in `src/api/client/schemas.ts`. These are the runtime source of truth: every mock/API response is validated against them before it reaches a component, so the contract is enforced programmatically, not just documented here. The shared TypeScript types derived from these schemas live in `src/types/index.ts`.

---

## Conventions

### Error Response Shape

All error responses follow a single envelope:

```json
{
  "error": {
    "code": "SLOT_UNAVAILABLE",
    "message": "Human-readable description of what went wrong.",
    "details": {
      "field": "Specific field-level context (optional)"
    }
  }
}
```

| Field     | Type              | Required | Description                                         |
|-----------|-------------------|----------|-----------------------------------------------------|
| `code`    | `string`          | Yes      | Machine-readable error code (see per-endpoint docs)  |
| `message` | `string`          | Yes      | Human-readable explanation                           |
| `details` | `Record<string, string>` | No  | Additional context (e.g. which field failed validation) |

### Loading & Caching Expectations

The client uses **TanStack Query**. Each endpoint maps to a query or mutation:

| Endpoint                     | Query/Mutation | Cache Key              | Invalidation On             |
|------------------------------|----------------|------------------------|-----------------------------|
| `GET /services`              | Query          | `['services']`         | After successful booking    |
| `GET /services/{id}`         | Query          | `['services', id]`     | After successful booking    |
| `GET /services/{id}/availability` | Query    | `['availability', id, params]** | After successful booking |
| `POST /bookings`             | Mutation       | —                      | Invalidates `['bookings']`, `['services']`, `['availability']` |
| `GET /bookings`              | Query          | `['bookings', params]` | After successful booking    |
| `GET /bookings/{id}`         | Query          | `['bookings', id]`     | After successful booking    |

**`params` includes any query-string filter values (e.g. `email`, `date`).

### Empty-Response Behaviour

- **List endpoints** (`GET /services`, `GET /bookings`, `GET /services/{id}/availability`): Return `200` with an empty array `[]` when no results match. They never return 404 for "no results".
- **Single-resource endpoints** (`GET /services/{id}`, `GET /bookings/{id}`): Return `404` when the resource does not exist.

### Retry-ability

- **`4xx` errors (except 409)**: Not retryable. The client should surface the error and require user action.
- **`409 Conflict`**: Retryable after the user changes the conflicting field (e.g. picks a different slot).
- **`500` errors**: Retryable. The client should offer a "Retry" button and use exponential backoff on automatic retries.

---

## Endpoints

---

### 1. List Services

```
GET /api/v1/services
```

**Purpose:** Retrieve all services offered by the platform.

#### Query Parameters

| Parameter  | Type     | Required | Description                                      |
|------------|----------|----------|--------------------------------------------------|
| `category` | `string` | No       | Filter by service category (exact match)         |
| `search`   | `string` | No       | Free-text search across name and description      |

#### Response — `200 OK`

```json
[
  {
    "id": "svc_01H8X1A2B3C4D5E6F7G8H9J0K",
    "name": "Deep Tissue Massage",
    "description": "A therapeutic massage targeting chronic muscle tension.",
    "durationMinutes": 60,
    "price": 8500,
    "currency": "USD",
    "category": "Wellness",
    "imageUrl": "https://cdn.example.com/images/massage.jpg"
  }
]
```

| Field              | Type              | Description                                    |
|--------------------|-------------------|------------------------------------------------|
| `id`               | `string`          | Unique service identifier (prefixed `svc_`)    |
| `name`             | `string`          | Display name                                   |
| `description`      | `string`          | Short description (one sentence)               |
| `durationMinutes`  | `number`          | Session length in minutes (positive integer)   |
| `price`            | `number`          | Price in minor currency units (cents)          |
| `currency`         | `string`          | ISO 4217 currency code                         |
| `category`         | `string`          | Category label for filtering                   |
| `imageUrl`         | `string \| null`  | Optional hero image URL                        |

#### Status Codes

| Code  | When                                         |
|-------|----------------------------------------------|
| `200` | Success (array, possibly empty)              |
| `500` | Unexpected server error                      |

#### Empty Behaviour

Returns `200` with `[]` when no services exist or no query filters match.

---

### 2. Get Service Details

```
GET /api/v1/services/{service_id}
```

**Purpose:** Retrieve full details for a single service, including extended information not present in the list view.

#### Path Parameters

| Parameter    | Type     | Required | Description            |
|--------------|----------|----------|------------------------|
| `service_id` | `string` | Yes      | The service identifier |

#### Response — `200 OK`

```json
{
  "id": "svc_01H8X1A2B3C4D5E6F7G8H9J0K",
  "name": "Deep Tissue Massage",
  "description": "A therapeutic massage targeting chronic muscle tension.",
  "longDescription": "Our deep tissue massage uses firm pressure and slow strokes to reach deeper layers of muscle and fascia. Ideal for chronic pain, injury recovery, and tension relief. Includes a brief consultation before the session.",
  "durationMinutes": 60,
  "price": 8500,
  "currency": "USD",
  "category": "Wellness",
  "imageUrl": "https://cdn.example.com/images/massage.jpg",
  "location": "123 Wellness Ave, Suite 200",
  "provider": "Sarah Johnson, LMT",
  "averageRating": 4.9
}
```

| Field              | Type              | Description                                         |
|--------------------|-------------------|-----------------------------------------------------|
| `id`               | `string`          | Unique service identifier                           |
| `name`             | `string`          | Display name                                        |
| `description`      | `string`          | Short description                                   |
| `longDescription`  | `string`          | Full marketing / details text                       |
| `durationMinutes`  | `number`          | Session length in minutes                           |
| `price`            | `number`          | Price in minor currency units (cents)               |
| `currency`         | `string`          | ISO 4217 currency code                              |
| `category`         | `string`          | Category label                                      |
| `imageUrl`         | `string \| null`  | Optional hero image URL                             |
| `location`         | `string`          | Physical address or meeting location                |
| `provider`         | `string`          | Name and credentials of the service provider        |
| `averageRating`    | `number`          | Aggregate star rating from `0.0` to `5.0`           |

#### Status Codes

| Code  | When                                                  |
|-------|-------------------------------------------------------|
| `200` | Success                                               |
| `404` | No service exists with the given `service_id`         |
| `500` | Unexpected server error                               |

#### Error Responses

**404 — Not Found**

```json
{
  "error": {
    "code": "SERVICE_NOT_FOUND",
    "message": "No service found with id svc_nonexistent."
  }
}
```

---

### 3. Get Service Availability

```
GET /api/v1/services/{service_id}/availability
```

**Purpose:** Retrieve time slots for a service within a date range. Slots may be available or already booked.

#### Path Parameters

| Parameter    | Type     | Required | Description            |
|--------------|----------|----------|------------------------|
| `service_id` | `string` | Yes      | The service identifier |

#### Query Parameters

| Parameter | Type     | Required | Description                                                           |
|-----------|----------|----------|-----------------------------------------------------------------------|
| `date`    | `string` | No       | Single day filter in `YYYY-MM-DD` format. Mutually exclusive with `from`/`to`. |
| `from`    | `string` | No       | Start of range as ISO 8601 datetime. Requires `to`.                   |
| `to`      | `string` | No       | End of range as ISO 8601 datetime. Requires `from`.                   |

If no date parameters are supplied, returns slots for the next 14 days.

#### Response — `200 OK`

```json
[
  {
    "id": "slot_01H8X1A2B3C4D5E6F7G8H9J0K",
    "serviceId": "svc_01H8X1A2B3C4D5E6F7G8H9J0K",
    "startTime": "2026-09-01T09:00:00Z",
    "endTime": "2026-09-01T10:00:00Z",
    "status": "available"
  }
]
```

| Field       | Type              | Description                                                |
|-------------|-------------------|------------------------------------------------------------|
| `id`        | `string`          | Unique slot identifier (prefixed `slot_`)                  |
| `serviceId` | `string`          | The service this slot belongs to                            |
| `startTime` | `string`          | Slot start as ISO 8601 datetime (UTC)                      |
| `endTime`   | `string`          | Slot end as ISO 8601 datetime (UTC)                        |
| `status`    | `string`          | `"available"` or `"booked"`                                |

#### Status Codes

| Code  | When                                                  |
|-------|-------------------------------------------------------|
| `200` | Success (array, possibly empty)                       |
| `404` | No service exists with the given `service_id`         |
| `500` | Unexpected server error                               |

#### Empty Behaviour

Returns `200` with `[]` when the service exists but has no matching slots. This is not an error.

#### Error Responses

**404 — Service Not Found** (same shape as endpoint 2)

#### Validation Errors (400)

Returned when `from` is provided without `to`, or vice versa:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Query parameters 'from' and 'to' must be used together.",
    "details": {
      "from": "Required when 'to' is provided",
      "to": "Required when 'from' is provided"
    }
  }
}
```

---

### 4. Create Booking

```
POST /api/v1/bookings
```

**Purpose:** Book an available time slot for a service.

#### Request Body

```json
{
  "serviceId": "svc_01H8X1A2B3C4D5E6F7G8H9J0K",
  "slotId": "slot_01H8X1A2B3C4D5E6F7G8H9J0K",
  "customerName": "Jane Doe",
  "customerEmail": "jane.doe@example.com",
  "customerPhone": "+1-555-0100",
  "address": "123 Main St, Springfield"
}
```

| Field           | Type     | Required | Validation Rules                                      |
|-----------------|----------|----------|-------------------------------------------------------|
| `serviceId`     | `string` | Yes      | Must be a valid, existing service ID                   |
| `slotId`        | `string` | Yes      | Must be a valid, existing, **available** slot for the given service |
| `customerName`  | `string` | Yes      | 1–100 characters, non-empty after trimming             |
| `customerEmail` | `string` | Yes      | Valid email format                                     |
| `customerPhone` | `string` | No       | 1–30 characters if provided                            |
| `address`       | `string` | Yes      | 1–200 characters, non-empty after trimming             |

#### Response — `201 Created`

```json
{
  "id": "bkg_01H8X1A2B3C4D5E6F7G8H9J0K",
  "serviceId": "svc_01H8X1A2B3C4D5E6F7G8H9J0K",
  "serviceName": "Deep Tissue Massage",
  "provider": "Sarah Johnson, LMT",
  "slotId": "slot_01H8X1A2B3C4D5E6F7G8H9J0K",
  "startTime": "2026-09-01T09:00:00Z",
  "endTime": "2026-09-01T10:00:00Z",
  "customerName": "Jane Doe",
  "customerEmail": "jane.doe@example.com",
  "customerPhone": "+1-555-0100",
  "status": "confirmed",
  "createdAt": "2026-08-31T14:30:00Z"
}
```

| Field            | Type              | Description                                            |
|------------------|-------------------|--------------------------------------------------------|
| `id`             | `string`          | Unique booking identifier (prefixed `bkg_`)            |
| `serviceId`      | `string`          | The booked service                                     |
| `serviceName`    | `string`          | Denormalized service name for display                  |
| `provider`       | `string`          | Denormalized service provider for display              |
| `slotId`         | `string`          | The booked slot                                        |
| `startTime`      | `string`          | Denormalized slot start (ISO 8601 UTC)                 |
| `endTime`        | `string`          | Denormalized slot end (ISO 8601 UTC)                   |
| `customerName`   | `string`          | Customer's full name                                   |
| `customerEmail`  | `string`          | Customer's email                                       |
| `customerPhone`  | `string \| null`  | Customer's phone (null if not provided)                |
| `status`         | `string`          | `"confirmed"` or `"cancelled"`                         |
| `createdAt`      | `string`          | Booking creation timestamp (ISO 8601 UTC)              |

#### Status Codes

| Code  | When                                                                     |
|-------|--------------------------------------------------------------------------|
| `201` | Booking created successfully                                             |
| `400` | Validation error (missing/invalid fields — see below)                    |
| `404` | Service or slot not found                                                |
| `409` | Slot conflict — slot is already booked or no longer available             |
| `500` | Unexpected server error                                                  |

#### Validation Errors (400)

Returned when request body fails schema validation:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request body failed validation.",
    "details": {
      "customerEmail": "Invalid email address",
      "customerName": "Required",
      "address": "Required"
    }
  }
}
```

`details` contains one entry per invalid field, keyed by field name. Only fields that failed validation are included.

#### Business Errors (409)

**409 — Slot Unavailable**

Returned when the requested slot is already booked or does not exist:

```json
{
  "error": {
    "code": "SLOT_UNAVAILABLE",
    "message": "The selected time slot is no longer available."
  }
}
```

**409 — Duplicate Booking**

Returned when the same customer (by email) already has a confirmed booking for this slot:

```json
{
  "error": {
    "code": "DUPLICATE_BOOKING",
    "message": "You already have a confirmed booking for this time slot."
  }
}
```

#### Error Responses (404)

**404 — Service Not Found**

```json
{
  "error": {
    "code": "SERVICE_NOT_FOUND",
    "message": "No service found with id svc_nonexistent."
  }
}
```

**404 — Slot Not Found**

```json
{
  "error": {
    "code": "SLOT_NOT_FOUND",
    "message": "No slot found with id slot_nonexistent."
  }
}
```

#### Client Loading Behaviour

- On submit, the form enters a **submitting** state (button disabled, spinner shown).
- On `201`: Invalidate `['bookings']`, `['services']`, and `['availability']` query caches. Navigate to the confirmation page.
- On `400`: Surface field-level errors in the form. Re-enable submit button.
- On `404`: Surface a toast notification. Re-enable submit button.
- On `409`: Surface a toast notification prompting the user to select a different slot. Re-enable submit button.
- On `500`: Surface a toast notification with a retry option. Re-enable submit button.

---

### 5. List Bookings

```
GET /api/v1/bookings
```

**Purpose:** Retrieve bookings for a customer, filtered by email.

#### Query Parameters

| Parameter | Type     | Required | Description                                    |
|-----------|----------|----------|------------------------------------------------|
| `email`   | `string` | Yes      | Customer email address (exact match, case-insensitive) |

#### Response — `200 OK`

```json
[
  {
    "id": "bkg_01H8X1A2B3C4D5E6F7G8H9J0K",
    "serviceId": "svc_01H8X1A2B3C4D5E6F7G8H9J0K",
    "serviceName": "Deep Tissue Massage",
    "provider": "Sarah Johnson, LMT",
    "slotId": "slot_01H8X1A2B3C4D5E6F7G8H9J0K",
    "startTime": "2026-09-01T09:00:00Z",
    "endTime": "2026-09-01T10:00:00Z",
    "customerName": "Jane Doe",
    "customerEmail": "jane.doe@example.com",
    "customerPhone": "+1-555-0100",
    "status": "confirmed",
    "createdAt": "2026-08-31T14:30:00Z"
  }
]
```

Each item has the same shape as the single-booking response (endpoint 4 response).

#### Status Codes

| Code  | When                                                    |
|-------|---------------------------------------------------------|
| `200` | Success (array, possibly empty)                         |
| `400` | Missing required `email` query parameter                |
| `500` | Unexpected server error                                 |

#### Empty Behaviour

Returns `200` with `[]` when no bookings match the given email.

#### Validation Errors (400)

Returned when `email` query parameter is missing:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Query parameter 'email' is required.",
    "details": {
      "email": "Required"
    }
  }
}
```

#### Client Loading Behaviour

- While loading, display a skeleton/list placeholder.
- On `200` with empty array: Display an empty state message ("No bookings found").
- On `400` / `500`: Display an inline error with a retry button.

---

### 6. Get Booking Details

```
GET /api/v1/bookings/{booking_id}
```

**Purpose:** Retrieve full details for a single booking.

#### Path Parameters

| Parameter    | Type     | Required | Description            |
|--------------|----------|----------|------------------------|
| `booking_id` | `string` | Yes      | The booking identifier |

#### Response — `200 OK`

```json
{
  "id": "bkg_01H8X1A2B3C4D5E6F7G8H9J0K",
  "serviceId": "svc_01H8X1A2B3C4D5E6F7G8H9J0K",
  "serviceName": "Deep Tissue Massage",
  "provider": "Sarah Johnson, LMT",
  "slotId": "slot_01H8X1A2B3C4D5E6F7G8H9J0K",
  "startTime": "2026-09-01T09:00:00Z",
  "endTime": "2026-09-01T10:00:00Z",
  "customerName": "Jane Doe",
  "customerEmail": "jane.doe@example.com",
  "customerPhone": "+1-555-0100",
  "status": "confirmed",
  "createdAt": "2026-08-31T14:30:00Z"
}
```

Same shape as the booking object in endpoints 4 and 5.

#### Status Codes

| Code  | When                                                    |
|-------|---------------------------------------------------------|
| `200` | Success                                                 |
| `404` | No booking exists with the given `booking_id`           |
| `500` | Unexpected server error                                 |

#### Error Responses

**404 — Not Found**

```json
{
  "error": {
    "code": "BOOKING_NOT_FOUND",
    "message": "No booking found with id bkg_nonexistent."
  }
}
```

---

## Error Code Reference

| Code                 | HTTP Status | Endpoint(s)                     | Description                                      |
|----------------------|-------------|---------------------------------|--------------------------------------------------|
| `VALIDATION_ERROR`   | `400`       | 3, 4, 5                         | Request body or query parameters failed validation |
| `SERVICE_NOT_FOUND`  | `404`       | 2, 3, 4                         | No service matches the given ID                  |
| `SLOT_NOT_FOUND`     | `404`       | 4                               | No slot matches the given ID                     |
| `BOOKING_NOT_FOUND`  | `404`       | 6                               | No booking matches the given ID                  |
| `SLOT_UNAVAILABLE`   | `409`       | 4                               | Slot is already booked or not available           |
| `DUPLICATE_BOOKING`  | `409`       | 4                               | Customer already has a booking for this slot      |
| `INTERNAL_ERROR`     | `500`       | All                             | Unexpected server-side failure                   |
