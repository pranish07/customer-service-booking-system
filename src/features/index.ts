// Feature-based organization of the booking flow. Each top-level feature is
// lazy-loaded as its own chunk and re-exported here as a single public barrel.
//
// Routes import each page directly by file path (see App.tsx) so Vite keeps
// one chunk per feature. This aggregate is for internal/cross-feature use and
// tidy imports, not for the router.
export { default as BookingPage } from './booking/BookingPage'
export { default as ConfirmationPage } from './confirmation/ConfirmationPage'
export { default as ServiceDetailsPage } from './service-details/ServiceDetailsPage'
export { default as ServiceListPage } from './service-list/ServiceListPage'
export { default as MyBookingsPage } from './my-bookings/MyBookingsPage'
