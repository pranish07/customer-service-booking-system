// Zod schemas — runtime source of truth for every API request and response.
//
// Every mock/API response is validated against these schemas before it reaches a
// component. If validation fails the schema throws, surfacing the mismatch
// immediately rather than letting a malformed object propagate through the UI.
//
// Types are inferred from the schemas via z.infer<> and re-exported so the rest
// of the app can import a single source (src/types) for type-only usage while
// the schemas remain the single source of runtime truth.

import { z } from "zod";

// ── Services ──────────────────────────────────────────────────────────────────

export const ServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  durationMinutes: z.number().int().positive(),
  price: z.number().int().min(0),
  currency: z.string().length(3),
  category: z.string(),
  imageUrl: z.string().url().nullable(),
});

export type Service = z.infer<typeof ServiceSchema>;

export const ServiceDetailsSchema = ServiceSchema.extend({
  longDescription: z.string(),
  location: z.string(),
  provider: z.string(),
});

export type ServiceDetails = z.infer<typeof ServiceDetailsSchema>;

// ── Availability ──────────────────────────────────────────────────────────────

export const SlotStatusSchema = z.enum(["available", "booked"]);

export const AvailabilitySlotSchema = z.object({
  id: z.string(),
  serviceId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: SlotStatusSchema,
});

export type AvailabilitySlot = z.infer<typeof AvailabilitySlotSchema>;

// ── Bookings ──────────────────────────────────────────────────────────────────

export const BookingStatusSchema = z.enum(["confirmed", "cancelled"]);

export const BookingSchema = z.object({
  id: z.string(),
  serviceId: z.string(),
  serviceName: z.string(),
  slotId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string().nullable(),
  status: BookingStatusSchema,
  createdAt: z.string().datetime(),
});

export type Booking = z.infer<typeof BookingSchema>;

export const BookingRequestSchema = z.object({
  serviceId: z.string().min(1),
  slotId: z.string().min(1),
  customerName: z.string().trim().min(1).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().trim().max(30).optional(),
});

export type BookingRequest = z.infer<typeof BookingRequestSchema>;

// ── API Error ─────────────────────────────────────────────────────────────────

export const ApiErrorBodySchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.string()).optional(),
});

export const ApiErrorSchema = z.object({
  error: ApiErrorBodySchema,
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

// ── Query Parameter Schemas (used by the client to validate params before
//    constructing URLs — not for response validation) ──────────────────────────

export const AvailabilityParamsSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      const hasFrom = data.from !== undefined;
      const hasTo = data.to !== undefined;
      return hasFrom === hasTo;
    },
    { message: "Parameters 'from' and 'to' must be used together." },
  );

export type AvailabilityParams = z.infer<typeof AvailabilityParamsSchema>;

export const BookingListParamsSchema = z.object({
  email: z.string().email(),
});

export type BookingListParams = z.infer<typeof BookingListParamsSchema>;
