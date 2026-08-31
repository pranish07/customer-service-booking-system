// Domain types shared across the booking module.
//
// These types mirror the shapes defined in the API contract (docs/api-contract.md)
// and are validated at runtime by Zod schemas in src/api/client/schemas.ts.

// ── Services ──────────────────────────────────────────────────────────────────

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: string;
  category: string;
  imageUrl: string | null;
}

export interface ServiceDetails extends Service {
  longDescription: string;
  location: string;
  provider: string;
  averageRating: number;
}

// ── Availability ──────────────────────────────────────────────────────────────

export type SlotStatus = "available" | "booked";

export interface AvailabilitySlot {
  id: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  status: SlotStatus;
}

// ── Bookings ──────────────────────────────────────────────────────────────────

export type BookingStatus = "confirmed" | "cancelled";

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  slotId: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  status: BookingStatus;
  createdAt: string;
}

export interface BookingRequest {
  serviceId: string;
  slotId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;   // optional
  address: string;
}

// ── API Error ─────────────────────────────────────────────────────────────────

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: Record<string, string>;
}

export interface ApiError {
  error: ApiErrorBody;
}

// ── Availability Query Parameters ─────────────────────────────────────────────

export interface AvailabilityParams {
  date?: string;
  from?: string;
  to?: string;
}

// ── Booking List Query Parameters ─────────────────────────────────────────────

export interface BookingListParams {
  email: string;
}
