import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { Button, Notice, PageHeader, TextArea } from '../components/ui'
import { feelingOptions } from '../components/common'
import { categories } from '../content/categories'
import { useApp } from '../services/store'
import type { JournalEntry } from '../types'

const fullFields: { key: keyof JournalEntry; label: string; placeholder: string; hint?: string }[] = [
  { key: 'situation', label: 'Situação', placeholder: 'Onde você estava? O que estava acontecendo?', hint: 'Só os fatos, como uma câmera veria.' },
  { key: 'thought', label: 'Pensamento automático', placeholder: 'O que passou pela sua cabeça?' },
  { key: 'emotion', label: 'Emoção', placeholder: 'Medo, raiva, vergonha, tristeza...' },
  { key: 'body', label: 'Sensação no corpo', placeholder: 'Aperto, calor, tremor, cansaço...' },
  { key: 'reaction', label: 'Reação', placeholder: 'O que você fez ou teve vontade de fazer?' },
  { key: 'alternative', label: 'Alternativa possível', placeholder: 'Que outra forma de ver ou agir seria possível?' },
  { key: 'learning', label: 'Aprendizado', placeholder: 'O que você leva dessa situação?' },
]

export default function JournalForm() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { journal, saveJournal, deleteJournal, ready } = useApp()
  const existing = id ? journal.find((j) => j.id === id) : undefined
  const [mode, setMode] = useState<JournalEntry['mode']>((params.get('modo') as JournalEntry['mode']) ?? existing?.mode ?? 'completa')
  const [entry, setEntry] = useState<Partial<JournalEntry>>(existing ?? { categoryId: params.get('categoria') ?? undefined })
  const [error, setError] = useState('')

  useEffect(() => {
    if (existing) {
      setEntry(existing)
      setMode(existing.mode)
    }
  }, [existing])

  if (id && ready && !existing) {
    return (
      <div>
        <PageHeader back="/progresso?aba=diario" title="Registro não encontrado" subtitle="Ele pode ter sido apagado." />
      </div>
    )
  }

  const set = (k: keyof JournalEntry, v: string) => setEntry((e) => ({ ...e, [k]: v }))
  const hasContent = fullFields.some((f) => String(entry[f.key] ?? '').trim())

  const save = async () => {
    if (!hasContent) {
      setError('Escreva pelo menos uma linha em qualquer campo.')
      return
    }
    const clean = Object.fromEntries(Object.entries(entry).map(([k, v]) => [k, typeof v === 'string' ? v.trim() || undefined : v]))
    await saveJournal({ ...(clean as Partial<JournalEntry>), id: existing?.id, mode })
    navigate('/progresso?aba=diario', { replace: true })
  }

  return (
    <div>
      <PageHeader back="/progresso?aba=diario" title={existing ? 'Registro do diário' : mode === 'rapida' ? 'Entrada rápida' : 'Entrada completa'} subtitle="Todos os campos são opcionais. Escreva do seu jeito." />

      <div role="radiogroup" aria-label="Tipo de entrada" className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-bege-100 p-1">
        {(['rapida', 'completa'] as const).map((m) => (
          <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={`min-h-10 rounded-full text-sm font-semibold ${mode === m ? 'bg-white shadow-sm' : 'text-muted'}`}>
            {m === 'rapida' ? 'Rápida · 30 s' : 'Completa · 5 min'}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {mode === 'rapida' ? (
          <>
            <TextArea label="O que aconteceu?" value={entry.situation ?? ''} onChange={(v) => set('situation', v)} placeholder="Em uma ou duas frases." />
            <div>
              <p className="label">O que você sentiu?</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Emoção">
                {feelingOptions.map((f) => (
                  <button key={f} type="button" aria-pressed={entry.emotion === f} onClick={() => set('emotion', entry.emotion === f ? '' : f)} className={`min-h-10 rounded-full border px-3.5 text-sm ${entry.emotion === f ? 'border-ink bg-azul-50 font-semibold' : 'border-bege-300 bg-white'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <TextArea label="O que ajudou ou poderia ajudar?" value={entry.learning ?? ''} onChange={(v) => set('learning', v)} rows={2} />
          </>
        ) : (
          fullFields.map((f) => <TextArea key={f.key} label={f.label} hint={f.hint} value={String(entry[f.key] ?? '')} onChange={(v) => set(f.key, v)} placeholder={f.placeholder} rows={f.key === 'situation' ? 3 : 2} />)
        )}

        <div>
          <label htmlFor="cat" className="label">
            Situação relacionada (opcional)
          </label>
          <select id="cat" className="field" value={entry.categoryId ?? ''} onChange={(e) => set('categoryId', e.target.value)}>
            <option value="">Nenhuma</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p role="alert" className="text-sm text-rose-700">
            {error}
          </p>
        )}
        <Button block size="lg" onClick={save}>
          Salvar no diário
        </Button>
        {existing && (
          <Button
            block
            variant="ghost"
            onClick={async () => {
              if (window.confirm('Apagar este registro do diário? Isso não pode ser desfeito.')) {
                await deleteJournal(existing.id)
                navigate('/progresso?aba=diario', { replace: true })
              }
            }}
          >
            <Trash2 size={16} aria-hidden /> Apagar registro
          </Button>
        )}
        <Notice tone="calmo">Seu diário fica só neste aparelho. Não é lido por ninguém, nem enviado para análise.</Notice>
      </div>
    </div>
  )
}
