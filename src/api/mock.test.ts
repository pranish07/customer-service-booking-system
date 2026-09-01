import { afterEach, describe, expect, it } from 'vitest'
import { getAvailability, getServices, resetDb } from '@/api/mock'

describe('mock availability', () => {
  afterEach(() => {
    resetDb()
  })

  it('never returns slots whose start time has already passed', async () => {
    const before = Date.now()
    const services = await getServices()
    const slots = await getAvailability(services[0].id)

    expect(slots.length).toBeGreaterThan(0)
    for (const slot of slots) {
      expect(new Date(slot.startTime).getTime()).toBeGreaterThan(before)
    }
  })

  it('excludes past slots from a specific requested date as well', async () => {
    const before = Date.now()
    const services = await getServices()
    const date = new Date().toISOString().slice(0, 10)
    const slots = await getAvailability(services[0].id, { date })

    for (const slot of slots) {
      const start = new Date(slot.startTime).getTime()
      expect(start).toBeGreaterThan(before)
      expect(slot.startTime.startsWith(date)).toBe(true)
    }
  })
})