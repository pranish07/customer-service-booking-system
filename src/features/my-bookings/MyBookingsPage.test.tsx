import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect } from 'vitest'
import MyBookingsPage from './MyBookingsPage'

const TIMEOUT = { timeout: 8000 }

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyBookingsPage />
        </MemoryRouter>
      </QueryClientProvider>
    </ChakraProvider>,
  )
}

describe('My Bookings page', () => {
  it(
    'lists a customer’s bookings after entering their email',
    { timeout: 20000 },
    async () => {
      const user = userEvent.setup()
      renderPage()

      await screen.findByRole('heading', { name: 'Look up your bookings' }, TIMEOUT)
      await user.type(screen.getByLabelText('Email address'), 'jane@example.com')
      await user.click(screen.getByRole('button', { name: 'Show my bookings' }))

      expect(
        await screen.findByText('Deep Tissue Massage', {}, TIMEOUT),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Sarah Johnson, LMT'),
      ).toBeInTheDocument()
    },
  )

  it(
    'shows booking details when a booking is selected',
    { timeout: 20000 },
    async () => {
      const user = userEvent.setup()
      renderPage()

      await screen.findByRole('heading', { name: 'Look up your bookings' }, TIMEOUT)
      await user.type(screen.getByLabelText('Email address'), 'jane@example.com')
      await user.click(screen.getByRole('button', { name: 'Show my bookings' }))

      const bookingRow = await screen.findByText(
        'Deep Tissue Massage',
        {},
        TIMEOUT,
      )
      await user.click(bookingRow)

      expect(
        await screen.findByRole('heading', { name: 'Booking details' }, TIMEOUT),
      ).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
      expect(screen.getByText('Status', { exact: false })).toBeInTheDocument()
    },
  )
})
