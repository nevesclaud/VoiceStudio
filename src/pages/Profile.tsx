import { ChevronRight, Download, MessageCircle, MessageSquareHeart, FileText, Heart, Info, Lock, RotateCcw, ShoppingBag, Smartphone, Trash2, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Monogram } from '../components/Brand'
import { Button, Card, ChoiceList, PageHeader, SectionTitle, TextInput, Toggle } from '../components/ui'
import { categoryById } from '../content/categories'
import { exerciseById } from '../content/exercises'
import { downloadExport } from '../services/download'
import { RemoteDataSettings } from '../components/RemoteDataSettings'
import { isRemoteAvailable } from '../services/remote'
import { links } from '../config/links'
import { useApp } from '../services/store'
import type { TextForm } from '../types'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
}

function Row({ to, icon: Icon, label }: { to: string; icon: typeof Info; label: string }) {
  return (
    <Link to={to} className="flex min-h-14 items-center gap-3 px-1 hover:text-azul-600">
      <Icon size={20} className="text-ink-soft" aria-hidden />
      <span className="flex-1 font-medium">{label}</span>
      <ChevronRight size={18} className="text-muted" aria-hidden />
    </Link>
  )
}

export default function Profile() {
  const { prefs, updatePrefs, wipeAll, persistent, journal, checkins, sessions } = useApp()
  const navigate = useNavigate()
  const [name, setName] = useState(prefs.name)
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => setName(prefs.name), [prefs.name])
  useEffect(() => {
    const fn = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', fn)
    return () => window.removeEventListener('beforeinstallprompt', fn)
  }, [])

  const favExercises = prefs.favorites.map(exerciseById).filter(Boolean)
  const favCategories = prefs.favorites.filter((f) => f.startsWith('cat:')).map((f) => categoryById(f.slice(4))).filter(Boolean)
  const isIos = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)

  return (
    <div>
      <PageHeader title="Perfil" subtitle="Preferências, privacidade e informações do app." />

      <Card className="flex items-center gap-4">
        <span className="grid size-14 place-items-center rounded-full bg-azul-50 text-ink-soft">
          <UserRound size={26} aria-hidden />
        </span>
        <div className="flex-1">
          <TextInput label="Como podemos te chamar? (opcional)" value={name} onChange={setName} autoComplete="given-name" />
        </div>
      </Card>
      <Button variant="secondary" size="sm" className="mt-2" onClick={() => updatePrefs({ name: name.trim() })} disabled={name.trim() === prefs.name}>
        Salvar nome
      </Button>

      <SectionTitle>Forma de tratamento</SectionTitle>
      <ChoiceList
        label="Forma de tratamento"
        value={[prefs.textForm]}
        onChange={(v) => updatePrefs({ textForm: (v[0] as TextForm) ?? 'n' })}
        options={[
          { label: 'No feminino', value: 'f' },
          { label: 'No masculino', value: 'm' },
          { label: 'De forma neutra', value: 'n' },
        ]}
      />

      <SectionTitle>Preferências</SectionTitle>
      <Card className="divide-y divide-line py-1">
        <Toggle label="Prefiro práticas curtas" description="Sugestões priorizam práticas de até 3 minutos." checked={prefs.shortPractices} onChange={(v) => updatePrefs({ shortPractices: v })} />
        <Toggle label="Evitar foco na respiração" description="Troca exercícios de respiração por alternativas de corpo e atenção." checked={prefs.avoidBreathFocus} onChange={(v) => updatePrefs({ avoidBreathFocus: v })} />
        <Toggle label="Reduzir animações" description="Também respeitamos a configuração do seu aparelho." checked={prefs.reduceMotion === 'sim'} onChange={(v) => updatePrefs({ reduceMotion: v ? 'sim' : 'sistema' })} />
        <Toggle label="Texto maior" checked={prefs.largerText} onChange={(v) => updatePrefs({ largerText: v })} />
        <Toggle label="Mostrar reflexões sobre espiritualidade" description="Opcional, na seção INTEGRA." checked={prefs.showSpirituality} onChange={(v) => updatePrefs({ showSpirituality: v })} />
      </Card>

      <Button variant="secondary" className="mt-4" onClick={() => navigate('/primeiros-passos')}>
        <RotateCcw size={16} aria-hidden /> {prefs.onboarding === 'concluido' ? 'Refazer os primeiros passos' : 'Responder os primeiros passos'}
      </Button>
      {prefs.onboarding === 'concluido' && (
        <Link to="/resultado" className="ml-3 text-sm text-azul-600 underline underline-offset-2">
          Ver minhas sugestões
        </Link>
      )}

      <SectionTitle>Favoritos</SectionTitle>
      {favExercises.length || favCategories.length ? (
        <div className="flex flex-wrap gap-2">
          {favExercises.map((e) => (
            <Link key={e!.id} to={`/praticar/${e!.id}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-bege-300 bg-white px-3.5 text-sm">
              <Heart size={14} className="fill-rose-300 text-rose-600" aria-hidden /> {e!.title}
            </Link>
          ))}
          {favCategories.map((c) => (
            <Link key={c!.id} to={`/explorar/${c!.id}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-bege-300 bg-azul-50 px-3.5 text-sm">
              <Heart size={14} className="fill-rose-300 text-rose-600" aria-hidden /> {c!.title}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">Nenhum favorito ainda. Toque no coração em uma prática ou situação.</p>
      )}

      <SectionTitle>Seus dados</SectionTitle>
      <Card>
        <div className="flex gap-3">
          <Lock size={20} className="mt-0.5 shrink-0 text-salvia-700" aria-hidden />
          <p className="text-sm text-ink-soft">
            Neste aparelho: {journal.length} registros no diário, {checkins.length} check-ins e {sessions.length} práticas. Esses registros nunca são enviados para servidores.{' '}
            <Link to="/privacidade" className="underline underline-offset-2">
              Como funciona
            </Link>
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={!persistent}
            onClick={async () => {
              try {
                await downloadExport()
                setMessage('Arquivo exportado. Guarde em um lugar seguro: ele contém seus registros.')
              } catch {
                setMessage('Não foi possível exportar agora. Tente novamente.')
              }
            }}
          >
            <Download size={16} aria-hidden /> Exportar meus dados
          </Button>
        </div>
        <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 p-4">
          <p className="font-semibold text-rose-700">Apagar todos os meus dados</p>
          <p className="mt-1 text-sm text-ink-soft">Remove diário, check-ins, práticas, gravações e preferências deste aparelho. Não dá para desfazer.{isRemoteAvailable() ? ' Para apagar também o que foi enviado à Rosa, use "Apagar dados enviados" acima, antes.' : ''}</p>
          <label htmlFor="confirmar" className="label mt-3">
            Para confirmar, digite APAGAR
          </label>
          <input id="confirmar" className="field" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
          <Button
            variant="help"
            size="sm"
            className="mt-3"
            disabled={confirm.trim().toUpperCase() !== 'APAGAR'}
            onClick={async () => {
              await wipeAll()
              setConfirm('')
              setMessage('Todos os dados foram apagados deste aparelho.')
              navigate('/boas-vindas', { replace: true })
            }}
          >
            <Trash2 size={16} aria-hidden /> Apagar tudo
          </Button>
        </div>
        {message && (
          <p role="status" className="mt-3 text-sm text-salvia-700">
            {message}
          </p>
        )}
      </Card>

      {isRemoteAvailable() && (
        <>
          <SectionTitle>Compartilhamento com a Rosa</SectionTitle>
          <RemoteDataSettings />
        </>
      )}

      <SectionTitle>Instalar o app</SectionTitle>
      <Card>
        <div className="flex gap-3">
          <Smartphone size={20} className="mt-0.5 shrink-0 text-ink-soft" aria-hidden />
          <div className="text-sm text-ink-soft">
            {installEvent ? (
              <Button size="sm" onClick={() => installEvent.prompt().then(() => setInstallEvent(null))}>
                Instalar na tela inicial
              </Button>
            ) : isIos ? (
              <p>No iPhone: abra no Safari, toque em Compartilhar e depois em "Adicionar à Tela de Início".</p>
            ) : (
              <p>No Android ou no computador: use o menu do navegador e escolha "Instalar app" ou "Adicionar à tela inicial". Depois de instalado, as práticas essenciais funcionam sem internet.</p>
            )}
          </div>
        </div>
      </Card>

      <SectionTitle>Sobre</SectionTitle>
      <Card className="divide-y divide-line py-1">
        <Row to="/converse-com-a-rosa" icon={MessageCircle} label="Converse com a Rosa" />
        <Row to="/rosa" icon={Info} label="Conheça a Rosa" />
        <Row to="/sua-voz" icon={MessageSquareHeart} label="Sua voz importa" />
        <Row to="/integra" icon={Info} label="Método INTEGRA" />
        <Row to="/trilhas" icon={Info} label="Trilhas guiadas" />
        <Row to="/acesso" icon={ShoppingBag} label="Acesso e materiais" />
        <Row to="/privacidade" icon={Lock} label="Privacidade" />
        <Row to="/limites" icon={FileText} label="Limites e cuidados" />
      </Card>
      <div className="mt-8 flex flex-col items-center gap-2 text-center text-xs text-muted">
        <Monogram className="h-8 opacity-80" />
        <p>INTEGRA | Ansiedade · versão {__APP_VERSION__}</p>
        <p>Conteúdo de autocuidado e psicoeducação. Não substitui atendimento profissional.</p>
        {isRemoteAvailable() && (
          <a href={links.painel} className="mt-2 inline-flex min-h-10 items-center gap-1 underline underline-offset-2">
            <Lock size={12} aria-hidden /> Painel da Rosa (acesso restrito)
          </a>
        )}
      </div>
    </div>
  )
}
