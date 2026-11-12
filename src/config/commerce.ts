/**
 * Oferta do material SOS Ansiedade.
 *
 * Situação atual: INTEGRAÇÃO PENDENTE.
 * - O link do checkout vem de VITE_CHECKOUT_URL (arquivo .env.local no build). Vazio por padrão.
 * - O app NÃO libera conteúdo após compra: não existe backend para verificar pagamento.
 *   O material é entregue pela própria plataforma de venda, fora do app.
 * - Nenhum conteúdo do app fica escondido atrás de pagamento. A ajuda imediata é sempre gratuita.
 */
const raw = (import.meta.env.VITE_CHECKOUT_URL ?? '').trim()

function validCheckout(url: string): string {
  if (!url) return ''
  try {
    const u = new URL(url)
    return u.protocol === 'https:' ? u.toString() : ''
  } catch {
    return ''
  }
}

export const offer = {
  title: 'Material SOS Ansiedade',
  format: 'Material digital em PDF',
  price: 'R$ 29,90',
  priceNote: 'Pagamento único',
  /** Benefícios descritos na oferta já aprovada no quiz. Confirmar com a Rosa se correspondem à entrega. */
  benefits: [
    { title: 'Exercícios para momentos de ansiedade', text: 'Orientações simples para conhecer e praticar recursos de regulação emocional.' },
    { title: 'Corpo, mente e respiração', text: 'Estratégias para reconhecer sinais e escolher o que faz sentido em diferentes situações.' },
    { title: 'Um guia para consultar quando precisar', text: 'Conteúdo digital, organizado para você ler e colocar em prática no seu ritmo.' },
  ],
  checkoutUrl: validCheckout(raw),
  checkoutConfiguredButInvalid: raw !== '' && validCheckout(raw) === '',
}
