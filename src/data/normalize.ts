import type { CarLocationSample, TelemetrySample } from './types'

type RawSample = Record<string, unknown>

const finiteNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : undefined
const requiredDriverId = (value: unknown) => typeof value === 'string' && value.length > 0 ? value : undefined

export const normalizeLocationSample = (raw: RawSample): CarLocationSample | undefined => {
  const driverId = requiredDriverId(raw.driverId)
  const timestamp = finiteNumber(raw.timestamp)
  if (!driverId || timestamp === undefined) return undefined
  const progress = finiteNumber(raw.progress)
  const providerX = finiteNumber(raw.x)
  const providerY = finiteNumber(raw.y)
  if (progress === undefined && (providerX === undefined || providerY === undefined)) return undefined
  return { driverId, timestamp, progress, providerX, providerY, coordinateSystem: progress === undefined ? 'provider-local' : 'normalized-progress' }
}

export const normalizeTelemetrySample = (raw: RawSample): TelemetrySample | undefined => {
  const driverId = requiredDriverId(raw.driverId)
  const timestamp = finiteNumber(raw.timestamp)
  if (!driverId || timestamp === undefined) return undefined
  return { driverId, timestamp, speedKph: finiteNumber(raw.speedKph), gear: finiteNumber(raw.gear), throttle: finiteNumber(raw.throttle), brake: finiteNumber(raw.brake) }
}