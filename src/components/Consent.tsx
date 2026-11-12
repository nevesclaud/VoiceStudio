import { BarChart3 } from 'lucide-react'
import { Link } from 'react-router'
import { isRemoteAvailable } from '../services/remote'
import { useApp } from '../services/store'
import { Button } from './ui'

export const statsExplanation =
  'Ajude a melhorar o INTEGRA enviando estatísticas anônimas de uso: quais telas e práticas são abertas e concluídas, sem nada do que você escreve, sente ou registra.'

/** Pergunta única e opcional, com duas opções de mesmo peso. Desligado até a pessoa dizer sim. */
export function StatsConsentCard() {
  const { prefs, updatePrefs } = useApp()
  if (!isRemoteAvailable() || prefs.statsAsked) return null
  return (
    <section aria-labelledby="consent-title" className="card mt-4 p-5">
      <div className="flex items-start gap-3">
        <BarChart3 size={20} className="mt-0.5 shrink-0 text-azul-600" aria-hidden />
        <div>
          <h2 id="consent-title" className="font-semibold">
            Quer ajudar a melhorar o app?
          </h2>
          <p className="mt-1 text-sm text-ink-soft">{statsExplanation}</p>
          <p className="mt-1 text-xs text-muted">
            Diário, check-ins, fotos e gravações nunca saem do aparelho. Você pode mudar em Perfil.{' '}
            <Link to="/privacidade" className="underline underline-offset-2">
              Saiba mais
            </Link>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" onClick={() => updatePrefs({ shareStats: true, statsAsked: true })}>
              Sim, pode enviar
            </Button>
            <Button variant="secondary" size="sm" onClick={() => updatePrefs({ shareStats: false, statsAsked: true })}>
              Agora não
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
