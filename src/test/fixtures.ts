import type { Service, ServiceDetails, AvailabilitySlot, Booking } from '@/types'

// Stable, schema-valid fixtures used by component tests that mock @/api/services,
// so assertions are not coupled to the raw mock server's seed data.

export const serviceList: Service[] = [
  {
    id: 'svc_a',
    name: 'Deep Tissue Massage',
    description: 'A firm-pressure massage for deeper muscle layers.',
    durationMinutes: 60,
    price: 8500,
    currency: 'USD',
    category: 'Wellness',
    imageUrl: 'https://example.com/massage.jpg',
  },
  {
    id: 'svc_b',
    name: 'Haircut & Style',
    description: 'Wash, cut, and blow-dry with premium products.',
    durationMinutes: 45,
    price: 4000,
    currency: 'USD',
    category: 'Beauty',
    imageUrl: null,
  },
]

export const serviceDetails: ServiceDetails = {
  ...serviceList[0],
  longDescription:
    'Our deep tissue massage uses firm pressure and slow strokes to reach deeper layers of muscle.',
  location: '123 Wellness Ave, Suite 200',
  provider: 'Sarah Johnson, LMT',
  averageRating: 4.9,
}

export const availabilitySlots: AvailabilitySlot[] = [
  {
    id: 'slot_1',
    serviceId: serviceDetails.id,
    startTime: '2026-09-01T09:00:00.000Z',
    endTime: '2026-09-01T10:00:00.000Z',
    status: 'available',
  },
  {
    id: 'slot_2',
    serviceId: serviceDetails.id,
    startTime: '2026-09-01T10:00:00.000Z',
    endTime: '2026-09-01T11:00:00.000Z',
    status: 'available',
  },
]

export const booking: Booking = {
  id: 'bkg_01',
  serviceId: serviceDetails.id,
  serviceName: serviceDetails.name,
  provider: serviceDetails.provider,
  slotId: availabilitySlots[0].id,
  startTime: availabilitySlots[0].startTime,
  endTime: availabilitySlots[0].endTime,
  customerName: 'Jane Doe',
  customerEmail: 'jane@example.com',
  customerPhone: '+1-555-0100',
  status: 'confirmed',
  createdAt: '2026-08-31T14:30:00.000Z',
}
