import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import ServiceDetailsPage from './ServiceDetailsPage'
import { serviceDetails, availabilitySlots } from '@/test/fixtures'

const TIMEOUT = { timeout: 8000 }

const getServiceDetailsMock = vi.fn()
const getAvailabilityMock = vi.fn()

vi.mock('@/api/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/services')>()
  return {
    ...actual,
    getServiceDetails: (...args: unknown[]) => getServiceDetailsMock(...args),
    getAvailability: (...args: unknown[]) => getAvailabilityMock(...args),
  }
})

beforeEach(() => {
  getServiceDetailsMock.mockReset().mockResolvedValue(serviceDetails)
  getAvailabilityMock.mockReset().mockResolvedValue(availabilitySlots)
})

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/services/${serviceDetails.id}`]}>
          <Routes>
            <Route path="/services/:serviceId" element={<ServiceDetailsPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </ChakraProvider>,
  )
}

describe('Service details page', () => {
  it(
    'renders every required service field after a successful load',
    { timeout: 20000 },
    async () => {
      renderPage()

      expect(
        await screen.findByRole('heading', { name: serviceDetails.name }, TIMEOUT),
      ).toBeInTheDocument()
      expect(screen.getByText(serviceDetails.description)).toBeInTheDocument()
      expect(screen.getByText(serviceDetails.longDescription)).toBeInTheDocument()
      expect(screen.getByText(serviceDetails.category)).toBeInTheDocument()
      expect(screen.getByText(serviceDetails.provider)).toBeInTheDocument()
      expect(screen.getByText(serviceDetails.location, { exact: false })).toBeInTheDocument()
      expect(screen.getByText(`${serviceDetails.durationMinutes} min`)).toBeInTheDocument()
      expect(screen.getByText(`★ ${serviceDetails.averageRating.toFixed(1)}`)).toBeInTheDocument()
      // Price rendered via Intl.NumberFormat (8500 minor units -> $8,500.00).
      expect(screen.getByText('$8,500.00')).toBeInTheDocument()
      expect(screen.getByText('2 of 2 time slots available in the next 14 days.')).toBeInTheDocument()

      const bookButton = screen.getByRole('button', { name: 'Book this service' })
      expect(bookButton).toBeInTheDocument()
    },
  )
})
