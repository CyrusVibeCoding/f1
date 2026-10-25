import type { OpenF1CarData, OpenF1Driver, OpenF1Interval, OpenF1Lap, OpenF1Location, OpenF1Meeting, OpenF1Position, OpenF1RaceControl, OpenF1Session } from './openF1Client'
import type { CarLocationSample, DataSourceStatus, DriverRaceState, RaceControlMessage, SessionMetadata, TelemetrySample } from './types'

const timestamp = (value: string | undefined) => value ? Date.parse(value) : undefined
const latestBy = <T>(items: T[], key: (item: T) => string | number) => {
  const latest = new Map<string | number, T>()
  items.forEach((item) => latest.set(key(item), item))
  return latest
}
const teamColor = (value?: string) => value && /^[0-9a-f]{6}$/i.test(value) ? `#${value}` : '#8c929a'
const secondsToLap = (value?: number) => value === undefined ? undefined : `${Math.floor(value / 60)}:${(value % 60).toFixed(3).padStart(6, '0')}`
const gapText = (value: number | string | null | undefined) => typeof value === 'number' ? `+${value.toFixed(3)}s` : value ?? undefined

export type OpenF1NormalizedData = {
  session: SessionMetadata
  drivers: DriverRaceState[]
  messages: RaceControlMessage[]
  source: DataSourceStatus
}

export type OpenF1SnapshotInput = {
  meeting: OpenF1Meeting
  session: OpenF1Session
  drivers: OpenF1Driver[]
  positions: OpenF1Position[]
  intervals: OpenF1Interval[]
  laps: OpenF1Lap[]
  raceControl: OpenF1RaceControl[]
  locations?: OpenF1Location[]
  telemetry?: OpenF1CarData[]
}

export const normalizeOpenF1Snapshot = (input: OpenF1SnapshotInput): OpenF1NormalizedData => {
  const positions = latestBy(input.positions, (item) => item.driver_number)
  const intervals = latestBy(input.intervals, (item) => item.driver_number)
  const laps = latestBy(input.laps, (item) => item.driver_number)
  const locations = latestBy(input.locations ?? [], (item) => item.driver_number)
  const telemetry = latestBy(input.telemetry ?? [], (item) => item.driver_number)
  const orderedDrivers = input.drivers.map((driver) => ({ driver, position: positions.get(driver.driver_number)?.position ?? Number.MAX_SAFE_INTEGER })).sort((a, b) => a.position - b.position)

  const drivers: DriverRaceState[] = orderedDrivers.map(({ driver, position }, index) => {
    const lap = laps.get(driver.driver_number)
    const interval = intervals.get(driver.driver_number)
    const location = locations.get(driver.driver_number)
    const car = telemetry.get(driver.driver_number)
    const locationSample: CarLocationSample | undefined = location && timestamp(location.date) !== undefined ? { driverId: String(driver.driver_number), timestamp: timestamp(location.date) as number, providerX: location.x, providerY: location.y, coordinateSystem: 'provider-local' } : undefined
    const telemetrySample: TelemetrySample | undefined = car && timestamp(car.date) !== undefined ? { driverId: String(driver.driver_number), timestamp: timestamp(car.date) as number, speedKph: car.speed, gear: car.n_gear, throttle: car.throttle, brake: car.brake } : undefined
    return {
      id: String(driver.driver_number),
      abbreviation: driver.name_acronym ?? '---',
      name: driver.full_name,
      number: driver.driver_number,
      team: { id: driver.team_name, name: driver.team_name, color: teamColor(driver.team_colour), accent: teamColor(driver.team_colour) },
      grid: position === Number.MAX_SAFE_INTEGER ? index + 1 : position,
      position: position === Number.MAX_SAFE_INTEGER ? index + 1 : position,
      lap: lap?.lap_number ?? 0,
      gap: gapText(interval?.gap_to_leader),
      lastLap: secondsToLap(lap?.lap_duration),
      speed: telemetrySample?.speedKph,
      gear: telemetrySample?.gear,
      sector: undefined,
      tyre: undefined,
      location: locationSample,
      telemetry: telemetrySample,
    }
  })

  const sessionStatus: SessionMetadata['status'] = input.session.session_type === 'Race' || input.session.session_type === 'Qualifying' ? 'finished' : 'scheduled'
  const source: DataSourceStatus = { source: 'openf1', freshness: 'fresh', receivedAt: Date.now() }
  const session: SessionMetadata = { id: String(input.session.session_key), eventName: input.meeting.meeting_name, circuitName: input.session.circuit_short_name, sessionName: input.session.session_name, currentLap: Math.max(...drivers.map((driver) => driver.lap), 0), totalLaps: 0, status: sessionStatus, data: source }
  const messages: RaceControlMessage[] = input.raceControl.filter((item) => item.message).map((item, index) => ({ id: `${input.session.session_key}-${index}`, timestamp: timestamp(item.date) ?? 0, tag: item.category ?? 'RACE CONTROL', message: item.message }))
  return { session, drivers, messages, source }
}