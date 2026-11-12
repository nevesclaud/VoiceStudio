import {
  Brain,
  Briefcase,
  CalendarClock,
  ChevronLeft,
  Compass,
  Flame,
  HeartPulse,
  Info,
  Layers,
  Mic,
  Moon,
  PenLine,
  Sprout,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { forwardRef, useId, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link, useNavigate, type LinkProps } from 'react-router'
import { useApp } from '../services/store'
import { tx } from '../lib/text'
import type { Gendered } from '../types'

export const categoryIcons: Record<string, LucideIcon> = {
  Mic,
  Users,
  Moon,
  Brain,
  Briefcase,
  PenLine,
  HeartPulse,
  CalendarClock,
  Layers,
  Flame,
  Compass,
  Sprout,
}

export const toneClasses: Record<'azul' | 'rose' | 'salvia' | 'bege', { bg: string; icon: string; border: string }> = {
  azul: { bg: 'bg-azul-50', icon: 'bg-azul-100 text-azul-600', border: 'border-azul-100' },
  rose: { bg: 'bg-rose-50', icon: 'bg-rose-100 text-rose-700', border: 'border-rose-100' },
  salvia: { bg: 'bg-salvia-50', icon: 'bg-salvia-100 text-salvia-700', border: 'border-salvia-100' },
  bege: { bg: 'bg-bege-50', icon: 'bg-bege-100 text-ink-soft', border: 'border-bege-100' },
}

/** Texto com forma de tratamento já resolvida. */
export function T({ children }: { children: Gendered | undefined }) {
  const { prefs } = useApp()
  return <>{tx(children, prefs.textForm)}</>
}

export function useTx() {
  const { prefs } = useApp()
  return (t: Gendered | undefined) => tx(t, prefs.textForm)
}

type Variant = 'primary' | 'secondary' | 'ghost' | 'help' | 'soft'
const variants: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-ink-soft shadow-sm',
  secondary: 'bg-white text-ink border border-bege-300 hover:bg-bege-50',
  ghost: 'text-ink hover:bg-bege-100',
  help: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm',
  soft: 'bg-azul-50 text-ink hover:bg-azul-100',
}
const sizes = { md: 'min-h-12 px-5 text-[0.975rem]', sm: 'min-h-10 px-4 text-sm', lg: 'min-h-14 px-6 text-base' }

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: keyof typeof sizes
  block?: boolean
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none'

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', block, className = '', type = 'button', ...rest },
  ref,
) {
  return <button ref={ref} type={type} className={`${base} ${variants[variant]} ${sizes[size]} ${block ? 'w-full' : ''} ${className}`} {...rest} />
})

export function ButtonLink({ variant = 'primary', size = 'md', block, className = '', ...rest }: LinkProps & { variant?: Variant; size?: keyof typeof sizes; block?: boolean }) {
  return <Link className={`${base} ${variants[variant]} ${sizes[size]} ${block ? 'w-full' : ''} ${className}`} {...rest} />
}

export function Card({ children, className = '', as: As = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'article' | 'li' }) {
  return <As className={`card p-5 ${className}`}>{children}</As>
}

