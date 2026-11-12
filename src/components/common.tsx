import { Check, Clock, Heart, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { pillarLabel } from '../content/exercises'
import { useApp } from '../services/store'
import type { CheckIn, Exercise } from '../types'
import { Badge, Button, Scale, TextInput, useTx } from './ui'

export const feelingOptions = ['Preocupação', 'Medo', 'Cansaço', 'Irritação', 'Tristeza', 'Culpa', 'Agitação', 'Calma']
export const bodyOptions = ['Coração acelerado', 'Aperto no peito', 'Tensão nos ombros', 'Estômago', 'Respiração curta', 'Tremor', 'Cansaço no corpo']

function QuickChips({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="label">{label}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(value === o ? '' : o)}
            className={`min-h-10 rounded-full border px-3.5 text-sm ${value === o ? 'border-ink bg-azul-50 font-semibold' : 'border-bege-300 bg-white'}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Check-in 0 a 10 com campos opcionais. */
export function CheckInForm({
  context,
  title = 'Como está sua ansiedade agora?',
  compact = false,
  exerciseId,
  onSaved,
  submitLabel = 'Salvar check-in',
}: {
  context: CheckIn['context']
  title?: string
  compact?: boolean
  exerciseId?: string
  onSaved?: (c: CheckIn) => void
  submitLabel?: string
}) {
  const { addCheckIn } = useApp()
  const [level, setLevel] = useState<number | null | undefined>(undefined)
  const [more, setMore] = useState(false)
  const [feeling, setFeeling] = useState('')
  const [body, setBody] = useState('')
  const [trigger, setTrigger] = useState('')
  const [saved, setSaved] = useState(false)

  const save = async () => {
    if (level === undefined) return
    const c = await addCheckIn({ level, feeling: feeling || undefined, body: body || undefined, trigger: trigger.trim() || undefined, context, exerciseId })
    setSaved(true)
    onSaved?.(c)
  }

  if (saved && !onSaved) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-salvia-50 p-4" role="status">
        <span className="grid size-9 place-items-center rounded-full bg-salvia-100 text-salvia-700">
          <Check size={18} aria-hidden />
        </span>
        <div>
          <p className="font-semibold">Check-in salvo.</p>
          <button type="button" className="text-sm text-muted underline underline-offset-2" onClick={() => { setSaved(false); setLevel(undefined); setFeeling(''); setBody(''); setTrigger(''); setMore(false) }}>
            Fazer outro
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="font-semibold">{title}</p>
      <Scale value={level} onChange={setLevel} label={title} />
      {!compact && !more && (
        <button type="button" onClick={() => setMore(true)} className="text-sm font-medium text-azul-600 underline underline-offset-2">
          Adicionar sentimento, corpo ou gatilho (opcional)
        </button>
      )}
      {!compact && more && (
        <div className="space-y-4 rounded-2xl bg-bege-50 p-4">
          <QuickChips label="Sentimento" options={feelingOptions} value={feeling} onChange={setFeeling} />
          <QuickChips label="Sensação no corpo" options={bodyOptions} value={body} onChange={setBody} />
          <TextInput label="Gatilho (se souber)" value={trigger} onChange={setTrigger} placeholder="Ex.: mensagem do trabalho" />
        </div>
      )}
      <Button onClick={save} disabled={level === undefined} block>
        {submitLabel}
      </Button>
    </div>
  )
}

export function ExerciseCard({ exercise, reason, to }: { exercise: Exercise; reason?: string; to?: string }) {
  const toTx = useTx()
  const { prefs } = useApp()
  const fav = prefs.favorites.includes(exercise.id)
  return (
    <Link to={to ?? `/praticar/${exercise.id}`} className="card block p-4 transition-colors hover:border-azul-300">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{pillarLabel[exercise.pillar]}</p>
          <p className="mt-0.5 font-semibold text-ink">{exercise.title}</p>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{reason ?? toTx(exercise.goal)}</p>
        </div>
        {fav && <Heart size={18} className="mt-1 shrink-0 fill-rose-300 text-rose-600" aria-label="Favorita" />}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <Clock size={14} aria-hidden /> {exercise.durationMin} min
        </span>
        <span>· {exercise.difficulty === 'leve' ? 'Leve' : 'Moderada'}</span>
        {exercise.reviewStatus === 'revisao-necessaria' && <Badge tone="alerta">Revisão profissional necessária</Badge>}
      </div>
    </Link>
  )
}

export function SafetyLimits({ className = '' }: { className?: string }) {
  return (
    <p className={`flex gap-2 text-xs text-muted ${className}`}>
      <ShieldAlert size={14} className="mt-0.5 shrink-0" aria-hidden />
      <span>
        Conteúdo de autocuidado e psicoeducação. Não substitui avaliação, psicoterapia, orientação médica ou atendimento de emergência.{' '}
        <Link to="/limites" className="underline underline-offset-2">
          Saiba mais
        </Link>
      </span>
    </p>
  )
}
