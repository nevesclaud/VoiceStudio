import { BookHeart, Compass, Home, LifeBuoy, MessageCircle, Sparkles, User } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { useApp } from '../services/store'
import { track } from '../services/analytics'
import { Wordmark } from './Brand'

const tabs = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/explorar', label: 'Explorar', icon: Compass },
  { to: '/praticar', label: 'Praticar', icon: Sparkles },
  { to: '/progresso', label: 'Meu progresso', icon: BookHeart },
  { to: '/perfil', label: 'Perfil', icon: User },
]

export function HelpButton({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/ajuda"
      className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-rose-600 font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 ${compact ? 'px-3.5 text-sm' : 'justify-center px-4 text-[0.95rem] whitespace-nowrap'}`}
    >
      <LifeBuoy size={18} aria-hidden />
      {compact ? (
        <span aria-label="Preciso de ajuda agora" className="whitespace-nowrap">
          Ajuda agora
        </span>
      ) : (
        <span>Preciso de ajuda agora</span>
      )}
    </Link>
  )
}

/** Moldura das telas principais: cabeçalho com ajuda imediata, conteúdo e navegação. */
export function Layout() {
  const { persistent, prefs } = useApp()
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  // Leva o foco ao conteúdo ao trocar de tela (leitores de tela anunciam a nova página).
  useEffect(() => {
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
    track('page_viewed', {}, location.pathname)
  }, [location.pathname])

  useEffect(() => {
    document.documentElement.dataset.text = prefs.largerText ? 'grande' : 'normal'
    document.documentElement.dataset.motion = prefs.reduceMotion === 'sim' ? 'reduzido' : 'sistema'
  }, [prefs.largerText, prefs.reduceMotion])

  return (
    <div className="min-h-dvh lg:flex">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
        Pular para o conteúdo
      </a>

      {/* Navegação lateral no computador */}
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-72 lg:flex-col lg:border-r lg:border-line lg:bg-white/60 lg:px-6 lg:py-8">
        <Link to="/" className="mb-10 rounded-lg">
          <Wordmark />
        </Link>
        <nav aria-label="Principal">
          <ul className="space-y-1">
            {tabs.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex min-h-12 items-center gap-3 rounded-2xl px-4 font-medium transition-colors ${isActive ? 'bg-azul-50 text-ink' : 'text-muted hover:bg-bege-50 hover:text-ink'}`
                  }
                >
                  <Icon size={20} aria-hidden /> {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6">
          <HelpButton />
        </div>
        <NavLink to="/converse-com-a-rosa" className={({ isActive }) => `mt-4 flex min-h-12 items-center gap-3 rounded-2xl px-4 font-medium ${isActive ? 'bg-azul-50 text-ink' : 'text-muted hover:bg-bege-50 hover:text-ink'}`}>
          <MessageCircle size={20} aria-hidden /> Converse com a Rosa
        </NavLink>
        <p className="mt-auto text-xs text-muted">Conteúdo de autocuidado e psicoeducação. Não substitui atendimento profissional.</p>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/90 backdrop-blur pt-[env(safe-area-inset-top)] lg:hidden">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-2.5">
            <Link to="/" className="rounded-lg">
              <Wordmark size="sm" />
            </Link>
            <HelpButton compact />
          </div>
        </header>

        {!persistent && (
          <div className="mx-auto mt-3 w-full max-w-2xl px-4" role="status">
            <div className="rounded-2xl border border-[#f1dfb2] bg-[#fdf6e7] p-3 text-sm">
              Este navegador não permitiu salvar dados (pode ser uma janela anônima). O app funciona, mas seus registros serão perdidos ao fechar.
            </div>
          </div>
        )}

        <main id="conteudo" ref={mainRef} tabIndex={-1} className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-28 outline-none lg:max-w-3xl lg:px-10 lg:pt-10 lg:pb-16">
          <Outlet />
        </main>

        {/* Barra inferior no celular */}
        <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          <ul className="mx-auto grid max-w-2xl grid-cols-5">
            {tabs.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex min-h-16 flex-col items-center justify-start gap-1 px-0.5 pt-2 text-[0.68rem] leading-tight font-medium whitespace-nowrap ${isActive ? 'text-ink' : 'text-muted'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`grid h-7 w-12 place-items-center rounded-full transition-colors ${isActive ? 'bg-azul-100' : ''}`}>
                        <Icon size={20} aria-hidden />
                      </span>
                      <span className="text-center">{label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

/** Moldura simples para fluxos focados (ajuda, prática em andamento, primeiros passos). */
export function FocusLayout() {
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => {
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
    track('page_viewed', {}, location.pathname)
  }, [location.pathname])
  return (
    <main ref={mainRef} tabIndex={-1} className="mx-auto min-h-dvh w-full max-w-xl px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-10 outline-none">
      <Outlet />
    </main>
  )
}
