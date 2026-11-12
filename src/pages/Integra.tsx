import { ArrowRight, Brain, Heart, Leaf, Sun } from 'lucide-react'
import { Link } from 'react-router'
import { FullLogo } from '../components/Brand'
import { Card, Notice, PageHeader, SectionTitle, Toggle, toneClasses } from '../components/ui'
import { brand } from '../config/brand'
import { integraPaths, integraSteps, spirituality } from '../content/integra'
import { exerciseById } from '../content/exercises'
import { useApp } from '../services/store'

const icons = { emocoes: Heart, corpo: Leaf, mente: Brain, valores: Sun }

export default function Integra() {
  const { prefs, updatePrefs } = useApp()
  return (
    <div>
      <PageHeader back eyebrow={brand.methodName} title="Mente, corpo e comportamento, juntos" subtitle="O INTEGRA olha para a ansiedade de forma conectada. Os caminhos abaixo se complementam, e todos são opcionais." />

      <Card className="bg-gradient-to-br from-azul-50 via-white to-rose-50 text-center">
        <FullLogo className="mx-auto h-20" />
        <p className="mt-3 text-sm text-ink-soft">{brand.methodTagline}</p>
      </Card>

      <SectionTitle>Um jeito de usar o app</SectionTitle>
      <ol className="grid gap-3 sm:grid-cols-3">
        {integraSteps.map((s, i) => (
          <li key={s.title} className="card p-4">
            <p className="text-xs font-semibold text-azul-600">{i + 1}</p>
            <p className="font-display text-xl font-semibold">{s.title}</p>
            <p className="mt-1 text-sm text-muted">{s.text}</p>
          </li>
        ))}
      </ol>

      {integraPaths.map((p) => {
        const Icon = icons[p.id]
        const tone = toneClasses[p.tone]
        return (
          <section key={p.id} aria-labelledby={`p-${p.id}`} className="mt-8">
            <div className="flex items-center gap-3">
              <span className={`grid size-11 place-items-center rounded-2xl ${tone.icon}`}>
                <Icon size={20} aria-hidden />
              </span>
              <div>
                <h2 id={`p-${p.id}`} className="font-display text-2xl font-semibold">
                  {p.title}
                </h2>
                <p className="text-sm text-muted">{p.subtitle}</p>
              </div>
            </div>
            <p className="mt-3 text-ink-soft">{p.intro}</p>
            <ul className="mt-4 space-y-3">
              {p.micro.map((m) => {
                const ex = m.exerciseId ? exerciseById(m.exerciseId) : undefined
                return (
                  <li key={m.title} className={`rounded-2xl border p-4 ${tone.bg} ${tone.border}`}>
                    <p className="font-semibold">{m.title}</p>
                    <p className="mt-1 text-sm text-ink-soft">{m.text}</p>
                    {ex && (
                      <Link to={`/praticar/${ex.id}`} className="mt-2 inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-azul-600">
                        Prática: {ex.title} <ArrowRight size={14} aria-hidden />
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
            <details className="mt-3 rounded-2xl bg-white p-4">
              <summary className="cursor-pointer font-medium">Perguntas para refletir</summary>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
                {p.reflections.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </details>
          </section>
        )
      })}

      <section className="mt-8 rounded-[1.25rem] border border-line bg-white p-5">
        <Toggle label="Mostrar reflexões sobre espiritualidade" description="Opcional. Só aparece se você quiser." checked={prefs.showSpirituality} onChange={(v) => updatePrefs({ showSpirituality: v })} />
        {prefs.showSpirituality && (
          <div className="mt-3 border-t border-line pt-4">
            <p className="font-display text-xl font-semibold">{spirituality.title}</p>
            <p className="mt-2 text-sm text-ink-soft">{spirituality.intro}</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
              {spirituality.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">{spirituality.note}</p>
          </div>
        )}
      </section>

      <div className="mt-6">
        <Notice>Caminhar, meditar ou ter fé podem fazer bem, mas não substituem tratamento profissional quando ele é necessário.</Notice>
      </div>
      <p className="mt-6 text-sm">
        <Link to="/rosa" className="text-azul-600 underline underline-offset-2">
          Quem está por trás do INTEGRA
        </Link>
      </p>
    </div>
  )
}
