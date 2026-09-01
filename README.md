# Customer Service Booking System

A single-page customer-service booking app built with **React**, **TypeScript**,
**Vite**, **Chakra UI**, and **TanStack Query**. Users browse services, view
details, book a time slot, and track their bookings. Everything runs against an
in-process mock API by default.

## Features

- **Service list**: browse and search services with category filtering.
- **Service details**: full description, provider, location, rating, duration,
  price, and an availability summary.
- **Booking flow**: a guided multi-step wizard (date → time slot → customer
  details → review/confirm) with client- and server-side validation, conflict
  handling, and a confirmation screen.
- **My bookings**: look up bookings by email and view their details inline.
- **Accessible states**: every feature handles loading, empty, error (with
  retry), and success states explicitly.

## Tech stack

React 18 · TypeScript · Vite · Chakra UI · TanStack Query · React Hook Form ·
Zod · React Router · Vitest + React Testing Library

## Getting started

```bash
npm install
npm run dev
```

The app runs in **mock-API mode** by default. No backend or database is
required. See [docs/setup.md](docs/setup.md) for full setup, environment
configuration, and test instructions.

## Documentation

- [Architecture](docs/architecture.md): code structure, layering, and the
  container/presentational split.
- [API Contract](docs/api-contract.md): the HTTP contract the client and mock
  implement.
- [Technical Decisions](docs/decisions.md): why key choices (React Query, Zod,
  the mock toggle, the booking state machine, error handling) were made.
- [Setup & Development](docs/setup.md): prerequisites, install, environment
  config, running the app and mock, and running tests.

## Demo video

[Watch the demo](https://jam.dev/c/9c835c8b-485e-4851-9cba-aea91e92780f)

---
