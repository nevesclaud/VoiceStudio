import { ExternalLink } from 'lucide-react'
import { MemoryRouter } from 'react-router'
import { Wordmark } from '../components/Brand'
import Painel from '../pages/Painel'

/** URL do app público, para o link "Abrir o app". */
const APP_URL = '/app/'

/**
 * Painel da Rosa como página separada (guia.rosaneves.com.br/painel/).
 * Não usa o estado local do app: só fala com o Supabase, com login de administradora.
 */
export default function PainelApp() {
  return (
    <MemoryRouter>
      <div className="min-h-dvh">
        <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
            <div className="flex items-center gap-3">
              <Wordmark size="sm" signature={false} />
              <span className="hidden rounded-full bg-azul-50 px-3 py-1 text-xs font-semibold text-azul-600 sm:inline">Área restrita</span>
            </div>
            <a href={APP_URL} className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted hover:text-ink">
              Abrir o app <ExternalLink size={14} aria-hidden />
            </a>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 pt-8 pb-16 sm:px-8">
          <Painel />
        </main>
      </div>
    </MemoryRouter>
  )
}
