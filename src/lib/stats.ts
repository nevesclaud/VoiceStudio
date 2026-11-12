import type { CheckIn, PracticeSession } from '../types'

export interface DayPoint {
  key: string
  label: string
  date: Date
  avg: number | null
  count: number
}

/** Mínimo de check-ins com nota para mostrar um gráfico. Abaixo disso, nenhuma tendência é exibida. */
export const MIN_CHECKINS_FOR_CHART = 3

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Médias diárias dos check-ins relatados pela própria pessoa. Dias sem registro ficam vazios (não são inventados). */
export function dailyAverages(checkins: CheckIn[], days: number, now = new Date()): DayPoint[] {
  const out: DayPoint[] = []
  const map = new Map<string, number[]>()
  for (const c of checkins) {
    if (c.level === null) continue
    const k = dayKey(new Date(c.createdAt))
    const arr = map.get(k) ?? []
    arr.push(c.level)
    map.set(k, arr)
  }
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const k = dayKey(d)
    const vals = map.get(k) ?? []
    out.push({
      key: k,
      date: d,
      label: new Intl.DateTimeFormat('pt-BR', days <= 7 ? { weekday: 'short' } : { day: '2-digit' }).format(d).replace('.', ''),
      avg: vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null,
      count: vals.length,
    })
  }
  return out
}

export function countInPeriod<T extends { createdAt?: number; endedAt?: number }>(items: T[], days: number, now = Date.now()): number {
  const since = now - days * 86400000
  return items.filter((i) => (i.createdAt ?? i.endedAt ?? 0) >= since).length
}

export function topPractices(sessions: PracticeSession[], limit = 3): { exerciseId: string; count: number; helped: number }[] {
  const map = new Map<string, { count: number; helped: number }>()
  for (const s of sessions) {
    if (s.status !== 'concluida') continue
    const v = map.get(s.exerciseId) ?? { count: 0, helped: 0 }
    v.count++
    if (s.usefulness === 'ajudou') v.helped++
    map.set(s.exerciseId, v)
  }
  return [...map.entries()]
    .map(([exerciseId, v]) => ({ exerciseId, ...v }))
    .sort((a, b) => b.count - a.count || b.helped - a.helped)
    .slice(0, limit)
}
