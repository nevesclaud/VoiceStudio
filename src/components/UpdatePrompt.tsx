import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Atualização segura: a nova versão só entra quando a pessoa toca em "Atualizar",
 * para não interromper uma prática ou um texto no diário.
 */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW()

  // O aviso de "pronto para uso offline" some sozinho; o de atualização espera a decisão da pessoa.
  useEffect(() => {
    if (!offlineReady || needRefresh) return
    const id = window.setTimeout(() => setOfflineReady(false), 5000)
    return () => window.clearTimeout(id)
  }, [offlineReady, needRefresh, setOfflineReady])

  if (!needRefresh && !offlineReady) return null
  return (
    <div role="status" className="fixed inset-x-3 bottom-24 z-50 mx-auto max-w-md rounded-2xl border border-line bg-white p-4 shadow-lg lg:bottom-6">
      <p className="text-sm">
        {needRefresh ? 'Há uma nova versão do app disponível.' : 'Pronto: as práticas essenciais agora funcionam sem internet.'}
      </p>
      <div className="mt-3 flex gap-2">
        {needRefresh && (
          <button type="button" className="min-h-10 rounded-full bg-ink px-4 text-sm font-semibold text-paper" onClick={() => updateServiceWorker(true)}>
            Atualizar
          </button>
        )}
        <button
          type="button"
          className="min-h-10 rounded-full border border-bege-300 px-4 text-sm font-semibold"
          onClick={() => {
            setNeedRefresh(false)
            setOfflineReady(false)
          }}
        >
          {needRefresh ? 'Depois' : 'Ok'}
        </button>
      </div>
    </div>
  )
}