export function PageHeader({ title, subtitle, back, eyebrow, action }: { title: string; subtitle?: ReactNode; back?: string | true; eyebrow?: string; action?: ReactNode }) {
  const navigate = useNavigate()
  return (
    <header className="mb-6 anim-in">
      {back && (
        <button
          type="button"
          onClick={() => (back === true ? navigate(-1) : navigate(back))}
          className="mb-3 -ml-2 inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-sm font-medium text-muted hover:text-ink"
        >
          <ChevronLeft size={18} aria-hidden /> Voltar
        </button>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
          <h1 className="font-display text-[2rem] leading-tight font-semibold text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
    </header>
  )
}

export function SectionTitle({ children, id, action }: { children: ReactNode; id?: string; action?: ReactNode }) {
  return (
    <div className="mt-8 mb-3 flex items-end justify-between gap-2">
      <h2 id={id} className="font-display text-[1.5rem] leading-tight font-semibold">
        {children}
      </h2>
      {action}
    </div>
  )
}

export function Badge({ children, tone = 'bege' }: { children: ReactNode; tone?: 'bege' | 'rose' | 'salvia' | 'azul' | 'alerta' }) {
  const map = {
    bege: 'bg-bege-100 text-ink-soft',
    rose: 'bg-rose-100 text-rose-700',
    salvia: 'bg-salvia-100 text-salvia-700',
    azul: 'bg-azul-100 text-azul-600',
    alerta: 'bg-[#fdf1d8] text-[#7a4b00]',
  }
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[tone]}`}>{children}</span>
}

export function Notice({ children, tone = 'info', title }: { children: ReactNode; tone?: 'info' | 'alerta' | 'calmo'; title?: string }) {
  const map = {
    info: 'bg-azul-50 border-azul-100',
    alerta: 'bg-[#fdf6e7] border-[#f1dfb2]',
    calmo: 'bg-salvia-50 border-salvia-100',
  }
  return (
    <div className={`flex gap-3 rounded-2xl border p-4 text-sm ${map[tone]}`} role="note">
      <Info size={18} className="mt-0.5 shrink-0 text-ink-soft" aria-hidden />
      <div>
        {title && <p className="mb-1 font-semibold">{title}</p>}
        <div className="text-ink-soft">{children}</div>
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, children, action }: { icon: LucideIcon; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-bege-300 bg-white/60 px-5 py-8 text-center">
      <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-bege-100 text-ink-soft">
        <Icon size={22} aria-hidden />
      </div>
      <p className="font-semibold">{title}</p>
      {children && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/** Escolha única ou múltipla em formato de botões grandes (acessível como grupo). */
export function ChoiceList({
  options,
  value,
  onChange,
  multi,
  max,
  label,
  columns = 1,
}: {
  options: { label: string; value: string }[]
  value: string[]
  onChange: (v: string[]) => void
  multi?: boolean
  max?: number
  label: string
  columns?: 1 | 2
}) {
  const toTx = useTx()
  return (
    <div role="group" aria-label={label} className={`grid gap-2.5 ${columns === 2 ? 'sm:grid-cols-2' : ''}`}>
      {options.map((o) => {
        const active = value.includes(o.value)
        const disabled = !active && multi && max !== undefined && value.length >= max
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => {
              if (multi) onChange(active ? value.filter((v) => v !== o.value) : [...value, o.value])
              else onChange([o.value])
            }}
            className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors disabled:opacity-45 ${
              active ? 'border-ink bg-azul-50 font-semibold' : 'border-bege-300 bg-white hover:border-azul-300'
            }`}
          >
            <span
              aria-hidden
              className={`grid size-5 shrink-0 place-items-center ${multi ? 'rounded-md' : 'rounded-full'} border-2 ${active ? 'border-ink bg-ink' : 'border-bege-300'}`}
            >
              {active && <span className={`${multi ? 'h-2 w-2 rounded-sm' : 'size-2 rounded-full'} bg-paper`} />}
            </span>
            <span>{toTx(o.label)}</span>
          </button>
        )
      })}
    </div>
  )
}

/** Escala 0 a 10 com opção "Ainda não sei". value null = ainda não sei; undefined = sem resposta. */
export function Scale({ value, onChange, label, allowUnknown = true }: { value: number | null | undefined; onChange: (v: number | null) => void; label: string; allowUnknown?: boolean }) {
  const id = useId()
  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-11" role="radiogroup" aria-labelledby={`${id}-l`}>
        <span id={`${id}-l`} className="sr-only">
          {label}
        </span>
        {Array.from({ length: 11 }, (_, n) => {
          const active = value === n
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${n}${n === 0 ? ', nenhuma' : n === 10 ? ', muito intensa' : ''}`}
              onClick={() => onChange(n)}
              className={`min-h-11 rounded-xl border text-base font-semibold transition-colors ${
                active ? 'border-ink bg-ink text-paper' : 'border-bege-300 bg-white hover:border-azul-300'
              }`}
            >
              {n}
            </button>
          )
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-muted" aria-hidden>
        <span>0 · nenhuma</span>
        <span>10 · muito intensa</span>
      </div>
      {allowUnknown && (
        <button
          type="button"
          aria-pressed={value === null}
          onClick={() => onChange(null)}
          className={`mt-3 min-h-10 rounded-full border px-4 text-sm font-medium ${value === null ? 'border-ink bg-azul-50' : 'border-bege-300 bg-white'}`}
        >
          Ainda não sei
        </button>
      )}
    </fieldset>
  )
}

export function TextArea({ label, value, onChange, placeholder, rows = 3, hint }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; hint?: string }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {hint && (
        <p id={`${id}-h`} className="-mt-1 mb-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      <textarea id={id} className="field resize-y" rows={rows} value={value} placeholder={placeholder} aria-describedby={hint ? `${id}-h` : undefined} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

export function TextInput({ label, value, onChange, placeholder, hint, autoComplete }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string; autoComplete?: string }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input id={id} className="field" value={value} placeholder={placeholder} autoComplete={autoComplete ?? 'off'} aria-describedby={hint ? `${id}-h` : undefined} onChange={(e) => onChange(e.target.value)} />
      {hint && (
        <p id={`${id}-h`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  )
}

export function Toggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p id={`${id}-l`} className="font-medium">
          {label}
        </p>
        {description && (
          <p id={`${id}-d`} className="text-sm text-muted">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-l`}
        aria-describedby={description ? `${id}-d` : undefined}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-salvia-700' : 'bg-bege-300'}`}
      >
        <span className={`absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  )
}

export function Progress({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className="h-2 w-full overflow-hidden rounded-full bg-bege-100">
      <div className="h-full rounded-full bg-salvia-700 transition-[width] duration-500" style={{ width: `${pct}%` }} />
    </div>
  )
}
