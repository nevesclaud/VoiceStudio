import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type {
  CheckIn,
  JournalEntry,
  JourneyProgress,
  PracticeSession,
  ResumeState,
  SpeakingState,
  UserPreferences,
} from '../types'
import * as storage from './db'
import { configureAnalytics, track } from './analytics'

export const defaultPrefs: UserPreferences = {
  name: '',
  textForm: 'n',
  onboarding: 'pendente',
  answers: {},
  shortPractices: true,
  avoidBreathFocus: false,
  reduceMotion: 'sistema',
  largerText: false,
  showSpirituality: false,
  favorites: [],
  recordingConsent: false,
  shareStats: false,
  statsAsked: false,
  quizShared: false,
  visitorId: '',
}

export const defaultSpeaking: SpeakingState = {
  checklist: {},
  cards: [],
  plan: {},
  planNotes: '',
  whatWorked: '',
  simulator: { totalMin: 5, pauseEverySec: 60 },
}

interface AppState {
  ready: boolean
  /** false quando o IndexedDB não está disponível (ex.: navegação privada restrita). */
  persistent: boolean
  prefs: UserPreferences
  checkins: CheckIn[]
  journal: JournalEntry[]
  sessions: PracticeSession[]
  journeys: Record<string, JourneyProgress>
  activeJourneyId: string | null
  notes: Record<string, string>
  speaking: SpeakingState
  resume: ResumeState | null
}

