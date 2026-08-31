import type {
  Service,
  ServiceDetails,
  AvailabilitySlot,
  Booking,
  BookingRequest,
  ApiError,
  AvailabilityParams,
} from "@/types";

// ── Force-error testing utility ──────────────────────────────────────────────
// Call setForceError('SLOT_UNAVAILABLE') from the browser console or test setup
// to make the mock return a specific error on every subsequent request.
// Pass null to clear.

let forcedError: string | null = null;

export function setForceError(code: string | null): void {
  forcedError = code;
}

export function getForcedError(): string | null {
  return forcedError;
}

// ── In-memory database ───────────────────────────────────────────────────────

let nextSlotId = 1;
let nextBookingId = 2;

function id(prefix: string, n: number): string {
  return `${prefix}_${String(n).padStart(2, "0")}`;
}

const servicesDb: Service[] = [
  {
    id: id("svc", 1),
    name: "Deep Tissue Massage",
    description: "A therapeutic massage targeting chronic muscle tension.",
    durationMinutes: 60,
    price: 8500,
    currency: "USD",
    category: "Wellness",
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600",
  },
  {
    id: id("svc", 2),
    name: "Haircut & Style",
    description: "Professional haircut tailored to your face shape and style.",
    durationMinutes: 45,
    price: 5500,
    currency: "USD",
    category: "Beauty",
    imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600",
  },
  {
    id: id("svc", 3),
    name: "Personal Training Session",
    description: "One-on-one fitness coaching with a certified trainer.",
    durationMinutes: 60,
    price: 7500,
    currency: "USD",
    category: "Fitness",
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600",
  },
  {
    id: id("svc", 4),
    name: "Tax Consultation",
    description:
      "Expert tax planning and advice for individuals and small businesses.",
    durationMinutes: 30,
    price: 12000,
    currency: "USD",
    category: "Professional",
    imageUrl: null,
  },
];

const serviceDetailsDb: Record<
  string,
  Pick<ServiceDetails, "longDescription" | "location" | "provider">
> = {
  [id("svc", 1)]: {
    longDescription:
      "Our deep tissue massage uses firm pressure and slow strokes to reach deeper layers of muscle and fascia. Ideal for chronic pain, injury recovery, and tension relief. Includes a brief consultation before the session.",
    location: "123 Wellness Ave, Suite 200",
    provider: "Sarah Johnson, LMT",
  },
  [id("svc", 2)]: {
    longDescription:
      "Our expert stylists provide a personalised haircut experience. Includes wash, cut, blow-dry, and styling. We use premium products suited to your hair type.",
    location: "456 Style Blvd, Floor 1",
    provider: "Marco Rossi",
  },
  [id("svc", 3)]: {
    longDescription:
      "Achieve your fitness goals with a certified personal trainer. Sessions include a warm-up, custom workout plan, and cool-down. Suitable for all fitness levels.",
    location: "789 Fit Street, Gym Level",
    provider: "Alex Kim, NASM-CPT",
  },
  [id("svc", 4)]: {
    longDescription:
      "Get expert advice on tax planning, deductions, and compliance. Ideal for individuals, freelancers, and small business owners. Includes a written summary of recommendations.",
    location: "321 Finance Row, Office 4B",
    provider: "Diana Patel, CPA",
  },
};

function generateAvailability(): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  const now = new Date();
  const businessHours = [9, 10, 11, 13, 14, 15, 16];

  for (const service of servicesDb) {
    for (let day = 0; day < 14; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);

      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const hour of businessHours) {
        const start = new Date(date);
        start.setHours(hour, 0, 0, 0);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + service.durationMinutes);

        slots.push({
          id: id("slot", nextSlotId++),
          serviceId: service.id,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          status: "available",
        });
      }
    }
  }

  // Pre-book a few slots so conflict detection is testable out of the box.
  // The first two slots of the first service are already taken.
  const svc1Slots = slots.filter((s) => s.serviceId === servicesDb[0].id);
  if (svc1Slots.length >= 2) {
    svc1Slots[0].status = "booked";
    svc1Slots[1].status = "booked";
  }

  return slots;
}

let availabilityDb = generateAvailability();

// Pre-existing booking so the "My Bookings" page has data for jane@example.com.
const preExistingSlot = availabilityDb.find(
  (s) => s.serviceId === servicesDb[0].id && s.status === "booked",
);

let bookingsDb: Booking[] = preExistingSlot
  ? [
      {
        id: id("bkg", 1),
        serviceId: servicesDb[0].id,
        serviceName: servicesDb[0].name,
        slotId: preExistingSlot.id,
        startTime: preExistingSlot.startTime,
        endTime: preExistingSlot.endTime,
        customerName: "Jane Doe",
        customerEmail: "jane@example.com",
        customerPhone: "+1-555-0100",
        status: "confirmed",
        createdAt: new Date().toISOString(),
      },
    ]
  : [];

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeError(
  code: string,
  message: string,
  details?: Record<string, string>,
): ApiError {
  return { error: { code, message, details } };
}

