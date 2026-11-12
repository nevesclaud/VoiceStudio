import { ArrowRight, Route } from 'lucide-react'
import { Link } from 'react-router'
import { Card, PageHeader, Progress, useTx } from '../components/ui'
import { journeys } from '../content/journeys'
import { useApp } from '../services/store'

export default function Journeys() {
  const toTx = useTx()
  const { journeys: progress, activeJourneyId } = useApp()
  return (
    <div>
      <PageHeader back title="Trilhas guiadas" subtitle="Um pouco por dia, no seu ritmo. Você pode pular dias, trocar de trilha ou recomeçar quando quiser." />
      <ul className="space-y-4">
        {journeys.map((j) => {
          const p = progress[j.id]
          return (
            <li key={j.id}>
              <Link to={`/trilhas/${j.id}`} className="card block p-5 hover:border-azul-300">
                <div className="flex items-center justify-between gap-3">
                  <p className="eyebrow">
                    {j.days} dias · {j.focus}
                  </p>
                  {activeJourneyId === j.id && <span className="rounded-full bg-salvia-100 px-2.5 py-0.5 text-xs font-semibold text-salvia-700">Em andamento</span>}
                </div>
                <p className="mt-1 font-display text-2xl font-semibold">{j.title}</p>
                <p className="mt-2 text-sm text-ink-soft">{toTx(j.description)}</p>
                {p ? (
                  <div className="mt-4">
                    <Progress value={p.completedDays.length / j.days} label={`Andamento de ${j.title}`} />
                    <p className="mt-2 text-xs text-muted">
                      {p.completedDays.length} de {j.days} dias feitos
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-azul-600">
                    Conhecer a trilha <ArrowRight size={16} aria-hidden />
                  </p>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
      <Card className="mt-6 bg-bege-50">
        <div className="flex gap-3">
          <Route className="shrink-0 text-ink-soft" size={20} aria-hidden />
          <p className="text-sm text-ink-soft">As trilhas são propostas de prática e reflexão. Não prometem resultado em um número de dias e não substituem acompanhamento profissional.</p>
        </div>
      </Card>
    </div>
  )
}
