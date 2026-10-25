import { useEffect, useState } from 'react'
import { initialDrivers, START_LAP, TOTAL_LAPS } from './raceData'
import type { DriverRaceState } from './types'

export type SimulationState = {
  isPlaying: boolean
  elapsed: number
  speed: number
  drivers: DriverRaceState[]
}

const MIN_SPEED = 0.25
const MAX_SPEED = 4
const MAX_FRAME_DELTA = 100

const safeSpeed = (speed: number) => Number.isFinite(speed) ? Math.min(MAX_SPEED, Math.max(MIN_SPEED, speed)) : 1

export const buildDrivers = (elapsed: number): DriverRaceState[] => {
  const safeElapsed = Number.isFinite(elapsed) && elapsed >= 0 ? elapsed : 0
  const moved = initialDrivers.map((driver) => {
    const rawDistance = START_LAP + (driver.startProgress ?? 0) + safeElapsed * (driver.pace ?? 0)
    const raceDistance = Math.min(TOTAL_LAPS, rawDistance)
    const lap = Math.min(TOTAL_LAPS, Math.floor(raceDistance))
    const progress = lap >= TOTAL_LAPS ? 0.999 : raceDistance - Math.floor(raceDistance)
    const sector: DriverRaceState['sector'] = progress < 0.33 ? 'S1' : progress < 0.66 ? 'S2' : 'S3'
    return {
      ...driver,
      lap,
      progress,
      raceDistance,
      speed: Math.round(275 + Math.sin(safeElapsed * 0.002 + driver.grid) * 13 + (20 - driver.grid) * 0.8),
      gear: Math.max(4, Math.min(8, Math.round(6 + Math.sin(safeElapsed * 0.004 + driver.grid) * 2))),
      sector,
      lastLap: `1:${(28.7 + driver.grid * 0.29 + Math.sin(safeElapsed * 0.001 + driver.grid) * 0.18).toFixed(3)}`,
    }
  })
  const ordered = [...moved].sort((a, b) => b.raceDistance - a.raceDistance || a.grid - b.grid)
  const leaderDistance = ordered[0]?.raceDistance ?? 0
  return ordered.map((driver, index) => ({
    ...driver,
    position: index + 1,
    gap: index === 0 ? 'LEADER' : `+${((leaderDistance - driver.raceDistance) * 86.5).toFixed(3)}s`,
  }))
}

export const createSimulation = (isPlaying = true): SimulationState => ({ isPlaying, elapsed: 0, speed: 1, drivers: buildDrivers(0) })

export const advanceSimulation = (state: SimulationState, frameDelta: number): SimulationState => {
  if (!state.isPlaying) return state
  const delta = Number.isFinite(frameDelta) ? Math.min(MAX_FRAME_DELTA, Math.max(0, frameDelta)) : 0
  const elapsed = state.elapsed + delta * safeSpeed(state.speed)
  return { ...state, elapsed, drivers: buildDrivers(elapsed) }
}

export const setSimulationSpeed = (state: SimulationState, speed: number): SimulationState => ({ ...state, speed: safeSpeed(speed) })

export const resetSimulation = (): SimulationState => createSimulation(false)

export function useRaceSimulation() {
  const [simulation, setSimulation] = useState<SimulationState>(() => createSimulation())

  useEffect(() => {
    if (!simulation.isPlaying) return
    let frameId = 0
    let lastTimestamp: number | undefined
    const tick = (timestamp: number) => {
      const frameDelta = lastTimestamp === undefined ? 0 : timestamp - lastTimestamp
      lastTimestamp = timestamp
      setSimulation((current) => advanceSimulation(current, frameDelta))
      frameId = window.requestAnimationFrame(tick)
    }
    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [simulation.isPlaying])

  return {
    ...simulation,
    togglePlaying: () => setSimulation((current) => ({ ...current, isPlaying: !current.isPlaying })),
    reset: () => setSimulation(resetSimulation),
    setSpeed: (speed: number) => setSimulation((current) => setSimulationSpeed(current, speed)),
  }
}
