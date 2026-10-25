import { useState } from 'react'
import type { OpenF1DataState } from '../data/useOpenF1Data'

type SessionBrowserProps = {
  mode: 'demo' | 'historical'
  onModeChange: (mode: 'demo' | 'historical') => void
  data: OpenF1DataState
  onSessionChange: (sessionKey: number) => void
  onReload: () => void
}

export function SessionBrowser({ mode, onModeChange, data, onSessionChange, onReload }: SessionBrowserProps) {
  const selectedSession = data.sessions.find((session) => session.session_key === data.selectedSessionKey)
  const [chosenMeetingKey, setChosenMeetingKey] = useState<number | undefined>()
  const meetingKey = data.meetings.some((meeting) => meeting.meeting_key === chosenMeetingKey) ? chosenMeetingKey : selectedSession?.meeting_key ?? data.meetings[0]?.meeting_key
  const meetingSessions = data.sessions.filter((session) => session.meeting_key === meetingKey)
  return <div className="session-browser"><label><span className="eyebrow">DATA SOURCE</span><select value={mode} onChange={(event) => onModeChange(event.target.value as 'demo' | 'historical')}><option value="demo">DEMO PLAYBACK</option><option value="historical">OPENF1 HISTORICAL</option></select></label>{mode === 'historical' && <><label><span className="eyebrow">MEETING</span><select value={meetingKey ?? ''} onChange={(event) => setChosenMeetingKey(Number(event.target.value))} disabled={data.loadingCatalog || data.meetings.length === 0}><option value="">{data.loadingCatalog ? 'LOADING MEETINGS...' : 'SELECT MEETING'}</option>{data.meetings.map((meeting) => <option value={meeting.meeting_key} key={meeting.meeting_key}>{meeting.date_start.slice(0, 10)} · {meeting.location}</option>)}</select></label><label><span className="eyebrow">SESSION</span><select value={data.selectedSessionKey ?? ''} onChange={(event) => onSessionChange(Number(event.target.value))} disabled={data.loadingCatalog || meetingSessions.length === 0}><option value="">{meetingSessions.length === 0 ? 'NO SESSIONS AVAILABLE' : 'SELECT SESSION'}</option>{meetingSessions.map((session) => <option value={session.session_key} key={session.session_key}>{session.session_name} · {session.session_type}</option>)}</select></label></>}<button className="session-reload" onClick={onReload} disabled={data.loadingCatalog} aria-label="Reload OpenF1 sessions">↻</button></div>
}