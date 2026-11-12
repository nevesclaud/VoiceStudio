/**
 * Armazenamento local (IndexedDB). Nada aqui é enviado para servidores.
 * Todos os registros ficam apenas neste aparelho e neste navegador.
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { CheckIn, JournalEntry, PracticeSession, Recording } from '../types'

export const DB_NAME = 'integra-ansiedade'
const DB_VERSION = 1

interface IntegraDB extends DBSchema {
  kv: { key: string; value: unknown }
  checkins: { key: string; value: CheckIn; indexes: { byDate: number } }
  journal: { key: string; value: JournalEntry; indexes: { byDate: number } }
  sessions: { key: string; value: PracticeSession; indexes: { byDate: number } }
  recordings: { key: string; value: Recording; indexes: { byDate: number } }
}

type ListStore = 'checkins' | 'journal' | 'sessions' | 'recordings'

let dbPromise: Promise<IDBPDatabase<IntegraDB>> | null = null

export class StorageUnavailableError extends Error {
  constructor(cause?: unknown) {
    super('O armazenamento local não está disponível neste navegador.')
    this.name = 'StorageUnavailableError'
    this.cause = cause
  }
}

function db(): Promise<IDBPDatabase<IntegraDB>> {
  if (typeof indexedDB === 'undefined') return Promise.reject(new StorageUnavailableError())
  if (!dbPromise) {
    dbPromise = openDB<IntegraDB>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        database.createObjectStore('kv')
        for (const name of ['checkins', 'journal', 'sessions', 'recordings'] as const) {
          const field = name === 'journal' || name === 'checkins' || name === 'recordings' ? 'createdAt' : 'startedAt'
          const store = database.createObjectStore(name, { keyPath: 'id' })
          store.createIndex('byDate', field)
        }
      },
      blocked() {
        /* outra aba aberta com versão antiga; a próxima abertura resolve */
      },
    }).catch((err) => {
      dbPromise = null
      throw new StorageUnavailableError(err)
    })
  }
  return dbPromise
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export async function kvGet<T>(key: string): Promise<T | undefined> {
  return (await (await db()).get('kv', key)) as T | undefined
}

export async function kvSet<T>(key: string, value: T): Promise<void> {
  await (await db()).put('kv', value, key)
}

export async function kvAll(): Promise<Record<string, unknown>> {
  const d = await db()
  const tx = d.transaction('kv')
  const out: Record<string, unknown> = {}
  let cursor = await tx.store.openCursor()
  while (cursor) {
    out[String(cursor.key)] = cursor.value
    cursor = await cursor.continue()
  }
  return out
}

export async function listAll<S extends ListStore>(store: S): Promise<IntegraDB[S]['value'][]> {
  const items = await (await db()).getAllFromIndex(store, 'byDate')
  return items.reverse() // mais recentes primeiro
}

export async function putItem<S extends ListStore>(store: S, value: IntegraDB[S]['value']): Promise<void> {
  await (await db()).put(store, value as never)
}

export async function deleteItem(store: ListStore, id: string): Promise<void> {
  await (await db()).delete(store, id)
}

/** Apaga TODOS os dados do app neste aparelho. */
export async function wipeAll(): Promise<void> {
  const d = await db()
  const tx = d.transaction(['kv', 'checkins', 'journal', 'sessions', 'recordings'], 'readwrite')
  await Promise.all([
    tx.objectStore('kv').clear(),
    tx.objectStore('checkins').clear(),
    tx.objectStore('journal').clear(),
    tx.objectStore('sessions').clear(),
    tx.objectStore('recordings').clear(),
    tx.done,
  ])
}

/** Exporta os dados em JSON legível. Gravações entram só como informação (o áudio fica no aparelho). */
export async function exportData(): Promise<string> {
  const [kv, checkins, journal, sessions, recordings] = await Promise.all([
    kvAll(),
    listAll('checkins'),
    listAll('journal'),
    listAll('sessions'),
    listAll('recordings'),
  ])
  return JSON.stringify(
    {
      app: 'INTEGRA | Ansiedade',
      exportedAt: new Date().toISOString(),
      note: 'Arquivo pessoal. Contém registros emocionais: guarde em local seguro.',
      preferences: kv.prefs ?? null,
      journeys: kv.journeys ?? null,
      categoryNotes: kv.notes ?? null,
      speaking: kv.speaking ?? null,
      checkins,
      journal,
      sessions,
      recordings: recordings.map(({ blob: _blob, ...meta }) => meta),
    },
    null,
    2,
  )
}

/** Usado apenas por testes. */
export async function __resetDbForTests(): Promise<void> {
  const p = dbPromise
  dbPromise = null
  if (p) (await p.catch(() => null))?.close()
}
