import type { Driver, DriverRaceState, RaceControlMessage } from './types'

export type { Driver, DriverRaceState as DriverState } from './types'

export const TOTAL_LAPS = 57
export const START_LAP = 42

const team = (id: string, name: string, color: string, accent: string) => ({ id, name, color, accent })
const mclaren = team('mclaren', 'McLaren', '#ff8700', '#ffc266')
const ferrari = team('ferrari', 'Ferrari', '#e10600', '#ff615b')
const redBull = team('red-bull', 'Red Bull Racing', '#3671c6', '#85b5ff')
const mercedes = team('mercedes', 'Mercedes', '#27f4d2', '#86ffe8')
const astonMartin = team('aston-martin', 'Aston Martin', '#229971', '#78e8bf')
const williams = team('williams', 'Williams', '#64c4ff', '#b5e6ff')
const alpine = team('alpine', 'Alpine', '#0093cc', '#72d7ff')
const haas = team('haas', 'Haas', '#b6babd', '#f1f4f5')
const rb = team('rb', 'RB', '#6692ff', '#acc0ff')
const sauber = team('sauber', 'Sauber', '#52e252', '#a8f6a8')

export const drivers: Driver[] = [
  { id: 'norris', abbreviation: 'NOR', name: 'Lando Norris', number: 4, team: mclaren, grid: 1, pace: 0.00019, startProgress: 0.738 },
  { id: 'leclerc', abbreviation: 'LEC', name: 'Charles Leclerc', number: 16, team: ferrari, grid: 2, pace: 0.000188, startProgress: 0.732 },
  { id: 'verstappen', abbreviation: 'VER', name: 'Max Verstappen', number: 1, team: redBull, grid: 3, pace: 0.000186, startProgress: 0.728 },
  { id: 'piastri', abbreviation: 'PIA', name: 'Oscar Piastri', number: 81, team: mclaren, grid: 4, pace: 0.000181, startProgress: 0.719 },
  { id: 'russell', abbreviation: 'RUS', name: 'George Russell', number: 63, team: mercedes, grid: 5, pace: 0.000178, startProgress: 0.711 },
  { id: 'hamilton', abbreviation: 'HAM', name: 'Lewis Hamilton', number: 44, team: ferrari, grid: 6, pace: 0.000176, startProgress: 0.704 },
  { id: 'alonso', abbreviation: 'ALO', name: 'Fernando Alonso', number: 14, team: astonMartin, grid: 7, pace: 0.000173, startProgress: 0.696 },
  { id: 'antonelli', abbreviation: 'ANT', name: 'Kimi Antonelli', number: 12, team: mercedes, grid: 8, pace: 0.00017, startProgress: 0.689 },
  { id: 'sainz', abbreviation: 'SAI', name: 'Carlos Sainz', number: 55, team: williams, grid: 9, pace: 0.000166, startProgress: 0.68 },
  { id: 'gasly', abbreviation: 'GAS', name: 'Pierre Gasly', number: 10, team: alpine, grid: 10, pace: 0.000163, startProgress: 0.672 },
  { id: 'albon', abbreviation: 'ALB', name: 'Alex Albon', number: 23, team: williams, grid: 11, pace: 0.00016, startProgress: 0.663 },
  { id: 'ocon', abbreviation: 'OCO', name: 'Esteban Ocon', number: 31, team: haas, grid: 12, pace: 0.000157, startProgress: 0.654 },
  { id: 'tsunoda', abbreviation: 'TSU', name: 'Yuki Tsunoda', number: 22, team: rb, grid: 13, pace: 0.000154, startProgress: 0.645 },
  { id: 'stroll', abbreviation: 'STR', name: 'Lance Stroll', number: 18, team: astonMartin, grid: 14, pace: 0.000151, startProgress: 0.636 },
  { id: 'bearman', abbreviation: 'BEA', name: 'Oliver Bearman', number: 87, team: haas, grid: 15, pace: 0.000148, startProgress: 0.626 },
  { id: 'hadjar', abbreviation: 'HAD', name: 'Isack Hadjar', number: 6, team: rb, grid: 16, pace: 0.000145, startProgress: 0.617 },
  { id: 'lawson', abbreviation: 'LAW', name: 'Liam Lawson', number: 30, team: rb, grid: 17, pace: 0.000142, startProgress: 0.607 },
  { id: 'hulkenberg', abbreviation: 'HUL', name: 'Nico Hulkenberg', number: 27, team: sauber, grid: 18, pace: 0.000139, startProgress: 0.598 },
  { id: 'bortoleto', abbreviation: 'BOR', name: 'Gabriel Bortoleto', number: 5, team: sauber, grid: 19, pace: 0.000136, startProgress: 0.588 },
  { id: 'colapinto', abbreviation: 'COL', name: 'Franco Colapinto', number: 43, team: alpine, grid: 20, pace: 0.000132, startProgress: 0.578 },
]

export const initialDrivers: DriverRaceState[] = drivers.map((driver) => ({ ...driver, position: driver.grid, lap: START_LAP, progress: driver.startProgress ?? 0, raceDistance: START_LAP + (driver.startProgress ?? 0), gap: driver.grid === 1 ? 'LEADER' : `+${((driver.grid - 1) * 1.847).toFixed(3)}s`, lastLap: `1:${(29.4 + driver.grid * 0.31).toFixed(3)}`, speed: Math.round(286 - driver.grid * 1.6), gear: 7, sector: 'S2', tyre: driver.grid % 3 === 0 ? 'HARD' : driver.grid % 2 === 0 ? 'MEDIUM' : 'SOFT' }))

export const raceMessages: RaceControlMessage[] = [
  { id: 'message-drs', timestamp: 2538000, tag: 'RACE CONTROL', message: 'DRS enabled' },
  { id: 'message-yellow', timestamp: 2512000, tag: 'SECTOR 2', message: 'Yellow flags cleared' },
  { id: 'message-pit', timestamp: 2410000, tag: 'PIT LANE', message: 'Hamilton pits for mediums' },
]