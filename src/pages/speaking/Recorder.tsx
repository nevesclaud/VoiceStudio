import { Mic, Square, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button, Card, EmptyState, Notice, PageHeader } from '../../components/ui'
import { deleteItem, listAll, newId, putItem } from '../../services/db'
import { formatClock, formatDateTime } from '../../lib/text'
import { useApp } from '../../services/store'
import type { Recording } from '../../types'

const MAX_SECONDS = 600

function pickMime(): string {
  if (typeof MediaRecorder === 'undefined') return ''
  for (const t of ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg']) if (MediaRecorder.isTypeSupported?.(t)) return t
  return ''
}

function Player({ rec }: { rec: Recording }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const u = URL.createObjectURL(rec.blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [rec.blob])
  return url ? <audio controls src={url} className="mt-2 w-full" preload="metadata" /> : null
}

/** Gravação de ensaio: só com permissão explícita, guardada no aparelho, com opção de apagar. */
export function Recorder() {
  const { prefs, updatePrefs, persistent } = useApp()
  const supported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined'
  const [recs, setRecs] = useState<Recording[]>([])
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState('')
  const mr = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const stream = useRef<MediaStream | null>(null)
  const started = useRef(0)

  useEffect(() => {
    if (persistent) listAll('recordings').then(setRecs).catch(() => setRecs([]))
  }, [persistent])

  useEffect(() => {
    if (!recording) return
    const id = window.setInterval(() => {
      const s = (Date.now() - started.current) / 1000
      setSeconds(s)
      if (s >= MAX_SECONDS) stop()
    }, 250)
    return () => window.clearInterval(id)
  }, [recording])

  // Garante que o microfone é liberado ao sair da tela.
  useEffect(() => () => stream.current?.getTracks().forEach((t) => t.stop()), [])

  const start = async () => {
    setError('')
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError('Sem acesso ao microfone. Você pode liberar nas configurações do navegador ou seguir ensaiando sem gravar.')
      return
    }
    const mime = pickMime()
    const rec = new MediaRecorder(stream.current, mime ? { mimeType: mime } : undefined)
    chunks.current = []
    rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data)
    rec.onstop = async () => {
      stream.current?.getTracks().forEach((t) => t.stop())
      const blob = new Blob(chunks.current, { type: rec.mimeType || mime || 'audio/webm' })
      const item: Recording = { id: newId(), createdAt: Date.now(), durationSec: Math.round((Date.now() - started.current) / 1000), mimeType: blob.type, blob }
      try {
        if (persistent) await putItem('recordings', item)
        setRecs((r) => [item, ...r])
      } catch {
        setError('Não foi possível salvar a gravação neste aparelho (espaço cheio ou navegador restrito).')
      }
    }
    mr.current = rec
    started.current = Date.now()
    setSeconds(0)
    rec.start(1000)
    setRecording(true)
  }

  const stop = () => {
    if (mr.current && mr.current.state !== 'inactive') mr.current.stop()
    setRecording(false)
  }

  const remove = async (id: string) => {
    if (!window.confirm('Apagar esta gravação?')) return
    if (persistent) await deleteItem('recordings', id)
    setRecs((r) => r.filter((x) => x.id !== id))
  }

  if (!prefs.recordingConsent) {
    return (
      <div>
        <PageHeader back="/falar-em-publico" title="Gravar um ensaio" subtitle="Ouvir a própria voz pode ajudar a perceber o que já funciona." />
        <Card>
          <p className="font-semibold">Antes de usar o microfone</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
            <li>A gravação é opcional. Você pode ensaiar sem gravar.</li>
            <li>O áudio fica salvo só neste aparelho e não é enviado para ninguém.</li>
            <li>Você pode apagar cada gravação, ou todas, quando quiser.</li>
            <li>O navegador vai pedir permissão para o microfone.</li>
          </ul>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Button onClick={() => updatePrefs({ recordingConsent: true })} disabled={!supported}>
              Concordo, quero gravar
            </Button>
            <Button variant="secondary" onClick={() => history.back()}>
              Agora não
            </Button>
          </div>
          {!supported && <p className="mt-3 text-sm text-rose-700">Este navegador não permite gravar áudio. As outras ferramentas funcionam normalmente.</p>}
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader back="/falar-em-publico" title="Gravar um ensaio" subtitle="Ao ouvir, procure primeiro o que já está bom. Depois, uma coisa só para ajustar." />
      {!persistent && <Notice tone="alerta">Este navegador não permite salvar. A gravação some ao fechar o app.</Notice>}
      <Card className="mt-4 text-center">
        <p className="font-display text-5xl font-semibold tabular-nums" aria-live="off">
          {formatClock(seconds)}
        </p>
        <p className="mt-1 text-sm text-muted" role="status">
          {recording ? 'Gravando...' : `Até ${MAX_SECONDS / 60} minutos por gravação.`}
        </p>
        <div className="mt-5">
          {recording ? (
            <Button variant="help" size="lg" onClick={stop}>
              <Square size={18} aria-hidden /> Parar gravação
            </Button>
          ) : (
            <Button size="lg" onClick={start} disabled={!supported}>
              <Mic size={18} aria-hidden /> Começar a gravar
            </Button>
          )}
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-rose-700">
            {error}
          </p>
        )}
      </Card>

      <h2 className="mt-8 mb-3 font-display text-2xl font-semibold">Minhas gravações</h2>
      {recs.length ? (
        <ul className="space-y-3">
          {recs.map((r) => (
            <li key={r.id} className="card p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">
                  {formatDateTime(r.createdAt)} · {formatClock(r.durationSec)}
                </p>
                <button type="button" onClick={() => remove(r.id)} className="grid size-10 place-items-center rounded-full text-muted hover:bg-bege-100" aria-label={`Apagar gravação de ${formatDateTime(r.createdAt)}`}>
                  <Trash2 size={16} aria-hidden />
                </button>
              </div>
              <Player rec={r} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={Mic} title="Nenhuma gravação">
          Grave um minuto da sua abertura para começar.
        </EmptyState>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="mt-6"
        onClick={async () => {
          if (!window.confirm('Retirar a permissão e apagar todas as gravações deste aparelho?')) return
          for (const r of recs) if (persistent) await deleteItem('recordings', r.id)
          setRecs([])
          await updatePrefs({ recordingConsent: false })
        }}
      >
        Retirar permissão e apagar gravações
      </Button>
    </div>
  )
}
