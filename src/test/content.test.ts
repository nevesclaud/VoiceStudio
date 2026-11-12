import { describe, expect, it } from 'vitest'
import { categories } from '../content/categories'
import { exercises, exerciseById } from '../content/exercises'
import { integraPaths } from '../content/integra'
import { journeys } from '../content/journeys'
import { questions } from '../content/onboarding'
import { sosBlocks } from '../content/sos'
import { gradualPlan, openingModels, speakingThoughts } from '../content/speaking'

/** Junta todo o texto visível do conteúdo, para verificações de linguagem e segurança. */
function allText(): string[] {
  const out: string[] = []
  const walk = (v: unknown) => {
    if (typeof v === 'string') out.push(v)
    else if (Array.isArray(v)) v.forEach(walk)
    else if (v && typeof v === 'object') Object.values(v).forEach(walk)
  }
  walk([exercises, categories, journeys, questions, integraPaths, sosBlocks, speakingThoughts, gradualPlan])
  out.push(...openingModels.map((m) => m.build({ topic: 'tema', audience: 'público', duration: '5 min', goal: 'aprendam' })))
  return out
}

describe('biblioteca de práticas', () => {
  it('tem pelo menos 20 práticas, com ids únicos', () => {
    expect(exercises.length).toBeGreaterThanOrEqual(20)
    expect(new Set(exercises.map((e) => e.id)).size).toBe(exercises.length)
  })

  it('inclui as 12 técnicas do catálogo SOS', () => {
    const sos = exercises.filter((e) => e.origin === 'sos').map((e) => e.id)
    for (const id of ['visao-periferica', 'distanciamento', 'e-dai-se', 'suspiro-fisiologico', 'respiracao-cadenciada', 'estimulacao-bilateral', 'butterfly-reset', 'tapping', 'mandibula', 'estimulo-frio', 'backward-spin', 'grounding']) {
      expect(sos).toContain(id)
    }
  })

  it('todas têm objetivo, preparo, passos, quando parar e organização em mente, respiração ou corpo', () => {
    for (const e of exercises) {
      expect(e.steps.length, e.id).toBeGreaterThanOrEqual(3)
      expect(e.preparation.length, e.id).toBeGreaterThan(0)
      expect(e.whenToStop, e.id).toBeTruthy()
      expect(['mente', 'respiracao', 'corpo']).toContain(e.pillar)
    }
  })

  it('técnicas de evidência incerta ficam fora da recomendação automática e marcadas para revisão', () => {
    for (const id of ['backward-spin', 'tapping', 'estimulacao-bilateral', 'butterfly-reset', 'estimulo-frio']) {
      const e = exerciseById(id)!
      expect(e.autoRecommend, id).toBe(false)
      expect(e.reviewStatus, id).toBe('revisao-necessaria')
      expect(e.caution, id).toBeTruthy()
    }
  })

  it('nenhuma prática pede retenção de ar, hiperventilação ou frio intenso', () => {
    const forbidden = [/segure o ar/i, /prenda a respira/i, /reten[cç][aã]o de ar (por|durante)/i, /respire r[aá]pido/i, /\bgelo\b(?! ou)/i, /banho gelado(?!,)/i, /imers[aã]o (em|na) [aá]gua/i]
    for (const e of exercises) {
      for (const s of e.steps) {
        const t = typeof s.text === 'string' ? s.text : s.text.f
        for (const re of forbidden) expect(re.test(t), `${e.id}: ${t}`).toBe(false)
      }
    }
  })
})

describe('áreas, trilhas e onboarding', () => {
  it('tem as 12 áreas A a L, cada uma com 3 a 5 práticas existentes', () => {
    expect(categories.map((c) => c.letter).join('')).toBe('ABCDEFGHIJKL')
    for (const c of categories) {
      expect(c.exerciseIds.length, c.id).toBeGreaterThanOrEqual(3)
      expect(c.exerciseIds.length, c.id).toBeLessThanOrEqual(5)
      for (const id of [...c.exerciseIds, c.during.exerciseId]) expect(exerciseById(id), `${c.id} → ${id}`).toBeDefined()
      expect(c.whatHappens.length).toBeGreaterThan(0)
      expect(c.before.length).toBeGreaterThan(0)
      expect(c.after.length).toBeGreaterThan(0)
      expect(c.plan.length).toBeGreaterThan(0)
    }
  })

  it('cada área tem conteúdo próprio (sem textos repetidos entre áreas)', () => {
    const seen = new Set<string>()
    for (const c of categories) for (const t of [...c.whatHappens, ...c.before, ...c.after]) {
      const s = String(t)
      expect(seen.has(s), s).toBe(false)
      seen.add(s)
    }
  })

  it('trilhas de 7, 14 e 21 dias, com práticas existentes de 1 a 8 minutos', () => {
    expect(journeys.map((j) => j.days)).toEqual([7, 14, 21])
    for (const j of journeys) {
      expect(j.plan.length, j.id).toBe(j.days)
      for (const d of j.plan) {
        const e = exerciseById(d.exerciseId)
        expect(e, `${j.id}: ${d.exerciseId}`).toBeDefined()
        expect(e!.durationMin).toBeLessThanOrEqual(8)
        expect(d.question && d.action && d.text).toBeTruthy()
      }
    }
  })

  it('preserva as perguntas do quiz SOS Ansiedade', () => {
    const titles = questions.filter((q) => q.origin === 'quiz').map((q) => q.title)
    expect(titles).toEqual(
      expect.arrayContaining([
        'De 0 a 10, qual o nível da sua ansiedade normalmente?',
        'Com que frequência a ansiedade sobe de forma forte?',
        'Em qual momento ela mais aparece?',
        'O que você sente primeiro quando ela sobe?',
        'O que você já tentou pra controlar isso?',
        'Isso já te fez evitar alguma coisa importante, uma reunião, um evento, uma viagem?',
        'O que mais te frustra quando a ansiedade sobe?',
      ]),
    )
  })
})

describe('linguagem e limites éticos', () => {
  const text = allText()

  it('não promete cura nem resultado garantido', () => {
    const banned = [/\bcura(r)?\b/i, /garant(e|ido|ia)/i, /padr[aã]o (de tens[aã]o )?confirmado/i, /t[eé]cnica secreta/i, /elimin(a|ar) (a|sua) ansiedade/i, /a ci[eê]ncia garante/i, /resultado certo/i]
    for (const t of text) for (const re of banned) expect(re.test(t), t).toBe(false)
  })

  it('não usa travessões na interface', () => {
    for (const t of text) expect(/[—–]/.test(t), t).toBe(false)
  })

  it('marcadores de forma de tratamento estão bem formados', () => {
    for (const t of text) {
      const opens = (t.match(/\[\[/g) ?? []).length
      const valid = (t.match(/\[\[[^|\]]*\|[^|\]]*\|[^\]]*\]\]/g) ?? []).length
      expect(valid, t).toBe(opens)
    }
  })
})
