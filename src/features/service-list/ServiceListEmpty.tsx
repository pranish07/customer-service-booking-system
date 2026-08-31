import { Button, Center, Heading, Text, VStack } from '@chakra-ui/react'

interface ServiceListEmptyProps {
  hasFilters: boolean
  onClearFilters: () => void
}

export function ServiceListEmpty({ hasFilters, onClearFilters }: ServiceListEmptyProps) {
  return (
    <Center py={16} textAlign="center">
      <VStack spacing={3}>
        <Heading size="md">
          {hasFilters ? 'No matching services' : 'No services available'}
        </Heading>
        <Text color="gray.500" maxWidth="sm">
          {hasFilters
            ? 'No services match your current search or category filter.'
            : 'There are no services to display right now. Please check back later.'}
        </Text>
        {hasFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
      </VStack>
    </Center>
  )
}
