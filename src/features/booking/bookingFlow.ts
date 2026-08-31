import type { AvailabilitySlot } from '@/types'

export type BookingStep = 'date' | 'slot' | 'details' | 'summary'

export interface CustomerDetails {
  customerName: string
  customerEmail: string
  customerPhone: string
  address: string
}

export interface BookingFlowState {
  step: BookingStep
  serviceId: string
  date: string | null
  slot: AvailabilitySlot | null
  customer: CustomerDetails | null
}

export type BookingFlowAction =
  | { type: 'SELECT_DATE'; date: string }
  | { type: 'SELECT_SLOT'; slot: AvailabilitySlot }
  | { type: 'SET_CUSTOMER'; customer: CustomerDetails }
  | { type: 'GO_BACK' }

/**
 * The booking flow is a small linear state machine (date → slot → details →
 * summary). A single reducer keeps the whole flow in one place rather than a
 * scatter of useState calls: steps share state (a chosen date must feed the
 * slot query, a chosen slot must appear in the summary), and "back" navigation
 * must invalidate downstream selections. Containing that in one reducer makes
 * the transitions and their side effects (e.g. clearing the slot when the date
 * changes) explicit and unit-testable, instead of letting individual useState
 * setters drift out of sync.
 */
export function bookingFlowReducer(
  state: BookingFlowState,
  action: BookingFlowAction,
): BookingFlowState {
  switch (action.type) {
    case 'SELECT_DATE':
      // Clearing the slot here guarantees a changing date can never leave a
      // slot from a different day selected for the summary.
      return { ...state, date: action.date, slot: null, step: 'slot' }
    case 'SELECT_SLOT':
      return { ...state, slot: action.slot, step: 'details' }
    case 'SET_CUSTOMER':
      return { ...state, customer: action.customer, step: 'summary' }
    case 'GO_BACK': {
      const next: BookingStep =
        state.step === 'slot'
          ? 'date'
          : state.step === 'details'
            ? 'slot'
            : state.step === 'summary'
              ? 'details'
              : state.step
      return { ...state, step: next }
    }
  }
}
