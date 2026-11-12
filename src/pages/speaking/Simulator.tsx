import { ChevronLeft, ChevronRight, Pause, Play, Plus, RotateCcw, Square, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button, Card, EmptyState, Notice, PageHeader } from '../../components/ui'
import { formatClock } from '../../lib/text'
import { useApp } from '../../services/store'

/** Simulador com cronômetro, cartões de fala e lembretes de pausa programados. */
export function Simulator() {
  const { speaking, updateSpeaking } = useApp()
  const [cards, setCards] = useState<string[]>(speaking.cards.length ? speaking.cards : [''])
  const [totalMin, setTotalMin] = useState(speaking.simulator.totalMin)
  const [pauseEvery, setPauseEvery] = useState(speaking.simulator.pauseEverySec)
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [card, setCard] = useState(0)
  const [cue, setCue] = useState(false)
  const last = useRef(0)
  const lastCueAt = useRef(0)

  useEffect(() => {
    if (!running || paused) return
    last.current = performance.now()
    const id = window.setInterval(() => {
      const now = performance.now()
      setElapsed((e) => e + (now - last.current) / 1000)
      last.current = now
    }, 250)
    return () => window.clearInterval(id)
  }, [running, paused])

  // Lembrete de pausa: aparece por 6 segundos a cada intervalo (sem piscar).
  useEffect(() => {
    if (!running || !pauseEvery) return
    const slot = Math.floor(elapsed / pauseEvery)
    if (slot > 0 && slot !== lastCueAt.current) {
      lastCueAt.current = slot
      setCue(true)
    }
    if (cue && elapsed - lastCueAt.current * pauseEvery > 6) setCue(false)
  }, [elapsed, pauseEvery, running, cue])

  const valid = cards.map((c) => c.trim()).filter(Boolean)
  const planned = totalMin * 60
  const over = elapsed > planned

  const start = async () => {
    await updateSpeaking({ cards: valid, simulator: { totalMin, pauseEverySec: pauseEvery } })
    setElapsed(0)
    setCard(0)
    lastCueAt.current = 0
    setCue(false)
    setPaused(false)
    setRunning(true)
  }

  if (running) {
    return (
      <div>
        <PageHeader title="Simulação em andamento" subtitle="Fale em voz alta, como se estivesse lá." />
        <div className="text-center">
          <p className={`font-display text-6xl font-semibold tabular-nums ${over ? 'text-rose-700' : ''}`} aria-live="off">
            {formatClock(elapsed)}
          </p>
          <p className="mt-1 text-sm text-muted">
            de {formatClock(planned)} planejados{over ? ' · tempo planejado concluído, tudo bem continuar' : ''}
          </p>
        </div>
        <div role="status" aria-live="polite" className="min-h-14">
          {cue && <p className="mt-4 rounded-2xl bg-salvia-50 p-3 text-center font-semibold text-salvia-700">Pausa. Respire, olhe para o público e siga.</p>}
        </div>
        <Card className="mt-2 min-h-44 p-6">
          {valid.length ? (
            <>
              <p className="eyebrow">
                Cartão {card + 1} de {valid.length}
              </p>
              <p className="mt-2 text-xl leading-relaxed whitespace-pre-line">{valid[card]}</p>
            </>
          ) : (
            <p className="text-muted">Sem cartões. Fale livremente sobre o seu tema.</p>
          )}
        </Card>
        {valid.length > 1 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="secondary" disabled={card === 0} onClick={() => setCard((c) => c - 1)}>
              <ChevronLeft size={18} aria-hidden /> Cartão anterior
            </Button>
            <Button variant="secondary" disabled={card === valid.length - 1} onClick={() => setCard((c) => c + 1)}>
              Próximo cartão <ChevronRight size={18} aria-hidden />
            </Button>
          </div>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
            {paused ? <Play size={18} aria-hidden /> : <Pause size={18} aria-hidden />} {paused ? 'Continuar' : 'Pausar'}
          </Button>
          <Button onClick={() => setRunning(false)}>
            <Square size={16} aria-hidden /> Encerrar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader back="/falar-em-publico" title="Simulador de apresentação" subtitle="Ensaie com tempo marcado, seus cartões de fala e lembretes de pausa." />
      {elapsed > 0 && (
        <div className="mb-5">
          <Notice tone="calmo" title="Ensaio concluído">
            Você falou por {formatClock(elapsed)}. O que funcionou? Anote na área de falar em público, se quiser.
          </Notice>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="tempo" className="label">
            Duração planejada
          </label>
          <select id="tempo" className="field" value={totalMin} onChange={(e) => setTotalMin(Number(e.target.value))}>
            {[1, 2, 3, 5, 7, 10, 15, 20, 30].map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pausa" className="label">
            Lembrete de pausa
          </label>
          <select id="pausa" className="field" value={pauseEvery} onChange={(e) => setPauseEvery(Number(e.target.value))}>
            <option value={0}>Sem lembrete</option>
            <option value={30}>A cada 30 s</option>
            <option value={60}>A cada 1 min</option>
            <option value={120}>A cada 2 min</option>
            <option value={180}>A cada 3 min</option>
          </select>
        </div>
      </div>

      <h2 className="mt-6 mb-2 font-semibold">Cartões de fala</h2>
      <p className="mb-3 text-sm text-muted">Um tópico por cartão. Frases curtas funcionam melhor do que texto completo.</p>
      {cards.length === 0 && <EmptyState icon={Plus} title="Nenhum cartão" />}
      <ol className="space-y-2">
        {cards.map((c, i) => (
          <li key={i} className="flex gap-2">
            <label className="sr-only" htmlFor={`card-${i}`}>
              Cartão {i + 1}
            </label>
            <textarea id={`card-${i}`} className="field" rows={2} value={c} placeholder={`Cartão ${i + 1}`} onChange={(e) => setCards((cs) => cs.map((x, k) => (k === i ? e.target.value : x)))} />
            <button type="button" className="grid size-11 shrink-0 place-items-center rounded-full text-muted hover:bg-bege-100" aria-label={`Remover cartão ${i + 1}`} onClick={() => setCards((cs) => cs.filter((_, k) => k !== i))}>
              <Trash2 size={16} aria-hidden />
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => setCards((cs) => [...cs, ''])}>
          <Plus size={16} aria-hidden /> Adicionar cartão
        </Button>
        {cards.some((c) => c.trim()) && (
          <Button variant="ghost" size="sm" onClick={() => setCards([''])}>
            <RotateCcw size={16} aria-hidden /> Limpar
          </Button>
        )}
      </div>
      <Button block size="lg" className="mt-6" onClick={start}>
        <Play size={18} aria-hidden /> Começar simulação
      </Button>
    </div>
  )
}
