import { ArrowRight, Info, RotateCcw } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router'
import { ExerciseCard } from '../components/common'
import { ButtonLink, Card, Notice, PageHeader, SectionTitle, Button } from '../components/ui'
import { journeyById } from '../content/journeys'
import { categoryById } from '../content/categories'
import { buildStartPlan } from '../lib/recommend'
import { QuizShareCard } from '../components/QuizShare'
import { useApp } from '../services/store'
import { track } from '../services/analytics'

export default function Result() {
  const { prefs, ready, updatePrefs, saveJourney, journeys } = useApp()
  const navigate = useNavigate()
  if (!ready) return null
  if (prefs.onboarding !== 'concluido') return <Navigate to="/primeiros-passos" replace />

  const plan = buildStartPlan(prefs.answers, prefs)
  const journey = journeyById(plan.journeyId)!
  const greetingName = prefs.name ? `${prefs.name}, aqui` : 'Aqui'

  return (
    <div>
      <PageHeader eyebrow="Seu ponto de partida" title={`${greetingName} estão algumas sugestões.`} subtitle="Feitas a partir das suas respostas. Você pode mudar tudo a qualquer momento." />

      <Notice title="Isso não é uma avaliação">
        O resultado indica apenas caminhos de prática a partir do que você respondeu. Não é diagnóstico nem avaliação médica ou psicológica.
      </Notice>

      <SectionTitle>Por que estas sugestões</SectionTitle>
      <Card>
        <ul className="space-y-2.5">
          {plan.reasons.length ? (
            plan.reasons.map((r) => (
              <li key={r} className="flex gap-2 text-ink-soft">
                <Info size={18} className="mt-0.5 shrink-0 text-azul-600" aria-hidden />
                <span>{r}</span>
              </li>
            ))
          ) : (
            <li className="text-ink-soft">Como você pulou algumas perguntas, escolhemos práticas simples e de baixo risco para começar.</li>
          )}
        </ul>
      </Card>

      <SectionTitle>3 práticas para começar</SectionTitle>
      <ul className="space-y-3">
        {plan.suggestions.map((s) => (
          <li key={s.exercise.id}>
            <ExerciseCard exercise={s.exercise} reason={s.reason} />
          </li>
        ))}
      </ul>

      <SectionTitle>Trilha inicial sugerida</SectionTitle>
      <Card className="bg-gradient-to-br from-white to-azul-50">
        <p className="eyebrow">
          {journey.days} dias · {journey.focus}
        </p>
        <p className="mt-1 font-display text-2xl font-semibold">{journey.title}</p>
        <p className="mt-2 text-sm text-ink-soft">{plan.journeyReason}</p>
        <Button
          className="mt-4"
          onClick={async () => {
            if (!journeys[journey.id]) track('journey_started', { journey_id: journey.id })
            if (!journeys[journey.id]) await saveJourney({ journeyId: journey.id, startedAt: Date.now(), currentDay: 1, completedDays: [], skippedDays: [], updatedAt: Date.now() })
            navigate(`/trilhas/${journey.id}`)
          }}
        >
          Ver a trilha <ArrowRight size={18} aria-hidden />
        </Button>
      </Card>

      {plan.categoryIds.length > 0 && (
        <>
          <SectionTitle>Situações que você marcou</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {plan.categoryIds.map((id) => (
              <ButtonLink key={id} to={`/explorar/${id}`} variant="soft" size="sm">
                {categoryById(id)?.title}
              </ButtonLink>
            ))}
          </div>
        </>
      )}

      <QuizShareCard />

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        <ButtonLink to="/" size="lg">
          Ir para o início
        </ButtonLink>
        <Button
          variant="secondary"
          size="lg"
          onClick={async () => {
            await updatePrefs({ onboarding: 'concluido' })
            navigate('/primeiros-passos')
          }}
        >
          <RotateCcw size={18} aria-hidden /> Refazer as perguntas
        </Button>
      </div>
    </div>
  )
}
