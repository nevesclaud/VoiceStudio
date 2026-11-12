import { AlertTriangle, Clock, Heart, PlayCircle } from 'lucide-react'
import { useParams } from 'react-router'
import NotFound from './NotFound'
import { Badge, ButtonLink, Card, Notice, PageHeader, SectionTitle, useTx } from '../components/ui'
import { exerciseById, pillarLabel } from '../content/exercises'
import { useApp } from '../services/store'

export default function ExerciseDetail() {
  const { id = '' } = useParams()
  const ex = exerciseById(id)
  const toTx = useTx()
  const { prefs, toggleFavorite, sessions } = useApp()
  if (!ex) return <NotFound />
  const fav = prefs.favorites.includes(ex.id)
  const done = sessions.filter((s) => s.exerciseId === ex.id && s.status === 'concluida').length
  const helped = sessions.filter((s) => s.exerciseId === ex.id && s.usefulness === 'ajudou').length

  return (
    <article>
      <PageHeader
        back
        eyebrow={pillarLabel[ex.pillar]}
        title={ex.title}
        action={
          <button
            type="button"
            onClick={() => toggleFavorite(ex.id)}
            aria-pressed={fav}
            aria-label={fav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-bege-300 bg-white"
          >
            <Heart size={20} className={fav ? 'fill-rose-300 text-rose-600' : 'text-muted'} aria-hidden />
          </button>
        }
      />
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <span className="inline-flex items-center gap-1">
          <Clock size={16} aria-hidden /> cerca de {ex.durationMin} min
        </span>
        <span>· {ex.difficulty === 'leve' ? 'Leve' : 'Moderada'}</span>
        {ex.breathFocus && <Badge tone="azul">Foco na respiração</Badge>}
        {ex.reviewStatus === 'revisao-necessaria' && <Badge tone="alerta">Revisão profissional necessária</Badge>}
        {!ex.autoRecommend && <Badge>Fora das recomendações automáticas</Badge>}
      </div>

      <p className="mt-5 text-lg text-ink">{toTx(ex.goal)}</p>

      {ex.caution && (
        <div className="mt-4">
          <Notice tone="alerta" title="Antes de começar">
            {toTx(ex.caution)}
          </Notice>
        </div>
      )}

      <ButtonLink to={`/praticar/${ex.id}/iniciar`} size="lg" block className="mt-6">
        <PlayCircle size={20} aria-hidden /> Iniciar prática
      </ButtonLink>
      {done > 0 && (
        <p className="mt-2 text-center text-sm text-muted">
          Você concluiu esta prática {done} {done === 1 ? 'vez' : 'vezes'}
          {helped ? `, e marcou que ajudou em ${helped}` : ''}.
        </p>
      )}

      <SectionTitle>Quando pode ajudar</SectionTitle>
      <p className="text-ink-soft">{toTx(ex.whenHelps)}</p>

      <SectionTitle>Como se preparar</SectionTitle>
      <ul className="list-disc space-y-1.5 pl-5 text-ink-soft">
        {ex.preparation.map((p, i) => (
          <li key={i}>{toTx(p)}</li>
        ))}
      </ul>

      <SectionTitle>Passo a passo</SectionTitle>
      <Card>
        <ol className="space-y-3">
          {ex.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-azul-50 text-sm font-semibold text-azul-600">{i + 1}</span>
              <span className="text-ink-soft">
                {toTx(s.text)}
                {s.seconds ? <span className="ml-1 text-xs text-muted">({s.seconds}s)</span> : null}
              </span>
            </li>
          ))}
        </ol>
      </Card>

      <SectionTitle>Quando parar</SectionTitle>
      <div className="flex gap-3 rounded-2xl bg-rose-50 p-4 text-ink-soft">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-700" aria-hidden />
        <p>{toTx(ex.whenToStop)}</p>
      </div>
      <p className="mt-6 text-sm text-muted">Não precisa acertar. Só experimentar com cuidado.</p>
    </article>
  )
}
