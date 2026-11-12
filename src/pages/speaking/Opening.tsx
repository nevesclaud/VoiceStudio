import { Copy, Save } from 'lucide-react'
import { useState } from 'react'
import { Button, ChoiceList, Notice, PageHeader, TextArea, TextInput, useTx } from '../../components/ui'
import { openingModels, type OpeningFields } from '../../content/speaking'
import { useApp } from '../../services/store'

/** Gerador de roteiro de abertura com modelos editáveis. Não usa IA nem internet. */
export function Opening() {
  const toTx = useTx()
  const { speaking, updateSpeaking } = useApp()
  const [fields, setFields] = useState<OpeningFields>({
    topic: speaking.opening?.topic ?? '',
    audience: speaking.opening?.audience ?? '',
    duration: speaking.opening?.duration ?? '',
    goal: speaking.opening?.goal ?? '',
  })
  const [model, setModel] = useState(speaking.opening?.model ?? 'pergunta')
  const [text, setText] = useState(speaking.opening?.text ?? '')
  const [status, setStatus] = useState('')

  const set = (k: keyof OpeningFields) => (v: string) => setFields((f) => ({ ...f, [k]: v }))
  const generate = () => {
    const m = openingModels.find((x) => x.id === model) ?? openingModels[0]!
    setText(toTx(m.build(fields)))
    setStatus('')
  }

  return (
    <div>
      <PageHeader back="/falar-em-publico" title="Roteiro de abertura" subtitle="As primeiras frases são as que mais pesam. Ter elas prontas ajuda a começar." />
      <div className="space-y-4">
        <TextInput label="Tema" value={fields.topic} onChange={set('topic')} placeholder="Ex.: resultados do trimestre" />
        <TextInput label="Público" value={fields.audience} onChange={set('audience')} placeholder="Ex.: a equipe de vendas" />
        <TextInput label="Duração" value={fields.duration} onChange={set('duration')} placeholder="Ex.: 10 minutos" />
        <TextInput label="Objetivo" value={fields.goal} onChange={set('goal')} placeholder="Ex.: entendam as prioridades do próximo mês" hint='Complete a frase: "Ao final, quero que vocês..."' />
        <div>
          <p className="label">Modelo</p>
          <ChoiceList label="Modelo de abertura" value={[model]} onChange={(v) => setModel(v[0] ?? 'pergunta')} options={openingModels.map((m) => ({ label: m.label, value: m.id }))} />
        </div>
        <Button block onClick={generate}>
          Montar abertura
        </Button>
      </div>

      {text && (
        <div className="mt-6 space-y-3">
          <TextArea label="Sua abertura (edite à vontade)" value={text} onChange={setText} rows={9} />
          <Notice>Troque os trechos entre colchetes pelas suas palavras. Depois, ensaie em voz alta três vezes.</Notice>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                await updateSpeaking({ opening: { ...fields, model, text } })
                setStatus('Abertura salva neste aparelho.')
              }}
            >
              <Save size={16} aria-hidden /> Salvar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(text)
                  setStatus('Texto copiado.')
                } catch {
                  setStatus('Não foi possível copiar. Selecione o texto e copie manualmente.')
                }
              }}
            >
              <Copy size={16} aria-hidden /> Copiar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                const cards = text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean)
                await updateSpeaking({ cards, opening: { ...fields, model, text } })
                setStatus('Abertura enviada para os cartões do simulador.')
              }}
            >
              Usar no simulador
            </Button>
          </div>
          {status && (
            <p role="status" className="text-sm text-salvia-700">
              {status}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
