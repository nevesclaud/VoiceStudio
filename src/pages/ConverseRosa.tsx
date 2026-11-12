import { Building2, ChevronLeft, ChevronRight, Expand, MapPin, MessageCircle, MonitorSmartphone, X } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { FullLogo } from '../components/Brand'
import { Card, PageHeader, SectionTitle } from '../components/ui'
import {
  contactFaq,
  photosApproved,
  PHOTO_HEIGHT,
  PHOTO_WIDTH,
  rosaPhotos,
  ROSA_WHATSAPP_DISPLAY,
  services,
  speakingTopics,
  whatsappMessages,
  whatsappUrl,
  type ContactTopic,
} from '../config/contact'
import { track } from '../services/analytics'

/** Botão que abre o WhatsApp com uma mensagem pronta. Só abre com clique; nada do app é enviado. */
function WhatsAppButton({ topic, children, variant = 'primary' }: { topic: ContactTopic; children: ReactNode; variant?: 'primary' | 'secondary' }) {
  const cls =
    variant === 'primary'
      ? 'bg-ink text-paper hover:bg-ink-soft shadow-sm'
      : 'bg-white text-ink border border-bege-300 hover:bg-bege-50'
  return (
    <a
      href={whatsappUrl(whatsappMessages[topic])}
      target="_blank"
      rel="noopener noreferrer"
      data-topic={topic}
      onClick={() => track('whatsapp_button_clicked', { topic })}
      className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-center font-semibold transition-colors ${cls}`}
    >
      <MessageCircle size={18} aria-hidden />
      <span>{children}</span>
      <span className="sr-only">(abre o WhatsApp em nova aba)</span>
    </a>
  )
}

function Photo({ index, className = '', eager = false }: { index: number; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false)
  const p = rosaPhotos[index]!
  if (failed) {
    return (
      <div className={`grid place-items-center bg-gradient-to-br from-azul-50 via-paper to-rose-50 ${className}`}>
        <FullLogo className="h-20" />
      </div>
    )
  }
  return (
    <img
      src={p.src}
      alt={p.alt}
      width={PHOTO_WIDTH}
      height={PHOTO_HEIGHT}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  )
}

function Gallery() {
  // Começa na segunda foto: a primeira já aparece na abertura.
  const [i, setI] = useState(rosaPhotos.length > 1 ? 1 : 0)
  const [zoom, setZoom] = useState(false)
  const n = rosaPhotos.length
  const closeRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLButtonElement>(null)
  const go = (d: number) => setI((x) => (x + d + n) % n)

  useEffect(() => {
    if (!zoom) return
    const opener = openerRef.current
    closeRef.current?.focus()
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(false)
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      opener?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom])

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(1)
    if (e.key === 'ArrowLeft') go(-1)
  }

  return (
    <section aria-roledescription="galeria" aria-label="Fotos da Rosa" onKeyDown={onKey}>
      <div className="relative mx-auto max-w-sm overflow-hidden rounded-[1.5rem] border border-line bg-bege-50">
        <Photo key={i} index={i} className="aspect-[3/4] w-full max-w-full anim-in" />
        <button
          ref={openerRef}
          type="button"
          onClick={() => setZoom(true)}
          className="absolute top-3 right-3 grid size-11 place-items-center rounded-full bg-white/90 text-ink shadow"
          aria-label="Ampliar foto"
        >
          <Expand size={18} aria-hidden />
        </button>
        {n > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} className="absolute top-1/2 left-3 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow" aria-label="Foto anterior">
              <ChevronLeft size={20} aria-hidden />
            </button>
            <button type="button" onClick={() => go(1)} className="absolute top-1/2 right-3 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow" aria-label="Próxima foto">
              <ChevronRight size={20} aria-hidden />
            </button>
          </>
        )}
      </div>
      <p className="mt-2 text-center text-sm text-muted" aria-live="polite">
        {rosaPhotos[i]!.caption} · {i + 1} de {n}
      </p>
      {n > 1 && (
        <div className="mt-2 flex justify-center gap-1" role="group" aria-label="Escolher foto">
          {rosaPhotos.map((p, k) => (
            <button key={p.src} type="button" onClick={() => setI(k)} aria-label={`Foto ${k + 1} de ${n}`} aria-current={k === i} className="grid size-11 place-items-center">
              <span className={`block h-2.5 rounded-full transition-all ${k === i ? 'w-6 bg-ink' : 'w-2.5 border border-ink/40 bg-white'}`} />
            </button>
          ))}
        </div>
      )}

      {zoom && (
        <div role="dialog" aria-modal="true" aria-label={`Foto ampliada: ${rosaPhotos[i]!.caption}`} className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/90 p-4" onClick={() => setZoom(false)}>
          <img
            src={rosaPhotos[i]!.src}
            alt={rosaPhotos[i]!.alt}
            width={PHOTO_WIDTH}
            height={PHOTO_HEIGHT}
            className="max-h-[80dvh] w-auto max-w-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="mt-4 flex gap-3" onClick={(e) => e.stopPropagation()}>
            {n > 1 && (
              <button type="button" onClick={() => go(-1)} className="grid size-12 place-items-center rounded-full bg-white text-ink" aria-label="Foto anterior">
                <ChevronLeft size={20} aria-hidden />
              </button>
            )}
            <button ref={closeRef} type="button" onClick={() => setZoom(false)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 font-semibold text-ink">
              <X size={18} aria-hidden /> Fechar
            </button>
            {n > 1 && (
              <button type="button" onClick={() => go(1)} className="grid size-12 place-items-center rounded-full bg-white text-ink" aria-label="Próxima foto">
                <ChevronRight size={20} aria-hidden />
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default function ConverseRosa() {
  const hasPhotos = photosApproved && rosaPhotos.length > 0
  return (
    <div>
      <PageHeader back title="Converse com a Rosa" subtitle="Conheça os atendimentos, palestras e formas de contato." />

      {/* 1. Abertura */}
      <section aria-labelledby="rosa-hero" className="overflow-hidden rounded-[1.5rem] border border-line bg-white">
        <div className="grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {hasPhotos ? (
            <Photo index={0} eager className="aspect-[4/3] h-full w-full max-w-full object-[50%_22%] sm:aspect-auto sm:object-center" />
          ) : (
            <div className="grid min-h-48 place-items-center bg-gradient-to-br from-azul-50 via-paper to-rose-50">
              <FullLogo className="h-24" />
            </div>
          )}
          <div className="flex flex-col gap-4 p-5 sm:p-6">
            <div>
              <h2 id="rosa-hero" className="font-display text-3xl font-semibold">
                Rosa Neves
              </h2>
              <p className="text-sm text-muted">Psicoterapeuta, professora, palestrante e especialista em comportamento humano</p>
            </div>
            <p className="text-ink-soft">
              Oi, eu sou a Rosa Neves. Trabalho com comportamento humano e ansiedade há mais de 15 anos. Meu objetivo é ajudar pessoas a compreender melhor o que sentem e encontrar ferramentas práticas para o dia a dia.
            </p>
            <ul className="flex flex-wrap gap-2" aria-label="Atuação">
              {['Mais de 15 anos de experiência', 'Ansiedade e emoções', 'Método INTEGRA'].map((t) => (
                <li key={t} className="rounded-full bg-azul-50 px-3 py-1.5 text-sm">
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <WhatsAppButton topic="geral">Falar com a Rosa</WhatsAppButton>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Galeria */}
      {hasPhotos && rosaPhotos.length > 1 && (
        <>
          <SectionTitle>Fotos</SectionTitle>
          <Gallery />
        </>
      )}

      {/* 3. Atendimentos individuais */}
      <SectionTitle id="atendimentos">Atendimentos individuais</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose-700">
              <MapPin size={20} aria-hidden />
            </span>
            <div>
              <p className="font-semibold">Consulta presencial</p>
              <p className="text-sm text-muted">{services.location}</p>
            </div>
          </div>
          <p className="text-sm text-ink-soft">Encontro presencial, com horário agendado.</p>
          <div className="mt-auto">
            <WhatsAppButton topic="presencial">Quero uma consulta presencial</WhatsAppButton>
          </div>
        </Card>
        <Card className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-azul-100 text-azul-600">
              <MonitorSmartphone size={20} aria-hidden />
            </span>
            <div>
              <p className="font-semibold">Consulta online</p>
              <p className="text-sm text-muted">Por agendamento</p>
            </div>
          </div>
          <p className="text-sm text-ink-soft">Atendimento a distância, com horário agendado.</p>
          <div className="mt-auto">
            <WhatsAppButton topic="online">Quero uma consulta online</WhatsAppButton>
          </div>
        </Card>
      </div>

      <Card className="mt-3">
        <h3 className="font-semibold">Valores</h3>
        <dl className="mt-3 divide-y divide-line">
          <div className="flex items-baseline justify-between gap-4 py-3">
            <dt>{services.consulta.label}</dt>
            <dd className="font-display text-2xl font-semibold tabular-nums">{services.consulta.price}</dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 py-3">
            <dt>{services.mensal.label}</dt>
            <dd className="font-display text-2xl font-semibold tabular-nums">{services.mensal.price}</dd>
            <dd className="mt-1 basis-full text-sm text-muted">{services.mensal.note}</dd>
          </div>
        </dl>
        <p className="mb-3 text-xs text-muted">Os valores valem para os formatos presencial e online.</p>
        <WhatsAppButton topic="mensal" variant="secondary">
          Informações sobre acompanhamento mensal
        </WhatsAppButton>
      </Card>

      {/* 4. Palestras */}
      <SectionTitle id="palestras">Palestras e treinamentos</SectionTitle>
      <Card className="bg-gradient-to-br from-white to-salvia-50">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-salvia-100 text-salvia-700">
            <Building2 size={20} aria-hidden />
          </span>
          <p className="text-ink-soft">
            Para gestores, RH, escolas e instituições. Rosa também realiza palestras e treinamentos sobre comportamento humano, inteligência emocional, ansiedade, comunicação e saúde emocional, com linguagem acessível e atividades práticas.
          </p>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2" aria-label="Temas">
          {speakingTopics.map((t) => (
            <li key={t} className="rounded-2xl border border-salvia-100 bg-white px-4 py-3 text-sm font-medium">
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-4 mb-3 text-sm text-muted">O orçamento é feito diretamente com a Rosa.</p>
        <WhatsAppButton topic="palestra">Solicitar palestra ou treinamento</WhatsAppButton>
      </Card>

      {/* 5. Perguntas frequentes */}
      <SectionTitle>Perguntas frequentes</SectionTitle>
      <div className="space-y-2">
        {contactFaq.map((f) => (
          <details key={f.q} className="card group p-0">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 font-medium">
              {f.q}
              <ChevronRight size={18} className="shrink-0 text-muted transition-transform group-open:rotate-90" aria-hidden />
            </summary>
            <p className="px-5 pb-4 text-ink-soft">{f.a}</p>
          </details>
        ))}
      </div>

      {/* 6. Contato final */}
      <section aria-labelledby="contato-final" className="mt-8 rounded-[1.5rem] bg-azul-50 p-6 text-center">
        <h2 id="contato-final" className="font-display text-2xl font-semibold">
          Quer entender qual formato faz sentido para você?
        </h2>
        <p className="mt-2 text-ink-soft">Entre em contato e tire suas dúvidas.</p>
        <div className="mx-auto mt-5 max-w-sm">
          <WhatsAppButton topic="geral">Conversar pelo WhatsApp</WhatsAppButton>
        </div>
        <p className="mt-3 text-xs text-muted">
          O contato direciona ao WhatsApp ({ROSA_WHATSAPP_DISPLAY}) e o atendimento depende de disponibilidade e agendamento. Nenhuma informação sua do app é enviada.
        </p>
      </section>
    </div>
  )
}
