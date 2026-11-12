import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { configure } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

configure({ asyncUtilTimeout: 4000 })
import { TestApp } from '../App'
import { __resetDbForTests, DB_NAME, kvSet, listAll } from '../services/db'
import { defaultPrefs } from '../services/store'

async function resetDb() {
  await __resetDbForTests()
  await new Promise<void>((res) => {
    const req = indexedDB.deleteDatabase(DB_NAME)
    req.onsuccess = req.onerror = req.onblocked = () => res()
  })
}

async function seedReturningUser() {
  await kvSet('prefs', { ...defaultPrefs, onboarding: 'ignorado' })
  await __resetDbForTests()
}

beforeEach(async () => {
  await resetDb()
})

describe('primeiro acesso', () => {
  it('mostra a mensagem de boas-vindas e permite explorar sem cadastro', async () => {
    const user = userEvent.setup()
    render(<TestApp />)
    expect(await screen.findByText(/Você não precisa resolver tudo agora/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Explorar sem responder' }))
    expect((await screen.findAllByText('Como está sua ansiedade agora?')).length).toBeGreaterThan(0)
  })

  it('completa os primeiros passos e mostra 3 sugestões com motivos e aviso de que não é avaliação', async () => {
    const user = userEvent.setup()
    render(<TestApp initialPath="/primeiros-passos" />)
    // forma de tratamento
    await user.click(await screen.findByRole('button', { name: 'No feminino' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    // o que está mais difícil (múltipla)
    await user.click(await screen.findByRole('button', { name: 'Falar em público ou em reuniões' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    // Demais telas: escolhe a primeira opção, usa a escala ou continua.
    for (let i = 0; i < 30; i++) {
      const finish = screen.queryByRole('button', { name: 'Ver minhas sugestões' })
      if (finish) {
        await user.click(finish)
        break
      }
      const scale = screen.queryByRole('radio', { name: /^6/ })
      if (scale) await user.click(scale)
      else {
        const group = screen.queryByRole('group')
        if (group) await user.click(within(group).getAllByRole('button')[0]!)
      }
      const cont = screen.queryByRole('button', { name: 'Continuar' })
      if (cont && !cont.hasAttribute('disabled')) await user.click(cont)
      await new Promise((r) => setTimeout(r, 300))
    }

    expect(await screen.findByText('Isso não é uma avaliação')).toBeInTheDocument()
    expect(screen.getByText('3 práticas para começar')).toBeInTheDocument()
    expect(screen.getByText(/Você contou que costuma perceber a ansiedade primeiro pelo corpo/)).toBeInTheDocument()
    const checkins = await listAll('checkins')
    expect(checkins[0]?.level).toBe(6)
  }, 20000)
})

describe('início e check-in', () => {
  it('salva um check-in com campos opcionais no IndexedDB', async () => {
    await seedReturningUser()
    const user = userEvent.setup()
    render(<TestApp />)
    await user.click(await screen.findByRole('radio', { name: /^7/ }))
    await user.click(screen.getByRole('button', { name: /Adicionar sentimento/ }))
    await user.click(screen.getByRole('button', { name: 'Preocupação' }))
    await user.click(screen.getByRole('button', { name: 'Salvar check-in' }))
    expect(await screen.findByText('Check-in salvo.')).toBeInTheDocument()
    const saved = await listAll('checkins')
    expect(saved[0]).toMatchObject({ level: 7, feeling: 'Preocupação', context: 'inicio' })
  })

  it('aceita "Ainda não sei"', async () => {
    await seedReturningUser()
    const user = userEvent.setup()
    render(<TestApp />)
    await user.click(await screen.findByRole('button', { name: 'Ainda não sei' }))
    await user.click(screen.getByRole('button', { name: 'Salvar check-in' }))
    await screen.findByText('Check-in salvo.')
    expect((await listAll('checkins'))[0]?.level).toBeNull()
  })
})

describe('preciso de ajuda agora', () => {
  it('escolhe tempo e dificuldade, mostra controles de saída e ajuda humana', async () => {
    const user = userEvent.setup()
    render(<TestApp initialPath="/ajuda" />)
    expect(await screen.findByText('Estou aqui com você.')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /SAMU 192/ })[0]).toHaveAttribute('href', 'tel:192')
    expect(screen.getAllByRole('link', { name: /CVV 188/ })[0]).toHaveAttribute('href', 'tel:188')
    await user.click(screen.getByRole('button', { name: /30 segundos/ }))
    await user.click(await screen.findByRole('button', { name: 'Minha mente não para' }))
    expect(await screen.findByRole('button', { name: /Pausar/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Pular para a próxima etapa/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Trocar exercício/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Voltar uma etapa/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Parar/ }))
    expect(await screen.findByText('Tudo bem parar.')).toBeInTheDocument()
    await waitFor(async () => expect((await listAll('sessions'))[0]).toMatchObject({ exerciseId: 'sos-mente', status: 'interrompida' }))
  })
})

describe('práticas', () => {
  it('executa uma prática até o fim e registra a avaliação opcional', async () => {
    await seedReturningUser()
    const user = userEvent.setup()
    render(<TestApp initialPath="/praticar/registro-pensamentos/iniciar" />)
    for (let i = 0; i < 6; i++) await user.click(await screen.findByRole('button', { name: /^(Próximo|Concluir)$/ }))
    expect(await screen.findByText('Prática concluída.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sim, me ajudou' }))
    await user.click(screen.getByRole('button', { name: 'Salvar e continuar' }))
    await waitFor(async () => expect((await listAll('sessions'))[0]).toMatchObject({ exerciseId: 'registro-pensamentos', status: 'concluida', usefulness: 'ajudou' }))
  })

  it('mostra aviso antes de práticas que pedem cuidado', async () => {
    await seedReturningUser()
    render(<TestApp initialPath="/praticar/backward-spin/iniciar" />)
    expect(await screen.findByRole('button', { name: 'Entendi, quero começar' })).toBeInTheDocument()
    expect(screen.getByText(/evidência incerta/)).toBeInTheDocument()
  })

  it('abre áreas diferentes com conteúdos próprios', async () => {
    await seedReturningUser()
    const { unmount } = render(<TestApp initialPath="/explorar/sono" />)
    expect(await screen.findByText(/a mente resolve fazer uma reunião/)).toBeInTheDocument()
    unmount()
    render(<TestApp initialPath="/explorar/trabalho" />)
    expect(await screen.findByText(/Abre o e-mail já com o estômago apertado/)).toBeInTheDocument()
  })
})

describe('diário e dados', () => {
  it('salva uma entrada rápida e apaga tudo com confirmação', async () => {
    await seedReturningUser()
    const user = userEvent.setup()
    render(<TestApp initialPath="/diario/novo?modo=rapida" />)
    await user.type(await screen.findByLabelText('O que aconteceu?'), 'Reunião difícil')
    await user.click(screen.getByRole('button', { name: 'Salvar no diário' }))
    expect(await screen.findByRole('link', { name: /Reunião difícil/ })).toBeInTheDocument()
    expect((await listAll('journal'))[0]).toMatchObject({ situation: 'Reunião difícil', mode: 'rapida' })

    await user.click(screen.getAllByRole('link', { name: /Perfil/ })[0]!)
    const btn = await screen.findByRole('button', { name: /Apagar tudo/ })
    expect(btn).toBeDisabled()
    await user.type(screen.getByLabelText(/digite APAGAR/), 'APAGAR')
    await user.click(btn)
    expect(await screen.findByText(/Você não precisa resolver tudo agora/)).toBeInTheDocument()
    expect(await listAll('journal')).toHaveLength(0)
  })
})

describe('trilhas', () => {
  it('marca um dia como feito e retoma no próximo', async () => {
    await seedReturningUser()
    const user = userEvent.setup()
    render(<TestApp initialPath="/trilhas/comecando" />)
    await user.click(await screen.findByRole('button', { name: 'Começar a trilha' }))
    expect(await screen.findByText('O que é ansiedade, afinal?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Marcar dia como feito/ }))
    expect(await screen.findByText('O que o corpo avisa')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Pular este dia/ }))
    expect(await screen.findByText('O que a mente diz')).toBeInTheDocument()
  })
})
