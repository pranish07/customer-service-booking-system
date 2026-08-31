import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BookingPage from './BookingPage'
import ConfirmationPage from '@/features/confirmation/ConfirmationPage'
import { serviceDetails, availabilitySlots, booking } from '@/test/fixtures'

const TIMEOUT = { timeout: 8000 }

// Mock the api/services layer (not the raw mock server) so the booking flow is
// driven by deterministic fixtures and we can assert error/conflict branches
// without depending on the mock server's seeded data.
const getServiceDetailsMock = vi.fn()
const getAvailabilityMock = vi.fn()
const createBookingMock = vi.fn()

vi.mock('@/api/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/services')>()
  return {
    ...actual,
    getServiceDetails: (...args: unknown[]) => getServiceDetailsMock(...args),
    getAvailability: (...args: unknown[]) => getAvailabilityMock(...args),
    createBooking: (...args: unknown[]) => createBookingMock(...args),
  }
})

function renderFlow() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/services/${serviceDetails.id}/book`]}>
          <Routes>
            <Route
              path="/services/:serviceId/book"
              element={<BookingPage />}
            />
            <Route path="/confirmation" element={<ConfirmationPage />} />
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

async function pickDateAndContinue() {
  const dateInput = await screen.findByLabelText('Select a date', {}, TIMEOUT)
  fireEvent.change(dateInput, { target: { value: nextWeekday() } })
  fireEvent.click(screen.getByRole('button', { name: 'Show available times' }))
}

async function pickFirstAvailableSlot() {
  const slots = await screen.findAllByRole(
    'button',
    { name: (name) => /^\d{1,2}:\d{2}/.test(name) },
    TIMEOUT,
  )
  const available = slots.find((b) => !b.hasAttribute('disabled'))
  if (!available) throw new Error('No available slot found')
  fireEvent.click(available)
}

async function reachCustomerForm() {
  await pickDateAndContinue()
  await pickFirstAvailableSlot()
  await screen.findByLabelText('Full name', {}, TIMEOUT)
}

describe('Booking page', () => {
  beforeEach(() => {
    getServiceDetailsMock.mockReset().mockResolvedValue(serviceDetails)
    getAvailabilityMock.mockReset().mockResolvedValue(availabilitySlots)
    createBookingMock.mockReset()
  })

  it(
    'shows client-side (RHF + Zod) validation errors on the customer/address form',
    { timeout: 20000 },
    async () => {
      const user = userEvent.setup()
      renderFlow()
      await reachCustomerForm()

      await user.type(screen.getByLabelText('Full name'), 'Jane Doe')
      await user.type(screen.getByLabelText('Email'), 'not-an-email')
      // Address left empty on purpose.
      await user.click(screen.getByRole('button', { name: 'Review booking' }))

      expect(await screen.findByText('Invalid email', {}, TIMEOUT)).toBeInTheDocument()
      // Empty address -> zod trim().min(1) with the field's default message.
      expect(
        screen.getByText('String must contain at least 1 character(s)'),
      ).toBeInTheDocument()
      // Never advanced to the summary while invalid.
      expect(
        screen.queryByRole('heading', { name: 'Review your booking' }),
      ).toBeNull()
      expect(createBookingMock).not.toHaveBeenCalled()
    },
  )

  it(
    'completes a booking end-to-end and lands on the confirmation screen',
    { timeout: 20000 },
    async () => {
      const user = userEvent.setup()
      createBookingMock.mockResolvedValue(booking)
      renderFlow()
      await reachCustomerForm()

      await fillCustomerForm(user, 'jane@example.com')
      await user.click(screen.getByRole('button', { name: 'Review booking' }))
      await screen.findByRole('heading', { name: 'Review your booking' }, TIMEOUT)

      await user.click(screen.getByRole('button', { name: /confirm booking/i }))

      expect(
        await screen.findByText('Booking confirmed!', {}, TIMEOUT),
      ).toBeInTheDocument()
      expect(screen.getByText(booking.serviceName)).toBeInTheDocument()
      expect(screen.getByText(booking.provider)).toBeInTheDocument()
      expect(createBookingMock).toHaveBeenCalledTimes(1)
    },
  )

  it(
    'surfaces a slot-conflict message and recovers the availability view',
    { timeout: 20000 },
    async () => {
      const user = userEvent.setup()
      // The chosen slot is rejected as already taken on submit.
      createBookingMock.mockRejectedValue({
        error: { code: 'SLOT_UNAVAILABLE', message: 'Slot no longer available.' },
      })
      renderFlow()
      await reachCustomerForm()

      await fillCustomerForm(user, 'jane@example.com')
      await user.click(screen.getByRole('button', { name: 'Review booking' }))
      await screen.findByRole('heading', { name: 'Review your booking' }, TIMEOUT)

      await user.click(screen.getByRole('button', { name: /confirm booking/i }))

      expect(
        await screen.findByText('Time no longer available', {}, TIMEOUT),
      ).toBeInTheDocument()

      // Recovery: choosing another time returns to the slot grid (availability
      // is refetched), where a fresh slot can be selected.
      await user.click(
        screen.getByRole('button', { name: /choose another time/i }),
      )
      expect(
        await screen.findByRole('heading', { name: 'Available times' }, TIMEOUT),
      ).toBeInTheDocument()
      expect(createBookingMock).toHaveBeenCalledTimes(1)
    },
  )
})

async function fillCustomerForm(
  user: ReturnType<typeof userEvent.setup>,
  email: string,
) {
  await user.type(screen.getByLabelText('Full name'), 'Jane Doe')
  await user.type(screen.getByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Address'), '123 Main St, Springfield')
}
