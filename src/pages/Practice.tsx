import { Heart, Search } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { ExerciseCard } from '../components/common'
import { EmptyState, Notice, PageHeader } from '../components/ui'
import { exercises, pillarLabel } from '../content/exercises'
import { useApp } from '../services/store'
import type { Pillar } from '../types'

/** Seleções por momento, usadas pelos cartões "Antes", "Durante" e "Depois" do início. */
const momentSets: Record<string, { title: string; ids: string[] }> = {
  antes: { title: 'Antes de uma situação difícil', ids: ['questionar-previsoes', 'respiracao-cadenciada', 'pontos-apoio', 'mandibula', 'passos-pequenos', 'movimento-leve'] },
  durante: { title: 'Durante um momento difícil', ids: ['pontos-apoio', 'grounding', 'orientacao-presente', 'suspiro-fisiologico', 'observar-pensamentos'] },
  depois: { title: 'Depois que passa', ids: ['registro-pensamentos', 'autocompaixao', 'gatilhos', 'fatos-hipoteses', 'relaxamento-muscular', 'mapa-apoio'] },
}

const pillars: (Pillar | 'todas')[] = ['todas', 'mente', 'respiracao', 'corpo']

export default function Practice() {
  const [params, setParams] = useSearchParams()
  const { prefs } = useApp()
  const pillar = (params.get('pilar') as Pillar | null) ?? 'todas'
  const moment = params.get('momento') ?? ''
  const onlyFav = params.get('favoritos') === '1'
  const duration = params.get('duracao') ?? ''

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const list = useMemo(() => {
    const ms = momentSets[moment]
    let l = ms ? ms.ids.map((id) => exercises.find((e) => e.id === id)!).filter(Boolean) : exercises
    if (pillar !== 'todas') l = l.filter((e) => e.pillar === pillar)
    if (onlyFav) l = l.filter((e) => prefs.favorites.includes(e.id))
    if (duration === 'curtas') l = l.filter((e) => e.durationMin <= 3)
    if (duration === 'longas') l = l.filter((e) => e.durationMin >= 4)
    return l
  }, [moment, pillar, onlyFav, duration, prefs.favorites])

  const chip = (active: boolean) => `min-h-10 shrink-0 rounded-full border px-4 text-sm font-medium ${active ? 'border-ink bg-ink text-paper' : 'border-bege-300 bg-white'}`

  return (
    <div>
      <PageHeader title={momentSets[moment]?.title ?? 'Praticar'} back={moment ? '/' : undefined} subtitle="Práticas curtas, com instruções, timer e botão de parar. Nenhuma depende de vídeo." />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filtrar por caminho">
        {pillars.map((p) => (
          <button key={p} type="button" aria-pressed={pillar === p} className={chip(pillar === p)} onClick={() => set('pilar', p === 'todas' ? '' : p)}>
            {p === 'todas' ? 'Todas' : pillarLabel[p]}
          </button>
        ))}
      </div>
      <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Outros filtros">
        <button type="button" aria-pressed={duration === 'curtas'} className={chip(duration === 'curtas')} onClick={() => set('duracao', duration === 'curtas' ? '' : 'curtas')}>
          Até 3 min
        </button>
        <button type="button" aria-pressed={duration === 'longas'} className={chip(duration === 'longas')} onClick={() => set('duracao', duration === 'longas' ? '' : 'longas')}>
          4 min ou mais
        </button>
        <button type="button" aria-pressed={onlyFav} className={chip(onlyFav)} onClick={() => set('favoritos', onlyFav ? '' : '1')}>
          <Heart size={14} className="mr-1 inline" aria-hidden /> Favoritas
        </button>
        {moment && (
          <button type="button" className={chip(false)} onClick={() => set('momento', '')}>
            Ver todas as práticas
          </button>
        )}
      </div>

      <div className="mt-5">
        <Notice>
          Práticas marcadas com <strong>Revisão profissional necessária</strong> vêm do material SOS Ansiedade ou têm evidência incerta e aguardam validação da Rosa. Experimente com cuidado.
        </Notice>
      </div>

      {list.length === 0 ? (
        <div className="mt-5">
          <EmptyState icon={onlyFav ? Heart : Search} title={onlyFav ? 'Nenhuma favorita com esses filtros' : 'Nenhuma prática com esses filtros'}>
            {onlyFav ? 'Abra uma prática e toque no coração para salvar.' : 'Tente remover algum filtro.'}
          </EmptyState>
        </div>
      ) : (
        <>
          <p className="mt-5 mb-2 text-sm text-muted" role="status">
            {list.length} {list.length === 1 ? 'prática' : 'práticas'}
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {list.map((e) => (
              <li key={e.id}>
                <ExerciseCard exercise={e} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
