import { ArrowRight, CloudSun, Heart, History, Mic, PlayCircle, Route, Sparkles, Waves } from 'lucide-react'
import { Link } from 'react-router'
import { CheckInForm, ExerciseCard } from '../components/common'
import { HelpButton } from '../components/Layout'
import { ButtonLink, Card, EmptyState, Progress, SectionTitle } from '../components/ui'
import { exerciseById } from '../content/exercises'
import { sessionTitle } from '../lib/sessions'
import { journeyById } from '../content/journeys'
import { suggestNow } from '../lib/recommend'
import { formatDate, greeting } from '../lib/text'
import { useApp } from '../services/store'

const moments = [
  { to: '/praticar?momento=antes', title: 'Antes de uma situação difícil', text: 'Preparar o corpo e a mente.', icon: CloudSun, cls: 'bg-azul-50' },
  { to: '/ajuda', title: 'Durante uma crise', text: 'Recursos de 30 segundos a 5 minutos.', icon: Waves, cls: 'bg-rose-50' },
  { to: '/praticar?momento=depois', title: 'Depois que passa', text: 'Entender e se acolher.', icon: Heart, cls: 'bg-salvia-50' },
]

export default function Home() {
  const { prefs, checkins, sessions, resume, activeJourneyId, journeys } = useApp()
  const last = checkins[0]
  const recent = last && Date.now() - last.createdAt < 1000 * 60 * 60 * 3 ? last : undefined
  const suggestion = suggestNow(recent ? recent.level : null, prefs)
  const resumeEx = resume ? exerciseById(resume.exerciseId) : undefined
  const journey = activeJourneyId ? journeyById(activeJourneyId) : undefined
  const progress = activeJourneyId ? journeys[activeJourneyId] : undefined
  const favorites = prefs.favorites.map(exerciseById).filter((e): e is NonNullable<typeof e> => Boolean(e))

  return (
    <div className="space-y-2">
      <section aria-labelledby="ola" className="anim-in">
        <p className="eyebrow">{formatDate(Date.now(), { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h1 id="ola" className="mt-1 font-display text-[2.1rem] leading-tight font-semibold">
          {greeting()}
          {prefs.name ? `, ${prefs.name}` : ''}.
        </h1>
        <p className="mt-1 text-muted">O que está mais difícil hoje?</p>
      </section>

      {prefs.onboarding === 'ignorado' && (
        <Card className="mt-4 bg-gradient-to-br from-white to-rose-50">
          <p className="font-semibold">Quer sugestões feitas para você?</p>
          <p className="mt-1 text-sm text-muted">Algumas perguntas rápidas sobre como a ansiedade aparece em você. Uns 3 minutos.</p>
          <ButtonLink to="/primeiros-passos" size="sm" className="mt-3">
            Responder agora
          </ButtonLink>
        </Card>
      )}

      <Card as="section" className="mt-4">
        <CheckInForm context="inicio" />
      </Card>

      <div className="lg:hidden">
        <div className="mt-4 flex justify-center">
          <HelpButton />
        </div>
      </div>

      <SectionTitle>Talvez isso ajude agora</SectionTitle>
      <ExerciseCard exercise={suggestion.exercise} reason={suggestion.reason} />

      {resumeEx && (
        <Link to={`/praticar/${resumeEx.id}/iniciar?retomar=1`} className="card mt-3 flex items-center gap-3 p-4 hover:border-azul-300">
          <PlayCircle className="shrink-0 text-azul-600" size={28} aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted">Continuar de onde parou</p>
            <p className="font-semibold">
              {resumeEx.title} · etapa {resume!.stepIndex + 1} de {resumeEx.steps.length}
            </p>
          </div>
          <ArrowRight size={18} aria-hidden />
        </Link>
      )}

      <SectionTitle>Para cada momento</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-3">
        {moments.map(({ to, title, text, icon: Icon, cls }) => (
          <Link key={to} to={to} className={`rounded-[1.25rem] border border-line p-4 transition-colors hover:border-azul-300 ${cls}`}>
            <Icon size={22} className="text-ink-soft" aria-hidden />
            <p className="mt-3 font-semibold leading-snug">{title}</p>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </Link>
        ))}
      </div>

      <SectionTitle action={<Link to="/trilhas" className="text-sm font-medium text-azul-600 underline-offset-2 hover:underline">Ver trilhas</Link>}>
        Sua trilha
      </SectionTitle>
      {journey && progress ? (
        <Link to={`/trilhas/${journey.id}/dia/${Math.min(progress.currentDay, journey.days)}`} className="card block p-5 hover:border-azul-300">
          <div className="flex items-center gap-3">
            <Route className="text-salvia-700" size={22} aria-hidden />
            <p className="font-semibold">{journey.title}</p>
          </div>
          <p className="mt-2 text-sm text-muted">
            {progress.completedDays.length} de {journey.days} dias feitos · próximo: dia {Math.min(progress.currentDay, journey.days)}
          </p>
          <div className="mt-3">
            <Progress value={progress.completedDays.length / journey.days} label={`Andamento da trilha ${journey.title}`} />
          </div>
          <p className="mt-3 text-sm text-muted">Sem pressa. Pular dias faz parte.</p>
        </Link>
      ) : (
        <EmptyState icon={Route} title="Nenhuma trilha em andamento" action={<ButtonLink to="/trilhas" size="sm" variant="secondary">Escolher uma trilha</ButtonLink>}>
          Trilhas de 7, 14 ou 21 dias, sem obrigação de fazer todos os dias.
        </EmptyState>
      )}

      <div className="grid gap-3 pt-2 sm:grid-cols-2">
        <Link to="/falar-em-publico" className="card mt-3 flex items-center gap-3 p-4 hover:border-azul-300">
          <span className="grid size-11 place-items-center rounded-full bg-rose-100 text-rose-700">
            <Mic size={20} aria-hidden />
          </span>
          <div>
            <p className="font-semibold">Falar em público</p>
            <p className="text-sm text-muted">Preparar, ensaiar e cronometrar.</p>
          </div>
        </Link>
        <Link to="/integra" className="card mt-3 flex items-center gap-3 p-4 hover:border-azul-300">
          <span className="grid size-11 place-items-center rounded-full bg-salvia-100 text-salvia-700">
            <Sparkles size={20} aria-hidden />
          </span>
          <div>
            <p className="font-semibold">Método INTEGRA</p>
            <p className="text-sm text-muted">Emoções, corpo, mente e sentido.</p>
          </div>
        </Link>
      </div>

      <SectionTitle>Favoritos</SectionTitle>
      {favorites.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {favorites.slice(0, 4).map((e) => (
            <li key={e.id}>
              <ExerciseCard exercise={e} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={Heart} title="Ainda sem favoritos">
          Quando uma prática ajudar, toque no coração para encontrá-la rápido aqui.
        </EmptyState>
      )}

      <SectionTitle action={<Link to="/progresso" className="text-sm font-medium text-azul-600 underline-offset-2 hover:underline">Ver tudo</Link>}>
        Últimas práticas
      </SectionTitle>
      {sessions.length ? (
        <ul className="card divide-y divide-line px-4">
          {sessions.slice(0, 4).map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="font-medium">{sessionTitle(s.exerciseId)}</span>
              <span className="text-muted">
                {s.status === 'concluida' ? 'concluída' : 'interrompida'} · {formatDate(s.endedAt)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={History} title="Nenhuma prática ainda">
          Você pode começar com dois minutos.
        </EmptyState>
      )}
    </div>
  )
}
