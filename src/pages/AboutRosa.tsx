import { AtSign, ExternalLink } from 'lucide-react'
import { RosaPortrait } from '../components/Brand'
import { Card, PageHeader, SectionTitle } from '../components/ui'
import { brand, rosaProfile } from '../config/brand'
import { links } from '../config/links'
import { Link } from 'react-router'

export default function AboutRosa() {
  return (
    <div>
      <PageHeader back title="Quem está por trás do INTEGRA" />
      <div className="overflow-hidden rounded-[1.5rem] border border-line">
        <RosaPortrait className="aspect-[4/3] w-full" />
      </div>
      <h2 className="mt-6 font-display text-3xl font-semibold">{rosaProfile.name}</h2>
      <p className="mt-1 text-muted">{rosaProfile.roles}</p>
      <div className="mt-4 space-y-3 text-ink-soft">
        {rosaProfile.bio.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <SectionTitle>Temas do trabalho</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {rosaProfile.themes.map((t) => (
          <span key={t} className="rounded-full bg-azul-50 px-3 py-1.5 text-sm">
            {t}
          </span>
        ))}
        <span className="rounded-full bg-salvia-50 px-3 py-1.5 text-sm">{brand.methodName}</span>
      </div>

      <div className="mt-8 grid gap-3">
        <Link to="/converse-com-a-rosa" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-rose-600 px-5 font-semibold text-white">
          Converse com a Rosa: atendimentos e palestras
        </Link>
        {links.rosaWork && (
          <a href={links.rosaWork} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-5 font-semibold text-paper">
            Conhecer o trabalho da Rosa <ExternalLink size={16} aria-hidden />
            <span className="sr-only">(abre em nova aba)</span>
          </a>
        )}
        {links.instagram.url && (
          <a href={links.instagram.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-bege-300 bg-white px-5 font-semibold">
            <AtSign size={18} aria-hidden /> Instagram {links.instagram.handle}
            <span className="sr-only">(abre em nova aba)</span>
          </a>
        )}
      </div>

      <Card className="mt-8 bg-bege-50">
        <p className="text-sm text-ink-soft">
          Este app é um material de autocuidado e psicoeducação criado a partir do trabalho da Rosa. Ele não é atendimento, não tem chat com a Rosa e não substitui acompanhamento profissional. Para falar com ela, use a área Converse com a Rosa.
        </p>
        <Link to="/limites" className="mt-2 inline-block text-sm text-azul-600 underline underline-offset-2">
          Limites e cuidados do app
        </Link>
      </Card>
    </div>
  )
}
