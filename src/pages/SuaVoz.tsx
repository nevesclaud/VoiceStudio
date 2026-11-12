import { CheckCircle2, LifeBuoy, Send } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Button, ButtonLink, ChoiceList, Notice, PageHeader, TextArea, TextInput } from '../components/ui'
import { track } from '../services/analytics'
import { getRemote, isRemoteAvailable, remoteErrorCode } from '../services/remote'
import { useApp } from '../services/store'

const categories = [
  { label: 'Sugestão', value: 'sugestao' },
  { label: 'Dúvida', value: 'duvida' },
  { label: 'Problema técnico', value: 'problema' },
  { label: 'Elogio', value: 'elogio' },
]

const LOCAL_KEY = 'integra-voz-envios'
const LOCAL_MAX_PER_HOUR = 3

/** Limite local (primeira barreira). O limite real é aplicado no servidor. */
function localSends(): number[] {
  try {
    const raw = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]') as unknown
    return Array.isArray(raw) ? raw.filter((n): n is number => typeof n === 'number' && Date.now() - n < 3600_000) : []
  } catch {
    return []
  }
}
function rememberSend(): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([...localSends(), Date.now()]))
  } catch {
    /* sem armazenamento: o servidor ainda limita */
  }
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export default function SuaVoz() {
  const { prefs } = useApp()
  const configured = isRemoteAvailable()
  const [category, setCategory] = useState('')
  const [body, setBody] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // armadilha para robôs (campo invisível)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState('')
  const openedAt = useRef(Date.now())
  const hpId = useId()

  useEffect(() => {
    openedAt.current = Date.now()
  }, [])

  const validate = (): string => {
    if (!category) return 'Escolha uma categoria.'
    if (body.trim().length < 5) return 'Escreva sua mensagem (pelo menos 5 caracteres).'
    if (body.length > 2000) return 'A mensagem pode ter no máximo 2.000 caracteres.'
    if (email.trim() && !EMAIL.test(email.trim())) return 'Confira o e-mail, ou deixe em branco.'
    if (localSends().length >= LOCAL_MAX_PER_HOUR) return 'Você já enviou algumas mensagens nesta hora. Tente de novo mais tarde.'
    return ''
  }

  const send = async () => {
    const v = validate()
    setError(v)
    if (v) return
    const remote = getRemote()
    if (!remote) return
    setStatus('sending')
    const { error: err } = await remote.rpc('submit_message', {
      p_category: category,
      p_body: body.trim(),
      p_name: name.trim() || null,
      p_email: email.trim() || null,
      p_visitor: prefs.visitorId,
      p_website: website,
      p_elapsed_ms: Date.now() - openedAt.current,
    })
    if (err) {
      const code = remoteErrorCode(err)
      setStatus('idle')
      setError(
        code === 'rate_limited'
          ? 'Muitos envios em pouco tempo. Tente de novo mais tarde.'
          : code === 'offline'
            ? 'Sem conexão com a internet. Sua mensagem continua aqui; tente enviar de novo quando estiver on-line.'
            : code === 'invalid'
              ? 'Confira os campos e tente de novo.'
              : 'Não foi possível enviar agora. Tente de novo em alguns minutos.',
      )
      return
    }
    rememberSend()
    track('suggestion_submitted', { topic: category })
    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div>
        <PageHeader back title="Sua voz importa" />
        <div className="card p-6 text-center" role="status">
          <CheckCircle2 size={36} className="mx-auto text-salvia-700" aria-hidden />
          <p className="mt-3 font-display text-2xl font-semibold">Mensagem enviada. Obrigada por contribuir.</p>
          <p className="mt-2 text-ink-soft">{email.trim() ? 'Se for preciso, a resposta chega pelo e-mail que você informou.' : 'Como você não deixou e-mail, não haverá resposta direta.'}</p>
          <div className="mt-6 grid gap-3">
            <ButtonLink to="/">Voltar ao início</ButtonLink>
            <Button
              variant="secondary"
              onClick={() => {
                setCategory('')
                setBody('')
                setStatus('idle')
                openedAt.current = Date.now()
              }}
            >
              Enviar outra mensagem
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader back title="Sua voz importa" subtitle="Sugestões, dúvidas, problemas técnicos ou elogios. Tudo ajuda a melhorar o INTEGRA." />

      <Notice tone="alerta" title="Este canal não é atendimento">
        Não é atendimento emergencial nem consulta terapêutica, e as mensagens podem levar dias para serem lidas. Se você precisa de ajuda agora, use{' '}
        <Link to="/ajuda" className="font-semibold underline underline-offset-2">
          Preciso de ajuda agora
        </Link>{' '}
        ou ligue 188 (CVV) ou 192 (SAMU).
      </Notice>

      {!configured ? (
        <div className="mt-6 space-y-4">
          <Notice title="Envio ainda não disponível">O canal de mensagens está sendo preparado. Enquanto isso, você pode falar com a Rosa pela área Converse com a Rosa.</Notice>
          <ButtonLink to="/converse-com-a-rosa" variant="secondary">
            Converse com a Rosa
          </ButtonLink>
          {import.meta.env.DEV && <Notice tone="alerta" title="Aviso de desenvolvimento">Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (ver docs/SUPABASE.md).</Notice>}
        </div>
      ) : (
        <form
          className="mt-6 space-y-5"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            void send()
          }}
        >
          <div>
            <p className="label">Categoria</p>
            <ChoiceList label="Categoria" columns={2} value={category ? [category] : []} onChange={(v) => setCategory(v[0] ?? '')} options={categories} />
          </div>
          <div>
            <TextArea label="Mensagem" value={body} onChange={setBody} rows={6} placeholder="Escreva aqui." hint="Evite colocar informações de saúde ou dados pessoais de outras pessoas." />
            <p className="mt-1 text-right text-xs text-muted" aria-live="polite">
              {body.length}/2000
            </p>
          </div>
          <TextInput label="Nome (opcional)" value={name} onChange={setName} autoComplete="name" />
          <TextInput label="E-mail (opcional)" value={email} onChange={setEmail} autoComplete="email" hint="Só se quiser receber resposta. Usado apenas para responder esta mensagem." />

          {/* Armadilha: invisível para pessoas, preenchida por robôs. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor={hpId}>Site</label>
            <input id={hpId} tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>

          {error && (
            <p role="alert" className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </p>
          )}
          <Button type="submit" block size="lg" disabled={status === 'sending'}>
            <Send size={18} aria-hidden /> {status === 'sending' ? 'Enviando...' : 'Enviar mensagem'}
          </Button>
          <p className="text-xs text-muted">
            A mensagem vai para a Rosa e fica guardada com segurança. Você pode pedir a exclusão em Perfil.{' '}
            <Link to="/privacidade" className="underline underline-offset-2">
              Privacidade
            </Link>
          </p>
        </form>
      )}

      <div className="mt-8 flex items-center gap-2 text-sm text-muted">
        <LifeBuoy size={16} aria-hidden /> Em perigo imediato, ligue 192.
      </div>
    </div>
  )
}
