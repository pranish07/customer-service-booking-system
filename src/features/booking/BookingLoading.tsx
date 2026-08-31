import { Center, Spinner } from '@chakra-ui/react'

export function BookingLoading() {
  return (
    <Center minH="40vh">
      <Spinner size="xl" />
    </Center>
  )
}
