import { ExternalLink, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Card, Notice, PageHeader } from '../components/ui'
import { emergency } from '../config/links'

function CallCard({ label, number, description }: { label: string; number: string; description: string }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-2xl font-semibold">
            {label} · {number}
          </p>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        <a href={`tel:${number}`} className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-rose-600 px-5 font-semibold text-white" aria-label={`Ligar para ${label}, ${number}`}>
          <Phone size={18} aria-hidden /> Ligar
        </a>
      </div>
    </Card>
  )
}

export default function HumanHelp() {
  return (
    <div>
      <PageHeader back title="Preciso de ajuda humana" subtitle="Você não precisa passar por isso sem companhia." />
      <Notice tone="alerta" title="Em perigo imediato">
        Se você está em risco, pensando em se machucar, ou com sintomas físicos fortes como dor no peito, falta de ar intensa ou desmaio, ligue agora para o SAMU (192) ou vá ao pronto atendimento mais próximo. Este app não presta atendimento de emergência.
      </Notice>
      <div className="mt-5 space-y-3">
        <CallCard {...emergency.samu} />
        <CallCard {...emergency.cvv} />
        <CallCard {...emergency.bombeiros} />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <a href={emergency.cvv.url} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-3 p-4 hover:border-azul-300">
          <MessageCircle size={20} className="text-azul-600" aria-hidden />
          <span className="flex-1 font-medium">Chat e e-mail do CVV</span>
          <ExternalLink size={16} aria-hidden />
          <span className="sr-only">(abre em nova aba)</span>
        </a>
        <a href={emergency.localSearch} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-3 p-4 hover:border-azul-300">
          <MapPin size={20} className="text-azul-600" aria-hidden />
          <span className="flex-1 font-medium">Buscar pronto atendimento perto de mim</span>
          <ExternalLink size={16} aria-hidden />
          <span className="sr-only">(abre o mapa em nova aba)</span>
        </a>
      </div>
      <Card className="mt-5 bg-bege-50">
        <p className="font-semibold">Outras formas de apoio</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
          <li>Ligue ou mande mensagem para alguém de confiança e diga que não está bem.</li>
          <li>Se você já tem acompanhamento, procure seu psicólogo, psiquiatra ou médico.</li>
          <li>Unidades Básicas de Saúde (UBS) e CAPS do SUS oferecem atendimento em saúde mental.</li>
        </ul>
      </Card>
      <p className="mt-6 text-xs text-muted">O app não registra nem envia nada quando você toca em um desses botões.</p>
    </div>
  )
}
