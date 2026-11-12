import { ChevronLeft, ChevronRight, Pause, Play, Repeat, Square } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { formatClock } from '../lib/text'
import type { ExerciseStep } from '../types'
import { Button, Progress, useTx } from './ui'

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduzido'
  })
  useEffect(() => {
    if (!window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fn = () => setReduced(mq.matches || document.documentElement.dataset.motion === 'reduzido')
    mq.addEventListener?.('change', fn)
    return () => mq.removeEventListener?.('change', fn)
  }, [])
  return reduced
}

/** Círculo de respiração: cresce ao inspirar, diminui ao expirar. Sem piscar. Texto quando o movimento está reduzido. */
function BreathVisual({ kind, seconds, remaining, paused }: { kind: NonNullable<ExerciseStep['breath']>; seconds: number; remaining: number; paused: boolean }) {
  const reduced = usePrefersReducedMotion()
  const label = kind === 'inspire' ? 'Inspire' : kind === 'expire' ? 'Solte o ar' : 'Respire do seu jeito'
  if (reduced) {
    return (
      <div className="my-4 grid h-40 place-items-center rounded-3xl bg-azul-50" aria-hidden>
        <p className="font-display text-3xl font-semibold">
          {label} · {Math.ceil(remaining)}
        </p>
      </div>
    )
  }
  const animation = kind === 'inspire' ? 'breathe-in' : kind === 'expire' ? 'breathe-out' : undefined
  return (
    <div className="my-4 grid h-56 place-items-center" aria-hidden>
      <div className="relative grid size-52 place-items-center">
        <div className="absolute inset-0 rounded-full bg-azul-50" />
        <div
          className="absolute inset-3 rounded-full bg-gradient-to-br from-azul-100 to-salvia-100"
          style={{
            animation: animation ? `${animation} ${seconds}s ease-in-out forwards` : undefined,
            animationPlayState: paused ? 'paused' : 'running',
            transform: kind === 'pausa-livre' ? 'scale(0.86)' : undefined,
          }}
        />
        <p className="relative font-display text-2xl font-semibold text-ink">{label}</p>
      </div>
    </div>
  )
}

export interface StepPlayerProps {
  steps: ExerciseStep[]
  initialStep?: number
  onStepChange?: (index: number) => void
  onFinish: () => void
  onStop: () => void
  onSwap?: () => void
  swapLabel?: string
  /** Avança sozinho ao fim de etapas com tempo. A pessoa pode pausar a qualquer momento. */
  autoAdvance?: boolean
}

export function StepPlayer({ steps, initialStep = 0, onStepChange, onFinish, onStop, onSwap, swapLabel = 'Trocar exercício', autoAdvance = true }: StepPlayerProps) {
  const toTx = useTx()
  const [index, setIndex] = useState(Math.min(initialStep, steps.length - 1))
  const [paused, setPaused] = useState(false)
  const [elapsedStep, setElapsedStep] = useState(0)
  const [elapsedTotal, setElapsedTotal] = useState(0)
  const step = steps[index]!
  const isLast = index === steps.length - 1
  const lastTick = useRef<number>(0)
  const finishedRef = useRef(false)

  useEffect(() => {
    onStepChange?.(index)
    setElapsedStep(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  useEffect(() => {
    if (paused) return
    lastTick.current = performance.now()
    const id = window.setInterval(() => {
      const now = performance.now()
      const dt = (now - lastTick.current) / 1000
      lastTick.current = now
      setElapsedStep((e) => e + dt)
      setElapsedTotal((e) => e + dt)
    }, 250)
    return () => window.clearInterval(id)
  }, [paused, index])

  const goNext = () => {
    if (isLast) {
      if (!finishedRef.current) {
        finishedRef.current = true
        onFinish()
      }
    } else setIndex((i) => i + 1)
  }

  // Avanço automático em etapas com tempo
  useEffect(() => {
    if (!autoAdvance || paused || !step.seconds) return
    if (elapsedStep >= step.seconds) goNext()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsedStep, autoAdvance, paused, step.seconds])

  const remaining = step.seconds ? Math.max(0, step.seconds - elapsedStep) : 0

  return (
    <div className="anim-in">
      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        <span>
          Etapa {index + 1} de {steps.length}
        </span>
        <span aria-label={`Tempo de prática: ${formatClock(elapsedTotal)}`}>{formatClock(elapsedTotal)}</span>
      </div>
      <Progress value={(index + (step.seconds ? Math.min(1, elapsedStep / step.seconds) : 0)) / steps.length} label="Andamento da prática" />

      {step.breath && step.seconds ? <BreathVisual key={index} kind={step.breath} seconds={step.seconds} remaining={remaining} paused={paused} /> : <div className="h-8" />}

      <div className="card min-h-40 p-6" aria-live="polite" aria-atomic="true">
        <p className="text-[1.3rem] leading-relaxed font-medium text-ink">{toTx(step.text)}</p>
        {step.seconds ? (
          <p className="mt-4 text-sm text-muted">
            {paused ? 'Pausado' : autoAdvance ? `Segue sozinho em ${Math.ceil(remaining)} s` : `Cerca de ${step.seconds} s`}
          </p>
        ) : (
          <p className="mt-4 text-sm text-muted">No seu ritmo. Toque em "{isLast ? 'Concluir' : 'Próximo'}" quando quiser.</p>
        )}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Button variant="secondary" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} aria-label="Voltar uma etapa">
          <ChevronLeft size={18} aria-hidden /> Voltar
        </Button>
        <Button variant="secondary" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
          {paused ? <Play size={18} aria-hidden /> : <Pause size={18} aria-hidden />} {paused ? 'Continuar' : 'Pausar'}
        </Button>
        <Button variant="secondary" onClick={goNext} aria-label={isLast ? 'Concluir prática' : 'Pular para a próxima etapa'}>
          {isLast ? 'Concluir' : 'Pular'} <ChevronRight size={18} aria-hidden />
        </Button>
      </div>
      <Button block size="lg" className="mt-3" onClick={goNext}>
        {isLast ? 'Concluir' : 'Próximo'}
      </Button>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {onSwap && (
          <Button variant="ghost" size="sm" onClick={onSwap}>
            <Repeat size={16} aria-hidden /> {swapLabel}
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onStop}>
          <Square size={14} aria-hidden /> Parar
        </Button>
      </div>
    </div>
  )
}
