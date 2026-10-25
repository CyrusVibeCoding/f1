import { describe, expect, it, vi } from 'vitest'
import { normalizeOpenF1Snapshot } from './openF1Adapter'
import { OpenF1ApiError, OpenF1Client } from './openF1Client'

const meeting = { meeting_key: 1254, meeting_name: 'Australian Grand Prix', meeting_official_name: 'FORMULA 1 AUSTRALIAN GRAND PRIX 2025', location: 'Melbourne', country_name: 'Australia', circuit_short_name: 'Melbourne', date_start: '2025-03-14T00:00:00Z', date_end: '2025-03-16T00:00:00Z', year: 2025 }
const session = { session_key: 9693, session_type: 'Race', session_name: 'Race', date_start: '2025-03-16T04:00:00Z', date_end: '2025-03-16T06:00:00Z', meeting_key: 1254, circuit_short_name: 'Melbourne', country_name: 'Australia', location: 'Melbourne', year: 2025 }

const response = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } })

describe('OpenF1 client', () => {
  it('requests the documented endpoint and preserves JSON response data', async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL) => response(input.toString().includes('/meetings?') ? [meeting] : [session]))
    const client = new OpenF1Client(fetcher)
    await expect(client.getMeetings(2025)).resolves.toEqual([meeting])
    await expect(client.getSessions(2025)).resolves.toEqual([session])
    expect(fetcher).toHaveBeenCalledWith(expect.stringContaining('/meetings?year=2025'), expect.objectContaining({ signal: undefined }))
  })

  it('surfaces request failures instead of returning demo data', async () => {
    const client = new OpenF1Client(async () => response({ detail: 'No results found.' }, 404))
    await expect(client.getIntervals(9693)).rejects.toBeInstanceOf(OpenF1ApiError)
  })

  it('keeps session keys isolated when switching historical sessions', async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL) => response([{ session_key: input.toString().includes('9693') ? 9693 : 9998 }]))
    const client = new OpenF1Client(fetcher)
    await expect(client.getDrivers(9693)).resolves.toEqual([{ session_key: 9693 }])
    await expect(client.getDrivers(9998)).resolves.toEqual([{ session_key: 9998 }])
  })
})

describe('OpenF1 normalization', () => {
  it('normalizes driver, timing, lap, race-control, and uncalibrated location data', () => {
    const normalized = normalizeOpenF1Snapshot({
      meeting,
      session,
      drivers: [{ driver_number: 4, name_acronym: 'NOR', full_name: 'Lando Norris', team_name: 'McLaren', team_colour: 'FF8700' }],
      positions: [{ date: '2025-03-16T05:00:00Z', driver_number: 4, position: 1 }],
      intervals: [{ date: '2025-03-16T05:00:00Z', driver_number: 4, gap_to_leader: 0, interval: 0 }],
      laps: [{ date_start: '2025-03-16T05:00:00Z', driver_number: 4, lap_number: 12, lap_duration: 90.5, duration_sector_1: 30, duration_sector_2: 30, duration_sector_3: 30.5 }],
      raceControl: [{ date: '2025-03-16T05:00:00Z', category: 'Flag', message: 'GREEN LIGHT' }],
      locations: [{ date: '2025-03-16T05:00:00Z', driver_number: 4, x: 12, y: 18 }],
      telemetry: [{ date: '2025-03-16T05:00:00Z', driver_number: 4, speed: 300, n_gear: 8, throttle: 99, brake: 0 }],
    })
    expect(normalized.drivers[0]).toMatchObject({ id: '4', abbreviation: 'NOR', position: 1, lap: 12, lastLap: '1:30.500', speed: 300, gear: 8, team: { color: '#FF8700' }, location: { coordinateSystem: 'provider-local', providerX: 12, providerY: 18 } })
    expect(normalized.messages[0].message).toBe('GREEN LIGHT')
    expect(normalized.session.data.source).toBe('openf1')
  })
})
