import { ChevronLeft, HeartHandshake, Phone, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { StepPlayer } from '../components/StepPlayer'
import { Button, ButtonLink, ChoiceList, Toggle } from '../components/ui'
import { emergency } from '../config/links'
import { needs, sosPlan, swapBlock, type SosBlock, type SosNeed, type SosTime } from '../content/sos'
import { useApp } from '../services/store'

type Phase = 'tempo' | 'dificuldade' | 'pratica' | 'fim'

const times: { value: SosTime; label: string; hint: string }[] = [
  { value: 30, label: '30 segundos', hint: 'Algo muito rápido' },
  { value: 120, label: '2 minutos', hint: 'Um pouco mais de tempo' },
  { value: 300, label: '5 minutos', hint: 'Com calma' },
]

function HumanHelpBar() {
  return (
    <div className="mt-8 rounded-2xl border border-rose-100 bg-rose-50 p-4">
      <p className="font-semibold">Precisa de uma pessoa agora?</p>
      <p className="mt-1 text-sm text-ink-soft">Sintomas físicos fortes, novos ou diferentes do habitual precisam de avaliação. Este app não presta atendimento de emergência.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={`tel:${emergency.samu.number}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-rose-600 px-4 font-semibold text-white">
          <Phone size={16} aria-hidden /> SAMU 192
        </a>
        <a href={`tel:${emergency.cvv.number}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-rose-300 bg-white px-4 font-semibold text-rose-700">
          <Phone size={16} aria-hidden /> CVV 188
        </a>
        <Link to="/ajuda/humana" className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-semibold text-rose-700 underline underline-offset-2">
          <HeartHandshake size={16} aria-hidden /> Preciso de ajuda humana
        </Link>
      </div>
    </div>
  )
}

export default function Help() {
  const navigate = useNavigate()
  const { prefs, updatePrefs, addSession } = useApp()
  const [phase, setPhase] = useState<Phase>('tempo')
  const [time, setTime] = useState<SosTime>(120)
  const [need, setNeed] = useState<SosNeed>('coracao')
  const [blocks, setBlocks] = useState<SosBlock[]>([])
  const [blockIndex, setBlockIndex] = useState(0)
  const [stopped, setStopped] = useState(false)
  const startedAt = useRef(0)

  const start = (n: SosNeed) => {
    setNeed(n)
    setBlocks(sosPlan(n, time, prefs.avoidBreathFocus))
    setBlockIndex(0)
    setStopped(false)
    startedAt.current = Date.now()
    setPhase('pratica')
  }

  const end = async (wasStopped: boolean) => {
    setStopped(wasStopped)
    setPhase('fim')
    await addSession({ exerciseId: `sos-${need}`, startedAt: startedAt.current, endedAt: Date.now(), status: wasStopped ? 'interrompida' : 'concluida', source: 'ajuda' })
  }

  const exit = () => navigate(prefs.onboarding === 'pendente' ? '/boas-vindas' : '/')

  const back = () => {
    if (phase === 'dificuldade') setPhase('tempo')
    else if (phase === 'pratica') setPhase('dificuldade')
    else if (phase === 'fim') setPhase('dificuldade')
    else navigate(-1)
  }

  const current = blocks[blockIndex]

  return (
    <div className="anim-in">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={back} className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-sm font-medium text-muted hover:text-ink">
          <ChevronLeft size={18} aria-hidden /> Voltar
        </button>
        <button type="button" onClick={exit} className="inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-sm font-medium text-muted hover:text-ink">
          Sair <X size={16} aria-hidden />
        </button>
      </div>

      {phase === 'tempo' && (
        <section aria-labelledby="t-tempo">
          <h1 id="t-tempo" className="font-display text-[2rem] leading-tight font-semibold">
            Estou aqui com você.
          </h1>
          <p className="mt-2 text-muted">Quanto tempo você tem agora?</p>
          <div className="mt-6 grid gap-3">
            {times.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setTime(t.value)
                  setPhase('dificuldade')
                }}
                className="card flex min-h-16 items-center justify-between px-5 text-left hover:border-azul-300"
              >
                <span className="text-lg font-semibold">{t.label}</span>
                <span className="text-sm text-muted">{t.hint}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-white/70">
            <Toggle
              label="Prefiro sem foco na respiração"
              description="Algumas pessoas ficam mais aflitas prestando atenção na respiração. Tudo bem."
              checked={prefs.avoidBreathFocus}
              onChange={(v) => updatePrefs({ avoidBreathFocus: v })}
            />
          </div>
          <HumanHelpBar />
        </section>
      )}

      {phase === 'dificuldade' && (
        <section aria-labelledby="t-dif">
          <h1 id="t-dif" className="font-display text-[2rem] leading-tight font-semibold">
            O que está mais difícil neste momento?
          </h1>
          <div className="mt-6">
            <ChoiceList label="O que está mais difícil" options={needs.map((n) => ({ label: n.label, value: n.id }))} value={[]} onChange={(v) => start(v[0] as SosNeed)} />
          </div>
          <Button variant="ghost" className="mt-3" onClick={() => start('coracao')}>
            Só quero começar
          </Button>
          <HumanHelpBar />
        </section>
      )}

      {phase === 'pratica' && current && (
        <section aria-labelledby="t-pr">
          <p className="eyebrow">
            Parte {blockIndex + 1} de {blocks.length}
          </p>
          <h1 id="t-pr" className="mt-1 mb-4 font-display text-[1.75rem] leading-tight font-semibold">
            {current.title}
          </h1>
          <StepPlayer
            key={`${blockIndex}-${current.id}`}
            steps={current.steps}
            onFinish={() => (blockIndex < blocks.length - 1 ? setBlockIndex((i) => i + 1) : end(false))}
            onStop={() => end(true)}
            onSwap={() => {
              const swapped = swapBlock(current.id, blocks.map((b) => b.id))
              setBlocks((bs) => bs.map((b, i) => (i === blockIndex ? swapped : b)))
            }}
          />
          <p className="mt-6 text-center text-sm text-muted">Você pode parar a qualquer momento.</p>
          <div className="mt-2 text-center">
            <Link to="/ajuda/humana" className="text-sm font-semibold text-rose-700 underline underline-offset-2">
              Preciso de ajuda humana
            </Link>
          </div>
        </section>
      )}

      {phase === 'fim' && (
        <section aria-labelledby="t-fim">
          <h1 id="t-fim" className="font-display text-[2rem] leading-tight font-semibold">
            {stopped ? 'Tudo bem parar.' : 'Você atravessou esses minutos.'}
          </h1>
          <p className="mt-2 text-muted">{stopped ? 'Esse exercício não ajudou agora? Vamos tentar outro, ou buscar uma pessoa.' : 'O que mudou, mesmo que um pouquinho?'}</p>
          <div className="mt-6 grid gap-3">
            <Button size="lg" onClick={() => setPhase('dificuldade')}>
              Fazer mais um pouco
            </Button>
            <ButtonLink to="/ajuda/humana" variant="help" size="lg">
              Preciso de ajuda humana
            </ButtonLink>
            <ButtonLink to="/" variant="secondary" size="lg">
              Voltar ao início
            </ButtonLink>
          </div>
          <p className="mt-6 text-sm text-muted">Quando sentir que é um bom momento, se quiser, registre no diário o que aconteceu.</p>
        </section>
      )}
    </div>
  )
}
