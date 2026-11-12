import type { OnboardingAnswers } from '../types'

/**
 * Primeiros passos, baseados no quiz SOS Ansiedade (guia.rosaneves.com.br/quiz/).
 *
 * As perguntas e respostas marcadas com origin "quiz" foram preservadas do quiz original.
 * Mudanças documentadas em docs/CONTEUDO.md, resumo:
 * - Gênero virou "Como prefere que o app fale com você?" (com opção neutra). Idade não é coletada.
 * - Em "O que você sente primeiro", a resposta "Não sou capaz de gerir meu tempo com eficiência"
 *   estava ligada ao caminho Respiração, mas não descreve um sinal. Foi trocada por
 *   "A respiração fica curta e o peito aperta", texto do próprio resultado Respiração do quiz.
 *   PENDENTE: confirmar com a Rosa.
 * - "De 0 a 10, o quanto você quer resolver isso agora?" ficou de fora: é pergunta de venda, não de cuidado.
 * - Leituras simuladas ("padrão de tensão confirmado"), gráfico "Você x Normal" e a frase
 *   "o corpo reage primeiro" foram removidos por não terem base nas respostas.
 * - Novas perguntas pedidas para o app: o que está mais difícil hoje, desconforto agora (0 a 10),
 *   e preferência por práticas curtas ou longas.
 */

export interface QuizOption {
  label: string
  value: string
  /** Rótulo neutro opcional; o texto padrão já é usado nas formas f/m via [[...]] */
}

export interface QuizQuestion {
  key: keyof OnboardingAnswers
  origin: 'quiz' | 'app'
  title: string
  helper?: string
  multi?: boolean
  max?: number
  options: QuizOption[]
}

export const hardestOptions: QuizOption[] = [
  { label: 'Falar em público ou em reuniões', value: 'falar-em-publico' },
  { label: 'Medo de julgamento e situações sociais', value: 'ansiedade-social' },
  { label: 'Dormir e desligar a mente à noite', value: 'sono' },
  { label: 'Pensamentos acelerados e preocupação', value: 'pensamentos-acelerados' },
  { label: 'Pressão e cobrança no trabalho', value: 'trabalho' },
  { label: 'Adiar coisas e medo de errar', value: 'perfeccionismo' },
  { label: 'Sensações fortes no corpo', value: 'sensacoes-fisicas' },
  { label: 'Provas, entrevistas ou conversas importantes', value: 'provas-entrevistas' },
  { label: 'Sobrecarga com família e responsabilidades', value: 'sobrecarga' },
  { label: 'Irritação, impaciência ou culpa', value: 'irritabilidade' },
  { label: 'Mudanças, viagens e lugares novos', value: 'mudancas' },
  { label: 'Insegurança e autocrítica', value: 'autocritica' },
]

