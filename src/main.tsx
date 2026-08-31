import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { logApiError } from './api/userMessage'
import './index.css'

// A single telemetry hook for every failed request: the machine-readable
// ApiError code is logged here (dev console / future observability pipeline)
// while the UI itself only ever shows friendly, user-facing messages.
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      const context =
        (query.meta?.errorContext as string | undefined) ?? 'request'
      logApiError(error, context)
    },
  }),
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ChakraProvider>
  </StrictMode>,
)
