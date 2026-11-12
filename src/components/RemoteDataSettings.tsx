import { Copy, MessageSquareHeart } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { getRemote, isRemoteAvailable } from '../services/remote'
import { useApp } from '../services/store'
import { statsExplanation } from './Consent'
import { Button, Card, Toggle } from './ui'

/** Perfil: escolhas sobre o que é enviado à Rosa, revogação e exclusão. */
export function RemoteDataSettings() {
  const { prefs, updatePrefs } = useApp()
  const [msg, setMsg] = useState('')
  const [confirmAll, setConfirmAll] = useState(false)
  const [busy, setBusy] = useState(false)
  if (!isRemoteAvailable()) return null

  const del = async (scope: 'quiz' | 'tudo') => {
    setBusy(true)
    setMsg('')
    const { error } = await getRemote()!.rpc('delete_my_data', { p_visitor: prefs.visitorId, p_scope: scope })
    setBusy(false)
    if (error) {
      setMsg('Não foi possível apagar agora. Verifique a conexão e tente de novo.')
      return
    }
    if (scope === 'quiz') {
      await updatePrefs({ quizShared: false })
      setMsg('Respostas compartilhadas retiradas e apagadas.')
    } else {
      await updatePrefs({ quizShared: false, shareStats: false, statsAsked: true })
      setConfirmAll(false)
      setMsg('Tudo o que este aparelho enviou foi apagado, e as estatísticas foram desligadas.')
    }
  }

  return (
    <Card className="divide-y divide-line py-1">
      <Toggle label="Estatísticas anônimas de uso" description={statsExplanation} checked={prefs.shareStats} onChange={(v) => updatePrefs({ shareStats: v, statsAsked: true })} />
      <div className="py-3">
        <p className="font-medium">Respostas dos primeiros passos</p>
        {prefs.quizShared ? (
          <>
            <p className="text-sm text-muted">Compartilhadas de forma anônima com a Rosa.</p>
            <Button variant="secondary" size="sm" className="mt-2" disabled={busy} onClick={() => del('quiz')}>
              Retirar e apagar
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted">
            Não compartilhadas.{' '}
            {prefs.onboarding === 'concluido' && (
              <Link to="/resultado" className="underline underline-offset-2">
                Compartilhar
              </Link>
            )}
          </p>
        )}
      </div>
      <div className="py-3">
        <p className="font-medium">Apagar o que já foi enviado</p>
        <p className="text-sm text-muted">Remove do servidor as estatísticas, avaliações, mensagens e respostas enviadas deste aparelho. Seus registros locais continuam.</p>
        {confirmAll ? (
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="help" size="sm" disabled={busy} onClick={() => del('tudo')}>
              Confirmar exclusão
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmAll(false)}>
              Cancelar
            </Button>
          </div>
        ) : (
          <Button variant="secondary" size="sm" className="mt-2" onClick={() => setConfirmAll(true)}>
            Apagar dados enviados
          </Button>
        )}
      </div>
      <div className="py-3 text-sm">
        <p className="font-medium">Código deste aparelho</p>
        <p className="text-muted">Para pedir acesso ou exclusão de dados à Rosa, informe este código em Sua voz importa.</p>
        <div className="mt-2 flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-lg bg-bege-50 px-2 py-1.5 text-xs">{prefs.visitorId}</code>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full hover:bg-bege-100"
            aria-label="Copiar código"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(prefs.visitorId)
                setMsg('Código copiado.')
              } catch {
                setMsg('Selecione o código e copie manualmente.')
              }
            }}
          >
            <Copy size={16} aria-hidden />
          </button>
        </div>
        <Link to="/sua-voz" className="mt-3 inline-flex items-center gap-1 text-azul-600 underline underline-offset-2">
          <MessageSquareHeart size={16} aria-hidden /> Sua voz importa
        </Link>
      </div>
      {msg && (
        <p role="status" className="py-3 text-sm text-salvia-700">
          {msg}
        </p>
      )}
    </Card>
  )
}
