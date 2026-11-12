import { BarChart3, Download, LogOut, Mail, MessageSquare, RefreshCw, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Badge, Button, Card, EmptyState, Notice, PageHeader, SectionTitle, TextInput } from '../components/ui'
import { categoryById } from '../content/categories'
import { exerciseById } from '../content/exercises'
import { journeyById } from '../content/journeys'
import { hardestOptions, questions } from '../content/onboarding'
import { formatDateTime } from '../lib/text'
import { getRemote, isRemoteAvailable } from '../services/remote'

/* ============================ Tipos ============================ */

export interface AdminStats {
  from: string
  to: string
  totals: { visitors: number; sessions: number; events: number; active_visitors: number }
  daily: { day: string; visitors: number; sessions: number }[]
  pages: { page: string; views: number; visitors: number }[]
  exercises: { exercise_id: string; opened: number; started: number; completed: number }[]
  categories: { category_id: string; opened: number; visitors: number }[]
  journeys: { journey_id: string; started: number; completed: number }[]
  quiz: { started: number; completed: number; steps: { step: number; step_key: string | null; sessions: number }[] }
  whatsapp: { topic: string; clicks: number }[]
  suggestions_submitted: number
  feedback: { exercise_id: string; ajudou: number; um_pouco: number; nao_ajudou: number; comments: number }[]
  quiz_shares: { total: number; answers: { question: string; answer: string; count: number }[] }
  messages: { total: number; nova: number; em_analise: number; respondida: number; arquivada: number }
}

interface Message {
  id: string
  created_at: string
  category: string
  body: string
  name: string | null
  email: string | null
  status: MessageStatus
}
type MessageStatus = 'nova' | 'em_analise' | 'respondida' | 'arquivada'

interface FeedbackComment {
  id: string
  created_at: string
  exercise_id: string
  usefulness: string
  comment: string
}

/* ============================ Rótulos ============================ */

