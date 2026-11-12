import { LifeBuoy } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { FullLogo, Wordmark } from '../components/Brand'
import { SafetyLimits } from '../components/common'
import { Button, ButtonLink } from '../components/ui'
import { useApp } from '../services/store'
import { isRemoteAvailable } from '../services/remote'

export default function Welcome() {
  const { updatePrefs, prefs } = useApp()
  const navigate = useNavigate()
  return (
    <div className="flex min-h-[calc(100dvh-3rem)] flex-col anim-in">
      <div className="flex justify-end">
        <Link to="/ajuda" className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-rose-700">
          <LifeBuoy size={18} aria-hidden /> Preciso de ajuda agora
        </Link>
      </div>
      <div className="flex flex-1 flex-col justify-center py-6 text-center">
        <FullLogo className="mx-auto h-24" />
        <div className="mx-auto mt-6">
          <Wordmark size="lg" signature={false} />
        </div>
        <h1 className="mx-auto mt-10 max-w-md font-display text-[2.1rem] leading-tight font-semibold">
          Você não precisa resolver tudo agora. Vamos começar pelo que está mais difícil hoje.
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-muted">Algumas perguntas rápidas para sugerir práticas que façam sentido para você. Leva uns 3 minutos e você pode pular.</p>
      </div>
      <div className="space-y-3">
        <ButtonLink to="/primeiros-passos" block size="lg">
          Começar
        </ButtonLink>
        <Button
          variant="secondary"
          block
          size="lg"
          onClick={async () => {
            await updatePrefs({ onboarding: 'ignorado' })
            navigate('/', { replace: true })
          }}
        >
          Explorar sem responder
        </Button>
        {isRemoteAvailable() && (
          <label className="flex items-start gap-3 rounded-2xl bg-white/70 p-3 text-left text-sm">
            <input
              type="checkbox"
              className="mt-0.5 size-5 shrink-0 accent-[#3f6348]"
              checked={prefs.shareStats}
              onChange={(e) => void updatePrefs({ shareStats: e.target.checked, statsAsked: true })}
            />
            <span>
              Opcional: enviar estatísticas anônimas de uso para ajudar a melhorar o app. Nada do que você escreve ou responde é enviado.{' '}
              <Link to="/privacidade" className="underline underline-offset-2">
                Saiba mais
              </Link>
            </span>
          </label>
        )}
        <p className="text-center text-xs text-muted">Sem cadastro. Suas respostas ficam só neste aparelho.</p>
        <SafetyLimits className="justify-center pt-2 text-center" />
      </div>
    </div>
  )
}
