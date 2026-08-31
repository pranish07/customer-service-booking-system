import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Alert, AlertIcon, AlertTitle, AlertDescription, Button, VStack } from '@chakra-ui/react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Top-level error boundary that catches unexpected render errors outside the
 * per-feature loading/error/empty states. Scaffolding only — it is a safety
 * net, not a replacement for feature-level error handling.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Scaffolding: log to an error-tracking service in a later phase.
    console.error('Unhandled render error caught by ErrorBoundary', error, info)
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Alert status="error" flexDirection="column" alignItems="center" textAlign="center" py={10}>
          <AlertIcon />
          <VStack spacing={3}>
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              {this.state.error?.message ?? 'An unexpected error occurred. Please try again.'}
            </AlertDescription>
            <Button colorScheme="red" onClick={this.handleReset}>
              Try again
            </Button>
          </VStack>
        </Alert>
      )
    }

    return this.props.children
  }
}
