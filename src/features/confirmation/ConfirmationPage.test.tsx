import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect } from 'vitest'
import ConfirmationPage from './ConfirmationPage'

const TIMEOUT = { timeout: 8000 }

function renderAt(search: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[{ pathname: '/confirmation', search }]}
        >
          <Routes>
            <Route path="/confirmation" element={<ConfirmationPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </ChakraProvider>,
  )
}

describe('Confirmation page', () => {
  it(
    'fetches and shows the booking referenced by ?bookingId=',
    { timeout: 20000 },
    async () => {
      renderAt('?bookingId=bkg_01')

      expect(
        await screen.findByText('Booking confirmed!', {}, TIMEOUT),
      ).toBeInTheDocument()
      expect(screen.getByText('Deep Tissue Massage')).toBeInTheDocument()
      expect(screen.getByText('Sarah Johnson, LMT')).toBeInTheDocument()
      expect(screen.getByText('Confirmed')).toBeInTheDocument()
      expect(screen.getByText('bkg_01')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'View my bookings' }),
      ).toBeInTheDocument()
    },
  )
})
