export {
  getServices,
  getServiceDetails,
  getAvailability,
  createBooking,
  getBookings,
  getBookingById,
} from "../client";

// Re-export the booking request schema so features can reuse the exact same
// validation rules as the (mock) server without importing from api/client —
// keeping client-side and server-side validation in lockstep.
export { BookingRequestSchema } from "../client/schemas";
