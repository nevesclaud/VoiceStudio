import { Check, ExternalLink } from 'lucide-react'
import { Card, Notice, PageHeader, SectionTitle } from '../components/ui'
import { offer } from '../config/commerce'
import { exercises } from '../content/exercises'
import { categories } from '../content/categories'

const freeItems = [
  'Ajuda imediata de 30 segundos a 5 minutos',
  `${exercises.length} práticas interativas de mente, respiração e corpo`,
  `${categories.length} áreas por situação, com plano opcional`,
  'Área especial de falar em público',
  'Trilhas de 7, 14 e 21 dias',
  'Diário privado, check-ins e progresso',
]

export default function Access() {
  const ready = Boolean(offer.checkoutUrl)
  return (
    <div>
      <PageHeader back title="Acesso e materiais" subtitle="Tudo o que está no app é gratuito. A ajuda imediata nunca fica atrás de pagamento." />

      <Card>
        <p className="eyebrow">Gratuito, neste app</p>
        <ul className="mt-3 space-y-2">
          {freeItems.map((i) => (
            <li key={i} className="flex gap-2 text-ink-soft">
              <Check size={18} className="mt-0.5 shrink-0 text-salvia-700" aria-hidden /> {i}
            </li>
          ))}
        </ul>
      </Card>

      <SectionTitle>{offer.title}</SectionTitle>
      <div className="overflow-hidden rounded-[1.5rem] border border-line bg-gradient-to-br from-white via-bege-50 to-rose-50 p-6 shadow-[var(--shadow-soft)]">
        <p className="eyebrow">{offer.format}</p>
        <p className="mt-2 font-display text-2xl font-semibold">Um jeito mais prático de cuidar da sua ansiedade</p>
        <ul className="mt-5 space-y-4">
          {offer.benefits.map((b) => (
            <li key={b.title} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-salvia-100 text-salvia-700">
                <Check size={16} aria-hidden />
              </span>
              <div>
                <p className="font-semibold">{b.title}</p>
                <p className="text-sm text-ink-soft">{b.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-6 rounded-2xl bg-white/80 p-4 text-center">
          <p className="text-sm text-muted">Acesso ao material</p>
          <p className="font-display text-4xl font-semibold">{offer.price}</p>
          <p className="text-sm text-muted">{offer.priceNote}</p>
        </div>
        {ready ? (
          <a href={offer.checkoutUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 font-semibold text-paper">
            Quero acessar o material <ExternalLink size={16} aria-hidden />
            <span className="sr-only">(abre a página de pagamento em nova aba)</span>
          </a>
        ) : (
          <p className="mt-5 rounded-full border border-bege-300 bg-white/70 py-3.5 text-center font-semibold text-muted">Em breve</p>
        )}
        <p className="mt-3 text-center text-xs text-muted">O material é entregue pela plataforma de pagamento, fora do app. Conteúdo educativo. Não substitui atendimento profissional ou avaliação individual.</p>
      </div>

      {import.meta.env.DEV && (
        <div className="mt-6">
          <Notice tone="alerta" title="Aviso de desenvolvimento: integração pendente">
            {offer.checkoutConfiguredButInvalid
              ? 'VITE_CHECKOUT_URL está preenchida, mas não é uma URL https válida.'
              : ready
                ? 'Checkout configurado. Lembre: o app não verifica pagamento nem libera conteúdo. A entrega é feita pela Kiwify.'
                : 'Defina VITE_CHECKOUT_URL em .env.local com o link real da Kiwify (fornecido pela Rosa) e gere o build de novo. Sem backend de verificação, o app não libera conteúdo pago.'}
          </Notice>
        </div>
      )}
    </div>
  )
}
