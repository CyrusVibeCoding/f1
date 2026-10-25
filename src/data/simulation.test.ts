import { describe, expect, it } from 'vitest'
import { normalizedProgressToSvg } from './circuitGeometry'
import { normalizeLocationSample, normalizeTelemetrySample } from './normalize'
import { advanceSimulation, buildDrivers, createSimulation, resetSimulation, setSimulationSpeed } from './useRaceSimulation'

describe('race simulation', () => {
  it('advances only while playing and applies playback speed to elapsed time', () => {
    const state = createSimulation()
    const normal = advanceSimulation(state, 80)
    const fast = advanceSimulation(setSimulationSpeed(state, 2), 80)
    expect(normal.elapsed).toBe(80)
    expect(fast.elapsed).toBe(160)
    expect(advanceSimulation({ ...state, isPlaying: false }, 80)).toEqual({ ...state, isPlaying: false })
  })

  it('resets to the same deterministic initial state and pauses', () => {
    const reset = resetSimulation()
    expect(reset.isPlaying).toBe(false)
    expect(reset.elapsed).toBe(0)
    expect(reset.drivers).toEqual(createSimulation(false).drivers)
    expect(reset.speed).toBe(1)
  })

  it('orders the leaderboard from the same race distance used by cars', () => {
    const drivers = buildDrivers(20000)
    const leader = drivers[0]
    const second = drivers[1]
    if (!leader || !second || leader.raceDistance === undefined || second.raceDistance === undefined) throw new Error('Expected two populated driver states')
    expect(drivers).toHaveLength(20)
    expect(drivers.map((driver) => driver.position)).toEqual(Array.from({ length: 20 }, (_, index) => index + 1))
    expect(leader.raceDistance).toBeGreaterThanOrEqual(second.raceDistance)
    expect(leader.gap).toBe('LEADER')
    expect(second.gap).toBe(`+${((leader.raceDistance - second.raceDistance) * 86.5).toFixed(3)}s`)
  })

  it('keeps a selected driver addressable in the shared race state', () => {
    const selected = buildDrivers(5000).find((driver) => driver.id === 'leclerc')
    expect(selected?.id).toBe('leclerc')
    expect(selected?.progress).toBeGreaterThanOrEqual(0)
    expect(selected?.progress).toBeLessThan(1)
  })

  it('handles lap transitions without invalid progress values', () => {
    const drivers = buildDrivers(100000)
    expect(drivers.every((driver) => (driver.progress ?? -1) >= 0 && (driver.progress ?? 2) <= 0.999)).toBe(true)
    expect(drivers.every((driver) => driver.lap <= 57)).toBe(true)
  })
})

describe('data and geometry boundaries', () => {
  it('returns a stable SVG fallback for missing or invalid progress', () => {
    expect(normalizedProgressToSvg(Number.NaN)).toEqual(normalizedProgressToSvg(0))
    expect(normalizedProgressToSvg(1.25)).not.toEqual(normalizedProgressToSvg(0))
    expect(normalizedProgressToSvg(0.125)).not.toEqual(normalizedProgressToSvg(0.12))
  })

  it('normalizes complete and incomplete location samples safely', () => {
    expect(normalizeLocationSample({ driverId: 'norris', timestamp: 10, progress: 0.4 })).toMatchObject({ driverId: 'norris', coordinateSystem: 'normalized-progress' })
    expect(normalizeLocationSample({ driverId: 'norris', timestamp: 10, x: 4, y: 9 })).toMatchObject({ coordinateSystem: 'provider-local' })
    expect(normalizeLocationSample({ driverId: 'norris', timestamp: 10 })).toBeUndefined()
  })

  it('preserves missing telemetry fields instead of inventing values', () => {
    expect(normalizeTelemetrySample({ driverId: 'norris', timestamp: 10, speedKph: 291 })).toEqual({ driverId: 'norris', timestamp: 10, speedKph: 291, gear: undefined, throttle: undefined, brake: undefined })
    expect(normalizeTelemetrySample({ timestamp: 10, speedKph: 291 })).toBeUndefined()
  })
})
