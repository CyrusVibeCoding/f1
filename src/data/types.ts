export type DataSource = 'demo' | 'openf1' | 'unknown'

export type DataFreshness = 'fresh' | 'stale' | 'unavailable'

export type DataSourceStatus = {
  source: DataSource
  freshness: DataFreshness
  receivedAt?: number
}

export type Team = {
  id: string
  name: string
  color: string
  accent: string
}

export type Driver = {
  id: string
  abbreviation: string
  name: string
  number: number
  team: Team
  grid: number
  pace?: number
  startProgress?: number
}

export type CarLocationSample = {
  driverId: string
  timestamp: number
  progress?: number
  providerX?: number
  providerY?: number
  coordinateSystem?: 'normalized-progress' | 'provider-local' | 'unknown'
}

export type LapTime = {
  driverId: string
  lap: number
  durationMs?: number
  timestamp: number
}

export type SectorTime = {
  driverId: string
  lap: number
  sector: 'S1' | 'S2' | 'S3'
  durationMs?: number
  timestamp: number
}

export type TimingInterval = {
  driverId: string
  leaderGapMs?: number
  aheadGapMs?: number
  timestamp: number
}

export type TelemetrySample = {
  driverId: string
  timestamp: number
  speedKph?: number
  gear?: number
  throttle?: number
  brake?: number
}

export type RaceControlMessage = {
  id: string
  timestamp: number
  tag: string
  message: string
}

export type SessionMetadata = {
  id: string
  eventName: string
  circuitName: string
  sessionName: string
  currentLap: number
  totalLaps: number
  status: 'scheduled' | 'running' | 'paused' | 'finished'
  data: DataSourceStatus
}

export type DriverRaceState = Driver & {
  position: number
  lap: number
  progress?: number
  raceDistance?: number
  gap?: string
  lastLap?: string
  speed?: number
  gear?: number
  sector?: 'S1' | 'S2' | 'S3'
  tyre?: 'SOFT' | 'MEDIUM' | 'HARD'
  location?: CarLocationSample
  telemetry?: TelemetrySample
}