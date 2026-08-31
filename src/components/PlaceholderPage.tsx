import { Center, Spinner, Text, VStack, Heading } from '@chakra-ui/react'

interface PlaceholderPageProps {
  title: string
}

/**
 * Temporary scaffold page rendered by each lazy-loaded feature route until
 * the real feature implementation lands in a later phase.
 */
export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <Center minH="60vh">
      <VStack spacing={3}>
        <Heading size="lg">{title}</Heading>
        <Text color="gray.500">Scaffolding — feature under construction.</Text>
        <Spinner />
      </VStack>
    </Center>
  )
}
