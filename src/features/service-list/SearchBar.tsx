import { Input } from '@chakra-ui/react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <Input
      placeholder="Search services…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
