export type SvgPoint = { x: number; y: number }
export type SvgTrackTransform = SvgPoint & { angle: number }

// Authored in clockwise race order: uphill T1, the esses, T11, the back straight,
// T12, the stadium section, and the final corner back onto the main straight.
export const circuitPoints: SvgPoint[] = [
  { x: 310, y: 438 }, { x: 306, y: 310 }, { x: 304, y: 165 }, { x: 284, y: 105 },
  { x: 236, y: 82 }, { x: 184, y: 105 }, { x: 164, y: 142 }, { x: 222, y: 171 },
  { x: 172, y: 203 }, { x: 234, y: 231 }, { x: 180, y: 263 }, { x: 248, y: 292 },
  { x: 316, y: 316 }, { x: 505, y: 321 }, { x: 665, y: 322 }, { x: 716, y: 344 },
  { x: 734, y: 385 }, { x: 714, y: 423 }, { x: 666, y: 442 }, { x: 604, y: 430 },
  { x: 639, y: 383 }, { x: 585, y: 352 }, { x: 532, y: 373 }, { x: 558, y: 415 },
  { x: 510, y: 447 }, { x: 442, y: 447 }, { x: 403, y: 415 }, { x: 378, y: 371 },
  { x: 334, y: 389 },
]

const clampProgress = (progress: number) => Number.isFinite(progress) ? ((progress % 1) + 1) % 1 : 0
const midpoint = (from: SvgPoint, to: SvgPoint): SvgPoint => ({ x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 })

export const circuitPath = (points: SvgPoint[] = circuitPoints) => {
  if (!points[0] || points.length < 2) return ''
  const start = midpoint(points[points.length - 1], points[0])
  const path = points.reduce((currentPath, point, index) => {
    const next = points[(index + 1) % points.length]
    return `${currentPath} Q ${point.x} ${point.y} ${midpoint(point, next).x} ${midpoint(point, next).y}`
  }, `M ${start.x} ${start.y}`)
  return `${path} Q ${points[0].x} ${points[0].y} ${start.x} ${start.y}`
}

const quadraticPoint = (start: SvgPoint, control: SvgPoint, end: SvgPoint, t: number): SvgPoint => ({
  x: (1 - t) ** 2 * start.x + 2 * (1 - t) * t * control.x + t ** 2 * end.x,
  y: (1 - t) ** 2 * start.y + 2 * (1 - t) * t * control.y + t ** 2 * end.y,
})

const trackSamples = (points: SvgPoint[]) => {
  const samples: SvgPoint[] = []
  const sampleCount = points.length * 24
  for (let sample = 0; sample < sampleCount; sample += 1) {
    const scaled = sample / sampleCount * points.length
    const index = Math.floor(scaled)
    const point = points[index]
    const previous = points[(index - 1 + points.length) % points.length]
    const next = points[(index + 1) % points.length]
    samples.push(quadraticPoint(midpoint(previous, point), point, midpoint(point, next), scaled - index))
  }
  return samples
}

const samples = trackSamples(circuitPoints)
const interpolate = (from: SvgPoint, to: SvgPoint, amount: number): SvgPoint => ({ x: from.x + (to.x - from.x) * amount, y: from.y + (to.y - from.y) * amount })

/** Demo progress is normalized around this authored Austin circuit. Provider coordinates require calibration first. */
export const normalizedProgressToSvgTransform = (progress: number): SvgTrackTransform => {
  const scaled = clampProgress(progress) * samples.length
  const index = Math.floor(scaled) % samples.length
  const amount = scaled - Math.floor(scaled)
  const point = interpolate(samples[index] ?? circuitPoints[0], samples[(index + 1) % samples.length] ?? circuitPoints[0], amount)
  const nextPoint = samples[(index + 2) % samples.length] ?? circuitPoints[0]
  const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * 180 / Math.PI
  return { ...point, angle }
}

export const normalizedProgressToSvg = (progress: number): SvgPoint => normalizedProgressToSvgTransform(progress)
