import { useCallback, useEffect, useRef, useState } from 'react'
import { normalizeOpenF1Snapshot, type OpenF1NormalizedData } from './openF1Adapter'
import { OpenF1Client, type OpenF1Meeting, type OpenF1Session } from './openF1Client'

export type OpenF1DataState = {
  year: number
  meetings: OpenF1Meeting[]
  sessions: OpenF1Session[]
  selectedSessionKey?: number
  snapshot?: OpenF1NormalizedData
  loadingCatalog: boolean
  loadingSnapshot: boolean
  error?: string
}

const defaultState: OpenF1DataState = { year: new Date().getUTCFullYear(), meetings: [], sessions: [], loadingCatalog: false, loadingSnapshot: false }
const defaultClient = new OpenF1Client()

export function useOpenF1Data(client = defaultClient) {
  const [state, setState] = useState<OpenF1DataState>(defaultState)
  const snapshotController = useRef<AbortController | undefined>(undefined)

  const loadCatalog = useCallback(async (year: number, signal?: AbortSignal) => {
    setState((current) => ({ ...current, year, loadingCatalog: true, error: undefined, snapshot: undefined, selectedSessionKey: undefined }))
    try {
      const [meetings, sessions] = await Promise.all([client.getMeetings(year, signal), client.getSessions(year, signal)])
      setState((current) => ({ ...current, meetings, sessions, loadingCatalog: false }))
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setState((current) => ({ ...current, meetings: [], sessions: [], loadingCatalog: false, error: error instanceof Error ? error.message : 'Unable to load OpenF1 sessions' }))
    }
  }, [client])

  useEffect(() => {
    snapshotController.current?.abort()
    const controller = new AbortController()
    snapshotController.current = controller
    void loadCatalog(defaultState.year, controller.signal)
    return () => controller.abort()
  }, [loadCatalog])

  const selectSession = useCallback(async (sessionKey: number) => {
    const session = state.sessions.find((item) => item.session_key === sessionKey)
    const meeting = session && state.meetings.find((item) => item.meeting_key === session.meeting_key)
    if (!session || !meeting) return
    const controller = new AbortController()
    setState((current) => ({ ...current, selectedSessionKey: sessionKey, loadingSnapshot: true, error: undefined, snapshot: undefined }))
    try {
      const [drivers, positions, intervals, laps, raceControl] = await Promise.all([
        client.getDrivers(sessionKey, controller.signal),
        client.getPositions(sessionKey, controller.signal),
        client.getIntervals(sessionKey, controller.signal).catch(() => []),
        client.getLaps(sessionKey, controller.signal).catch(() => []),
        client.getRaceControl(sessionKey, controller.signal).catch(() => []),
      ])
      const snapshot = normalizeOpenF1Snapshot({ meeting, session, drivers, positions, intervals, laps, raceControl })
      setState((current) => ({ ...current, loadingSnapshot: false, snapshot }))
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setState((current) => ({ ...current, loadingSnapshot: false, error: error instanceof Error ? error.message : 'Unable to load the selected OpenF1 session' }))
    }
  }, [client, state.meetings, state.sessions])

  const sessionsForMeeting = useCallback((meetingKey: number) => state.sessions.filter((session) => session.meeting_key === meetingKey), [state.sessions])

  return { ...state, loadCatalog, selectSession, sessionsForMeeting }
}