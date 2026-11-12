import { ArrowLeft, ArrowRight, Check, PlayCircle, SkipForward } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import NotFound from './NotFound'
import { Button, ButtonLink, Card, PageHeader, SectionTitle, useTx } from '../components/ui'
import { journeyById } from '../content/journeys'
import { exerciseById } from '../content/exercises'
import { useApp } from '../services/store'
import type { JourneyProgress } from '../types'

export default function JourneyDayPage() {
  const { id = '', day = '1' } = useParams()
  const j = journeyById(id)
  const n = Number(day)
  const toTx = useTx()
  const navigate = useNavigate()
  const { journeys, saveJourney } = useApp()
  if (!j || !Number.isInteger(n) || n < 1 || n > j.days) return <NotFound />
  const d = j.plan[n - 1]!
  const ex = exerciseById(d.exerciseId)
  const p: JourneyProgress = journeys[j.id] ?? { journeyId: j.id, startedAt: Date.now(), currentDay: 1, completedDays: [], skippedDays: [], updatedAt: Date.now() }
  const done = p.completedDays.includes(n)
  const nextOpen = (from: number, completed: number[], skipped: number[]) => {
    for (let k = from + 1; k <= j.days; k++) if (!completed.includes(k) && !skipped.includes(k)) return k
    return Math.min(from + 1, j.days)
  }

  const mark = async (kind: 'feito' | 'pular') => {
    const completed = kind === 'feito' ? [...new Set([...p.completedDays, n])] : p.completedDays
    const skipped = kind === 'pular' ? [...new Set([...p.skippedDays, n])].filter((x) => !completed.includes(x)) : p.skippedDays.filter((x) => x !== n)
    const next = nextOpen(n, completed, skipped)
    await saveJourney({ ...p, completedDays: completed, skippedDays: skipped, currentDay: next, updatedAt: Date.now() })
    if (n < j.days) navigate(`/trilhas/${j.id}/dia/${next}`)
    else navigate(`/trilhas/${j.id}`)
  }

  const here = `/trilhas/${j.id}/dia/${n}`

  return (
    <article>
      <PageHeader back={`/trilhas/${j.id}`} eyebrow={`${j.title} · Dia ${n} de ${j.days}`} title={d.title} />
      <p className="text-lg text-ink-soft">{toTx(d.text)}</p>

      <SectionTitle>Prática do dia</SectionTitle>
      {ex && (
        <Card className="bg-gradient-to-br from-white to-azul-50">
          <p className="font-semibold">{ex.title}</p>
          <p className="mt-1 text-sm text-muted">
            {toTx(ex.goal)} · {ex.durationMin} min
          </p>
          <ButtonLink to={`/praticar/${ex.id}/iniciar?trilha=${encodeURIComponent(here)}`} className="mt-4">
            <PlayCircle size={18} aria-hidden /> Iniciar prática
          </ButtonLink>
        </Card>
      )}

      <SectionTitle>Para refletir</SectionTitle>
      <Card>
        <p className="font-display text-xl font-semibold">{toTx(d.question)}</p>
        <ButtonLink to={`/diario/novo?modo=rapida`} variant="secondary" size="sm" className="mt-4">
          Responder no diário
        </ButtonLink>
      </Card>

      <SectionTitle>Uma ação simples</SectionTitle>
      <p className="text-ink-soft">{toTx(d.action)}</p>

      <div className="mt-8 grid gap-3">
        {done ? (
          <p className="flex items-center justify-center gap-2 rounded-full bg-salvia-50 py-3 font-semibold text-salvia-700" role="status">
            <Check size={18} aria-hidden /> Dia marcado como feito
          </p>
        ) : (
          <Button size="lg" onClick={() => mark('feito')}>
            <Check size={18} aria-hidden /> Marcar dia como feito
          </Button>
        )}
        {!done && (
          <Button variant="secondary" onClick={() => mark('pular')}>
            <SkipForward size={16} aria-hidden /> Pular este dia
          </Button>
        )}
      </div>
      <div className="mt-6 flex justify-between">
        <Button variant="ghost" size="sm" disabled={n === 1} onClick={() => navigate(`/trilhas/${j.id}/dia/${n - 1}`)}>
          <ArrowLeft size={16} aria-hidden /> Dia anterior
        </Button>
        <Button variant="ghost" size="sm" disabled={n === j.days} onClick={() => navigate(`/trilhas/${j.id}/dia/${n + 1}`)}>
          Próximo dia <ArrowRight size={16} aria-hidden />
        </Button>
      </div>
      <p className="mt-6 text-center text-sm text-muted">Fez em outro dia, pulou alguns? Tudo bem. A trilha espera você.</p>
    </article>
  )
}
