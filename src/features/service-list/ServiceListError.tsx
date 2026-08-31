import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  VStack,
} from '@chakra-ui/react'
import type { ApiError } from '@/types'

interface ServiceListErrorProps {
  error: unknown
  onRetry: () => void
}

function messageFrom(error: unknown): string {
  if (error && typeof error === 'object' && 'error' in error) {
    const body = (error as ApiError).error
    return body.message || body.code
  }
  return 'Something went wrong while loading services.'
}

export function ServiceListError({ error, onRetry }: ServiceListErrorProps) {
  return (
    <Alert
      status="error"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      borderRadius="md"
      py={8}
    >
      <AlertIcon boxSize={8} />
      <AlertTitle mr={0} mt={4}>
        Could not load services
      </AlertTitle>
      <AlertDescription maxWidth="sm" mb={4}>
        {messageFrom(error)}
      </AlertDescription>
      <VStack spacing={2}>
        <Button colorScheme="red" onClick={onRetry}>
          Try again
        </Button>
      </VStack>
    </Alert>
  )
}
