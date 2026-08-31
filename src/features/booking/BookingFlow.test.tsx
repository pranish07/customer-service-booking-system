import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useSearchParams } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect } from 'vitest'
import BookingPage from './BookingPage'
import { setForceError } from '@/api/mock'

const TIMEOUT = { timeout: 8000 }

function renderBooking() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/services/svc_01/book']}>
          <Routes>
            <Route
              path="/services/:serviceId/book"
              element={<BookingPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </ChakraProvider>,
  )
}

function formatIso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

// The mock only generates slots on weekdays within the next 14 days. Find the
// first such weekday so the test reliably has a slot to select.
function nextWeekday(): string {
  const now = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    const day = d.getDay()
    if (day !== 0 && day !== 6) return formatIso(d)
  }
  return formatIso(new Date())
}

// Set the native date input via fireEvent (user-event types into date inputs
// unreliably), then confirm with the "Show available times" button.
async function pickDateAndContinue() {
  const dateInput = await screen.findByLabelText('Select a date', {}, TIMEOUT)
  fireEvent.change(dateInput, { target: { value: nextWeekday() } })
  fireEvent.click(screen.getByRole('button', { name: 'Show available times' }))
}

// Wait for the slot grid and click the first enabled (not already-booked) slot.
// Slots render an `hour:minute` local time (optionally with AM/PM depending on
// the test environment's locale), so match on the leading time pattern.
async function pickFirstAvailableSlot() {
  const slots = await screen.findAllByRole(
    'button',
    { name: (name: string) => /^\d{1,2}:\d{2}/.test(name) },
    TIMEOUT,
  )
  const available = slots.find((b) => !b.hasAttribute('disabled'))
  if (!available) throw new Error('No available slot found')
  fireEvent.click(available)
  return available
}

async function fillCustomerForm(user: ReturnType<typeof userEvent.setup>, email: string) {
  const name = screen.getByLabelText('Full name')
  const mail = screen.getByLabelText('Email')
  const address = screen.getByLabelText('Address')
  await user.clear(name)
  await user.type(name, 'Jane Doe')
  await user.clear(mail)
  await user.type(mail, email)
  await user.clear(address)
  await user.type(address, '123 Main St')
}

describe('Booking flow', () => {
  it(
    'guides the user from date → slot → details → summary',
    { timeout: 20000 },
    async () => {
      const user = userEvent.setup()
      renderBooking()

      await pickDateAndContinue()
      await pickFirstAvailableSlot()
      await screen.findByText('Full name', {}, TIMEOUT)

      await fillCustomerForm(user, 'jane@example.com')
      await user.click(screen.getByRole('button', { name: 'Review booking' }))

      expect(
        await screen.findByRole(
          'heading',
          { name: 'Review your booking' },
          TIMEOUT,
        ),
      ).toBeInTheDocument()
      expect(screen.getByText('Deep Tissue Massage')).toBeInTheDocument()
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
      expect(screen.getByText('123 Main St')).toBeInTheDocument()
    },
  )

  it(
    'surfaces field-level validation errors instead of a generic message',
    { timeout: 20000 },
    async () => {
      const user = userEvent.setup()
      renderBooking()

      await pickDateAndContinue()
      await pickFirstAvailableSlot()
      await screen.findByText('Full name', {}, TIMEOUT)

      await fillCustomerForm(user, 'not-an-email')
      await user.click(screen.getByRole('button', { name: 'Review booking' }))

      await waitFor(
        () => expect(screen.getByText('Invalid email')).toBeInTheDocument(),
        TIMEOUT,
      )
      expect(
        screen.queryByRole('heading', { name: 'Review your booking' }),
      ).toBeNull()
    },
  )

  it(
    'confirms the booking and navigates to confirmation with the booking id',
    { timeout: 20000 },
    async () => {
      const user = userEvent.setup()

      function ConfirmationProbe() {
        const [params] = useSearchParams()
        return <div>landed?bookingId={params.get('bookingId')}</div>
      }

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      })
      render(
        <ChakraProvider>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/services/svc_01/book']}>
              <Routes>
                <Route path="/services/:serviceId/book" element={<BookingPage />} />
                <Route path="/confirmation" element={<ConfirmationProbe />} />
              </Routes>
            </MemoryRouter>
          </QueryClientProvider>
        </ChakraProvider>,
      )

      await pickDateAndContinue()
      await pickFirstAvailableSlot()
      await screen.findByText('Full name', {}, TIMEOUT)

      await fillCustomerForm(user, 'jane@example.com')
      await user.click(screen.getByRole('button', { name: 'Review booking' }))
      await screen.findByRole('heading', { name: 'Review your booking' }, TIMEOUT)

      await user.click(screen.getByRole('button', { name: /confirm booking/i }))

      expect(
        await screen.findByText(/^landed\?bookingId=bkg_/, TIMEOUT),
      ).toBeInTheDocument()
    },
  )

  it(
    'surfaces a slot-conflict message and returns to the slot grid',
    { timeout: 20000 },
    async () => {
      const user = userEvent.setup()
      renderBooking()

      await pickDateAndContinue()
      await pickFirstAvailableSlot()
      await screen.findByText('Full name', {}, TIMEOUT)

      await fillCustomerForm(user, 'jane@example.com')
      await user.click(screen.getByRole('button', { name: 'Review booking' }))
      await screen.findByRole('heading', { name: 'Review your booking' }, TIMEOUT)

      // Force the next createBooking request to fail as a 409 slot conflict.
      setForceError('SLOT_UNAVAILABLE')
      await user.click(screen.getByRole('button', { name: /confirm booking/i }))

      expect(
        await screen.findByText('Time no longer available', {}, TIMEOUT),
      ).toBeInTheDocument()

      await user.click(
        screen.getByRole('button', { name: /choose another time/i }),
      )
      expect(
        await screen.findByRole('heading', { name: 'Available times' }, TIMEOUT),
      ).toBeInTheDocument()
    },
  )
})
