import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, Card, ChoiceList, PageHeader, TextArea, useTx } from '../../components/ui'
import { speakingThoughts } from '../../content/speaking'
import { useApp } from '../../services/store'

/** Reestruturação gentil de pensamentos antes de falar. Pode salvar no diário. */
export function Thoughts() {
  const toTx = useTx()
  const navigate = useNavigate()
  const { saveJournal } = useApp()
  const [pick, setPick] = useState('')
  const [custom, setCustom] = useState('')
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [alt, setAlt] = useState('')
  const [saved, setSaved] = useState(false)
  const t = speakingThoughts.find((x) => x.id === pick)
  const thoughtText = pick === 'outro' ? custom : t ? toTx(t.thought) : ''
  const questions = t?.questions ?? ['O que você sabe de fato sobre isso?', 'Se acontecer, o que você poderia fazer?', 'O que você diria para alguém querido que pensasse isso?']

  return (
    <div>
      <PageHeader back="/falar-em-publico" title="Pensamentos que travam" subtitle="Escolha o pensamento mais parecido com o seu. Vamos olhar para ele com calma, sem brigar." />
      <ChoiceList
        label="Pensamento"
        value={pick ? [pick] : []}
        onChange={(v) => {
          setPick(v[0] ?? '')
          setAnswers({})
          setAlt('')
          setSaved(false)
        }}
        options={[...speakingThoughts.map((x) => ({ label: `"${x.thought}"`, value: x.id })), { label: 'Outro pensamento', value: 'outro' }]}
      />
      {pick === 'outro' && (
        <div className="mt-4">
          <TextArea label="Qual é o pensamento?" value={custom} onChange={setCustom} rows={2} />
        </div>
      )}

      {pick && (
        <div className="mt-6 space-y-5">
          {questions.map((q, i) => (
            <TextArea key={q} label={q} value={answers[i] ?? ''} onChange={(v) => setAnswers((a) => ({ ...a, [i]: v }))} rows={2} />
          ))}
          {t && (
            <Card>
              <p className="font-semibold">Frases possíveis para levar</p>
              <p className="text-sm text-muted">Toque para usar uma como ponto de partida.</p>
              <div className="mt-3 flex flex-col gap-2">
                {t.alternatives.map((a) => (
                  <button key={a} type="button" onClick={() => setAlt(toTx(a))} className="min-h-11 rounded-2xl border border-bege-300 bg-white px-4 py-2 text-left hover:border-azul-300">
                    {toTx(a)}
                  </button>
                ))}
              </div>
            </Card>
          )}
          <TextArea label="Minha frase alternativa" value={alt} onChange={setAlt} rows={2} hint="Não precisa ser positiva demais. Precisa ser possível de acreditar." />
          <Button
            block
            disabled={!thoughtText.trim() && !alt.trim()}
            onClick={async () => {
              await saveJournal({
                mode: 'completa',
                categoryId: 'falar-em-publico',
                situation: 'Preparação para falar em público',
                thought: thoughtText,
                alternative: [alt, ...Object.values(answers)].filter((s) => s.trim()).join('\n'),
              })
              setSaved(true)
            }}
          >
            Salvar no diário
          </Button>
          {saved && (
            <p role="status" className="text-center text-sm text-salvia-700">
              Salvo no diário.{' '}
              <button type="button" className="underline" onClick={() => navigate('/falar-em-publico')}>
                Voltar para a área
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
