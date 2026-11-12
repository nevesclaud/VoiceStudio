import { Share2 } from 'lucide-react'
import { useState } from 'react'
import { getRemote, isRemoteAvailable } from '../services/remote'
import { useApp } from '../services/store'
import type { OnboardingAnswers } from '../types'
import { Button } from './ui'

/** Só as opções marcadas. Nunca nome, nível de agora, texto livre, diário ou check-ins. */
export function quizSharePayload(a: OnboardingAnswers): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {}
  if (a.hardest?.length) out.hardest = a.hardest.slice(0, 3)
  for (const k of ['usualLevel', 'frequency', 'moment', 'firstSign', 'tried', 'avoid', 'self', 'frustration', 'change', 'length', 'heard'] as const) {
    const v = a[k]
    if (typeof v === 'string' && v) out[k] = v
  }
  return out
}

export function QuizShareCard() {
  const { prefs, updatePrefs } = useApp()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [dismissed, setDismissed] = useState(false)
  if (!isRemoteAvailable() || dismissed) return null

  if (prefs.quizShared) {
    return (
      <p role="status" className="mt-6 rounded-2xl bg-salvia-50 p-4 text-sm">
        Suas respostas foram compartilhadas de forma anônima. Você pode retirar em Perfil.
      </p>
    )
  }

  return (
    <section aria-labelledby="share-title" className="card mt-6 p-5">
      <div className="flex items-start gap-3">
        <Share2 size={20} className="mt-0.5 shrink-0 text-azul-600" aria-hidden />
        <div>
          <h2 id="share-title" className="font-semibold">
            Compartilhar suas respostas com a Rosa? (opcional)
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Serve para a Rosa entender quais situações e necessidades aparecem mais e melhorar os conteúdos. Vão apenas as opções que você marcou, sem nome e sem nada que você escreveu. Ninguém recebe um resultado individual.
          </p>
          <p className="mt-1 text-xs text-muted">Você pode retirar e apagar a qualquer momento em Perfil.</p>
          {msg && (
            <p role="alert" className="mt-2 text-sm text-rose-700">
              {msg}
            </p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                setMsg('')
                const { error } = await getRemote()!.rpc('share_quiz', { p_visitor: prefs.visitorId, p_answers: quizSharePayload(prefs.answers) })
                setBusy(false)
                if (error) setMsg('Não foi possível compartilhar agora. Tente de novo mais tarde.')
                else await updatePrefs({ quizShared: true })
              }}
            >
              Compartilhar
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setDismissed(true)}>
              Agora não
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
