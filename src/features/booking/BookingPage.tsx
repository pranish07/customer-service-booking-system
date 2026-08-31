import { useMemo, useReducer, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container as ChakraContainer, Heading, VStack } from '@chakra-ui/react'
import { bookingFlowReducer, type CustomerDetails } from './bookingFlow'
import { useBookingService, useAvailability, getSelectableDates } from './useAvailability'
import { BookingStepper } from './BookingStepper'
import { BookingDateStep } from './BookingDateStep'
import { BookingSlotStep } from './BookingSlotStep'
import { CustomerDetailsForm } from './CustomerDetailsForm'
import { BookingSummary } from './BookingSummary'
import { BookingLoading } from './BookingLoading'
import { BookingError } from './BookingError'
import type { CustomerDetailsFormValues } from './customerDetailsSchema'

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
            onBack={() => dispatch({ type: 'GO_BACK' })}
          />
        )
      }
      break
  }

  return (
    <ChakraContainer maxW="860px" py={8}>
      <VStack align="stretch" spacing={6}>
        <Heading size="lg">Book a service</Heading>
        <BookingStepper current={state.step} />
        {content}
      </VStack>
    </ChakraContainer>
  )
}
