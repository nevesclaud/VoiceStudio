import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { links } from './config/links'
import { BrowserRouter, MemoryRouter, Navigate, Route, Routes } from 'react-router'
import { FocusLayout, Layout } from './components/Layout'
import { AppProvider, useApp } from './services/store'
import Home from './pages/Home'
import Welcome from './pages/Welcome'
import Onboarding from './pages/Onboarding'
import Result from './pages/Result'
import Help from './pages/Help'
import HumanHelp from './pages/HumanHelp'
import Explore from './pages/Explore'
import CategoryPage from './pages/CategoryPage'
import Practice from './pages/Practice'
import ExerciseDetail from './pages/ExerciseDetail'
import ExerciseRun from './pages/ExerciseRun'
import Progress from './pages/Progress'
import JournalForm from './pages/JournalForm'
import Journeys from './pages/Journeys'
import JourneyPage from './pages/JourneyPage'
import JourneyDayPage from './pages/JourneyDayPage'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import { ErrorBoundary } from './components/ErrorBoundary'

// Telas menos acessadas carregam sob demanda (continuam disponíveis offline após a primeira visita).
const Integra = lazy(() => import('./pages/Integra'))
const AboutRosa = lazy(() => import('./pages/AboutRosa'))
const ConverseRosa = lazy(() => import('./pages/ConverseRosa'))
const SuaVoz = lazy(() => import('./pages/SuaVoz'))
const Access = lazy(() => import('./pages/Access'))
const InfoPages = lazy(() => import('./pages/InfoPages'))
const Speaking = lazy(() => import('./pages/speaking/Speaking'))

function Loading() {
  return (
    <div className="grid min-h-[40vh] place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-muted">
        <span className="size-8 animate-spin rounded-full border-2 border-bege-300 border-t-ink" aria-hidden />
        Carregando...
      </div>
    </div>
  )
}

/** O painel virou uma página separada (/painel/). Endereços antigos são encaminhados. */
function PainelMoved() {
  useEffect(() => {
    if (!import.meta.env.VITEST) window.location.replace(links.painel)
  }, [])
  return (
    <p className="py-10 text-center text-muted">
      O Painel da Rosa agora fica em <a className="underline" href={links.painel}>{links.painel}</a>.
    </p>
  )
}

function Gate({ children }: { children: ReactNode }) {
  const { ready, prefs } = useApp()
  if (!ready) return <Loading />
  if (prefs.onboarding === 'pendente') return <Navigate to="/boas-vindas" replace />
  return <>{children}</>
}

export function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<FocusLayout />}>
          <Route path="/boas-vindas" element={<Welcome />} />
          <Route path="/primeiros-passos" element={<Onboarding />} />
          <Route path="/ajuda" element={<Help />} />
          <Route path="/praticar/:id/iniciar" element={<ExerciseRun />} />
        </Route>
        <Route element={<Layout />}>
          <Route
            index
            element={
              <Gate>
                <Home />
              </Gate>
            }
          />
          <Route path="/resultado" element={<Result />} />
          <Route path="/ajuda/humana" element={<HumanHelp />} />
          <Route path="/explorar" element={<Explore />} />
          <Route path="/explorar/:id" element={<CategoryPage />} />
          <Route path="/praticar" element={<Practice />} />
          <Route path="/praticar/:id" element={<ExerciseDetail />} />
          <Route path="/progresso" element={<Progress />} />
          <Route path="/diario/novo" element={<JournalForm />} />
          <Route path="/diario/:id" element={<JournalForm />} />
          <Route path="/trilhas" element={<Journeys />} />
          <Route path="/trilhas/:id" element={<JourneyPage />} />
          <Route path="/trilhas/:id/dia/:day" element={<JourneyDayPage />} />
          <Route path="/integra" element={<Integra />} />
          <Route path="/falar-em-publico/*" element={<Speaking />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/rosa" element={<AboutRosa />} />
          <Route path="/converse-com-a-rosa" element={<ConverseRosa />} />
          <Route path="/sua-voz" element={<SuaVoz />} />
          <Route path="/painel" element={<PainelMoved />} />
          <Route path="/acesso" element={<Access />} />
          <Route path="/privacidade" element={<InfoPages page="privacidade" />} />
          <Route path="/limites" element={<InfoPages page="limites" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        {import.meta.env.VITE_ARTIFACT ? (
          // Pré-visualização em página única: a navegação fica na memória (sem mudar o endereço).
          <MemoryRouter>
            <AppRoutes />
          </MemoryRouter>
        ) : (
          <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <AppRoutes />
          </BrowserRouter>
        )}
      </AppProvider>
    </ErrorBoundary>
  )
}

/** Usado nos testes. */
export function TestApp({ initialPath = '/' }: { initialPath?: string }) {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    </ErrorBoundary>
  )
}
