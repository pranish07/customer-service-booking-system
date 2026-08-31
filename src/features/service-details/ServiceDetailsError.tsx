import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  VStack,
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import type { ApiError } from '@/types'

interface ServiceDetailsErrorProps {
  error: unknown
  onRetry: () => void
}

function isNotFound(error: unknown): boolean {
  return (
    error != null &&
    typeof error === 'object' &&
    'error' in error &&
    (error as ApiError).error.code === 'SERVICE_NOT_FOUND'
  )
}

export function ServiceDetailsError({ error, onRetry }: ServiceDetailsErrorProps) {
  const notFound = isNotFound(error)

  return (
    <Alert
      status={notFound ? 'info' : 'error'}
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      borderRadius="md"
      py={8}
      maxW="520px"
      mx="auto"
    >
      <AlertIcon boxSize={8} />
      <AlertTitle mr={0} mt={4}>
        {notFound ? 'Service not found' : 'Could not load service'}
      </AlertTitle>
      <AlertDescription maxWidth="sm" mb={4}>
        {notFound
          ? 'The service you are looking for does not exist or has been removed.'
          : 'Something went wrong while loading this service.'}
      </AlertDescription>
      <VStack spacing={2}>
        {!notFound && (
          <Button colorScheme="red" onClick={onRetry}>
            Try again
          </Button>
        )}
        <Button as={Link} to="/" variant="outline">
          Back to services
        </Button>
      </VStack>
    </Alert>
  )
}
