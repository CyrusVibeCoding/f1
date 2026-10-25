const API_BASE = 'https://api.openf1.org/v1'

export class OpenF1ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'OpenF1ApiError'
  }
}

export type OpenF1Meeting = {
  meeting_key: number
  meeting_name: string
  meeting_official_name: string
  location: string
  country_name: string
  circuit_short_name: string
  date_start: string
  date_end: string
  year: number
}

export type OpenF1Session = {
  session_key: number
  session_type: string
  session_name: string
  date_start: string
  date_end: string
  meeting_key: number
  circuit_short_name: string
  country_name: string
  location: string
  year: number
  is_cancelled?: boolean
}

export type OpenF1Driver = {
  driver_number: number
  name_acronym?: string
  full_name: string
  team_name: string
  team_colour?: string
}

export type OpenF1Position = { date: string; driver_number: number; position: number }
export type OpenF1Interval = { date: string; driver_number: number; gap_to_leader: number | string | null; interval: number | string | null }
export type OpenF1Lap = { date_start: string; driver_number: number; lap_number: number; lap_duration?: number; duration_sector_1?: number; duration_sector_2?: number; duration_sector_3?: number }
export type OpenF1CarData = { date: string; driver_number: number; speed?: number; n_gear?: number; throttle?: number; brake?: number }
export type OpenF1Location = { date: string; driver_number: number; x?: number; y?: number; z?: number }
export type OpenF1RaceControl = { date: string; driver_number?: number | null; category?: string; message: string }

const queryString = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined) query.set(key, String(value)) })
  return query.toString()
}

export class OpenF1Client {
  private readonly fetcher: typeof fetch

  constructor(fetcher: typeof fetch = fetch) {
    this.fetcher = fetcher
  }

  private async request<T>(path: string, params: Record<string, string | number | undefined>, signal?: AbortSignal): Promise<T[]> {
    const response = await this.fetcher(`${API_BASE}/${path}?${queryString(params)}`, { signal })
    if (!response.ok) throw new OpenF1ApiError(response.status, `OpenF1 ${path} request failed (${response.status})`)
    const payload: unknown = await response.json()
    if (!Array.isArray(payload)) throw new OpenF1ApiError(response.status, `OpenF1 ${path} returned an unexpected response`)
    return payload as T[]
  }

  getMeetings(year: number, signal?: AbortSignal) { return this.request<OpenF1Meeting>('meetings', { year }, signal) }
  getSessions(year: number, signal?: AbortSignal) { return this.request<OpenF1Session>('sessions', { year }, signal) }
  getDrivers(sessionKey: number, signal?: AbortSignal) { return this.request<OpenF1Driver>('drivers', { session_key: sessionKey }, signal) }
  getPositions(sessionKey: number, signal?: AbortSignal) { return this.request<OpenF1Position>('position', { session_key: sessionKey }, signal) }
  getIntervals(sessionKey: number, signal?: AbortSignal) { return this.request<OpenF1Interval>('intervals', { session_key: sessionKey }, signal) }
  getLaps(sessionKey: number, signal?: AbortSignal) { return this.request<OpenF1Lap>('laps', { session_key: sessionKey }, signal) }
  getCarData(sessionKey: number, driverNumber: number, signal?: AbortSignal) { return this.request<OpenF1CarData>('car_data', { session_key: sessionKey, driver_number: driverNumber }, signal) }
  getLocations(sessionKey: number, driverNumber: number, signal?: AbortSignal) { return this.request<OpenF1Location>('location', { session_key: sessionKey, driver_number: driverNumber }, signal) }
  getRaceControl(sessionKey: number, signal?: AbortSignal) { return this.request<OpenF1RaceControl>('race_control', { session_key: sessionKey }, signal) }
}