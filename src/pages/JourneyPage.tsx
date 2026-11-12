import { Check, Circle, MinusCircle, RotateCcw } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import NotFound from './NotFound'
import { Button, Card, PageHeader, Progress, useTx } from '../components/ui'
import { journeyById } from '../content/journeys'
import { exerciseById } from '../content/exercises'
import { useApp } from '../services/store'
import { track } from '../services/analytics'

export default function JourneyPage() {
  const { id = '' } = useParams()
  const j = journeyById(id)
  const toTx = useTx()
  const navigate = useNavigate()
  const { journeys, saveJourney, resetJourney, activeJourneyId, setActiveJourney } = useApp()
  if (!j) return <NotFound />
  const p = journeys[j.id]

  const start = async () => {
    // O estado muda na hora; a gravação local segue em segundo plano.
    if (!p) track('journey_started', { journey_id: j.id })
    if (!p) void saveJourney({ journeyId: j.id, startedAt: Date.now(), currentDay: 1, completedDays: [], skippedDays: [], updatedAt: Date.now() })
    else void setActiveJourney(j.id)
    navigate(`/trilhas/${j.id}/dia/${p ? Math.min(p.currentDay, j.days) : 1}`)
  }

  return (
    <div>
      <PageHeader back="/trilhas" eyebrow={`${j.days} dias · ${j.focus}`} title={j.title} subtitle={toTx(j.description)} />

      {p && (
        <Card className="mb-5">
          <Progress value={p.completedDays.length / j.days} label={`Andamento de ${j.title}`} />
          <p className="mt-2 text-sm text-muted">
            {p.completedDays.length} de {j.days} dias feitos{p.skippedDays.length ? ` · ${p.skippedDays.length} pulados` : ''}. Sem pressa.
          </p>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button size="lg" onClick={start}>
          {p ? `Continuar no dia ${Math.min(p.currentDay, j.days)}` : 'Começar a trilha'}
        </Button>
        {p && activeJourneyId !== j.id && (
          <Button variant="secondary" size="lg" onClick={() => setActiveJourney(j.id)}>
            Tornar esta a trilha atual
          </Button>
        )}
      </div>

      <ol className="mt-6 space-y-2">
        {j.plan.map((d, i) => {
          const n = i + 1
          const done = p?.completedDays.includes(n)
          const skipped = p?.skippedDays.includes(n)
          const ex = exerciseById(d.exerciseId)
          return (
            <li key={n}>
              <Link to={`/trilhas/${j.id}/dia/${n}`} className="card flex items-center gap-3 p-4 hover:border-azul-300">
                <span className={`grid size-9 shrink-0 place-items-center rounded-full ${done ? 'bg-salvia-100 text-salvia-700' : 'bg-bege-100 text-muted'}`}>
                  {done ? <Check size={18} aria-label="feito" /> : skipped ? <MinusCircle size={18} aria-label="pulado" /> : <Circle size={10} aria-hidden />}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted">Dia {n}</p>
                  <p className="font-medium">{d.title}</p>
                  {ex && <p className="text-xs text-muted">{ex.title} · {ex.durationMin} min</p>}
                </div>
              </Link>
            </li>
          )
        })}
      </ol>

      {p && (
        <Button
          variant="ghost"
          className="mt-6"
          onClick={async () => {
            if (window.confirm('Recomeçar esta trilha do dia 1? Seus registros no diário continuam salvos.')) {
              await resetJourney(j.id)
              await saveJourney({ journeyId: j.id, startedAt: Date.now(), currentDay: 1, completedDays: [], skippedDays: [], updatedAt: Date.now() })
            }
          }}
        >
          <RotateCcw size={16} aria-hidden /> Recomeçar do início
        </Button>
      )}
    </div>
  )
}
