import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { configure } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { TestApp } from '../App'
import { whatsappMessages, whatsappUrl } from '../config/contact'
import { __resetDbForTests, DB_NAME, kvSet } from '../services/db'
import { defaultPrefs } from '../services/store'

configure({ asyncUtilTimeout: 4000 })

beforeEach(async () => {
  await __resetDbForTests()
  await new Promise<void>((res) => {
    const req = indexedDB.deleteDatabase(DB_NAME)
    req.onsuccess = req.onerror = req.onblocked = () => res()
  })
  await kvSet('prefs', { ...defaultPrefs, onboarding: 'ignorado', name: 'Ana' })
  await __resetDbForTests()
})

describe('link do WhatsApp', () => {
  it('usa o número da Rosa e codifica a mensagem', () => {
    const url = new URL(whatsappUrl(whatsappMessages.presencial))
    expect(url.origin + url.pathname).toBe('https://api.whatsapp.com/send/')
    expect(url.searchParams.get('phone')).toBe('5535991007594')
    expect(url.searchParams.get('text')).toBe('Olá, Rosa! Vim pelo aplicativo INTEGRA e gostaria de informações sobre a consulta presencial de R$ 120.')
    expect(url.searchParams.get('type')).toBe('phone_number')
    expect(url.searchParams.get('app_absent')).toBe('0')
    expect(whatsappUrl('a & b')).toContain('text=a%20%26%20b')
  })
})

describe('Converse com a Rosa', () => {
  it('mostra preços, fotos e um botão de WhatsApp com a mensagem certa para cada assunto', async () => {
    render(<TestApp initialPath="/converse-com-a-rosa" />)
    expect(await screen.findByRole('heading', { name: 'Converse com a Rosa' })).toBeInTheDocument()
    expect(screen.getAllByText('R$ 120,00').length).toBeGreaterThan(0)
    expect(screen.getByText('R$ 500,00')).toBeInTheDocument()
    expect(screen.getByText(/quantidade de encontros, duração e condições/)).toBeInTheDocument()
    expect(screen.getByText('São Sebastião do Paraíso, MG')).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: /Rosa Neves/ }).length).toBeGreaterThan(0)

    const expected: [RegExp, keyof typeof whatsappMessages][] = [
      [/Falar com a Rosa/, 'geral'],
      [/Quero uma consulta presencial/, 'presencial'],
      [/Quero uma consulta online/, 'online'],
      [/Informações sobre acompanhamento mensal/, 'mensal'],
      [/Solicitar palestra ou treinamento/, 'palestra'],
      [/Conversar pelo WhatsApp/, 'geral'],
    ]
    for (const [name, topic] of expected) {
      const link = screen.getByRole('link', { name })
      expect(link).toHaveAttribute('href', whatsappUrl(whatsappMessages[topic]))
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAccessibleName(/abre o WhatsApp/)
    }
    // Nenhum dado pessoal vai junto: o nome salvo no perfil não aparece em nenhum link.
    for (const a of screen.getAllByRole('link')) expect(a.getAttribute('href') ?? '').not.toMatch(/Ana/)
  })

  it('galeria navega e amplia a foto com teclado', async () => {
    const user = userEvent.setup()
    render(<TestApp initialPath="/converse-com-a-rosa" />)
    const gallery = await screen.findByRole('region', { name: 'Fotos da Rosa' })
    expect(within(gallery).getByText(/2 de 3/)).toBeInTheDocument()
    await user.click(within(gallery).getByRole('button', { name: 'Próxima foto' }))
    expect(within(gallery).getByText(/3 de 3/)).toBeInTheDocument()
    await user.click(within(gallery).getByRole('button', { name: 'Ampliar foto' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('não aparece no fluxo de ajuda imediata nem durante uma prática', async () => {
    const { unmount } = render(<TestApp initialPath="/ajuda" />)
    await screen.findByText('Estou aqui com você.')
    expect(document.body.innerHTML).not.toMatch(/whatsapp|converse-com-a-rosa/i)
    unmount()
    render(<TestApp initialPath="/praticar/grounding/iniciar" />)
    await screen.findByText('Grounding 5-4-3-2-1')
    expect(document.body.innerHTML).not.toMatch(/whatsapp|converse-com-a-rosa/i)
  })

  it('está no Perfil', async () => {
    const user = userEvent.setup()
    render(<TestApp initialPath="/perfil" />)
    await screen.findByText('Seus dados')
    await user.click(within(screen.getByRole('main')).getByRole('link', { name: 'Converse com a Rosa' }))
    expect(await screen.findByText('Conheça os atendimentos, palestras e formas de contato.')).toBeInTheDocument()
  })
})
