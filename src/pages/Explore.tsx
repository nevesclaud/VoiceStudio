import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { categoryIcons, EmptyState, PageHeader, toneClasses, useTx } from '../components/ui'
import { categories } from '../content/categories'

const filters = [
  { id: 'todas', label: 'Todas' },
  { id: 'trabalho', label: 'Trabalho e estudo', ids: ['falar-em-publico', 'trabalho', 'perfeccionismo', 'provas-entrevistas'] },
  { id: 'relacoes', label: 'Relações', ids: ['ansiedade-social', 'irritabilidade', 'sobrecarga'] },
  { id: 'corpo', label: 'Corpo e sono', ids: ['sono', 'sensacoes-fisicas'] },
  { id: 'mente', label: 'Pensamentos', ids: ['pensamentos-acelerados', 'autocritica', 'mudancas'] },
]

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export default function Explore() {
  const toTx = useTx()
  const [filter, setFilter] = useState('todas')
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const f = filters.find((x) => x.id === filter)
    return categories.filter((c) => (!f?.ids || f.ids.includes(c.id)) && (!q || norm(`${c.title} ${c.short} ${toTx(c.hook)}`).includes(norm(q))))
  }, [filter, q, toTx])

  return (
    <div>
      <PageHeader title="Explorar situações" subtitle="Escolha o que mais se parece com o seu momento. Cada área tem explicação, práticas e um plano opcional." />
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" aria-hidden />
        <label htmlFor="busca" className="sr-only">
          Buscar situação
        </label>
        <input id="busca" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex.: dormir, reunião, culpa" className="field pl-10" />
      </div>
      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filtrar por tema">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-medium ${filter === f.id ? 'border-ink bg-ink text-paper' : 'border-bege-300 bg-white'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Search} title="Nada encontrado com essa busca">
            Tente outra palavra ou veja todas as situações.
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {list.map((c) => {
            const Icon = categoryIcons[c.icon] ?? Search
            const tone = toneClasses[c.tone]
            return (
              <li key={c.id}>
                <Link to={`/explorar/${c.id}`} className={`card flex h-full flex-col p-4 hover:border-azul-300`}>
                  <div className="flex items-center gap-3">
                    <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${tone.icon}`}>
                      <Icon size={20} aria-hidden />
                    </span>
                    <div>
                      <p className="font-semibold leading-snug">{c.title}</p>
                      <p className="text-xs text-muted">{c.short}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-ink-soft">{toTx(c.hook)}</p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
