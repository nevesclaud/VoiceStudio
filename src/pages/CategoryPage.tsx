import { ArrowRight, BookOpen, Check, Heart, PlayCircle, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ExerciseCard } from '../components/common'
import NotFound from './NotFound'
import { Button, ButtonLink, Card, categoryIcons, PageHeader, SectionTitle, TextArea, toneClasses, useTx } from '../components/ui'
import { categoryById } from '../content/categories'
import { exerciseById } from '../content/exercises'
import { useApp } from '../services/store'

export default function CategoryPage() {
  const { id = '' } = useParams()
  const cat = categoryById(id)
  const toTx = useTx()
  const { notes, saveNote, prefs, toggleFavorite } = useApp()
  const [note, setNote] = useState(notes[id] ?? '')
  const [saved, setSaved] = useState(false)
  useEffect(() => setNote(notes[id] ?? ''), [id, notes])

  if (!cat) return <NotFound />
  const Icon = categoryIcons[cat.icon]!
  const tone = toneClasses[cat.tone]
  const during = exerciseById(cat.during.exerciseId)
  const list = cat.exerciseIds.map(exerciseById).filter((e): e is NonNullable<typeof e> => Boolean(e))
  const favId = `cat:${cat.id}`
  const isFav = prefs.favorites.includes(favId)

  return (
    <article>
      <PageHeader
        back="/explorar"
        eyebrow={cat.short}
        title={cat.title}
        action={
          <button
            type="button"
            onClick={() => toggleFavorite(favId)}
            aria-pressed={isFav}
            aria-label={isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-bege-300 bg-white"
          >
            <Heart size={20} className={isFav ? 'fill-rose-300 text-rose-600' : 'text-muted'} aria-hidden />
          </button>
        }
      />

      <div className={`flex items-start gap-4 rounded-[1.25rem] p-5 ${tone.bg}`}>
        <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${tone.icon}`}>
          <Icon size={22} aria-hidden />
        </span>
        <p className="font-display text-[1.45rem] leading-snug font-semibold">{toTx(cat.hook)}</p>
      </div>

      {cat.specialRoute && (
        <ButtonLink to={cat.specialRoute.to} block size="lg" className="mt-4" variant="help">
          {cat.specialRoute.label} <ArrowRight size={18} aria-hidden />
        </ButtonLink>
      )}

      <SectionTitle>O que pode estar acontecendo?</SectionTitle>
      <div className="space-y-3 text-ink-soft">
        {cat.whatHappens.map((p, i) => (
          <p key={i}>{toTx(p)}</p>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">Esta explicação é geral e não é um diagnóstico.</p>

      <SectionTitle>O que fazer antes?</SectionTitle>
      <Card>
        <ul className="space-y-3">
          {cat.before.map((b, i) => (
            <li key={i} className="flex gap-3">
              <Check size={18} className="mt-0.5 shrink-0 text-salvia-700" aria-hidden />
              <span>{toTx(b)}</span>
            </li>
          ))}
        </ul>
      </Card>

      <SectionTitle>O que fazer durante?</SectionTitle>
      <Card className="bg-gradient-to-br from-white to-azul-50">
        <p className="font-semibold">{cat.during.title}</p>
        <p className="mt-1 text-ink-soft">{toTx(cat.during.intro)}</p>
        {during && (
          <ButtonLink to={`/praticar/${during.id}/iniciar?origem=categoria`} className="mt-4">
            <PlayCircle size={18} aria-hidden /> Iniciar: {during.title} · {during.durationMin} min
          </ButtonLink>
        )}
      </Card>

      <SectionTitle>O que fazer depois?</SectionTitle>
      <Card>
        <ul className="space-y-2.5">
          {cat.after.map((a, i) => (
            <li key={i} className="text-ink-soft">
              {toTx(a)}
            </li>
          ))}
        </ul>
        <ButtonLink to={`/diario/novo?categoria=${cat.id}`} variant="secondary" size="sm" className="mt-4">
          <BookOpen size={16} aria-hidden /> Registrar no diário
        </ButtonLink>
      </Card>

      <SectionTitle>Práticas recomendadas</SectionTitle>
      <ul className="grid gap-3 sm:grid-cols-2">
        {list.map((e) => (
          <li key={e.id}>
            <ExerciseCard exercise={e} />
          </li>
        ))}
      </ul>

      <SectionTitle>Plano opcional para os próximos dias</SectionTitle>
      <p className="-mt-1 mb-3 text-sm text-muted">Use se fizer sentido. Pode mudar a ordem, pular ou repetir.</p>
      <ol className="card divide-y divide-line px-5">
        {cat.plan.map((p) => (
          <li key={p.day} className="flex gap-4 py-3.5">
            <span className="w-14 shrink-0 text-sm font-semibold text-azul-600">{p.day}</span>
            <span className="text-ink-soft">{toTx(p.action)}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-[1.25rem] bg-rose-50 p-5 text-center">
        <p className="font-display text-xl font-semibold text-rose-700">"{toTx(cat.supportPhrase)}"</p>
      </div>

      <SectionTitle>Minha anotação</SectionTitle>
      <TextArea label="Anotação pessoal sobre essa situação" value={note} onChange={(v) => { setNote(v); setSaved(false) }} rows={4} placeholder="O que você quer lembrar?" hint="Fica salva só neste aparelho." />
      <div className="mt-3 flex items-center gap-3">
        <Button
          variant="secondary"
          onClick={async () => {
            await saveNote(cat.id, note)
            setSaved(true)
          }}
        >
          <Save size={16} aria-hidden /> Salvar anotação
        </Button>
        {saved && (
          <span role="status" className="text-sm text-salvia-700">
            Salvo.
          </span>
        )}
      </div>

      <p className="mt-10 text-center text-sm">
        <Link to="/explorar" className="text-azul-600 underline underline-offset-2">
          Ver outras situações
        </Link>
      </p>
    </article>
  )
}
