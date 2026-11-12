/**
 * Seção INTEGRA: quatro caminhos complementares e opcionais.
 * Organização proposta pelo app (Perceber, Regular, Agir) e caminhos baseados nas dimensões
 * que Rosa descreveu para o método. PENDENTE: revisão final da Rosa sobre os textos.
 */
export interface IntegraPath {
  id: 'emocoes' | 'corpo' | 'mente' | 'valores'
  title: string
  subtitle: string
  intro: string
  micro: { title: string; text: string; exerciseId?: string }[]
  reflections: string[]
  tone: 'rose' | 'salvia' | 'azul' | 'bege'
}

export const integraSteps = [
  { title: 'Perceber', text: 'O que sinto, penso e noto no corpo agora?' },
  { title: 'Regular', text: 'Qual prática é segura e faz sentido neste momento?' },
  { title: 'Agir', text: 'Qual pequeno passo posso dar, mesmo com desconforto?' },
]

export const integraPaths: IntegraPath[] = [
  {
    id: 'emocoes',
    title: 'Emoções',
    subtitle: 'Identificar e acolher sem julgamento',
    intro: 'Emoções trazem informação. Dar nome ao que sentimos costuma diminuir a confusão e ajuda a escolher o que fazer.',
    tone: 'rose',
    micro: [
      { title: 'Nomear em uma palavra', text: 'Pare agora e pergunte: se essa sensação tivesse um nome, qual seria? Medo, tristeza, raiva, cansaço, saudade...' },
      { title: 'Onde ela mora no corpo?', text: 'Perceba em que parte do corpo essa emoção aparece. Só note, sem tentar mudar.' },
      { title: 'Uma frase de acolhimento', text: '"Faz sentido eu me sentir assim, considerando o que estou vivendo."', exerciseId: 'autocompaixao' },
    ],
    reflections: ['Que emoção apareceu mais esta semana?', 'Que emoção você costuma esconder?', 'O que essa emoção talvez esteja pedindo?'],
  },
  {
    id: 'corpo',
    title: 'Corpo',
    subtitle: 'Movimento leve e percepção corporal',
    intro: 'O corpo participa da ansiedade e também pode participar do cuidado. Movimento possível, sem cobrança, respeitando seus limites e sua saúde.',
    tone: 'salvia',
    micro: [
      { title: 'Pausa de pés no chão', text: 'Sinta os pés no chão por 30 segundos, onde estiver.', exerciseId: 'pontos-apoio' },
      { title: 'Três minutos de movimento', text: 'Ombros, pescoço, mãos e alguns passos. Do jeito que for possível hoje.', exerciseId: 'movimento-leve' },
      { title: 'Soltar a tensão', text: 'Mandíbula, ombros e mãos: perceba e solte, uma parte de cada vez.', exerciseId: 'relaxamento-muscular' },
    ],
    reflections: ['Que tipo de movimento você gosta, ou já gostou?', 'Como seu corpo avisa que está cansado?', 'O que seria um movimento possível esta semana, sem exagero?'],
  },
  {
    id: 'mente',
    title: 'Mente',
    subtitle: 'Pensamentos, hábitos e foco',
    intro: 'Pensamentos influenciam emoções e atitudes, e o contrário também acontece. Observar a mente com curiosidade ajuda a não obedecer a tudo o que ela diz.',
    tone: 'azul',
    micro: [
      { title: 'É fato ou hipótese?', text: 'Escolha um pensamento de hoje e pergunte: isso aconteceu ou estou supondo?', exerciseId: 'fatos-hipoteses' },
      { title: 'Uma tarefa só', text: 'Escolha a menor parte de uma tarefa e faça só ela por três minutos.', exerciseId: 'uma-tarefa' },
      { title: 'Deixar passar', text: 'Observe os pensamentos como carros numa rua. Você não precisa entrar em todos.', exerciseId: 'observar-pensamentos' },
    ],
    reflections: ['Que pensamento mais se repetiu hoje?', 'Que hábito seu ajuda a mente a descansar?', 'O que costuma roubar seu foco?'],
  },
  {
    id: 'valores',
    title: 'Valores e sentido',
    subtitle: 'Aquilo que importa para você',
    intro: 'Às vezes a ansiedade ocupa tanto espaço que esquecemos o que nos move. Lembrar do que é importante ajuda a escolher passos com mais sentido.',
    tone: 'bege',
    micro: [
      { title: 'O que importa?', text: 'Liste três coisas que são importantes para você: pessoas, causas, sonhos, jeitos de viver.' },
      { title: 'Um passo ligado a um valor', text: 'Escolha um desses valores e uma ação pequena ligada a ele para esta semana.', exerciseId: 'passos-pequenos' },
      { title: 'Um momento de gratidão possível', text: 'Lembre de algo pequeno que foi bom hoje. Não é para negar o difícil, é para dar espaço a mais coisas.' },
    ],
    reflections: ['Quando você se sente mais você?', 'O que você gostaria de fazer mais, se a ansiedade pesasse menos?', 'Que pessoa você quer ser nos momentos difíceis?'],
  },
]

/** Exibido apenas se a pessoa escolher ver conteúdos de espiritualidade. */
export const spirituality = {
  title: 'Espiritualidade, se fizer sentido para você',
  intro: 'Para algumas pessoas, fé, oração, meditação ou contato com a natureza trazem sentido e conforto. Para outras, não. As duas escolhas são respeitadas aqui.',
  items: [
    'Se você tem uma prática espiritual, quando ela ajuda você a se sentir em paz?',
    'Que momento de silêncio ou contemplação cabe no seu dia?',
    'Existe uma frase, oração ou pensamento que acalma você?',
  ],
  note: 'Fé e espiritualidade podem acolher, mas não substituem acompanhamento profissional quando ele é necessário.',
}
