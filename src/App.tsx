import { useMemo, useState } from 'react'
import { Circuit } from './components/Circuit'
import { SessionBrowser } from './components/SessionBrowser'
import { raceMessages } from './data/raceData'
import { useOpenF1Data } from './data/useOpenF1Data'
import { useRaceSimulation } from './data/useRaceSimulation'
import './App.css'

function App() {
  const simulation = useRaceSimulation()
  const openF1 = useOpenF1Data()
  const [mode, setMode] = useState<'demo' | 'historical'>('demo')
  const [selectedDriver, setSelectedDriver] = useState('norris')
  const displayDrivers = useMemo(() => mode === 'demo' ? simulation.drivers : openF1.snapshot?.drivers ?? [], [mode, openF1.snapshot, simulation.drivers])
  const selected = useMemo(() => displayDrivers.find((driver) => driver.id === selectedDriver) ?? displayDrivers[0], [displayDrivers, selectedDriver])
  const selectedName = selected?.name ?? 'No driver selected'
  const selectedTeam = selected?.team.name ?? 'Awaiting session data'
  const formatLapTime = (elapsed: number) => `${Math.floor(elapsed / 60000)}:${((elapsed % 60000) / 1000).toFixed(1).padStart(4, '0')}`
  const historicalReady = mode === 'historical' && Boolean(openF1.snapshot)
  const currentLap = mode === 'demo' ? simulation.drivers[0]?.lap ?? '—' : openF1.snapshot?.session.currentLap || '—'
  const totalLaps = mode === 'demo' ? 57 : openF1.snapshot?.session.totalLaps || '—'
  const eventName = mode === 'demo' ? 'UNITED STATES GRAND PRIX' : openF1.snapshot?.session.eventName ?? 'OPENF1 HISTORICAL SESSION'
  const messages = mode === 'demo' ? raceMessages : openF1.snapshot?.messages ?? []

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup"><span className="brand-mark">F1</span><span className="brand-divider" /><div><strong>APEX // TIMING</strong><span>RACE OPERATIONS CONSOLE</span></div></div>
        <div className="event-context"><span className="eyebrow">{mode === 'demo' ? '2025 FIA FORMULA ONE WORLD CHAMPIONSHIP' : 'OPENF1 SESSION DATA'}</span><strong>{eventName}</strong><span className="session-name">{mode === 'demo' ? 'RACE' : openF1.snapshot?.session.sessionName ?? 'HISTORICAL'} <i>•</i> LAP {currentLap} / {totalLaps}</span></div>
        <div className="session-status"><span className={`demo-pill ${mode === 'historical' ? 'historical-pill' : ''}`}><span className="pulse-dot" /> {mode === 'demo' ? 'DEMO MODE' : 'HISTORICAL'}</span><span className="status-copy">{mode === 'demo' ? <>SIMULATED DATA<br /><b>PLAYBACK ACTIVE</b></> : <>OPENF1 DATA<br /><b>{openF1.snapshot ? 'SNAPSHOT LOADED' : 'AWAITING SESSION'}</b></>}</span></div>
      </header>

      <div className="source-toolbar"><SessionBrowser mode={mode} onModeChange={setMode} data={openF1} onSessionChange={(sessionKey) => { setSelectedDriver(''); void openF1.selectSession(sessionKey) }} onReload={() => void openF1.loadCatalog(openF1.year)} /><span className="source-note">{mode === 'demo' ? 'DETERMINISTIC PLAYBACK' : openF1.error ? 'REQUEST FAILED' : openF1.loadingSnapshot ? 'LOADING SESSION SNAPSHOT' : historicalReady ? 'HISTORICAL SNAPSHOT · MAP CALIBRATION UNAVAILABLE' : 'SELECT A SESSION TO LOAD REAL DATA'}</span></div>

      <section className="dashboard-grid">
        <section className="main-stage panel">
          <div className="panel-heading"><div><span className="eyebrow">CIRCUIT POSITIONING</span><h1>{mode === 'demo' ? <>Austin <span>/</span> Race Map</> : <>{openF1.snapshot?.session.circuitName ?? 'Historical'} <span>/</span> Race Map</>}</h1></div><div className="stage-meta"><span className="live-dot" /> ALL CARS <b>{displayDrivers.length || '—'}</b><span className="meta-divider" /> SOURCE <b>{mode === 'demo' ? 'DEMO' : 'OPENF1'}</b></div></div>
          {mode === 'historical' && openF1.error && <div className="data-state error-state"><strong>Unable to load session</strong><span>{openF1.error}</span></div>}
          {mode === 'historical' && !openF1.error && !openF1.loadingSnapshot && !openF1.snapshot && <div className="data-state"><strong>Select a historical session</strong><span>Choose a meeting and session above. No simulated data will be shown here.</span></div>}
          <Circuit drivers={displayDrivers} selectedDriver={selectedDriver} onSelectDriver={setSelectedDriver} locationsAvailable={mode === 'demo'} />
          <div className="stage-footer"><div><span className="eyebrow">{mode === 'demo' ? 'SESSION CLOCK' : 'DATA STATUS'}</span><strong>{mode === 'demo' ? formatLapTime(simulation.elapsed) : openF1.snapshot ? 'SYNCED' : '—'}</strong></div><div className="simulation-controls"><button onClick={simulation.togglePlaying} disabled={mode !== 'demo'} aria-label={simulation.isPlaying ? 'Pause simulation' : 'Play simulation'}>{simulation.isPlaying ? 'Ⅱ' : '▶'}</button><button onClick={simulation.reset} disabled={mode !== 'demo'} aria-label="Reset simulation">↺</button><div className="speed-controls">{[0.5, 1, 2].map((speed) => <button className={simulation.speed === speed ? 'is-active' : ''} disabled={mode !== 'demo'} key={speed} onClick={() => simulation.setSpeed(speed)}>{speed}x</button>)}</div></div><span className="simulation-note">{mode === 'demo' ? <>Deterministic playback<br /><b>NO LIVE TELEMETRY</b></> : <>Historical API snapshot<br /><b>NO LIVE POLLING</b></>}</span></div>
        </section>

        <aside className="leaderboard panel"><div className="panel-heading compact"><div><span className="eyebrow">{mode === 'demo' ? 'LIVE TIMING' : 'OPENF1 TIMING'}</span><h2>Classification</h2></div><span className="refresh-status"><span className="live-dot" /> {mode === 'demo' ? 'SYNCED' : openF1.snapshot ? 'LOADED' : 'IDLE'}</span></div><div className="leaderboard-head"><span>POS</span><span>DRIVER</span><span>GAP / LAST LAP</span></div><div className="driver-list">{displayDrivers.length === 0 ? <div className="list-empty">{mode === 'historical' ? 'No session data loaded.' : 'No drivers available.'}</div> : displayDrivers.map((driver) => <button className={`driver-row ${selectedDriver === driver.id ? 'is-selected' : ''}`} key={driver.id} onClick={() => setSelectedDriver(driver.id)}><span className="position">{String(driver.position).padStart(2, '0')}<small className={driver.position < driver.grid ? 'gain' : driver.position > driver.grid ? 'loss' : ''}>{driver.position < driver.grid ? '▲' : driver.position > driver.grid ? '▼' : '—'} {Math.abs(driver.grid - driver.position) || ''}</small></span><span className="driver-name"><i style={{ background: driver.team.color }} /><b>{driver.abbreviation}</b><small>{driver.team.name}</small></span><span className="driver-gap"><b>{driver.gap ?? '—'}</b><small>{driver.lastLap ?? '—'}</small></span></button>)}</div></aside>

        <section className="lower-grid"><div className="race-control panel"><div className="panel-heading compact"><div><span className="eyebrow">RACE CONTROL</span><h2>Track messages</h2></div><span className="message-count">{String(messages.length).padStart(2, '0')}</span></div>{messages.length === 0 ? <div className="list-empty">No race-control messages available.</div> : messages.map((message) => <div className="message" key={message.id}><time>{new Date(message.timestamp).toISOString().slice(14, 19)}</time><div><span>{message.tag}</span><p>{message.message}</p></div></div>)}</div><div className="driver-detail panel"><div className="panel-heading compact"><div><span className="eyebrow">SELECTED DRIVER</span><h2><i style={{ background: selected?.team.color ?? '#6f7780' }} /> {selectedName}</h2></div><span className="car-number-large">{selected?.number ?? '—'}</span></div><div className="driver-detail-body"><div className="detail-identity"><strong>{selected?.abbreviation ?? '---'}</strong><span>{selectedTeam}</span><b>{selected ? `P${selected.position}` : '—'}</b></div><div className="telemetry-grid"><div><span>CAR SPEED</span><strong>{selected?.speed ?? '—'}<small>{selected?.speed === undefined ? '' : ' KM/H'}</small></strong></div><div><span>GEAR</span><strong>{selected?.gear ?? '—'}</strong></div><div><span>CURRENT LAP</span><strong>{selected?.lap ?? '—'}<small>{selected ? ` / ${totalLaps}` : ''}</small></strong></div><div><span>SECTOR</span><strong>{selected?.sector ?? '—'}</strong></div></div><div className="sector-bar"><span>S1 <b>—</b></span><span className={selected?.sector === 'S2' ? 'active' : ''}>S2 <b>—</b></span><span>S3 <b>—</b></span></div></div></div></section>
      </section>
      <footer className="footer"><span>APEX TIMING SYSTEM <b>v0.2.0</b></span><span>SESSION ID <b>{mode === 'demo' ? 'COTA-26-RACE' : openF1.selectedSessionKey ?? 'NONE'}</b></span><span>LAST UPDATE <b>{openF1.snapshot?.source.receivedAt ? new Date(openF1.snapshot.source.receivedAt).toLocaleTimeString() : mode === 'demo' ? 'JUST NOW' : '—'}</b></span></footer>
    </main>
  )
}

export default App
