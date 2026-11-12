import { AlertTriangle, ChevronLeft, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { CheckInForm } from '../components/common'
import { StepPlayer } from '../components/StepPlayer'
import { Button, ButtonLink, ChoiceList, TextArea, useTx } from '../components/ui'
import { exerciseById, exercises } from '../content/exercises'
import { eligible } from '../lib/recommend'
import { useApp } from '../services/store'
import type { PracticeSession } from '../types'
import NotFound from './NotFound'

type Phase = 'antes' | 'pratica' | 'avaliar' | 'parou' | 'fim'

export default function ExerciseRun() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const toTx = useTx()
  const { prefs, resume, setResume, addSession, updateSession } = useApp()
  const ex = exerciseById(id)
  const resuming = params.get('retomar') === '1' && resume?.exerciseId === id
  const source = (params.get('origem') as PracticeSession['source']) ?? (params.get('trilha') ? 'trilha' : 'biblioteca')
  const [phase, setPhase] = useState<Phase>(ex?.caution && !resuming ? 'antes' : 'pratica')
  const [usefulness, setUsefulness] = useState<PracticeSession['usefulness']>()
  const [note, setNote] = useState('')
  const [session, setSession] = useState<PracticeSession | null>(null)
  const startedAt = useRef(Date.now())

  if (!ex) return <NotFound />

  const back = params.get('trilha') ?? `/praticar/${ex.id}`

  const finish = async (status: PracticeSession['status']) => {
    const s = await addSession({ exerciseId: ex.id, startedAt: startedAt.current, endedAt: Date.now(), status, source })
    setSession(s)
    await setResume(null)
    setPhase(status === 'concluida' ? 'avaliar' : 'parou')
  }

  const alternative = () => {
    const pool = eligible(prefs).filter((e) => e.id !== ex.id)
    return pool.find((e) => e.pillar === ex.pillar && e.durationMin <= ex.durationMin + 2) ?? pool.find((e) => !e.breathFocus) ?? exercises[0]!
  }

  const swap = async () => {
    await addSession({ exerciseId: ex.id, startedAt: startedAt.current, endedAt: Date.now(), status: 'interrompida', source })
    await setResume(null)
    navigate(`/praticar/${alternative().id}/iniciar${params.get('trilha') ? `?trilha=${encodeURIComponent(params.get('trilha')!)}` : ''}`, { replace: true })
  }

  return (
    <div className="anim-in">
      <div className="mb-3 flex items-center justify-between">
        <Link to={back} className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-sm font-medium text-muted hover:text-ink">
          <ChevronLeft size={18} aria-hidden /> Voltar
        </Link>
        <Link to="/ajuda" className="inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-sm font-semibold text-rose-700">
          Ajuda agora
        </Link>
      </div>
      <h1 className="mb-5 font-display text-[1.9rem] leading-tight font-semibold">{ex.title}</h1>

      {phase === 'antes' && (
        <section>
          <div className="flex gap-3 rounded-2xl border border-[#f1dfb2] bg-[#fdf6e7] p-4">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden />
            <p className="text-ink-soft">{toTx(ex.caution)}</p>
          </div>
          <p className="mt-4 text-ink-soft">{toTx(ex.whenToStop)}</p>
          <div className="mt-6 grid gap-3">
            <Button size="lg" onClick={() => setPhase('pratica')}>
              Entendi, quero começar
            </Button>
            <ButtonLink to="/praticar" variant="secondary" size="lg">
              Escolher outra prática
            </ButtonLink>
          </div>
        </section>
      )}

      {phase === 'pratica' && (
        <>
          {resuming && <p className="mb-3 rounded-xl bg-azul-50 px-3 py-2 text-sm">Retomando de onde você parou.</p>}
          <StepPlayer
            steps={ex.steps}
            initialStep={resuming ? resume!.stepIndex : 0}
            onStepChange={(i) => {
              // Guarda a etapa para retomar depois, mesmo se o app for fechado.
              if (i > 0) void setResume({ exerciseId: ex.id, stepIndex: i, savedAt: Date.now(), source })
            }}
            onFinish={() => finish('concluida')}
            onStop={() => finish('interrompida')}
            onSwap={swap}
          />
        </>
      )}

      {phase === 'avaliar' && (
        <section className="space-y-6">
          <div>
            <p className="font-display text-2xl font-semibold">Prática concluída.</p>
            <p className="mt-1 text-muted">{toTx(ex.reflection) || 'O que mudou, mesmo que um pouquinho?'}</p>
          </div>
          <div>
            <p className="label">Essa prática ajudou? (opcional)</p>
            <ChoiceList
              label="Essa prática ajudou?"
              value={usefulness ? [usefulness] : []}
              onChange={(v) => setUsefulness(v[0] as PracticeSession['usefulness'])}
              options={[
                { label: 'Ajudou', value: 'ajudou' },
                { label: 'Um pouco', value: 'um-pouco' },
                { label: 'Não ajudou desta vez', value: 'nao-ajudou' },
              ]}
            />
          </div>
          <TextArea label="Anotação (opcional)" value={note} onChange={setNote} placeholder="O que você percebeu?" />
          <Button
            block
            size="lg"
            onClick={async () => {
              if (session) await updateSession({ ...session, usefulness, note: note.trim() || undefined })
              setPhase('fim')
            }}
          >
            Salvar e continuar
          </Button>
          {usefulness === 'nao-ajudou' && <p className="text-sm text-muted">Tudo bem. Nem todo exercício ajuda em todo momento. Vamos tentar outro quando quiser.</p>}
        </section>
      )}

      {phase === 'parou' && (
        <section>
          <p className="font-display text-2xl font-semibold">Tudo bem parar.</p>
          <p className="mt-2 text-muted">Esse exercício não ajudou agora? Você pode experimentar outro, ou só descansar.</p>
          <div className="mt-6 grid gap-3">
            <ButtonLink to={`/praticar/${alternative().id}/iniciar`} size="lg" replace>
              Tentar {alternative().title}
            </ButtonLink>
            <ButtonLink to="/ajuda" variant="help" size="lg">
              Preciso de ajuda agora
            </ButtonLink>
            <ButtonLink to={back} variant="secondary" size="lg">
              Voltar
            </ButtonLink>
          </div>
        </section>
      )}

      {phase === 'fim' && (
        <section className="space-y-5">
          <div className="card p-5">
            <CheckInForm context="pratica" exerciseId={ex.id} compact title="Quer registrar como está agora? (opcional)" />
          </div>
          <div className="grid gap-3">
            {params.get('trilha') ? (
              <ButtonLink to={params.get('trilha')!} size="lg">
                Voltar para a trilha
              </ButtonLink>
            ) : (
              <ButtonLink to="/" size="lg">
                Ir para o início
              </ButtonLink>
            )}
            <ButtonLink to="/praticar" variant="secondary" size="lg">
              Ver outras práticas
            </ButtonLink>
          </div>
          <button type="button" onClick={() => navigate('/')} className="mx-auto flex min-h-11 items-center gap-1 text-sm text-muted">
            <X size={14} aria-hidden /> Fechar
          </button>
        </section>
      )}
    </div>
  )
}