export const questions: QuizQuestion[] = [
  {
    key: 'hardest',
    origin: 'app',
    title: 'O que está mais difícil hoje?',
    helper: 'Escolha até três. Você pode mudar depois.',
    multi: true,
    max: 3,
    options: hardestOptions,
  },
  {
    key: 'usualLevel',
    origin: 'quiz',
    title: 'De 0 a 10, qual o nível da sua ansiedade normalmente?',
    helper: 'Não existe resposta certa ou errada aqui. É só a sua percepção.',
    options: [
      { label: '1 a 3, baixa', value: '1-3' },
      { label: '4 a 6, média', value: '4-6' },
      { label: '7 a 8, alta', value: '7-8' },
      { label: '9 a 10, muito alta', value: '9-10' },
    ],
  },
  {
    key: 'frequency',
    origin: 'quiz',
    title: 'Com que frequência a ansiedade sobe de forma forte?',
    options: [
      { label: 'Quase todos os dias', value: 'quase-todo-dia' },
      { label: 'Algumas vezes por semana', value: 'algumas-vezes' },
      { label: 'Poucas vezes, mas quando bate é forte', value: 'poucas-forte' },
    ],
  },
  {
    key: 'moment',
    origin: 'quiz',
    title: 'Em qual momento ela mais aparece?',
    options: [
      { label: 'No trabalho ou nos estudos', value: 'trabalho' },
      { label: 'Antes de dormir', value: 'noite' },
      { label: 'Em situações sociais', value: 'social' },
      { label: 'Sem um motivo claro, do nada', value: 'sem-motivo' },
    ],
  },
  {
    key: 'firstSign',
    origin: 'quiz',
    title: 'O que você sente primeiro quando ela sobe?',
    helper: 'Escolha o que aparece com mais frequência.',
    options: [
      { label: 'O coração dispara, o corpo fica em alerta', value: 'corpo' },
      { label: 'A respiração fica curta e o peito aperta', value: 'respiracao' },
      { label: 'A mente acelera e não para de pensar no que pode dar errado', value: 'mente' },
      { label: 'Uma sensação de que algo ruim vai acontecer, mesmo sem motivo', value: 'mente:pressentimento' },
      { label: 'Vontade de sair ou fugir da situação', value: 'corpo:fuga' },
      { label: 'Uma sensação de estar sem controle sobre [[mim mesma|mim mesmo|mim]]', value: 'mente:controle' },
    ],
  },
  {
    key: 'tried',
    origin: 'quiz',
    title: 'O que você já tentou pra controlar isso?',
    options: [
      { label: 'Respirar fundo', value: 'respirar' },
      { label: 'Meditação', value: 'meditacao' },
      { label: 'Terapia', value: 'terapia' },
      { label: 'Nada, só espero passar', value: 'nada' },
    ],
  },
  {
    key: 'avoid',
    origin: 'quiz',
    title: 'Isso já te fez evitar alguma coisa importante, uma reunião, um evento, uma viagem?',
    options: [
      { label: 'Sim, às vezes', value: 'as-vezes' },
      { label: 'Sim, sempre acontece', value: 'sempre' },
      { label: 'Já pensei em evitar, mas fui mesmo assim', value: 'foi-mesmo-assim' },
      { label: 'Ainda não chegou nesse ponto', value: 'nao' },
    ],
  },
  {
    key: 'self',
    origin: 'quiz',
    title: 'Como a ansiedade afeta como você se sente [[consigo mesma|consigo mesmo|consigo]]?',
    options: [
      { label: '[[Me sinto sozinha nisso|Me sinto sozinho nisso|Sinto solidão nisso]], como se ninguém entendesse', value: 'sozinha' },
      { label: '[[Fico irritada|Fico irritado|Fico com irritação]] ou impaciente com as pessoas por perto', value: 'irritada' },
      { label: 'Sinto que estou falhando por não conseguir controlar isso', value: 'falhando' },
      { label: 'Não afeta muito como eu me vejo, só o momento em si', value: 'pouco' },
    ],
  },
  {
    key: 'frustration',
    origin: 'quiz',
    title: 'O que mais te frustra quando a ansiedade sobe?',
    options: [
      { label: 'Saber que deveria me acalmar e não conseguir', value: 'nao-consegue' },
      { label: 'Não ter ideia do que fazer na hora', value: 'sem-ideia' },
      { label: 'A vergonha de sentir isso na frente de outras pessoas', value: 'vergonha' },
      { label: 'Não conseguir fazer o que eu preciso fazer e ficar [[estagnada|estagnado|sem sair do lugar]]', value: 'estagnada' },
    ],
  },
  {
    key: 'change',
    origin: 'quiz',
    title: 'Se você tivesse uma resposta pronta pra usar assim que a ansiedade começasse a subir, o que isso mudaria mais na sua rotina?',
    helper: 'Esse será o seu objetivo principal no app.',
    options: [
      { label: 'Ter mais paz e bem-estar no meu dia a dia', value: 'paz' },
      { label: 'Dormir melhor', value: 'sono' },
      { label: 'Conquistar as coisas que a ansiedade me impedia de conseguir', value: 'conquistar' },
      { label: 'Ter mais controle e mais confiança no trabalho ou nos estudos', value: 'confianca' },
    ],
  },
  {
    key: 'length',
    origin: 'app',
    title: 'Você prefere práticas curtas ou mais longas?',
    options: [
      { label: 'Curtas, de 1 a 3 minutos', value: 'curtos' },
      { label: 'Mais longas, de 5 a 8 minutos', value: 'longos' },
      { label: 'Tanto faz, depende do dia', value: 'tanto-faz' },
    ],
  },
  {
    key: 'heard',
    origin: 'quiz',
    title: 'Você já ouviu falar que a ansiedade é uma reação automática do corpo, e não uma escolha ou uma falha sua?',
    options: [
      { label: 'Sim, já ouvi', value: 'sim' },
      { label: 'Mais ou menos', value: 'mais-ou-menos' },
      { label: 'Nunca ouvi falar', value: 'nunca' },
    ],
  },
]

/** Pequenas pausas de conteúdo entre as perguntas, no lugar das "leituras" do quiz. */
export const interludes: Record<number, { title: string; body: string[] }> = {
  4: {
    title: 'Cada pessoa sente a ansiedade de um jeito.',
    body: [
      'Para algumas, ela começa no corpo. Para outras, nos pensamentos ou na respiração. Muitas vezes, tudo junto.',
      'Por isso uma técnica que ajuda uma pessoa pode não ajudar outra. Nas próximas perguntas, vamos entender o que costuma acontecer com você.',
    ],
  },
  9: {
    title: 'Ter algo pronto para a hora difícil faz diferença.',
    body: [
      'Saber o que experimentar quando a ansiedade sobe ajuda a não reagir no escuro.',
      'É isso que o INTEGRA propõe: perceber o que está acontecendo, escolher uma prática possível e dar um pequeno passo, mesmo com desconforto.',
    ],
  },
}

/** Explicação depois de "Você já ouviu falar...". */
export const heardExplanation = {
  title: 'Isso não é falta de força de vontade.',
  body: [
    'A ansiedade é uma reação de alerta do organismo. Ela envolve o corpo, os pensamentos e as emoções, que se influenciam o tempo todo.',
    'Por isso "se acalma" raramente funciona. Mas dá para aprender a perceber os sinais e escolher o que fazer com eles.',
    'Não é sobre sentir zero ansiedade. É sobre ela não decidir tudo por você.',
  ],
}
