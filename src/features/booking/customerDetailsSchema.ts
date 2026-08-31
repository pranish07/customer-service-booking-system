import { z } from 'zod'
import { BookingRequestSchema } from '@/api/services'

// Reuse the exact field rules from BookingRequestSchema (which mirrors the
// server-side validation) so client and server can never silently drift.
// serviceId/slotId are omitted because they come from the date/slot steps
// rather than being typed by the user.
export const customerDetailsSchema = BookingRequestSchema.pick({
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  address: true,
})

export type CustomerDetailsFormValues = z.infer<typeof customerDetailsSchema>
