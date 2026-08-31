import { useState } from 'react'
import { Button, FormControl, FormErrorMessage, FormLabel, Heading, Input, VStack } from '@chakra-ui/react'

interface MyBookingsEmailPromptProps {
  onSubmit: (email: string) => void
}

export function MyBookingsEmailPrompt({ onSubmit }: MyBookingsEmailPromptProps) {
  const [email, setEmail] = useState('')
  const trimmed = email.trim()
  const invalid = trimmed.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!trimmed || invalid) return
    onSubmit(trimmed)
  }

  return (
    <VStack as="form" onSubmit={handleSubmit} align="stretch" spacing={4} maxW="440px">
      <Heading size="md">Look up your bookings</Heading>
      <FormControl isInvalid={invalid}>
        <FormLabel>Email address</FormLabel>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        {invalid && <FormErrorMessage>Enter a valid email address.</FormErrorMessage>}
      </FormControl>
      <Button type="submit" colorScheme="green" isDisabled={!trimmed || invalid}>
        Show my bookings
      </Button>
    </VStack>
  )
}
