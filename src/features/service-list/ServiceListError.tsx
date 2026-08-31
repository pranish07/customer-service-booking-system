import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  VStack,
} from '@chakra-ui/react'
import { useFocusOnMount } from '@/hooks'
import { userFacingMessage } from '@/api/userMessage'

interface ServiceListErrorProps {
  error: unknown
  onRetry: () => void
}

export function ServiceListError({ error, onRetry }: ServiceListErrorProps) {
  // Only present a friendly message to the user; the raw server code/message is
  // still available on `error` for telemetry (`logApiError`) but never shown.
  const bannerRef = useFocusOnMount<HTMLDivElement>()
  const message = userFacingMessage(
    error,
    'Something went wrong while loading services.',
  )

  return (
    <Alert
      ref={bannerRef}
      role="alert"
      tabIndex={-1}
      status="error"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      outline="none"
      borderRadius="md"
      py={8}
    >
      <AlertIcon boxSize={8} />
      <AlertTitle mr={0} mt={4}>
        Could not load services
      </AlertTitle>
      <AlertDescription maxWidth="sm" mb={4}>
        {message}
      </AlertDescription>
      <VStack spacing={2}>
        <Button colorScheme="red" onClick={onRetry}>
          Try again
        </Button>
      </VStack>
    </Alert>
  )
}
