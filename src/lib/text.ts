import type { Gendered, TextForm } from '../types'

/**
 * Resolve textos com forma de tratamento.
 * - Objeto { f, m, n }: escolhe a forma.
 * - String com marcadores [[feminino|masculino|neutro]]: substitui cada marcador.
 * A forma neutra reescreve a frase sem flexão de gênero.
 */
export function tx(text: Gendered | undefined, form: TextForm): string {
  if (text === undefined) return ''
  const raw = typeof text === 'string' ? text : text[form]
  return raw.replace(/\[\[([^|\]]*)\|([^|\]]*)\|([^\]]*)\]\]/g, (_m, f: string, m: string, n: string) =>
    form === 'f' ? f : form === 'm' ? m : n,
  )
}

export function formatDate(ts: number, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' }): string {
  return new Intl.DateTimeFormat('pt-BR', opts).format(new Date(ts))
}

export function formatDateTime(ts: number): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(ts))
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export function greeting(date = new Date()): string {
  const h = date.getHours()
  if (h < 5) return 'Boa noite'
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}
