import { BarChart3, BookOpen, Download, NotebookPen, Plus, Trash2, Zap } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { CheckInChart } from '../components/CheckInChart'
import { Button, ButtonLink, Card, EmptyState, PageHeader, SectionTitle } from '../components/ui'
import { categories, categoryById } from '../content/categories'
import { sessionTitle } from '../lib/sessions'
import { countInPeriod, dailyAverages, MIN_CHECKINS_FOR_CHART, topPractices } from '../lib/stats'
import { formatDateTime } from '../lib/text'
import { downloadExport } from '../services/download'
import { useApp } from '../services/store'

type Tab = 'resumo' | 'diario' | 'checkins'

const contextLabel: Record<string, string> = {
  inicio: 'Início',
  antes: 'Antes',
  depois: 'Depois',
  pratica: 'Após prática',
  'falar-antes': 'Antes de falar',
  'falar-depois': 'Depois de falar',
  onboarding: 'Primeiros passos',
}

export default function Progress() {
  const { checkins, sessions, journal, deleteCheckIn, persistent } = useApp()
  const [params, setParams] = useSearchParams()
  const tab = (params.get('aba') as Tab) ?? 'resumo'
  const [period, setPeriod] = useState<7 | 30>(7)
  const [filterCat, setFilterCat] = useState('')
  const [filterMode, setFilterMode] = useState('')
  const [exportError, setExportError] = useState('')

  const rated = checkins.filter((c) => c.level !== null)
  const ratedInPeriod = rated.filter((c) => c.createdAt >= Date.now() - period * 86400000)
  const points = useMemo(() => dailyAverages(checkins, period), [checkins, period])
  const completed = sessions.filter((s) => s.status === 'concluida')
  const top = topPractices(sessions)
  const filteredJournal = journal.filter((j) => (!filterCat || j.categoryId === filterCat) && (!filterMode || j.mode === filterMode))

  const tabs: { id: Tab; label: string }[] = [
    { id: 'resumo', label: 'Resumo' },
    { id: 'diario', label: 'Diário' },
    { id: 'checkins', label: 'Check-ins' },
  ]

  return (
    <div>
      <PageHeader title="Meu progresso" subtitle="Participação, não obrigação. Tudo aqui vem do que você registrou." />

      <div role="tablist" aria-label="Seções do progresso" className="grid grid-cols-3 gap-1 rounded-full bg-bege-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`painel-${t.id}`}
            onClick={() => setParams({ aba: t.id }, { replace: true })}
            className={`min-h-10 rounded-full text-sm font-semibold ${tab === t.id ? 'bg-white shadow-sm' : 'text-muted'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'resumo' && (
        <section id="painel-resumo" role="tabpanel" aria-labelledby="tab-resumo">
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { n: completed.length, l: 'práticas concluídas' },
              { n: checkins.length, l: 'check-ins' },
              { n: journal.length, l: 'registros no diário' },
            ].map((s) => (
              <Card key={s.l} className="p-4 text-center">
                <p className="font-display text-3xl font-semibold">{s.n}</p>
                <p className="mt-1 text-xs leading-tight text-muted">{s.l}</p>
              </Card>
            ))}
          </div>

          <SectionTitle
            action={
              <div className="flex gap-1 rounded-full bg-bege-100 p-1" role="group" aria-label="Período do gráfico">
                {([7, 30] as const).map((p) => (
                  <button key={p} type="button" aria-pressed={period === p} onClick={() => setPeriod(p)} className={`min-h-9 rounded-full px-3 text-xs font-semibold ${period === p ? 'bg-white shadow-sm' : 'text-muted'}`}>
                    {p === 7 ? 'Semana' : 'Mês'}
                  </button>
                ))}
              </div>
            }
          >
            Seus check-ins
          </SectionTitle>
          {ratedInPeriod.length >= MIN_CHECKINS_FOR_CHART ? (
            <Card>
              <CheckInChart points={points} title={`Check-ins dos últimos ${period} dias`} />
              <p className="mt-3 text-sm text-muted">
                {ratedInPeriod.length} check-ins com nota no período. O gráfico mostra o que você relatou, sem interpretação.
              </p>
            </Card>
          ) : (
            <EmptyState icon={BarChart3} title="Ainda não há dados suficientes" action={<ButtonLink to="/" size="sm" variant="secondary">Fazer um check-in</ButtonLink>}>
              O gráfico aparece a partir de {MIN_CHECKINS_FOR_CHART} check-ins com nota no período. Você tem {ratedInPeriod.length}.
            </EmptyState>
          )}

          <SectionTitle>Práticas mais usadas</SectionTitle>
          {top.length ? (
            <ul className="card divide-y divide-line px-4">
              {top.map((t) => (
                <li key={t.exerciseId} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="font-medium">{sessionTitle(t.exerciseId)}</span>
                  <span className="text-muted">
                    {t.count}× {t.helped ? `· ajudou ${t.helped}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Zap} title="Nenhuma prática concluída ainda">
              Quando concluir uma prática, ela aparece aqui.
            </EmptyState>
          )}

          <SectionTitle>Atividade recente</SectionTitle>
          <p className="text-sm text-muted">
            Nos últimos 7 dias: {countInPeriod(completed, 7)} práticas concluídas, {countInPeriod(checkins, 7)} check-ins e {countInPeriod(journal, 7)} registros no diário.
          </p>

          <div className="mt-8 rounded-2xl bg-bege-50 p-4">
            <p className="text-sm font-semibold">Seus dados são seus</p>
            <p className="mt-1 text-sm text-muted">Tudo fica neste aparelho. Você pode exportar uma cópia ou apagar tudo em Perfil.</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              disabled={!persistent}
              onClick={async () => {
                try {
                  setExportError('')
                  await downloadExport()
                } catch {
                  setExportError('Não foi possível exportar agora. Tente novamente.')
                }
              }}
            >
              <Download size={16} aria-hidden /> Exportar meus dados
            </Button>
            {exportError && (
              <p role="alert" className="mt-2 text-sm text-rose-700">
                {exportError}
              </p>
            )}
          </div>
        </section>
      )}

      {tab === 'diario' && (
        <section id="painel-diario" role="tabpanel" aria-labelledby="tab-diario">
          <div className="mt-5 grid grid-cols-2 gap-3">
            <ButtonLink to="/diario/novo?modo=rapida" variant="secondary">
              <Zap size={16} aria-hidden /> Rápida · 30 s
            </ButtonLink>
            <ButtonLink to="/diario/novo?modo=completa">
              <Plus size={16} aria-hidden /> Completa · 5 min
            </ButtonLink>
          </div>
          <p className="mt-3 text-sm text-muted">Diário privado. Nada é enviado para a internet.</p>

          {journal.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="f-cat" className="label">
                  Situação
                </label>
                <select id="f-cat" className="field" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
                  <option value="">Todas</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="f-mode" className="label">
                  Tipo
                </label>
                <select id="f-mode" className="field" value={filterMode} onChange={(e) => setFilterMode(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="rapida">Rápida</option>
                  <option value="completa">Completa</option>
                </select>
              </div>
            </div>
          )}

          <div className="mt-5">
            {filteredJournal.length ? (
              <ul className="space-y-3">
                {filteredJournal.map((j) => (
                  <li key={j.id}>
                    <Link to={`/diario/${j.id}`} className="card block p-4 hover:border-azul-300">
                      <div className="flex items-center justify-between gap-2 text-xs text-muted">
                        <span>{formatDateTime(j.createdAt)}</span>
                        <span>{j.mode === 'rapida' ? 'Rápida' : 'Completa'}</span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 font-medium">{j.situation || j.thought || j.emotion || 'Registro sem título'}</p>
                      {(j.emotion || j.categoryId) && (
                        <p className="mt-1 text-sm text-muted">
                          {[j.emotion, j.categoryId ? categoryById(j.categoryId)?.title : ''].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : journal.length ? (
              <EmptyState icon={BookOpen} title="Nenhum registro com esses filtros" />
            ) : (
              <EmptyState icon={NotebookPen} title="Seu diário está vazio">
                Uma entrada rápida leva 30 segundos. Todos os campos são opcionais.
              </EmptyState>
            )}
          </div>
        </section>
      )}

      {tab === 'checkins' && (
        <section id="painel-checkins" role="tabpanel" aria-labelledby="tab-checkins">
          <div className="mt-5">
            {checkins.length ? (
              <ul className="card divide-y divide-line px-4">
                {checkins.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 py-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-azul-50 font-semibold" aria-label={c.level === null ? 'Ainda não sei' : `Nível ${c.level}`}>
                      {c.level ?? '?'}
                    </span>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-medium">
                        {formatDateTime(c.createdAt)} · {contextLabel[c.context] ?? c.context}
                      </p>
                      <p className="truncate text-muted">{[c.feeling, c.body, c.trigger, c.note].filter(Boolean).join(' · ') || (c.level === null ? 'Ainda não sei' : 'Sem detalhes')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Apagar este check-in?')) void deleteCheckIn(c.id)
                      }}
                      className="grid size-10 place-items-center rounded-full text-muted hover:bg-bege-100"
                      aria-label={`Apagar check-in de ${formatDateTime(c.createdAt)}`}
                    >
                      <Trash2 size={16} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={BarChart3} title="Nenhum check-in ainda" action={<ButtonLink to="/" size="sm" variant="secondary">Fazer o primeiro</ButtonLink>}>
                O check-in leva poucos segundos e ajuda você a perceber seus padrões.
              </EmptyState>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