const statusLabel: Record<MessageStatus, string> = { nova: 'Nova', em_analise: 'Em análise', respondida: 'Respondida', arquivada: 'Arquivada' }
const statusTone: Record<MessageStatus, 'rose' | 'azul' | 'salvia' | 'bege'> = { nova: 'rose', em_analise: 'azul', respondida: 'salvia', arquivada: 'bege' }
const categoryLabel: Record<string, string> = { sugestao: 'Sugestão', duvida: 'Dúvida', problema: 'Problema técnico', elogio: 'Elogio' }
const topicLabel: Record<string, string> = { presencial: 'Consulta presencial', online: 'Consulta online', mensal: 'Acompanhamento mensal', palestra: 'Palestras e treinamentos', geral: 'Contato geral' }
const usefulnessLabel: Record<string, string> = { ajudou: 'Sim, me ajudou', 'um-pouco': 'Ajudou um pouco', 'nao-ajudou': 'Não foi útil' }
const stepLabel = (key: string | null): string => {
  if (!key) return 'Etapa'
  const map: Record<string, string> = { form: 'Forma de tratamento', now: 'Desconforto agora', interlude: 'Texto de pausa', heard: 'Explicação final', name: 'Nome' }
  if (map[key]) return map[key]
  const q = questions.find((x) => x.key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`) === key)
  return q ? q.title.replace(/\[\[([^|\]]*)\|[^\]]*\]\]/g, '$1') : key
}
const exerciseName = (id: string) => (id.startsWith('sos-') ? `Ajuda imediata (${id.slice(4)})` : exerciseById(id)?.title ?? id)
const answerLabel = (q: string, a: string): string => {
  if (q === 'hardest') return hardestOptions.find((o) => o.value === a)?.label ?? a
  const question = questions.find((x) => x.key === q)
  const opt = question?.options.find((o) => o.value === a || o.value.split(':')[0] === a)
  return (opt?.label ?? a).replace(/\[\[([^|\]]*)\|[^\]]*\]\]/g, '$1')
}
const questionLabel = (q: string) => (questions.find((x) => x.key === q)?.title ?? q).replace(/\[\[([^|\]]*)\|[^\]]*\]\]/g, '$1')

/* ============================ Utilidades ============================ */

function dayStart(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}
function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const pct = (n: number, d: number) => (d > 0 ? `${Math.round((n / d) * 100)}%` : '–')

function downloadFile(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** CSV com os agregados (nenhuma mensagem, comentário ou identificador). */
export function statsToCsv(s: AdminStats): string {
  const rows: (string | number)[][] = [['secao', 'item', 'metrica', 'valor']]
  const push = (sec: string, item: string, metric: string, v: number) => rows.push([sec, item, metric, v])
  push('totais', 'periodo', 'visitantes', s.totals.visitors)
  push('totais', 'periodo', 'visitantes_ativos', s.totals.active_visitors)
  push('totais', 'periodo', 'sessoes', s.totals.sessions)
  s.daily.forEach((d) => push('diario', d.day, 'visitantes', d.visitors))
  s.pages.forEach((p) => push('paginas', p.page, 'visualizacoes', p.views))
  s.exercises.forEach((e) => {
    push('exercicios', e.exercise_id, 'abertos', e.opened)
    push('exercicios', e.exercise_id, 'iniciados', e.started)
    push('exercicios', e.exercise_id, 'concluidos', e.completed)
  })
  s.categories.forEach((c) => push('areas', c.category_id, 'aberturas', c.opened))
  s.journeys.forEach((j) => {
    push('jornadas', j.journey_id, 'iniciadas', j.started)
    push('jornadas', j.journey_id, 'concluidas', j.completed)
  })
  push('quiz', 'geral', 'iniciados', s.quiz.started)
  push('quiz', 'geral', 'concluidos', s.quiz.completed)
  s.quiz.steps.forEach((q) => push('quiz_etapas', `${q.step}-${q.step_key ?? ''}`, 'sessoes', q.sessions))
  s.whatsapp.forEach((w) => push('whatsapp', w.topic, 'cliques', w.clicks))
  s.feedback.forEach((f) => {
    push('avaliacoes', f.exercise_id, 'ajudou', f.ajudou)
    push('avaliacoes', f.exercise_id, 'um_pouco', f.um_pouco)
    push('avaliacoes', f.exercise_id, 'nao_ajudou', f.nao_ajudou)
  })
  s.quiz_shares.answers.forEach((a) => push('respostas_quiz', `${a.question}:${a.answer}`, 'pessoas', a.count))
  push('mensagens', 'geral', 'total', s.messages.total)
  return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n')
}

/* ============================ Componentes ============================ */

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="font-display text-3xl font-semibold tabular-nums">{value.toLocaleString('pt-BR')}</p>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  )
}

function Table({ caption, head, rows, empty }: { caption: string; head: string[]; rows: ReactNode[][]; empty: string }) {
  if (!rows.length) return <EmptyState icon={BarChart3} title={empty} />
  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-bege-50 text-xs text-muted">
          <tr>
            {head.map((h, i) => (
              <th key={h} scope="col" className={`px-4 py-2.5 font-semibold ${i > 0 ? 'text-right' : ''}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, k) => (
                <td key={k} className={`px-4 py-2.5 ${k > 0 ? 'text-right tabular-nums' : ''}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DailyChart({ data }: { data: AdminStats['daily'] }) {
  if (!data.length) return <EmptyState icon={BarChart3} title="Nenhuma visita no período" />
  const W = 640
  const H = 160
  const pad = { l: 28, r: 8, t: 10, b: 22 }
  const max = Math.max(...data.map((d) => d.visitors), 1)
  const bw = (W - pad.l - pad.r) / data.length
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / max)
  return (
    <figure className="card p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Visitantes por dia. Detalhes na tabela a seguir.">
        {[0, max].map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="#e6ddd1" strokeDasharray="3 4" />
            <text x={pad.l - 6} y={y(v) + 3} textAnchor="end" fontSize="10" fill="#55666d">
              {v}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.l + i * bw + bw * 0.15
          const w = Math.max(2, bw * 0.7)
          const label = data.length <= 14 || i % Math.ceil(data.length / 10) === 0
          return (
            <g key={d.day}>
              <rect x={x} y={y(d.visitors)} width={w} height={Math.max(1, H - pad.b - y(d.visitors))} rx={Math.min(3, w / 2)} fill="#3e6a85" />
              {label && (
                <text x={x + w / 2} y={H - 6} textAnchor="middle" fontSize="9" fill="#55666d">
                  {d.day.slice(8, 10)}/{d.day.slice(5, 7)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <table className="sr-only">
        <caption>Visitantes por dia</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.day}>
              <td>{d.day}</td>
              <td>{d.visitors} visitantes</td>
              <td>{d.sessions} sessões</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

/* ============================ Login ============================ */

function Login({ onError }: { onError?: (m: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <form
      className="card mx-auto max-w-md space-y-4 p-6"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError('')
        const { error: err } = await getRemote()!.auth.signInWithPassword({ email: email.trim(), password })
        setBusy(false)
        if (err) {
          const m = /invalid/i.test(err.message) ? 'E-mail ou senha incorretos.' : 'Não foi possível entrar agora. Tente de novo.'
          setError(m)
          onError?.(m)
        }
      }}
    >
      <div className="flex items-center gap-2 font-semibold">
        <ShieldCheck size={20} className="text-salvia-700" aria-hidden /> Acesso da administradora
      </div>
      <TextInput label="E-mail" value={email} onChange={setEmail} autoComplete="username" />
      <div>
        <label htmlFor="senha" className="label">
          Senha
        </label>
        <input id="senha" type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      </div>
      {error && (
        <p role="alert" className="text-sm text-rose-700">
          {error}
        </p>
      )}
      <Button type="submit" block disabled={busy || !email || !password}>
        {busy ? 'Entrando...' : 'Entrar'}
      </Button>
      <p className="text-xs text-muted">O acesso é verificado pelo servidor. Somente contas cadastradas como administradora veem os dados.</p>
    </form>
  )
}

/* ============================ Painel ============================ */

type Period = '7' | '30' | '90' | 'custom'

function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const remote = getRemote()!
  const [period, setPeriod] = useState<Period>('30')
  const [customFrom, setCustomFrom] = useState(isoDate(new Date(Date.now() - 30 * 86400000)))
  const [customTo, setCustomTo] = useState(isoDate(new Date()))
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [comments, setComments] = useState<FeedbackComment[]>([])
  const [statusFilter, setStatusFilter] = useState<MessageStatus | 'todas'>('todas')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const range = useMemo(() => {
    if (period === 'custom') {
      const from = new Date(`${customFrom}T00:00:00`)
      const to = new Date(`${customTo}T00:00:00`)
      to.setDate(to.getDate() + 1)
      return { from, to }
    }
    const to = new Date(dayStart(new Date()).getTime() + 86400000)
    return { from: new Date(to.getTime() - Number(period) * 86400000), to }
  }, [period, customFrom, customTo])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const from = range.from.toISOString()
    const to = range.to.toISOString()
    const [s, m, c] = await Promise.all([
      remote.rpc('admin_stats', { p_from: from, p_to: to }),
      remote.from('messages').select('id, created_at, category, body, name, email, status').gte('created_at', from).lt('created_at', to).order('created_at', { ascending: false }).limit(300),
      remote.from('exercise_feedback').select('id, created_at, exercise_id, usefulness, comment').not('comment', 'is', null).gte('created_at', from).lt('created_at', to).order('created_at', { ascending: false }).limit(200),
    ])
    setLoading(false)
    if (s.error || m.error || c.error) {
      setError(s.error?.message.includes('invalid_period') ? 'Período inválido. Escolha até 400 dias, com data final depois da inicial.' : 'Não foi possível carregar os dados. Verifique a conexão e tente de novo.')
      return
    }
    setStats(s.data as AdminStats)
    setMessages((m.data ?? []) as Message[])
    setComments((c.data ?? []) as FeedbackComment[])
  }, [remote, range])

  useEffect(() => {
    void load()
  }, [load])

  const updateStatus = async (id: string, status: MessageStatus) => {
    const prev = messages
    setMessages((ms) => ms.map((x) => (x.id === id ? { ...x, status } : x)))
    const { error: err } = await remote.from('messages').update({ status }).eq('id', id)
    if (err) {
      setMessages(prev)
      setError('Não foi possível alterar a classificação. Tente de novo.')
    }
  }

  const shown = statusFilter === 'todas' ? messages : messages.filter((m) => m.status === statusFilter)
  const chip = (active: boolean) => `min-h-10 shrink-0 rounded-full border px-4 text-sm font-medium ${active ? 'border-ink bg-ink text-paper' : 'border-bege-300 bg-white'}`
  const noData = stats && stats.totals.events === 0 && stats.messages.total === 0 && stats.feedback.length === 0 && stats.quiz_shares.total === 0

  const funnel = useMemo(() => {
    if (!stats) return []
    const steps = [...stats.quiz.steps].sort((a, b) => a.step - b.step)
    return steps.map((s, i) => {
      const before = i === 0 ? stats.quiz.started : steps[i - 1]!.sessions
      return { ...s, before, drop: before > 0 ? Math.max(0, 1 - s.sessions / before) : null }
    })
  }, [stats])

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Período">
          {(['7', '30', '90'] as const).map((p) => (
            <button key={p} type="button" aria-pressed={period === p} className={chip(period === p)} onClick={() => setPeriod(p)}>
              {p} dias
            </button>
          ))}
          <button type="button" aria-pressed={period === 'custom'} className={chip(period === 'custom')} onClick={() => setPeriod('custom')}>
            Personalizado
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw size={16} aria-hidden /> Atualizar
          </Button>
          <Button variant="ghost" size="sm" onClick={onSignOut}>
            <LogOut size={16} aria-hidden /> Sair
          </Button>
        </div>
      </div>
      {period === 'custom' && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="de" className="label">
              De
            </label>
            <input id="de" type="date" className="field" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
          </div>
          <div>
            <label htmlFor="ate" className="label">
              Até
            </label>
            <input id="ate" type="date" className="field" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mb-4 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </p>
      )}
      {loading && !stats && (
        <p role="status" className="py-10 text-center text-muted">
          Carregando dados...
        </p>
      )}

      {stats && (
        <>
          <Notice>
            Os números vêm só de quem autorizou as estatísticas anônimas no app, então representam uma parte das pessoas usuárias. Nenhum diário, texto pessoal, foto ou gravação chega aqui.
          </Notice>

          {noData && (
            <div className="mt-5">
              <EmptyState icon={BarChart3} title="Ainda não há dados neste período">
                Os números aparecem conforme as pessoas usam o app e autorizam as estatísticas. Nada é estimado ou simulado.
              </EmptyState>
            </div>
          )}

          <SectionTitle>Visão geral</SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Visitantes" value={stats.totals.visitors} hint="aparelhos distintos" />
            <Stat label="Visitantes ativos" value={stats.totals.active_visitors} hint="usaram em 2 dias ou mais" />
            <Stat label="Sessões" value={stats.totals.sessions} />
            <Stat label="Mensagens" value={stats.messages.total} hint={`${stats.messages.nova} novas`} />
          </div>

          <SectionTitle>Visitantes por dia</SectionTitle>
          <DailyChart data={stats.daily} />

          <SectionTitle>Páginas mais acessadas</SectionTitle>
          <Table caption="Páginas mais acessadas" head={['Página', 'Visualizações', 'Visitantes']} rows={stats.pages.map((p) => [p.page, p.views, p.visitors])} empty="Nenhuma página visualizada no período" />

          <SectionTitle>Exercícios</SectionTitle>
          <Table
            caption="Exercícios abertos, iniciados e concluídos"
            head={['Prática', 'Abertos', 'Iniciados', 'Concluídos', 'Conclusão']}
            rows={stats.exercises.map((e) => [exerciseName(e.exercise_id), e.opened, e.started, e.completed, pct(e.completed, e.started)])}
            empty="Nenhum exercício usado no período"
          />

          <SectionTitle>Áreas de ansiedade mais procuradas</SectionTitle>
          <Table caption="Áreas mais abertas" head={['Área', 'Aberturas', 'Visitantes']} rows={stats.categories.map((c) => [categoryById(c.category_id)?.title ?? c.category_id, c.opened, c.visitors])} empty="Nenhuma área aberta no período" />

          <SectionTitle>Jornadas</SectionTitle>
          <Table caption="Jornadas iniciadas e concluídas" head={['Jornada', 'Iniciadas', 'Concluídas']} rows={stats.journeys.map((j) => [journeyById(j.journey_id)?.title ?? j.journey_id, j.started, j.completed])} empty="Nenhuma jornada iniciada no período" />

          <SectionTitle>Quiz de entrada: etapas e abandono</SectionTitle>
          <p className="-mt-1 mb-3 text-sm text-muted">
            {stats.quiz.started} sessões começaram e {stats.quiz.completed} concluíram ({pct(stats.quiz.completed, stats.quiz.started)}). Abandono = quem chegou na etapa anterior e não concluiu esta.
          </p>
          <Table
            caption="Funil do quiz"
            head={['Etapa', 'Concluíram', 'Abandono']}
            rows={funnel.map((f) => [`${f.step}. ${stepLabel(f.step_key)}`, f.sessions, f.drop === null ? '–' : `${Math.round(f.drop * 100)}%`])}
            empty="Ninguém iniciou o quiz no período"
          />

          <SectionTitle>Cliques em consultas e palestras</SectionTitle>
          <Table caption="Cliques nos botões de WhatsApp" head={['Botão', 'Cliques']} rows={stats.whatsapp.map((w) => [topicLabel[w.topic] ?? w.topic, w.clicks])} empty="Nenhum clique no período" />
          <p className="mt-2 text-xs text-muted">Conta cliques nos botões. Não indica se a mensagem foi enviada no WhatsApp.</p>

          <SectionTitle>Avaliações das práticas</SectionTitle>
          <Notice tone="alerta">Avaliações mostram a percepção de quem respondeu. Não são evidência de eficácia clínica.</Notice>
          <div className="mt-3">
            <Table
              caption="Avaliações por prática"
              head={['Prática', 'Me ajudou', 'Um pouco', 'Não foi útil', 'Comentários']}
              rows={stats.feedback.map((f) => [exerciseName(f.exercise_id), f.ajudou, f.um_pouco, f.nao_ajudou, f.comments])}
              empty="Nenhuma avaliação no período"
            />
          </div>
          {comments.length > 0 && (
            <details className="card mt-3 p-4">
              <summary className="cursor-pointer font-medium">Comentários enviados ({comments.length})</summary>
              <ul className="mt-3 space-y-3">
                {comments.map((c) => (
                  <li key={c.id} className="rounded-2xl bg-bege-50 p-3 text-sm">
                    <p className="text-xs text-muted">
                      {exerciseName(c.exercise_id)} · {usefulnessLabel[c.usefulness]} · {formatDateTime(new Date(c.created_at).getTime())}
                    </p>
                    <p className="mt-1 whitespace-pre-line">{c.comment}</p>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <SectionTitle>Respostas compartilhadas do quiz</SectionTitle>
          <p className="-mt-1 mb-3 text-sm text-muted">
            {stats.quiz_shares.total} {stats.quiz_shares.total === 1 ? 'pessoa escolheu' : 'pessoas escolheram'} compartilhar, de forma anônima. Não é diagnóstico nem amostra representativa.
          </p>
          {stats.quiz_shares.answers.length ? (
            <div className="space-y-3">
              {[...new Set(stats.quiz_shares.answers.map((a) => a.question))].map((q) => (
                <Table
                  key={q}
                  caption={questionLabel(q)}
                  head={[questionLabel(q), 'Pessoas']}
                  rows={stats.quiz_shares.answers.filter((a) => a.question === q).map((a) => [answerLabel(q, a.answer), a.count])}
                  empty=""
                />
              ))}
            </div>
          ) : (
            <EmptyState icon={BarChart3} title="Nenhuma resposta compartilhada no período" />
          )}

          <SectionTitle>
            <span className="inline-flex items-center gap-2">
              <MessageSquare size={20} aria-hidden /> Sugestões e mensagens
            </span>
          </SectionTitle>
          <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Filtrar mensagens">
            {(['todas', 'nova', 'em_analise', 'respondida', 'arquivada'] as const).map((s) => (
              <button key={s} type="button" aria-pressed={statusFilter === s} className={chip(statusFilter === s)} onClick={() => setStatusFilter(s)}>
                {s === 'todas' ? `Todas (${messages.length})` : `${statusLabel[s]} (${messages.filter((m) => m.status === s).length})`}
              </button>
            ))}
          </div>
          {shown.length ? (
            <ul className="space-y-3">
              {shown.map((m) => (
                <li key={m.id} className="card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <Badge tone={statusTone[m.status]}>{statusLabel[m.status]}</Badge>
                      <span>{categoryLabel[m.category] ?? m.category}</span>
                      <span>· {formatDateTime(new Date(m.created_at).getTime())}</span>
                    </div>
                    <label className="text-xs">
                      <span className="sr-only">Classificar mensagem</span>
                      <select className="field min-h-10 py-1.5 text-sm" value={m.status} onChange={(e) => void updateStatus(m.id, e.target.value as MessageStatus)}>
                        {(Object.keys(statusLabel) as MessageStatus[]).map((s) => (
                          <option key={s} value={s}>
                            {statusLabel[s]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <p className="mt-3 whitespace-pre-line">{m.body}</p>
                  {(m.name || m.email) && (
                    <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
                      {m.name && <span>{m.name}</span>}
                      {m.email && (
                        <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 text-azul-600 underline underline-offset-2">
                          <Mail size={14} aria-hidden /> {m.email}
                        </a>
                      )}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={MessageSquare} title={messages.length ? 'Nenhuma mensagem com essa classificação' : 'Nenhuma mensagem no período'} />
          )}

          <SectionTitle>Exportar</SectionTitle>
          <Card>
            <p className="text-sm text-ink-soft">Exporta só os números agregados do período (sem mensagens, comentários ou identificadores).</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => downloadFile(`integra-estatisticas-${isoDate(range.from)}-${isoDate(new Date(range.to.getTime() - 1))}.csv`, '﻿' + statsToCsv(stats), 'text/csv;charset=utf-8')}>
                <Download size={16} aria-hidden /> Planilha (CSV)
              </Button>
              <Button variant="secondary" size="sm" onClick={() => downloadFile(`integra-estatisticas-${isoDate(range.from)}.json`, JSON.stringify(stats, null, 2), 'application/json')}>
                <Download size={16} aria-hidden /> JSON
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

export default function Painel() {
  const configured = isRemoteAvailable()
  const [session, setSession] = useState<Session | null>(null)
  const [admin, setAdmin] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(configured)

  useEffect(() => {
    const remote = getRemote()
    if (!remote) return
    let alive = true
    void remote.auth.getSession().then(({ data }) => {
      if (!alive) return
      setSession(data.session)
      setChecking(false)
    })
    const { data } = remote.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => {
      alive = false
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const remote = getRemote()
    if (!remote || !session) {
      setAdmin(null)
      return
    }
    void remote.rpc('is_admin').then(({ data, error }) => setAdmin(!error && data === true))
  }, [session])

  const signOut = async () => {
    await getRemote()?.auth.signOut()
    setSession(null)
  }

  return (
    <div>
      <PageHeader title="Painel da Rosa" subtitle="Uso do app, avaliações e mensagens. Área restrita." />
      {!configured ? (
        <Notice tone="alerta" title="Integração pendente">
          O painel precisa de um projeto no Supabase. Siga docs/SUPABASE.md e gere o app de novo com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
        </Notice>
      ) : checking ? (
        <p role="status" className="py-10 text-center text-muted">
          Verificando acesso...
        </p>
      ) : !session ? (
        <Login />
      ) : admin === null ? (
        <p role="status" className="py-10 text-center text-muted">
          Verificando permissão...
        </p>
      ) : !admin ? (
        <div className="space-y-4">
          <Notice tone="alerta" title="Sem permissão">
            Esta conta não está autorizada a ver o Painel da Rosa.
          </Notice>
          <Button variant="secondary" onClick={signOut}>
            <LogOut size={16} aria-hidden /> Sair
          </Button>
        </div>
      ) : (
        <Dashboard onSignOut={signOut} />
      )}
    </div>
  )
}