interface AppActions {
  updatePrefs: (patch: Partial<UserPreferences>) => Promise<void>
  toggleFavorite: (exerciseId: string) => Promise<void>
  addCheckIn: (c: Omit<CheckIn, 'id' | 'createdAt'>) => Promise<CheckIn>
  deleteCheckIn: (id: string) => Promise<void>
  saveJournal: (e: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<JournalEntry>
  deleteJournal: (id: string) => Promise<void>
  addSession: (s: Omit<PracticeSession, 'id'>) => Promise<PracticeSession>
  updateSession: (s: PracticeSession) => Promise<void>
  saveJourney: (p: JourneyProgress) => Promise<void>
  setActiveJourney: (id: string | null) => Promise<void>
  resetJourney: (id: string) => Promise<void>
  saveNote: (categoryId: string, text: string) => Promise<void>
  updateSpeaking: (patch: Partial<SpeakingState>) => Promise<void>
  setResume: (r: ResumeState | null) => Promise<void>
  wipeAll: () => Promise<void>
}

const Ctx = createContext<(AppState & AppActions) | null>(null)

const initial: AppState = {
  ready: false,
  persistent: true,
  prefs: defaultPrefs,
  checkins: [],
  journal: [],
  sessions: [],
  journeys: {},
  activeJourneyId: null,
  notes: {},
  speaking: defaultSpeaking,
  resume: null,
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initial)
  const stateRef = useRef<AppState>(initial)
  const persistentRef = useRef(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        // Se o armazenamento não responder em 3 s (alguns navegadores travam o IndexedDB), segue em memória.
        const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
        const [prefs, journeys, active, notes, speaking, resume, checkins, journal, sessions] = await Promise.race([timeout, Promise.all([
          storage.kvGet<UserPreferences>('prefs'),
          storage.kvGet<Record<string, JourneyProgress>>('journeys'),
          storage.kvGet<string | null>('activeJourney'),
          storage.kvGet<Record<string, string>>('notes'),
          storage.kvGet<SpeakingState>('speaking'),
          storage.kvGet<ResumeState | null>('resume'),
          storage.listAll('checkins'),
          storage.listAll('journal'),
          storage.listAll('sessions'),
        ])])
        if (!alive) return
        const mergedPrefs: UserPreferences = { ...defaultPrefs, ...prefs }
        if (!mergedPrefs.visitorId) {
          mergedPrefs.visitorId = storage.newId()
          void storage.kvSet('prefs', mergedPrefs).catch(() => undefined)
        }
        const loaded: AppState = {
          ready: true,
          persistent: true,
          prefs: mergedPrefs,
          journeys: journeys ?? {},
          activeJourneyId: active ?? null,
          notes: notes ?? {},
          speaking: { ...defaultSpeaking, ...speaking },
          resume: resume ?? null,
          checkins,
          journal,
          sessions,
        }
        stateRef.current = loaded
        setState(loaded)
      } catch {
        persistentRef.current = false
        if (alive) {
          stateRef.current = { ...stateRef.current, ready: true, persistent: false, prefs: { ...stateRef.current.prefs, visitorId: storage.newId() } }
          setState(stateRef.current)
        }
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  /** Grava no IndexedDB quando disponível; sem ele, o app segue funcionando em memória. */
  const persist = useCallback(async (fn: () => Promise<void>) => {
    if (!persistentRef.current) return
    try {
      await fn()
    } catch {
      persistentRef.current = false
      stateRef.current = { ...stateRef.current, persistent: false }
      setState(stateRef.current)
    }
  }, [])

  const actions = useMemo<AppActions>(() => {
    /** Calcula o próximo estado de forma síncrona, para gravar exatamente o que foi mostrado. */
    const commit = (fn: (s: AppState) => AppState): AppState => {
      const next = fn(stateRef.current)
      stateRef.current = next
      setState(next)
      return next
    }
    const setKv = <T,>(key: string, value: T) => persist(() => storage.kvSet(key, value))
    return {
      async updatePrefs(patch) {
        const s = commit((s) => ({ ...s, prefs: { ...s.prefs, ...patch } }))
        await setKv('prefs', s.prefs)
      },
      async toggleFavorite(id) {
        const s = commit((s) => {
          const has = s.prefs.favorites.includes(id)
          return { ...s, prefs: { ...s.prefs, favorites: has ? s.prefs.favorites.filter((f) => f !== id) : [id, ...s.prefs.favorites] } }
        })
        await setKv('prefs', s.prefs)
      },
      async addCheckIn(c) {
        const item: CheckIn = { ...c, id: storage.newId(), createdAt: Date.now() }
        commit((s) => ({ ...s, checkins: [item, ...s.checkins] }))
        await persist(() => storage.putItem('checkins', item))
        return item
      },
      async deleteCheckIn(id) {
        commit((s) => ({ ...s, checkins: s.checkins.filter((c) => c.id !== id) }))
        await persist(() => storage.deleteItem('checkins', id))
      },
      async saveJournal(e) {
        const now = Date.now()
        const existing = e.id ? stateRef.current.journal.find((j) => j.id === e.id) : undefined
        const item = { ...existing, ...e, id: e.id ?? storage.newId(), createdAt: existing?.createdAt ?? now, updatedAt: now } as JournalEntry
        commit((s) => ({
          ...s,
          journal: [item, ...s.journal.filter((j) => j.id !== item.id)].sort((a, b) => b.createdAt - a.createdAt),
        }))
        await persist(() => storage.putItem('journal', item))
        return item
      },
      async deleteJournal(id) {
        commit((s) => ({ ...s, journal: s.journal.filter((j) => j.id !== id) }))
        await persist(() => storage.deleteItem('journal', id))
      },
      async addSession(sess) {
        const item: PracticeSession = { ...sess, id: storage.newId() }
        commit((s) => ({ ...s, sessions: [item, ...s.sessions] }))
        await persist(() => storage.putItem('sessions', item))
        return item
      },
      async updateSession(item) {
        commit((s) => ({ ...s, sessions: s.sessions.map((x) => (x.id === item.id ? item : x)) }))
        await persist(() => storage.putItem('sessions', item))
      },
      async saveJourney(p) {
        const s = commit((s) => ({ ...s, journeys: { ...s.journeys, [p.journeyId]: p }, activeJourneyId: p.journeyId }))
        await setKv('journeys', s.journeys)
        await setKv('activeJourney', p.journeyId)
      },
      async setActiveJourney(id) {
        commit((s) => ({ ...s, activeJourneyId: id }))
        await setKv('activeJourney', id)
      },
      async resetJourney(id) {
        const s = commit((s) => {
          const journeys = { ...s.journeys }
          delete journeys[id]
          return { ...s, journeys }
        })
        await setKv('journeys', s.journeys)
      },
      async saveNote(categoryId, text) {
        const s = commit((s) => ({ ...s, notes: { ...s.notes, [categoryId]: text } }))
        await setKv('notes', s.notes)
      },
      async updateSpeaking(patch) {
        const s = commit((s) => ({ ...s, speaking: { ...s.speaking, ...patch } }))
        await setKv('speaking', s.speaking)
      },
      async setResume(r) {
        commit((s) => ({ ...s, resume: r }))
        await setKv('resume', r)
      },
      async wipeAll() {
        await persist(() => storage.wipeAll())
        // Novo identificador: nada do que vier depois se liga ao que foi apagado.
        commit(() => ({ ...initial, ready: true, persistent: persistentRef.current, prefs: { ...defaultPrefs, visitorId: storage.newId() } }))
      },
    }
  }, [persist])

  // Estatísticas: só com consentimento. Atualiza sempre que a escolha muda.
  const openedRef = useRef(false)
  useEffect(() => {
    if (!state.ready) return
    configureAnalytics({ consent: state.prefs.shareStats, visitorId: state.prefs.visitorId })
    if (state.prefs.shareStats && !openedRef.current) {
      openedRef.current = true
      track('app_opened')
    }
  }, [state.ready, state.prefs.shareStats, state.prefs.visitorId])

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions])
  // Nada é exibido antes de os dados locais carregarem: evita que um registro feito
  // nesse intervalo seja sobrescrito pelo carregamento.
  if (!state.ready) {
    return (
      <div className="grid min-h-dvh place-items-center" role="status" aria-live="polite">
        <span className="size-8 animate-spin rounded-full border-2 border-bege-300 border-t-ink" aria-hidden />
        <span className="sr-only">Carregando...</span>
      </div>
    )
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp precisa estar dentro de <AppProvider>')
  return v
}
