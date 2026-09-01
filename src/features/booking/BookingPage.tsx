import { useMemo, useReducer, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Button, Container as ChakraContainer, Heading, VStack } from '@chakra-ui/react'
import { BackIcon } from '@/components/BackIcon'
import { bookingFlowReducer, type CustomerDetails } from './bookingFlow'
import { useBookingService, useAvailability, getSelectableDates } from './useAvailability'
import { useCreateBooking } from './useCreateBooking'
import { BookingStepper } from './BookingStepper'
import { BookingDateStep } from './BookingDateStep'
import { BookingSlotStep } from './BookingSlotStep'
import { CustomerDetailsForm } from './CustomerDetailsForm'
import { BookingSummary, type BookingSubmitError } from './BookingSummary'
import { BookingLoading } from './BookingLoading'
import { BookingError } from './BookingError'
import type { CustomerDetailsFormValues } from './customerDetailsSchema'
import type { BookingRequest } from '@/types'

/**
 * Reduces a normalised ApiError thrown by POST /bookings into a structured
 * submit error the summary step can render, mapping server error codes onto
 * the three supported recovery paths (field 400, slot-taken 409, generic 500).
 */
function toSubmitError(err: unknown): BookingSubmitError | null {
  const body = (err as { error?: { code?: string; message?: string; details?: Record<string, string> } })?.error
  if (!body?.code) return null
  if (body.code === 'VALIDATION_ERROR') {
    return {
      kind: 'validation',
      message: body.message ?? 'Please correct the highlighted fields.',
      fields: body.details,
    }
  }
  if (body.code === 'SLOT_UNAVAILABLE' || body.code === 'DUPLICATE_BOOKING') {
    return {
      kind: 'conflict',
      message: body.message ?? 'This time slot is no longer available.',
    }
  }
  return {
    kind: 'server',
    message: body.message ?? 'Something went wrong. Please try again.',
  }
}

/**
 * Feature: booking flow. Reads :serviceId from the URL, owns the multi-step
 * flow via a single reducer (see bookingFlow.ts), and delegates each step to
 * presentational components.
 */
export default function BookingPage() {
  const { serviceId = '' } = useParams()

  const [state, dispatch] = useReducer(bookingFlowReducer, {
    step: 'date',
    serviceId,
    date: null,
    slot: null,
    customer: null,
  })

  // Uncommitted date the user is typing in the date picker. Only dispatched
  // into the flow reducer (and locked in) when "Show available times" is hit.
  const [draftDate, setDraftDate] = useState('')

  const service = useBookingService(serviceId)
  const availability = useAvailability(serviceId, state.date)

  const navigate = useNavigate()
  const createBooking = useCreateBooking((booking) => {
    navigate(`/confirmation?bookingId=${booking.id}`, { state: { booking } })
  })
  // Keep the last submitted request so "Try again" can re-run the mutation
  // without the user having to re-enter anything on this visit.
  const lastRequestRef = useRef<BookingRequest | null>(null)

  const submitError = createBooking.error ? toSubmitError(createBooking.error) : null

  const { minDate, maxDate } = useMemo(() => {
    const all = getSelectableDates()
    return { minDate: all[0], maxDate: all[all.length - 1] }
  }, [])

  function handleCustomerSubmit(values: CustomerDetailsFormValues) {
    const customer: CustomerDetails = {
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      customerPhone: values.customerPhone ?? '',
      address: values.address,
    }
    dispatch({ type: 'SET_CUSTOMER', customer })
  }

  function handleConfirm() {
    if (createBooking.isPending) return // guard against double-clicks
    if (!state.slot || !state.customer || !service.data) return
    const request: BookingRequest = {
      serviceId: state.slot.serviceId,
      slotId: state.slot.id,
      customerName: state.customer.customerName,
      customerEmail: state.customer.customerEmail,
      customerPhone: state.customer.customerPhone || undefined,
      address: state.customer.address,
    }
    lastRequestRef.current = request
    createBooking.mutate(request)
  }

  // 400 validation — return to the details form to fix the highlighted fields.
  function handleEditDetails() {
    createBooking.reset()
    dispatch({ type: 'GO_BACK' })
  }

  // 409 conflict — return to the slot grid and refetch so the taken slot shows
  // as booked/disabled before the customer picks another time.
  function handlePickAnotherTime() {
    createBooking.reset()
    dispatch({ type: 'RETURN_TO_SLOT' })
    void availability.refetch()
  }

  // 500 generic — re-run the last request.
  function handleRetry() {
    if (!lastRequestRef.current) return
    createBooking.reset()
    createBooking.mutate(lastRequestRef.current)
  }

  if (service.isError) return <BookingError onRetry={() => service.refetch()} />

  let content
  switch (state.step) {
    case 'date':
      content = (
        <BookingDateStep
          minDate={minDate}
          maxDate={maxDate}
          value={draftDate}
          onChange={setDraftDate}
          onContinue={() => dispatch({ type: 'SELECT_DATE', date: draftDate })}
        />
      )
      break
    case 'slot':
      content = (
        <BookingSlotStep
          date={state.date ?? ''}
          slots={availability.data ?? []}
          selectedSlotId={state.slot?.id ?? null}
          isLoading={availability.isLoading}
          isError={availability.isError}
          isRefreshing={availability.isFetching}
          onRetry={() => availability.refetch()}
          onSelectSlot={(slot) => dispatch({ type: 'SELECT_SLOT', slot })}
          onBack={() => dispatch({ type: 'GO_BACK' })}
        />
      )
      break
    case 'details':
      content = (
        <CustomerDetailsForm
          initialValues={state.customer}
          onSubmit={handleCustomerSubmit}
          onBack={() => dispatch({ type: 'GO_BACK' })}
        />
      )
      break
    case 'summary':
      if (service.isLoading || !service.data || !state.slot || !state.customer) {
        content = <BookingLoading />
      } else {
        content = (
          <BookingSummary
            service={service.data}
            slot={state.slot}
            customer={state.customer}
            isConfirming={createBooking.isPending}
            submitError={submitError}
            onConfirm={handleConfirm}
            onBack={() => dispatch({ type: 'GO_BACK' })}
            onEditDetails={handleEditDetails}
            onPickAnotherTime={handlePickAnotherTime}
            onRetry={handleRetry}
          />
        )
      }
      break
  }

  return (
    <ChakraContainer maxW="860px" py={8}>
      <VStack align="stretch" spacing={6}>
        <Box alignSelf="flex-start">
          <Button variant="ghost" size="sm" as={RouterLink} to={`/services/${serviceId}`} leftIcon={<BackIcon />}>
            Back to details
          </Button>
        </Box>
        <Heading size="lg">Book a service</Heading>
        <BookingStepper current={state.step} />
        {content}
      </VStack>
    </ChakraContainer>
  )
}
