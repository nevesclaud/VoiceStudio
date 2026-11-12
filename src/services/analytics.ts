/**
 * Estatísticas anônimas de uso, somente com consentimento.
 *
 * O que é enviado: nome do evento, página (padrão de rota), identificador aleatório do aparelho,
 * identificador aleatório da sessão e alguns códigos (ex.: id da prática, número da etapa).
 * O que NUNCA é enviado: texto digitado, diário, respostas, fotos, gravações, nome, e-mail.
 * Sem gravação de tela, sem reprodução de sessão, sem captura de formulários.
 */
import { getRemote } from './remote'

export const EVENT_NAMES = [
  'app_opened',
  'page_viewed',
  'category_opened',
  'exercise_started',
  'exercise_completed',
  'exercise_feedback_submitted',
  'quiz_started',
  'quiz_step_completed',
  'quiz_completed',
  'journey_started',
  'journey_completed',
  'whatsapp_button_clicked',
  'suggestion_submitted',
] as const
export type EventName = (typeof EVENT_NAMES)[number]

type Props = Partial<Record<'exercise_id' | 'category_id' | 'journey_id' | 'step_key' | 'topic' | 'usefulness' | 'source' | 'pillar', string> & Record<'step' | 'day' | 'total', number>>

interface QueuedEvent {
  name: EventName
  visitor_id: string
  session_id: string
  page?: string
  props: Record<string, string | number>
}

const SLUG = /^[a-z0-9-]{1,60}$/
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi

let consent = false
let visitorId = ''
const sessionId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : '00000000-0000-4000-8000-000000000000'
let queue: QueuedEvent[] = []
let timer: ReturnType<typeof setTimeout> | null = null

export function configureAnalytics(opts: { consent: boolean; visitorId: string }): void {
  consent = opts.consent && /^[0-9a-f-]{36}$/i.test(opts.visitorId)
  visitorId = opts.visitorId
  if (!consent) queue = []
}

/** Rota sem dados pessoais: ids aleatórios viram :id e o texto fica só com caracteres seguros. */
export function normalizePage(pathname: string): string | undefined {
  const p = pathname.toLowerCase().replace(UUID, ':id').replace(/\/+$/, '') || '/'
  return /^\/[a-z0-9/:_-]*$/.test(p) && p.length <= 80 ? p : undefined
}

/** Mantém só chaves conhecidas, com valores em formato de código. Texto livre é descartado. */
export function cleanProps(props: Props = {}): Record<string, string | number> {
  const out: Record<string, string | number> = {}
  for (const [k, v] of Object.entries(props)) {
    if (['step', 'day', 'total'].includes(k)) {
      if (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < 1000) out[k] = v
    } else if (['exercise_id', 'category_id', 'journey_id', 'step_key', 'topic', 'usefulness', 'source', 'pillar'].includes(k)) {
      if (typeof v === 'string' && SLUG.test(v)) out[k] = v
    }
  }
  return out
}

export function track(name: EventName, props?: Props, page?: string): void {
  if (!consent || !getRemote()) return
  queue.push({ name, visitor_id: visitorId, session_id: sessionId, page: page ? normalizePage(page) : undefined, props: cleanProps(props) })
  if (queue.length >= 20) void flush()
  else if (!timer) timer = setTimeout(() => void flush(), 8000)
}

export async function flush(): Promise<void> {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  const remote = getRemote()
  if (!remote || queue.length === 0) return
  const batch = queue.splice(0, 50)
  try {
    await remote.rpc('log_events', { p_events: batch })
  } catch {
    // Sem rede: descarta em silêncio. Estatística nunca atrapalha o uso do app.
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flush()
  })
}

/** Usado apenas nos testes. */
export function __analyticsState() {
  return { queue: [...queue], consent, sessionId }
}
