/** Tipos centrais do INTEGRA | Ansiedade. Conteúdo editável fica em src/content. */

export type Pillar = 'mente' | 'respiracao' | 'corpo'
export type Difficulty = 'leve' | 'moderada'
export type TextForm = 'f' | 'm' | 'n'

/** Texto que muda conforme a forma de tratamento escolhida pela pessoa. */
export type Gendered = string | { f: string; m: string; n: string }

export interface ExerciseStep {
  text: Gendered
  /** Duração sugerida da etapa, em segundos. Sem valor = a pessoa avança no seu ritmo. */
  seconds?: number
  /** Etapas de respiração mostram uma animação calma (ou contagem em texto com movimento reduzido). */
  breath?: 'inspire' | 'expire' | 'pausa-livre'
}

/**
 * Situação de revisão de cada prática.
 * - "conteudo-base": roteiro simples, de baixo risco, escrito para o app (ainda passará pela leitura da Rosa).
 * - "revisao-necessaria": nome vem do material SOS ou a evidência é incerta; aguarda validação da Rosa.
 */
export type ReviewStatus = 'conteudo-base' | 'revisao-necessaria'

export interface Exercise {
  id: string
  title: string
  pillar: Pillar
  /** Uma frase sobre o objetivo. */
  goal: Gendered
  /** Quando pode ajudar. */
  whenHelps: Gendered
  durationMin: number
  difficulty: Difficulty
  preparation: Gendered[]
  steps: ExerciseStep[]
  /** Quando parar ou trocar. */
  whenToStop: Gendered
  reviewStatus: ReviewStatus
  /** Observação de segurança ou de evidência, exibida antes de iniciar. */
  caution?: Gendered
  /** Se false, nunca entra em recomendações automáticas (só aparece na biblioteca). */
  autoRecommend: boolean
  /** Prática centrada na respiração; respeita a preferência "evitar foco na respiração". */
  breathFocus: boolean
  /** Origem do nome: catálogo do quiz SOS Ansiedade ou material escrito para o app. */
  origin: 'sos' | 'app'
  tags: string[]
  /** Pergunta de registro ao concluir. */
  reflection?: Gendered
}

export interface Category {
  id: string
  letter: string
  title: string
  short: string
  /** A situação humana primeiro, como pergunta. */
  hook: Gendered
  icon: string
  tone: 'azul' | 'rose' | 'salvia' | 'bege'
  whatHappens: Gendered[]
  before: Gendered[]
  during: { title: string; intro: Gendered; exerciseId: string }
  after: Gendered[]
  exerciseIds: string[]
  plan: { day: string; action: Gendered }[]
  supportPhrase: Gendered
  /** Link para uma área especial do app, se houver. */
  specialRoute?: { to: string; label: string }
}

export interface JourneyDay {
  title: string
  text: Gendered
  exerciseId: string
  question: Gendered
  action: Gendered
}

export interface Journey {
  id: string
  title: string
  days: number
  description: Gendered
  focus: string
  plan: JourneyDay[]
}

export interface CheckIn {
  id: string
  createdAt: number
  /** 0 a 10. null = "Ainda não sei". */
  level: number | null
  feeling?: string
  body?: string
  trigger?: string
  context: 'inicio' | 'antes' | 'depois' | 'pratica' | 'falar-antes' | 'falar-depois' | 'onboarding'
  note?: string
  exerciseId?: string
}

export interface JournalEntry {
  id: string
  createdAt: number
  updatedAt: number
  mode: 'rapida' | 'completa'
  situation?: string
  thought?: string
  emotion?: string
  body?: string
  reaction?: string
  alternative?: string
  learning?: string
  categoryId?: string
}

export interface PracticeSession {
  id: string
  exerciseId: string
  startedAt: number
  endedAt: number
  status: 'concluida' | 'interrompida'
  usefulness?: 'ajudou' | 'um-pouco' | 'nao-ajudou'
  note?: string
  source?: 'biblioteca' | 'ajuda' | 'trilha' | 'categoria' | 'falar'
}

export interface Recording {
  id: string
  createdAt: number
  durationSec: number
  mimeType: string
  blob: Blob
  label?: string
}

export interface OnboardingAnswers {
  hardest?: string[]
  usualLevel?: string
  nowLevel?: number | null
  frequency?: string
  moment?: string
  firstSign?: 'mente' | 'corpo' | 'respiracao'
  firstSignLabel?: string
  tried?: string
  avoid?: string
  self?: string
  frustration?: string
  change?: string
  length?: 'curtos' | 'longos' | 'tanto-faz'
  heard?: string
}

export interface UserPreferences {
  name: string
  textForm: TextForm
  onboarding: 'pendente' | 'concluido' | 'ignorado'
  answers: OnboardingAnswers
  shortPractices: boolean
  avoidBreathFocus: boolean
  reduceMotion: 'sistema' | 'sim'
  largerText: boolean
  showSpirituality: boolean
  favorites: string[]
  recordingConsent: boolean
  /** Estatísticas anônimas de uso (opcional, desligado por padrão). */
  shareStats: boolean
  /** Já foi perguntado sobre as estatísticas (para não perguntar de novo). */
  statsAsked: boolean
  /** Respostas dos primeiros passos compartilhadas com a Rosa (opcional, revogável). */
  quizShared: boolean
  /** Identificador aleatório deste aparelho, usado só no que a pessoa escolher enviar. */
  visitorId: string
}

export interface JourneyProgress {
  journeyId: string
  startedAt: number
  currentDay: number
  completedDays: number[]
  skippedDays: number[]
  updatedAt: number
}

/** Prática em andamento, para retomada. */
export interface ResumeState {
  exerciseId: string
  stepIndex: number
  savedAt: number
  source?: PracticeSession['source']
}

export interface SpeakingState {
  checklist: Record<string, boolean>
  opening?: { topic: string; audience: string; duration: string; goal: string; model: string; text: string }
  cards: string[]
  plan: Record<string, 'feito' | 'pulado' | undefined>
  planNotes: string
  whatWorked: string
  simulator: { totalMin: number; pauseEverySec: number }
}
