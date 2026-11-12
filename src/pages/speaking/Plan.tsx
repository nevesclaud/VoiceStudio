import { Check, MinusCircle } from 'lucide-react'
import { useState } from 'react'
import { Button, Card, Notice, PageHeader, TextArea, useTx } from '../../components/ui'
import { gradualPlan } from '../../content/speaking'
import { useApp } from '../../services/store'

export function Plan() {
  const toTx = useTx()
  const { speaking, updateSpeaking } = useApp()
  const [notes, setNotes] = useState(speaking.planNotes)
  const [saved, setSaved] = useState(false)
  const setStep = (id: string, v: 'feito' | 'pulado' | undefined) => updateSpeaking({ plan: { ...speaking.plan, [id]: v } })
  const done = gradualPlan.filter((s) => speaking.plan[s.id] === 'feito').length

  return (
    <div>
      <PageHeader back="/falar-em-publico" title="Plano gradual" subtitle="Degraus do mais fácil ao mais desafiador. Você escolhe se, quando e como subir." />
      <Notice tone="calmo">Nenhum degrau é obrigatório. Repetir um degrau também é avançar. Se algo não sair como planejado, isso não é fracasso, é informação.</Notice>
      <p className="mt-5 mb-3 text-sm text-muted" role="status">
        {done} de {gradualPlan.length} degraus feitos
      </p>
      <ol className="space-y-3">
        {gradualPlan.map((s, i) => {
          const st = speaking.plan[s.id]
          return (
            <li key={s.id}>
              <Card className={`p-4 ${st === 'feito' ? 'border-salvia-300 bg-salvia-50' : ''}`}>
                <div className="flex gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-bege-100 text-sm font-semibold">{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-semibold">{toTx(s.label)}</p>
                    <p className="text-sm text-muted">{s.hint}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant={st === 'feito' ? 'primary' : 'secondary'} aria-pressed={st === 'feito'} onClick={() => setStep(s.id, st === 'feito' ? undefined : 'feito')}>
                        <Check size={14} aria-hidden /> Fiz
                      </Button>
                      <Button size="sm" variant={st === 'pulado' ? 'primary' : 'ghost'} aria-pressed={st === 'pulado'} onClick={() => setStep(s.id, st === 'pulado' ? undefined : 'pulado')}>
                        <MinusCircle size={14} aria-hidden /> Agora não
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </li>
          )
        })}
      </ol>
      <div className="mt-6">
        <TextArea label="Anotações sobre o plano" value={notes} onChange={(v) => { setNotes(v); setSaved(false) }} rows={4} placeholder="Como foi? O que ajudou? Qual o próximo degrau?" />
        <div className="mt-3 flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={async () => { await updateSpeaking({ planNotes: notes }); setSaved(true) }}>
            Salvar anotações
          </Button>
          {saved && <span role="status" className="text-sm text-salvia-700">Salvo.</span>}
        </div>
      </div>
    </div>
  )
}
