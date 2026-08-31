import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
} from '@chakra-ui/react'

interface BookingErrorProps {
  onRetry: () => void
}

export function BookingError({ onRetry }: BookingErrorProps) {
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
      maxW="520px"
      mx="auto"
    >
      <AlertIcon boxSize={8} />
      <AlertTitle mr={0} mt={4}>
        Could not load booking details
      </AlertTitle>
      <AlertDescription maxWidth="sm" mb={4}>
        Something went wrong while preparing this booking.
      </AlertDescription>
      <Button colorScheme="red" onClick={onRetry}>
        Try again
      </Button>
    </Alert>
  )
}
