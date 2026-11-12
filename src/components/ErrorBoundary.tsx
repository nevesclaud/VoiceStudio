import { Component, type ReactNode } from 'react'

interface State {
  error: Error | null
}

/** Se algo quebrar, a pessoa nunca fica sem acesso à ajuda imediata. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    const base = import.meta.env.BASE_URL
    return (
      <main className="mx-auto max-w-lg px-5 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold">Algo não saiu como esperado.</h1>
        <p className="mt-3 text-muted">Seus registros continuam salvos neste aparelho. Tente recarregar a página.</p>
        <div className="mt-6 flex flex-col gap-3">
          <button type="button" className="min-h-12 rounded-full bg-ink px-5 font-semibold text-paper" onClick={() => window.location.reload()}>
            Recarregar
          </button>
          <a className="min-h-12 rounded-full bg-rose-600 px-5 py-3 font-semibold text-white" href={`${base}ajuda`}>
            Preciso de ajuda agora
          </a>
          <p className="text-sm text-muted">Em perigo imediato, ligue 192 (SAMU). Para apoio emocional, 188 (CVV).</p>
        </div>
      </main>
    )
  }
}
