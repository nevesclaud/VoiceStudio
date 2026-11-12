import { CheckSquare, ClipboardList, Clock3, ListChecks, MessageSquareQuote, Mic, PenSquare, Timer } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router'
import { CheckInForm } from '../../components/common'
import { StepPlayer } from '../../components/StepPlayer'
import { Button, Card, PageHeader, SectionTitle, TextArea, useTx } from '../../components/ui'
import { physicalChecklist, preparation3min } from '../../content/speaking'
import { useApp } from '../../services/store'
import NotFound from '../NotFound'
import { Opening } from './Opening'
import { Plan } from './Plan'
import { Recorder } from './Recorder'
import { Simulator } from './Simulator'
import { Thoughts } from './Thoughts'

const tools = [
  { to: 'preparar', title: 'Preparação de 3 minutos', text: 'Para fazer logo antes de falar.', icon: Clock3 },
  { to: 'checklist', title: 'Checklist do corpo', text: 'Pés, postura, água, olhar e ritmo.', icon: CheckSquare },
  { to: 'pensamentos', title: 'Pensamentos que travam', text: '"Vou esquecer tudo", "Vão me julgar"...', icon: MessageSquareQuote },
  { to: 'roteiro', title: 'Roteiro de abertura', text: 'Monte as primeiras frases com modelos.', icon: PenSquare },
  { to: 'simulador', title: 'Simulador de apresentação', text: 'Cronômetro, cartões de fala e pausas.', icon: Timer },
  { to: 'gravacao', title: 'Gravar um ensaio', text: 'Opcional. Fica só no seu aparelho.', icon: Mic },
  { to: 'plano', title: 'Plano gradual', text: 'Degraus voluntários, no seu ritmo.', icon: ListChecks },
]

function Hub() {
  const { speaking, updateSpeaking } = useApp()
  const [worked, setWorked] = useState(speaking.whatWorked)
  const [saved, setSaved] = useState(false)
  return (
    <div>
      <PageHeader back="/explorar/falar-em-publico" eyebrow="Área especial" title="Falar em público" subtitle="Preparar, ensaiar e cuidar do nervosismo. Sem obrigação de se expor." />
      <div className="rounded-[1.25rem] bg-rose-50 p-5">
        <p className="font-display text-[1.45rem] leading-snug font-semibold text-rose-700">"É possível sentir nervosismo e ainda assim comunicar sua ideia."</p>
      </div>

      <SectionTitle>Antes de falar</SectionTitle>
      <Card>
        <CheckInForm context="falar-antes" compact title="Como está seu nervosismo agora, de 0 a 10?" />
      </Card>

      <SectionTitle>Ferramentas</SectionTitle>
      <ul className="grid gap-3 sm:grid-cols-2">
        {tools.map(({ to, title, text, icon: Icon }) => (
          <li key={to}>
            <Link to={to} className="card flex h-full items-start gap-3 p-4 hover:border-azul-300">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose-700">
                <Icon size={20} aria-hidden />
              </span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted">{text}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <SectionTitle>Depois de falar</SectionTitle>
      <Card className="space-y-5">
        <CheckInForm context="falar-depois" compact title="E agora, depois, de 0 a 10?" />
        <div className="border-t border-line pt-5">
          <TextArea label="O que funcionou?" value={worked} onChange={(v) => { setWorked(v); setSaved(false) }} placeholder="Ex.: ensaiar a abertura, olhar para uma pessoa amiga, fazer pausa..." hint="Não precisa ter sido perfeito. Anote o que ajudou, mesmo que pouco." />
          <div className="mt-3 flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={async () => { await updateSpeaking({ whatWorked: worked }); setSaved(true) }}>
              Salvar
            </Button>
            {saved && <span role="status" className="text-sm text-salvia-700">Salvo.</span>}
          </div>
        </div>
      </Card>
      <p className="mt-6 text-sm text-muted">Se o medo de falar em público for muito intenso ou atrapalhar sua vida, conversar com um profissional pode ajudar.</p>
    </div>
  )
}

function Prep() {
  const navigate = useNavigate()
  const { addSession } = useApp()
  const [done, setDone] = useState<null | 'ok' | 'parou'>(null)
  const started = useRef(Date.now())
  const finish = async (status: 'concluida' | 'interrompida') => {
    await addSession({ exerciseId: 'falar-preparacao', startedAt: started.current, endedAt: Date.now(), status, source: 'falar' })
    setDone(status === 'concluida' ? 'ok' : 'parou')
  }
  return (
    <div>
      <PageHeader back="/falar-em-publico" title="Preparação de 3 minutos" subtitle="Para fazer em um canto tranquilo, no banheiro ou na cadeira, antes de começar." />
      {done ? (
        <Card className="text-center">
          <p className="font-display text-2xl font-semibold">{done === 'ok' ? 'Pronto. Vá no seu ritmo.' : 'Tudo bem parar.'}</p>
          <p className="mt-2 text-muted">Você pode estar com nervosismo e ainda assim dar um passo pequeno.</p>
          <div className="mt-5 grid gap-3">
            <Button onClick={() => navigate('/falar-em-publico/checklist')}>Ver checklist do corpo</Button>
            <Button variant="secondary" onClick={() => navigate('/falar-em-publico')}>
              Voltar
            </Button>
          </div>
        </Card>
      ) : (
        <StepPlayer steps={preparation3min} onFinish={() => finish('concluida')} onStop={() => finish('interrompida')} />
      )}
    </div>
  )
}

function Checklist() {
  const { speaking, updateSpeaking } = useApp()
  const toTx = useTx()
  const done = physicalChecklist.filter((c) => speaking.checklist[c.id]).length
  return (
    <div>
      <PageHeader back="/falar-em-publico" title="Checklist do corpo" subtitle="Antes de começar. Marque o que já está ok." />
      <p className="mb-3 text-sm text-muted" role="status">
        {done} de {physicalChecklist.length}
      </p>
      <ul className="space-y-2">
        {physicalChecklist.map((c) => {
          const checked = Boolean(speaking.checklist[c.id])
          return (
            <li key={c.id}>
              <label className={`card flex min-h-16 cursor-pointer items-start gap-3 p-4 ${checked ? 'border-salvia-300 bg-salvia-50' : ''}`}>
                <input type="checkbox" className="mt-1 size-5 accent-[#3f6348]" checked={checked} onChange={(e) => updateSpeaking({ checklist: { ...speaking.checklist, [c.id]: e.target.checked } })} />
                <span>
                  <span className="block font-semibold">{c.label}</span>
                  <span className="text-sm text-muted">{toTx(c.hint)}</span>
                </span>
              </label>
            </li>
          )
        })}
      </ul>
      <Button variant="ghost" size="sm" className="mt-4" onClick={() => updateSpeaking({ checklist: {} })}>
        <ClipboardList size={16} aria-hidden /> Desmarcar tudo para a próxima vez
      </Button>
    </div>
  )
}

export default function Speaking() {
  return (
    <Routes>
      <Route index element={<Hub />} />
      <Route path="preparar" element={<Prep />} />
      <Route path="checklist" element={<Checklist />} />
      <Route path="pensamentos" element={<Thoughts />} />
      <Route path="roteiro" element={<Opening />} />
      <Route path="simulador" element={<Simulator />} />
      <Route path="gravacao" element={<Recorder />} />
      <Route path="plano" element={<Plan />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
