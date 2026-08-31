import { z } from "zod";
import * as mock from "../mock";
import {
  ServiceSchema,
  ServiceDetailsSchema,
  AvailabilitySlotSchema,
  BookingSchema,
  ApiErrorSchema,
} from "./schemas";
import type {
  Service,
  ServiceDetails,
  AvailabilitySlot,
  Booking,
  BookingRequest,
  ApiError,
  AvailabilityParams,
} from "@/types";

// ── Mock vs Real routing ─────────────────────────────────────────────────────

function isMock(): boolean {
  return import.meta.env.VITE_USE_MOCK_API === "true";
}

// ── Error normalization ──────────────────────────────────────────────────────
// Every error source — mock handler rejection, HTTP error response, Zod
// schema mismatch, or network failure — is converted to the standardised
// ApiError shape here.  Callers only ever see ApiError.

function normalizeError(err: unknown): ApiError {
  // Already an ApiError (thrown by mock handlers or HTTP error parsing)
  if (err && typeof err === "object" && "error" in err) {
    const candidate = err as Record<string, unknown>;
    const error = candidate.error;
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      "message" in error
    ) {
      return err as ApiError;
    }
  }

  // ZodError — map each issue path/message into the details record
  if (err instanceof z.ZodError) {
    const details: Record<string, string> = {};
    for (const issue of err.issues) {
      const path = issue.path.join(".");
      details[path || "(root)"] = issue.message;
    }
    return {
      error: {
        code: "INTERNAL_ERROR",
        message: "Response did not match the expected schema.",
        details,
      },
    };
  }

  // Network or unknown error
  const message =
    err instanceof Error ? err.message : "An unexpected error occurred.";
  return { error: { code: "INTERNAL_ERROR", message } };
}

// ── Real HTTP transport ──────────────────────────────────────────────────────

const BASE_URL = "/api/v1";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, init);

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw {
      error: {
        code: "INTERNAL_ERROR",
        message: `Request failed with status ${response.status}.`,
      },
    } satisfies ApiError;
  }

  if (!response.ok) {
    // Attempt to extract the structured error the server returned;
    // fall back to constructing one from the HTTP status code.
    const parsed = ApiErrorSchema.safeParse(body);
    if (parsed.success) throw parsed.data;

    const code = statusToCode(response.status);
    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof (body as Record<string, unknown>).message === "string"
        ? (body as Record<string, string>).message
        : `Request failed with status ${response.status}.`;

    throw { error: { code, message } } satisfies ApiError;
  }

  return body as T;
}

function statusToCode(status: number): string {
  if (status === 400) return "VALIDATION_ERROR";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  return "INTERNAL_ERROR";
}

// ── Shared wrapper ───────────────────────────────────────────────────────────
// Ensures every code path — mock call, HTTP call, or Zod validation —
// produces a normalised ApiError on failure.

async function withErrorNormalization<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    throw normalizeError(err);
  }
}

// ── Typed API functions ──────────────────────────────────────────────────────

export async function getServices(): Promise<Service[]> {
  return withErrorNormalization(async () => {
    const raw = isMock()
      ? await mock.getServices()
      : await fetchJson<unknown>("/services");
    return z.array(ServiceSchema).parse(raw);
  });
}

export async function getServiceDetails(
  serviceId: string,
): Promise<ServiceDetails> {
  return withErrorNormalization(async () => {
    const raw = isMock()
      ? await mock.getServiceDetails(serviceId)
      : await fetchJson<unknown>(`/services/${enc(serviceId)}`);
    return ServiceDetailsSchema.parse(raw);
  });
}

export async function getAvailability(
  serviceId: string,
  params?: AvailabilityParams,
): Promise<AvailabilitySlot[]> {
  return withErrorNormalization(async () => {
    let raw: unknown;
    if (isMock()) {
      raw = await mock.getAvailability(serviceId, params);
    } else {
      const qs = buildQuery(params);
      raw = await fetchJson<unknown>(
        `/services/${enc(serviceId)}/availability${qs}`,
      );
    }
    return z.array(AvailabilitySlotSchema).parse(raw);
  });
}

export async function createBooking(
  request: BookingRequest,
): Promise<Booking> {
  return withErrorNormalization(async () => {
    const raw = isMock()
      ? await mock.createBooking(request)
      : await fetchJson<unknown>("/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });
    return BookingSchema.parse(raw);
  });
}

export async function getBookings(email: string): Promise<Booking[]> {
  return withErrorNormalization(async () => {
    const raw = isMock()
      ? await mock.getBookings(email)
      : await fetchJson<unknown>(`/bookings?email=${enc(email)}`);
    return z.array(BookingSchema).parse(raw);
  });
}

export async function getBookingById(bookingId: string): Promise<Booking> {
  return withErrorNormalization(async () => {
    const raw = isMock()
      ? await mock.getBookingById(bookingId)
      : await fetchJson<unknown>(`/bookings/${enc(bookingId)}`);
    return BookingSchema.parse(raw);
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function enc(s: string): string {
  return encodeURIComponent(s);
}

function buildQuery(params?: AvailabilityParams): string {
  if (!params) return "";
  const entries: [string, string][] = [];
  if (params.date) entries.push(["date", params.date]);
  if (params.from) entries.push(["from", params.from]);
  if (params.to) entries.push(["to", params.to]);
  return entries.length > 0 ? `?${new URLSearchParams(entries)}` : "";
}