function delay(): Promise<void> {
  const ms = Math.floor(Math.random() * 500) + 300;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Handlers ─────────────────────────────────────────────────────────────────

export async function getServices(): Promise<Service[]> {
  await delay();

  if (forcedError) {
    const code = forcedError;
    forcedError = null;
    throw makeError(code, `Simulated error: ${code}`);
  }

  return [...servicesDb];
}

export async function getServiceDetails(
  serviceId: string,
): Promise<ServiceDetails> {
  await delay();

  if (forcedError) {
    const code = forcedError;
    forcedError = null;
    throw makeError(code, `Simulated error: ${code}`);
  }

  const service = servicesDb.find((s) => s.id === serviceId);
  if (!service) {
    throw makeError(
      "SERVICE_NOT_FOUND",
      `No service found with id ${serviceId}.`,
    );
  }

  const details = serviceDetailsDb[serviceId];
  return { ...service, ...details! };
}

export async function getAvailability(
  serviceId: string,
  params?: AvailabilityParams,
): Promise<AvailabilitySlot[]> {
  await delay();

  if (forcedError) {
    const code = forcedError;
    forcedError = null;
    throw makeError(code, `Simulated error: ${code}`);
  }

  if (!servicesDb.some((s) => s.id === serviceId)) {
    throw makeError(
      "SERVICE_NOT_FOUND",
      `No service found with id ${serviceId}.`,
    );
  }

  let slots = availabilityDb.filter((s) => s.serviceId === serviceId);

  if (params?.date) {
    slots = slots.filter((s) => s.startTime.startsWith(params.date!));
  } else if (params?.from && params?.to) {
    const from = new Date(params.from).getTime();
    const to = new Date(params.to).getTime();
    slots = slots.filter((s) => {
      const t = new Date(s.startTime).getTime();
      return t >= from && t <= to;
    });
  }

  return slots;
}

export async function createBooking(
  request: BookingRequest,
): Promise<Booking> {
  await delay();

  if (forcedError) {
    const code = forcedError;
    forcedError = null;
    throw makeError(code, `Simulated error: ${code}`);
  }

  if (!request.serviceId) {
    throw makeError("VALIDATION_ERROR", "Request body failed validation.", {
      serviceId: "Required",
    });
  }
  if (!request.slotId) {
    throw makeError("VALIDATION_ERROR", "Request body failed validation.", {
      slotId: "Required",
    });
  }
  if (!request.customerName?.trim()) {
    throw makeError("VALIDATION_ERROR", "Request body failed validation.", {
      customerName: "Required",
    });
  }
  if (
    !request.customerEmail ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.customerEmail)
  ) {
    throw makeError("VALIDATION_ERROR", "Request body failed validation.", {
      customerEmail: "Invalid email address",
    });
  }

  const service = servicesDb.find((s) => s.id === request.serviceId);
  if (!service) {
    throw makeError(
      "SERVICE_NOT_FOUND",
      `No service found with id ${request.serviceId}.`,
    );
  }

  const slot = availabilityDb.find((s) => s.id === request.slotId);
  if (!slot) {
    throw makeError(
      "SLOT_NOT_FOUND",
      `No slot found with id ${request.slotId}.`,
    );
  }

  if (slot.serviceId !== request.serviceId) {
    throw makeError(
      "SLOT_NOT_FOUND",
      `No slot found with id ${request.slotId} for service ${request.serviceId}.`,
    );
  }

  // Conflict detection: reject if slot is already booked by anyone.
  if (slot.status === "booked") {
    throw makeError(
      "SLOT_UNAVAILABLE",
      "The selected time slot is no longer available.",
    );
  }

  // Conflict detection: reject if this customer already has a confirmed booking
  // for the same slot — prevents accidental double-booking.
  const duplicate = bookingsDb.find(
    (b) =>
      b.slotId === request.slotId &&
      b.customerEmail === request.customerEmail &&
      b.status === "confirmed",
  );
  if (duplicate) {
    throw makeError(
      "DUPLICATE_BOOKING",
      "You already have a confirmed booking for this time slot.",
    );
  }

  slot.status = "booked";

  const booking: Booking = {
    id: id("bkg", nextBookingId++),
    serviceId: service.id,
    serviceName: service.name,
    slotId: slot.id,
    startTime: slot.startTime,
    endTime: slot.endTime,
    customerName: request.customerName.trim(),
    customerEmail: request.customerEmail,
    customerPhone: request.customerPhone?.trim() ?? null,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  bookingsDb.push(booking);
  return booking;
}

export async function getBookings(email: string): Promise<Booking[]> {
  await delay();

  if (forcedError) {
    const code = forcedError;
    forcedError = null;
    throw makeError(code, `Simulated error: ${code}`);
  }

  if (!email) {
    throw makeError(
      "VALIDATION_ERROR",
      "Query parameter 'email' is required.",
      { email: "Required" },
    );
  }

  const lower = email.toLowerCase();
  return bookingsDb.filter((b) => b.customerEmail.toLowerCase() === lower);
}

export async function getBookingById(bookingId: string): Promise<Booking> {
  await delay();

  if (forcedError) {
    const code = forcedError;
    forcedError = null;
    throw makeError(code, `Simulated error: ${code}`);
  }

  const booking = bookingsDb.find((b) => b.id === bookingId);
  if (!booking) {
    throw makeError(
      "BOOKING_NOT_FOUND",
      `No booking found with id ${bookingId}.`,
    );
  }

  return booking;
}

// ── Test utility ─────────────────────────────────────────────────────────────
// Resets the in-memory database to its initial seed state.

export function resetDb(): void {
  nextSlotId = 1;
  nextBookingId = 2;
  availabilityDb = generateAvailability();

  const firstBooked = availabilityDb.find(
    (s) => s.serviceId === servicesDb[0].id && s.status === "booked",
  );

  bookingsDb = firstBooked
    ? [
        {
          id: id("bkg", 1),
          serviceId: servicesDb[0].id,
          serviceName: servicesDb[0].name,
          slotId: firstBooked.id,
          startTime: firstBooked.startTime,
          endTime: firstBooked.endTime,
          customerName: "Jane Doe",
          customerEmail: "jane@example.com",
          customerPhone: "+1-555-010",
          status: "confirmed",
          createdAt: new Date().toISOString(),
        },
      ]
    : [];

  forcedError = null;
}
