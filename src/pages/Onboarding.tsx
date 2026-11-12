import { ChevronLeft, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { Button, ChoiceList, Progress, Scale, TextInput, useTx } from '../components/ui'
import { heardExplanation, interludes, questions } from '../content/onboarding'
import { useApp } from '../services/store'
import { track } from '../services/analytics'
import type { OnboardingAnswers, Pillar, TextForm } from '../types'

type Screen =
  | { kind: 'form' }
  | { kind: 'question'; index: number }
  | { kind: 'now' }
  | { kind: 'interlude'; index: number }
  | { kind: 'heard' }
  | { kind: 'name' }

/**
 * Primeiros passos. Ordem: forma de tratamento, perguntas do quiz SOS (com as pausas de conteúdo),
 * desconforto agora, explicação final e nome (opcional).
 */
function buildScreens(): Screen[] {
  const out: Screen[] = [{ kind: 'form' }]
  questions.forEach((q, i) => {
    if (interludes[i]) out.push({ kind: 'interlude', index: i })
    out.push({ kind: 'question', index: i })
    if (q.key === 'usualLevel') out.push({ kind: 'now' })
    if (q.key === 'heard') out.push({ kind: 'heard' })
  })
  out.push({ kind: 'name' })
  return out
}

export default function Onboarding() {
  const { prefs, updatePrefs, addCheckIn } = useApp()
  const navigate = useNavigate()
  const toTx = useTx()
  const screens = useMemo(buildScreens, [])
  const [pos, setPos] = useState(0)
  const [answers, setAnswers] = useState<OnboardingAnswers>({ ...prefs.answers })
  const [form, setForm] = useState<TextForm>(prefs.textForm)
  const [name, setName] = useState(prefs.name)
  const screen = screens[pos]!
  const posRef = useRef(pos)
  posRef.current = pos

  // Estatística anônima do funil: só o número e o tipo da etapa, nunca a resposta.
  const stepKey = (s: Screen) => (s.kind === 'question' ? questions[s.index]!.key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`) : s.kind)
  const trackStep = (at: number) => track('quiz_step_completed', { step: at + 1, step_key: stepKey(screens[at]!), total: screens.length })
  const startedRef = useRef(false)
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    track('quiz_started')
  }, [])
  const next = () => {
    trackStep(pos)
    setPos((p) => Math.min(p + 1, screens.length - 1))
  }
  const back = () => (pos === 0 ? navigate(-1) : setPos((p) => p - 1))

  const finish = async () => {
    trackStep(pos)
    track('quiz_completed', { total: screens.length })
    const usual = answers.usualLevel
    await updatePrefs({
      answers,
      name: name.trim(),
      textForm: form,
      onboarding: 'concluido',
      shortPractices: answers.length !== 'longos',
    })
    if (answers.nowLevel !== undefined) await addCheckIn({ level: answers.nowLevel ?? null, context: 'onboarding', note: usual ? `Nível habitual: ${usual}` : undefined })
    navigate('/resultado', { replace: true })
  }

  const skipAll = async () => {
    await updatePrefs({ onboarding: prefs.onboarding === 'concluido' ? 'concluido' : 'ignorado' })
    navigate('/', { replace: true })
  }

  const setAnswer = (patch: Partial<OnboardingAnswers>) => setAnswers((a) => ({ ...a, ...patch }))

  let body: ReactNode = null
  let canContinue = true
  let autoAdvance = false

  if (screen.kind === 'form') {
    body = (
      <>
        <h1 className="font-display text-[1.9rem] leading-tight font-semibold">Como você prefere que o app fale com você?</h1>
        <p className="mt-2 mb-5 text-muted">Usamos isso só para ajustar palavras como "cansada" ou "cansado".</p>
        <ChoiceList
          label="Forma de tratamento"
          value={[form]}
          onChange={(v) => setForm((v[0] as TextForm) ?? 'n')}
          options={[
            { label: 'No feminino', value: 'f' },
            { label: 'No masculino', value: 'm' },
            { label: 'De forma neutra', value: 'n' },
          ]}
        />
      </>
    )
  } else if (screen.kind === 'question') {
    const q = questions[screen.index]!
    const raw = answers[q.key]
    const value: string[] =
      q.key === 'firstSign'
        ? answers.firstSignLabel
          ? [q.options.find((o) => o.label === answers.firstSignLabel)?.value ?? '']
          : []
        : Array.isArray(raw)
          ? raw
          : typeof raw === 'string'
            ? [raw]
            : []
    canContinue = value.length > 0
    autoAdvance = !q.multi
    body = (
      <>
        <h1 className="font-display text-[1.75rem] leading-tight font-semibold">{toTx(q.title)}</h1>
        {q.helper && <p className="mt-2 text-muted">{q.helper}</p>}
        <div className="mt-5">
          <ChoiceList
            label={toTx(q.title)}
            options={q.options}
            value={value}
            multi={q.multi}
            max={q.max}
            columns={q.options.length > 6 ? 2 : 1}
            onChange={(v) => {
              if (q.key === 'firstSign') {
                const opt = q.options.find((o) => o.value === v[0])
                setAnswer({ firstSign: (opt?.value.split(':')[0] as Pillar) ?? undefined, firstSignLabel: opt?.label })
              } else if (q.multi) setAnswer({ [q.key]: v } as Partial<OnboardingAnswers>)
              else setAnswer({ [q.key]: v[0] } as Partial<OnboardingAnswers>)
              if (!q.multi) {
                const at = pos
                window.setTimeout(() => {
                  if (posRef.current !== at) return
                  trackStep(at)
                  setPos(Math.min(at + 1, screens.length - 1))
                }, 280)
              }
            }}
          />
        </div>
      </>
    )
  } else if (screen.kind === 'now') {
    canContinue = answers.nowLevel !== undefined
    body = (
      <>
        <h1 className="font-display text-[1.75rem] leading-tight font-semibold">E agora, neste momento, de 0 a 10?</h1>
        <p className="mt-2 mb-5 text-muted">É só a sua percepção. Se não souber dizer, tudo bem.</p>
        <Scale value={answers.nowLevel} onChange={(v) => setAnswer({ nowLevel: v })} label="Desconforto agora, de 0 a 10" />
      </>
    )
  } else if (screen.kind === 'interlude') {
    const it = interludes[screen.index]!
    body = (
      <div className="rounded-3xl bg-gradient-to-br from-azul-50 to-rose-50 p-6">
        <h1 className="font-display text-[1.75rem] leading-tight font-semibold">{it.title}</h1>
        {it.body.map((p) => (
          <p key={p} className="mt-3 text-ink-soft">
            {p}
          </p>
        ))}
      </div>
    )
  } else if (screen.kind === 'heard') {
    body = (
      <div className="rounded-3xl bg-salvia-50 p-6">
        <h1 className="font-display text-[1.75rem] leading-tight font-semibold">{heardExplanation.title}</h1>
        {heardExplanation.body.map((p) => (
          <p key={p} className="mt-3 text-ink-soft">
            {p}
          </p>
        ))}
      </div>
    )
  } else if (screen.kind === 'name') {
    body = (
      <>
        <h1 className="font-display text-[1.75rem] leading-tight font-semibold">Para finalizar, como podemos te chamar?</h1>
        <p className="mt-2 mb-5 text-muted">Opcional. Fica salvo só neste aparelho.</p>
        <TextInput label="Nome ou apelido" value={name} onChange={setName} autoComplete="given-name" placeholder="Digite seu nome..." />
      </>
    )
  }

  const isLast = pos === screens.length - 1

  return (
    <div className="anim-in">
      <div className="mb-5 flex items-center justify-between gap-2">
        <button type="button" onClick={back} className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-sm font-medium text-muted hover:text-ink">
          <ChevronLeft size={18} aria-hidden /> Voltar
        </button>
        <button type="button" onClick={skipAll} className="inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-sm font-medium text-muted hover:text-ink">
          Pular por enquanto <X size={16} aria-hidden />
        </button>
      </div>
      <Progress value={(pos + 1) / screens.length} label="Andamento dos primeiros passos" />
      <p className="mt-2 mb-6 text-xs text-muted">
        {pos + 1} de {screens.length}
      </p>

      <section key={pos} className="anim-in" aria-live="polite">
        {body}
      </section>

      <div className="mt-8">
        {isLast ? (
          <Button block size="lg" onClick={finish}>
            Ver minhas sugestões
          </Button>
        ) : (
          <Button block size="lg" onClick={next} disabled={!canContinue} variant={autoAdvance && canContinue ? 'secondary' : 'primary'}>
            Continuar
          </Button>
        )}
      </div>
    </div>
  )
}
