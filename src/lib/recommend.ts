import { categories } from '../content/categories'
import { exercises } from '../content/exercises'
import type { Exercise, OnboardingAnswers, Pillar, UserPreferences } from '../types'

/**
 * Personalização simples e transparente. Não calcula diagnóstico nem "tipo de ansiedade":
 * só combina as respostas com práticas e trilhas, e explica o motivo de cada sugestão.
 */

export interface Suggestion {
  exercise: Exercise
  reason: string
}

export interface StartPlan {
  suggestions: Suggestion[]
  journeyId: 'comecando' | 'mais-calma' | 'coragem'
  journeyReason: string
  categoryIds: string[]
  pillar: Pillar | null
  reasons: string[]
}

const pillarText: Record<Pillar, string> = {
  mente: 'pelos pensamentos',
  corpo: 'pelo corpo',
  respiracao: 'pela respiração',
}

export function eligible(prefs: Pick<UserPreferences, 'avoidBreathFocus'>): Exercise[] {
  return exercises.filter((e) => e.autoRecommend && !(prefs.avoidBreathFocus && e.breathFocus))
}

function fitsLength(e: Exercise, length: OnboardingAnswers['length']): boolean {
  if (length === 'curtos') return e.durationMin <= 3
  if (length === 'longos') return e.durationMin >= 4
  return true
}

export function buildStartPlan(answers: OnboardingAnswers, prefs: Pick<UserPreferences, 'avoidBreathFocus'>): StartPlan {
  const pool = eligible(prefs)
  const picked: Suggestion[] = []
  const reasons: string[] = []
  const take = (id: string, reason: string) => {
    const ex = pool.find((e) => e.id === id)
    if (ex && !picked.some((p) => p.exercise.id === id)) picked.push({ exercise: ex, reason })
  }

  const pillar = answers.firstSign ?? null
  const categoryIds = (answers.hardest ?? []).filter((id) => categories.some((c) => c.id === id))

  // 1) Sinal que aparece primeiro
  if (pillar) {
    reasons.push(`Você contou que costuma perceber a ansiedade primeiro ${pillarText[pillar]}.`)
    const byPillar = pool.filter((e) => e.pillar === pillar && fitsLength(e, answers.length))
    const first = pillar === 'corpo' ? 'pontos-apoio' : pillar === 'respiracao' ? 'respiracao-cadenciada' : 'grounding'
    const firstEx = pool.find((e) => e.id === first)
    if (firstEx) take(first, `Começa ${pillarText[pillar]}, onde você disse que nota os primeiros sinais.`)
    else if (byPillar[0]) take(byPillar[0].id, `Começa ${pillarText[pillar]}, onde você disse que nota os primeiros sinais.`)
    // Se evitou foco em respiração, ou a categoria respiração está indisponível, cai no corpo
    if (picked.length === 0) take('pontos-apoio', 'Uma prática de corpo, sem foco na respiração.')
  }

  // 2) O que está mais difícil hoje
  for (const id of categoryIds) {
    const cat = categories.find((c) => c.id === id)
    if (!cat) continue
    const ex = cat.exerciseIds.map((x) => pool.find((e) => e.id === x)).find((e) => e && !picked.some((p) => p.exercise.id === e.id) && fitsLength(e, answers.length))
    if (ex) take(ex.id, `Ligada ao que você marcou como difícil: ${cat.title.toLowerCase()}.`)
    if (picked.length >= 3) break
  }
  if (categoryIds.length) reasons.push(`Você marcou como mais difícil hoje: ${categoryIds.map((id) => categories.find((c) => c.id === id)?.title.toLowerCase()).join(', ')}.`)

  // 3) Momento em que mais aparece
  if (picked.length < 3) {
    const byMoment: Record<string, [string, string]> = {
      noite: ['preparacao-sono', 'Você disse que a ansiedade aparece mais antes de dormir.'],
      trabalho: ['uma-tarefa', 'Você disse que ela aparece mais no trabalho ou nos estudos.'],
      social: ['fatos-hipoteses', 'Você disse que ela aparece mais em situações sociais.'],
      'sem-motivo': ['gatilhos', 'Você disse que às vezes ela vem sem motivo claro. Entender padrões pode ajudar.'],
    }
    const m = answers.moment ? byMoment[answers.moment] : undefined
    if (m) take(m[0], m[1])
  }

  // 4) Completar com práticas curtas e de baixo risco
  for (const id of ['pontos-apoio', 'grounding', 'mandibula', 'observar-pensamentos', 'relaxamento-muscular']) {
    if (picked.length >= 3) break
    take(id, 'Uma prática simples, boa para começar.')
  }

  if (answers.length === 'curtos') reasons.push('Você prefere práticas curtas, então priorizamos as de poucos minutos.')
  if (answers.length === 'longos') reasons.push('Você prefere práticas mais longas, então incluímos algumas de 4 minutos ou mais.')

  // Trilha inicial
  let journeyId: StartPlan['journeyId'] = 'comecando'
  let journeyReason = 'Uma semana para observar como a ansiedade aparece em você, antes de qualquer mudança.'
  if (answers.avoid === 'sempre' || answers.avoid === 'as-vezes' || answers.change === 'conquistar') {
    journeyId = 'coragem'
    journeyReason = 'Você contou que a ansiedade já fez você evitar coisas importantes. Essa trilha propõe se aproximar delas aos poucos, sempre por escolha.'
  } else if (answers.frequency === 'quase-todo-dia' || answers.change === 'sono' || answers.change === 'paz') {
    journeyId = 'mais-calma'
    journeyReason = 'Você busca mais calma no dia a dia. Essa trilha reúne pausas curtas para incluir na rotina.'
  }
  if (answers.heard === 'nunca' || answers.heard === 'mais-ou-menos') {
    journeyReason += ' Se preferir começar entendendo melhor a ansiedade, a trilha "Começando a me entender" também é uma boa porta.'
  }

  return { suggestions: picked.slice(0, 3), journeyId, journeyReason, categoryIds, pillar, reasons }
}

/** Sugestão para agora, a partir do último check-in e das preferências. */
export function suggestNow(level: number | null, prefs: Pick<UserPreferences, 'avoidBreathFocus' | 'shortPractices' | 'answers'>, hour = new Date().getHours()): Suggestion {
  const pool = eligible(prefs)
  const find = (id: string) => pool.find((e) => e.id === id)
  let id = 'pontos-apoio'
  let reason = 'Uma prática curta para perceber o corpo e se situar.'
  if (level !== null && level >= 7) {
    id = 'pontos-apoio'
    reason = 'Com a ansiedade alta, uma prática curta de corpo costuma ser mais possível do que pensar muito.'
  } else if (hour >= 21 || hour < 5) {
    id = 'preparacao-sono'
    reason = 'Está tarde. Uma transição calma pode ajudar a mente a desacelerar.'
  } else if (level !== null && level >= 4) {
    id = prefs.answers.firstSign === 'mente' ? 'grounding' : prefs.avoidBreathFocus ? 'mandibula' : 'respiracao-cadenciada'
    reason = 'Para um desconforto médio, algo de poucos minutos que você pode fazer onde estiver.'
  } else if (level !== null) {
    id = 'gatilhos'
    reason = 'Com a ansiedade mais baixa, é um bom momento para observar padrões com calma.'
  }
  const ex = find(id) ?? find('pontos-apoio') ?? pool[0]!
  return { exercise: ex, reason }
}
