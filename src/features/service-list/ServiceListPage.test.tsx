import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ServiceListPage from './ServiceListPage'
import { serviceList } from '@/test/fixtures'

const TIMEOUT = { timeout: 8000 }

const getServicesMock = vi.fn()

// Mock the api/services layer (not the raw mock server) so this test is
// decoupled from seeded mock data and control the exact response per case.
vi.mock('@/api/services', () => ({
  getServices: (...args: unknown[]) => getServicesMock(...args),
}))

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ServiceListPage />
        </MemoryRouter>
      </QueryClientProvider>
    </ChakraProvider>,
  )
}

describe('Service list page', () => {
  beforeEach(() => {
    getServicesMock.mockReset()
  })

  it(
    'renders the fetched services after a successful load',
    { timeout: 20000 },
    async () => {
      getServicesMock.mockResolvedValue(serviceList)
      renderPage()

      expect(
        await screen.findByRole('heading', { name: 'Services' }, TIMEOUT),
      ).toBeInTheDocument()
      for (const service of serviceList) {
        expect(
          await screen.findByText(service.name, {}, TIMEOUT),
        ).toBeInTheDocument()
      }
    },
  )

  it(
    'shows a user-facing error with a working retry action',
    { timeout: 20000 },
    async () => {
      // First load fails transiently.
      getServicesMock.mockRejectedValueOnce({
        error: { code: 'INTERNAL_ERROR', message: 'Upstream unavailable.' },
      })
      renderPage()

      expect(
        await screen.findByRole('alert', {}, TIMEOUT),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Could not load services'),
      ).toBeInTheDocument()

      // Recover on retry.
      getServicesMock.mockResolvedValue(serviceList)
      await userEvent.click(screen.getByRole('button', { name: 'Try again' }))

      expect(
        await screen.findByText(serviceList[0].name, {}, TIMEOUT),
      ).toBeInTheDocument()
      expect(getServicesMock).toHaveBeenCalledTimes(2)
    },
  )
})
