import { useMemo } from 'react'
import { circuitPath, normalizedProgressToSvgTransform } from '../data/circuitGeometry'
import type { DriverState } from '../data/raceData'

type CircuitProps = {
  drivers: DriverState[]
  selectedDriver: string
  onSelectDriver: (id: string) => void
  locationsAvailable?: boolean
}

export function Circuit({ drivers, selectedDriver, onSelectDriver, locationsAvailable = true }: CircuitProps) {
  const trackPath = useMemo(() => circuitPath(), [])

  return (
    <div className="circuit-wrap">
      <div className="circuit-label circuit-label-start">START / FINISH</div>
      <svg className="circuit" viewBox="100 55 680 430" role="img" aria-label="Circuit of the Americas simulated circuit map">
        <defs>
          <filter id="track-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="12" stdDeviation="9" floodColor="#000" floodOpacity=".5" />
          </filter>
        </defs>
        <path d={trackPath} className="track-shadow" filter="url(#track-shadow)" />
        <path d={trackPath} className="track-kerb" />
        <path d={trackPath} className="track-surface" />
        <path d={trackPath} className="track-center" />
        <path d="M 310 424 L 310 452" className="finish-line" />
        <g className="circuit-markers">
          <text x="274" y="70">T1</text><text x="155" y="190">T4</text><text x="210" y="300">T10</text>
          <text x="690" y="337">T12</text><text x="585" y="340">T15</text><text x="390" y="358">T19</text>
        </g>
        {locationsAvailable && drivers.filter((driver) => driver.progress !== undefined).map((driver) => {
          const point = normalizedProgressToSvgTransform(driver.progress ?? 0)
          const selected = driver.id === selectedDriver
          return (
            <g
              className={`car-marker ${selected ? 'is-selected' : ''}`}
              key={driver.id}
              transform={`translate(${point.x} ${point.y})`}
              onClick={() => onSelectDriver(driver.id)}
              tabIndex={0}
              role="button"
              aria-label={`Select ${driver.name}, car ${driver.number}`}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelectDriver(driver.id) }}
            >
              <circle className="car-halo" r={selected ? 18 : 11} style={{ fill: driver.team.color }} />
              <g transform={`rotate(${point.angle + 90})`}>
                <image className="car-image" href="/f1-car.png" x="-22" y="-11" width="44" height="22" preserveAspectRatio="xMidYMid meet" />
                <circle className="car-number-badge" r="5" />
                <text className="car-number" y="3.5">{driver.number}</text>
              </g>
            </g>
          )
        })}
      </svg>
      {!locationsAvailable && <div className="map-unavailable"><strong>LOCATION MAP UNAVAILABLE</strong><span>OpenF1 coordinates require circuit-specific calibration.</span></div>}
      <div className="track-legend"><span className="legend-dot live-dot" /> {locationsAvailable ? 'Demo position simulation' : 'Authored circuit geometry'} <span className="legend-line" /> Racing line</div>
    </div>
  )
}
