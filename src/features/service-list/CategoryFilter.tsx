import { Select } from '@chakra-ui/react'

export const ALL_CATEGORIES = 'all'

interface CategoryFilterProps {
  categories: string[]
  value: string
  onChange: (value: string) => void
}

export function CategoryFilter({ categories, value, onChange }: CategoryFilterProps) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      width={{ base: '100%', sm: '220px' }}
      aria-label="Filter by category"
    >
      <option value={ALL_CATEGORIES}>All categories</option>
      {categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </Select>
  )
}
