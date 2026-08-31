import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect } from 'vitest'
import App from './App'

function renderApp(initialPath = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialPath]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    </ChakraProvider>,
  )
}

describe('App routing scaffold', () => {
  it('renders the service list on the root path', async () => {
    renderApp('/')
    expect(await screen.findByRole('heading', { name: 'Services' })).toBeInTheDocument()
  })

  it('renders My Bookings at /my-bookings', async () => {
    renderApp('/my-bookings')
    expect(await screen.findByText('My Bookings')).toBeInTheDocument()
  })
})
