import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, HStack, Heading, VStack } from '@chakra-ui/react'
import { useServices } from './useServices'
import { SearchBar } from './SearchBar'
import { CategoryFilter, ALL_CATEGORIES } from './CategoryFilter'
import { ServiceListGrid } from './ServiceListGrid'
import { ServiceListLoading } from './ServiceListLoading'
import { ServiceListError } from './ServiceListError'
import { ServiceListEmpty } from './ServiceListEmpty'

const DEFAULT_CATEGORY = ALL_CATEGORIES

/**
 * Feature: browse/list services. Owns the service query and filter UI state,
 * then delegates rendering to presentational components.
 */
export default function ServiceListPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(DEFAULT_CATEGORY)
  const navigate = useNavigate()

  const { data, error, isLoading, isError, refetch, categories, hasFilters } =
    useServices({
      search,
      category,
    })

  function handleSelectService(serviceId: string) {
    navigate(`/services/${serviceId}`)
  }

  function handleClearFilters() {
    setSearch('')
    setCategory(DEFAULT_CATEGORY)
  }

  if (isLoading) return <ServiceListLoading />
  if (isError) return <ServiceListError error={error} onRetry={() => refetch()} />
  if (data.length === 0) {
    return (
      <ServiceListEmpty
        hasFilters={hasFilters}
        onClearFilters={handleClearFilters}
      />
    )
  }

  return (
    <VStack align="stretch" spacing={6} p={6} maxW="1200px" mx="auto">
      <Heading size="lg">Services</Heading>
      <HStack spacing={4} flexWrap="wrap">
        <Box flex="1" minW="240px">
          <SearchBar value={search} onChange={setSearch} />
        </Box>
        <CategoryFilter
          categories={categories}
          value={category}
          onChange={setCategory}
        />
      </HStack>
      <ServiceListGrid services={data} onSelectService={handleSelectService} />
    </VStack>
  )
}
