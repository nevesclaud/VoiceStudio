import { configure, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TestApp } from '../App'
import { quizSharePayload } from '../components/QuizShare'
import { __analyticsState, cleanProps, configureAnalytics, flush, normalizePage, track } from '../services/analytics'
import { __resetDbForTests, DB_NAME, kvSet } from '../services/db'
import { __setRemoteForTests } from '../services/remote'
import { defaultPrefs } from '../services/store'
import { statsToCsv, type AdminStats } from '../pages/Painel'
import { makeFakeRemote } from './fakeRemote'

configure({ asyncUtilTimeout: 4000 })
const VISITOR = '11111111-2222-4333-8444-555555555555'

async function seed(prefs: Partial<typeof defaultPrefs> = {}) {
  await __resetDbForTests()
  await new Promise<void>((res) => {
    const req = indexedDB.deleteDatabase(DB_NAME)
    req.onsuccess = req.onerror = req.onblocked = () => res()
  })
  await kvSet('prefs', { ...defaultPrefs, onboarding: 'ignorado', visitorId: VISITOR, statsAsked: true, ...prefs })
  await __resetDbForTests()
}

afterEach(() => {
  __setRemoteForTests(null)
  configureAnalytics({ consent: false, visitorId: '' })
})

describe('estatísticas anônimas', () => {
  it('não registra nada sem consentimento', () => {
    __setRemoteForTests(makeFakeRemote().client)
    configureAnalytics({ consent: false, visitorId: VISITOR })
    track('app_opened')
    expect(__analyticsState().queue).toHaveLength(0)
  })

  it('remove texto livre e identificadores das propriedades e das páginas', async () => {
    const fake = makeFakeRemote()
    __setRemoteForTests(fake.client)
    configureAnalytics({ consent: true, visitorId: VISITOR })
    expect(cleanProps({ exercise_id: 'grounding', topic: 'Meu diário: hoje chorei' } as never)).toEqual({ exercise_id: 'grounding' })
    expect(cleanProps({ texto: 'segredo', step: 3 } as never)).toEqual({ step: 3 })
    expect(normalizePage('/diario/0f8fad5b-d9cb-469f-a165-70867728950e')).toBe('/diario/:id')
    expect(normalizePage('/busca/Nome Completo')).toBeUndefined()
    track('exercise_started', { exercise_id: 'grounding' }, '/praticar/grounding/iniciar')
    await flush()
    const call = fake.calls.find((c) => c.name === 'log_events')!
    const ev = (call.args as { p_events: Record<string, unknown>[] }).p_events[0]!
    expect(ev).toMatchObject({ name: 'exercise_started', visitor_id: VISITOR, page: '/praticar/grounding/iniciar', props: { exercise_id: 'grounding' } })
    expect(Object.keys(ev).sort()).toEqual(['name', 'page', 'props', 'session_id', 'visitor_id'])
  })

  it('o card de consentimento tem duas opções e liga só com "sim"', async () => {
    await seed({ statsAsked: false })
    __setRemoteForTests(makeFakeRemote().client)
    const user = userEvent.setup()
    render(<TestApp />)
    expect(await screen.findByText('Quer ajudar a melhorar o app?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Agora não' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sim, pode enviar' }))
    await waitFor(() => expect(screen.queryByText('Quer ajudar a melhorar o app?')).not.toBeInTheDocument())
    await user.click(screen.getAllByRole('link', { name: /Perfil/ })[0]!)
    expect(await screen.findByRole('switch', { name: 'Estatísticas anônimas de uso' })).toHaveAttribute('aria-checked', 'true')
  })
})

describe('Sua voz importa', () => {
  it('sem integração, avisa e oferece outro caminho', async () => {
    await seed()
    render(<TestApp initialPath="/sua-voz" />)
    expect(await screen.findByText('Envio ainda não disponível')).toBeInTheDocument()
    expect(screen.getByText(/não é atendimento emergencial nem consulta terapêutica/i)).toBeInTheDocument()
  })

  it('valida, envia com proteção anti-spam e confirma', async () => {
    await seed()
    const fake = makeFakeRemote()
    __setRemoteForTests(fake.client)
    const user = userEvent.setup()
    vi.spyOn(Date, 'now').mockReturnValueOnce(0)
    render(<TestApp initialPath="/sua-voz" />)
    await user.click(await screen.findByRole('button', { name: 'Enviar mensagem' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Escolha uma categoria.')
    await user.click(screen.getByRole('button', { name: 'Sugestão' }))
    await user.type(screen.getByLabelText('Mensagem'), 'Poderia ter um lembrete diário.')
    await user.type(screen.getByLabelText('E-mail (opcional)'), 'ana@exemplo.com')
    await user.click(screen.getByRole('button', { name: 'Enviar mensagem' }))
    expect(await screen.findByText('Mensagem enviada. Obrigada por contribuir.')).toBeInTheDocument()
    const call = fake.calls.find((c) => c.name === 'submit_message')!
    expect(call.args).toMatchObject({ p_category: 'sugestao', p_body: 'Poderia ter um lembrete diário.', p_email: 'ana@exemplo.com', p_name: null, p_visitor: VISITOR, p_website: '' })
    expect(typeof (call.args as { p_elapsed_ms: number }).p_elapsed_ms).toBe('number')
    vi.restoreAllMocks()
  })

  it('mostra aviso claro quando o servidor limita os envios', async () => {
    await seed()
    __setRemoteForTests(makeFakeRemote({ rpc: { submit_message: () => ({ error: { message: 'rate_limited' } }) } }).client)
    const user = userEvent.setup()
    render(<TestApp initialPath="/sua-voz" />)
    await user.click(await screen.findByRole('button', { name: 'Dúvida' }))
    await user.type(screen.getByLabelText('Mensagem'), 'Como instalo no iPhone?')
    await user.click(screen.getByRole('button', { name: 'Enviar mensagem' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Muitos envios em pouco tempo')
  })
})

describe('avaliação das práticas', () => {
  async function finishPractice(user: ReturnType<typeof userEvent.setup>) {
    for (let i = 0; i < 6; i++) await user.click(await screen.findByRole('button', { name: /^(Próximo|Concluir)$/ }))
    expect(await screen.findByText('Esse exercício foi útil para você? (opcional)')).toBeInTheDocument()
  }

  it('sem marcar a opção e sem estatísticas, nada é enviado', async () => {
    await seed({ shareStats: false })
    const fake = makeFakeRemote()
    __setRemoteForTests(fake.client)
    const user = userEvent.setup()
    render(<TestApp initialPath="/praticar/registro-pensamentos/iniciar" />)
    await finishPractice(user)
    await user.click(screen.getByRole('button', { name: 'Ajudou um pouco' }))
    await user.type(screen.getByLabelText('Comentário (opcional)'), 'Texto pessoal')
    await user.click(screen.getByRole('button', { name: 'Salvar e continuar' }))
    await screen.findAllByText(/Quer registrar como está agora/)
    expect(fake.calls.filter((c) => c.name === 'submit_exercise_feedback')).toHaveLength(0)
  })

  it('com a opção marcada, envia avaliação e comentário', async () => {
    await seed({ shareStats: false })
    const fake = makeFakeRemote()
    __setRemoteForTests(fake.client)
    const user = userEvent.setup()
    render(<TestApp initialPath="/praticar/registro-pensamentos/iniciar" />)
    await finishPractice(user)
    await user.click(screen.getByRole('button', { name: 'Sim, me ajudou' }))
    await user.type(screen.getByLabelText('Comentário (opcional)'), 'Gostei da ordem das perguntas')
    await user.click(screen.getByRole('checkbox', { name: /Enviar esta avaliação e o comentário/ }))
    await user.click(screen.getByRole('button', { name: 'Salvar e continuar' }))
    await screen.findAllByText(/Quer registrar como está agora/)
    expect(fake.calls.find((c) => c.name === 'submit_exercise_feedback')?.args).toEqual({
      p_visitor: VISITOR,
      p_exercise: 'registro-pensamentos',
      p_usefulness: 'ajudou',
      p_comment: 'Gostei da ordem das perguntas',
    })
  })
})

describe('respostas do quiz', () => {
  it('compartilha só opções marcadas, nunca nome, nível de agora ou texto', () => {
    const payload = quizSharePayload({ hardest: ['sono', 'trabalho'], usualLevel: '7-8', nowLevel: 9, firstSign: 'corpo', firstSignLabel: 'O coração dispara', change: 'sono' })
    expect(payload).toEqual({ hardest: ['sono', 'trabalho'], usualLevel: '7-8', firstSign: 'corpo', change: 'sono' })
  })
})

const emptyStats: AdminStats = {
  from: '2026-11-01T00:00:00Z',
  to: '2026-11-12T00:00:00Z',
  totals: { visitors: 0, sessions: 0, events: 0, active_visitors: 0 },
  daily: [],
  pages: [],
  exercises: [],
  categories: [],
  journeys: [],
  quiz: { started: 0, completed: 0, steps: [] },
  whatsapp: [],
  suggestions_submitted: 0,
  feedback: [],
  quiz_shares: { total: 0, answers: [] },
  messages: { total: 0, nova: 0, em_analise: 0, respondida: 0, arquivada: 0 },
}

describe('Painel da Rosa', () => {
  it('sem integração, explica o que falta', async () => {
    await seed()
    render(<TestApp initialPath="/painel" />)
    expect(await screen.findByText('Integração pendente')).toBeInTheDocument()
  })

  it('senha errada não entra', async () => {
    await seed()
    const fake = makeFakeRemote({ login: { email: 'rosa@exemplo.com', password: 'certa' } })
    __setRemoteForTests(fake.client)
    const user = userEvent.setup()
    render(<TestApp initialPath="/painel" />)
    await user.type(await screen.findByLabelText('E-mail'), 'rosa@exemplo.com')
    await user.type(screen.getByLabelText('Senha'), 'errada')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos.')
    expect(fake.calls.some((c) => c.name === 'admin_stats')).toBe(false)
  })

  it('conta sem permissão de administradora não vê dados', async () => {
    await seed()
    const fake = makeFakeRemote({ login: { email: 'outra@exemplo.com', password: 'x' }, rpc: { is_admin: () => ({ data: false }) } })
    __setRemoteForTests(fake.client)
    const user = userEvent.setup()
    render(<TestApp initialPath="/painel" />)
    await user.type(await screen.findByLabelText('E-mail'), 'outra@exemplo.com')
    await user.type(screen.getByLabelText('Senha'), 'x')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('Sem permissão')).toBeInTheDocument()
    expect(fake.calls.some((c) => c.name === 'admin_stats')).toBe(false)
  })

  it('administradora vê estados vazios (sem números inventados) e classifica mensagens', async () => {
    await seed()
    const message = { id: 'm1', created_at: '2026-11-11T10:00:00Z', category: 'sugestao', body: 'Ter modo escuro.', name: null, email: 'ana@exemplo.com', status: 'nova' }
    const fake = makeFakeRemote({
      login: { email: 'rosa@exemplo.com', password: 'certa' },
      rpc: { is_admin: () => ({ data: true }), admin_stats: () => ({ data: { ...emptyStats, messages: { ...emptyStats.messages, total: 1, nova: 1 } } }) },
      tables: { messages: [message], exercise_feedback: [] },
    })
    __setRemoteForTests(fake.client)
    const user = userEvent.setup()
    render(<TestApp initialPath="/painel" />)
    await user.type(await screen.findByLabelText('E-mail'), 'rosa@exemplo.com')
    await user.type(screen.getByLabelText('Senha'), 'certa')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('Visão geral')).toBeInTheDocument()
    expect(screen.getByText('Nenhuma visita no período')).toBeInTheDocument()
    expect(screen.getByText('Nenhum exercício usado no período')).toBeInTheDocument()
    expect(screen.getByText('Ninguém iniciou o quiz no período')).toBeInTheDocument()
    expect(screen.getByText('Não são evidência de eficácia clínica.', { exact: false })).toBeInTheDocument()
    const item = screen.getByText('Ter modo escuro.').closest('li')!
    await user.selectOptions(within(item).getByLabelText('Classificar mensagem'), 'respondida')
    await waitFor(() => expect(fake.calls).toContainEqual({ kind: 'update-eq', name: 'messages', args: { id: 'm1' } }))
    expect(fake.calls).toContainEqual({ kind: 'update', name: 'messages', args: { status: 'respondida' } })
  })

  it('exportação contém só números agregados', () => {
    const csv = statsToCsv({ ...emptyStats, totals: { visitors: 3, sessions: 4, events: 9, active_visitors: 1 }, whatsapp: [{ topic: 'presencial', clicks: 2 }] })
    expect(csv).toContain('"totais";"periodo";"visitantes";"3"')
    expect(csv).toContain('"whatsapp";"presencial";"cliques";"2"')
    expect(csv).not.toMatch(/@|visitor|session_id/)
  })
})
