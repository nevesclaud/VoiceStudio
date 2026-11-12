/** Conteúdo da área especial de falar em público. Modelos personalizáveis, sem IA. */

export const physicalChecklist = [
  { id: 'pes', label: 'Pés no chão', hint: 'Afastados na largura do quadril, peso distribuído.' },
  { id: 'postura', label: 'Postura confortável', hint: 'Coluna apoiada, ombros soltos, sem rigidez.' },
  { id: 'agua', label: 'Água por perto', hint: 'Um gole antes de começar ajuda com a boca seca.' },
  { id: 'olhar', label: 'Olhar para algumas pessoas', hint: 'Escolha dois ou três rostos amigáveis em pontos diferentes.' },
  { id: 'ritmo', label: 'Ritmo de fala', hint: 'Um pouco mais devagar do que parece natural. Pausas são permitidas.' },
  { id: 'maos', label: 'Mãos livres', hint: 'Segure suas anotações ou deixe as mãos acompanharem a fala.' },
  { id: 'abertura', label: 'Abertura na ponta da língua', hint: 'As primeiras frases ensaiadas em voz alta.' },
]

export interface ThoughtReframe {
  id: string
  thought: string
  questions: string[]
  alternatives: string[]
}

export const speakingThoughts: ThoughtReframe[] = [
  {
    id: 'esquecer',
    thought: 'Vou esquecer tudo.',
    questions: [
      'Você já esqueceu algo falando antes? O que aconteceu depois?',
      'Que apoio você pode ter à mão: tópicos, slides, um cartão?',
      'Se der um branco, o que você pode fazer nos próximos 5 segundos?',
    ],
    alternatives: [
      'Posso esquecer uma parte e olhar minhas anotações.',
      'Eu conheço o assunto. Um branco é uma pausa, não o fim.',
      'Se eu me perder, posso dizer: "Deixa eu retomar daqui."',
    ],
  },
  {
    id: 'julgar',
    thought: 'Vão me julgar.',
    questions: [
      'O que você sabe de fato sobre o que as pessoas vão pensar?',
      'Quando você assiste alguém falar, fica procurando defeitos?',
      'Que parte do público tende a estar do seu lado?',
    ],
    alternatives: [
      'Algumas pessoas vão prestar atenção na ideia, não em mim.',
      'Não preciso agradar a todos para fazer uma boa fala.',
      'A maioria das pessoas torce para quem está falando.',
    ],
  },
  {
    id: 'perfeita',
    thought: '[[Preciso ser perfeita.|Preciso ser perfeito.|Preciso fazer perfeito.]]',
    questions: [
      'O que seria uma fala "boa o suficiente" para esse contexto?',
      'Alguma fala que você admira foi totalmente sem erros?',
      'O que o público precisa levar, de verdade, da sua fala?',
    ],
    alternatives: [
      'Meu objetivo é comunicar uma ideia, não fazer sem erros.',
      'Posso tropeçar numa palavra e seguir em frente.',
      'Bom o suficiente é ótimo para quem está ouvindo.',
    ],
  },
  {
    id: 'tremer',
    thought: 'Vão perceber que estou [[nervosa|nervoso|com nervosismo]].',
    questions: [
      'O nervosismo aparece tanto por fora quanto você sente por dentro?',
      'Se alguém perceber, o que isso realmente muda?',
      'Você julgaria outra pessoa por ver que ela está nervosa?',
    ],
    alternatives: [
      'O que sinto por dentro costuma aparecer bem menos por fora.',
      'Posso estar com nervosismo e ainda assim falar com clareza.',
      'Muita gente fica nervosa falando em público. Isso é humano.',
    ],
  },
]

export const openingModels = [
  {
    id: 'pergunta',
    label: 'Começar com uma pergunta',
    build: (f: OpeningFields) =>
      `Boa ${partOfDay()}. Antes de começar, queria fazer uma pergunta: ${f.topic ? `quantos de vocês já pararam para pensar em ${f.topic.toLowerCase()}?` : 'quantos de vocês já passaram por isso?'}\n\nHoje, nos próximos ${f.duration || 'minutos'}, vou falar sobre ${f.topic || 'o tema'}${f.audience ? ` pensando em ${f.audience}` : ''}.\n\nMeu objetivo é que, ao final, vocês ${f.goal || 'levem uma ideia prática para o dia a dia'}.`,
  },
  {
    id: 'historia',
    label: 'Começar com uma situação real',
    build: (f: OpeningFields) =>
      `Boa ${partOfDay()}. Quero começar contando uma situação rápida. [Descreva aqui, em duas ou três frases, um momento real ligado a ${f.topic || 'o tema'}.]\n\nFoi por situações assim que escolhi falar hoje sobre ${f.topic || 'esse tema'}${f.audience ? ` com ${f.audience}` : ''}.\n\nEm ${f.duration || 'poucos minutos'}, quero que vocês ${f.goal || 'saiam com uma ideia clara do que fazer'}.`,
  },
  {
    id: 'direto',
    label: 'Começar direto ao ponto',
    build: (f: OpeningFields) =>
      `Boa ${partOfDay()}. [[Obrigada|Obrigado|Agradeço]] pela presença.\n\nVou falar sobre ${f.topic || 'o tema'}${f.audience ? ` para ${f.audience}` : ''}, em ${f.duration || 'alguns minutos'}.\n\nVou dividir em três partes: [parte 1], [parte 2] e [parte 3].\n\nAo final, espero que vocês ${f.goal || 'tenham clareza sobre o próximo passo'}.`,
  },
]

export interface OpeningFields {
  topic: string
  audience: string
  duration: string
  goal: string
}

function partOfDay(): string {
  const h = new Date().getHours()
  return h < 12 ? 'dia' : h < 18 ? 'tarde' : 'noite'
}

export const gradualPlan = [
  { id: 'sozinha', label: 'Ensaiar em voz alta, [[sozinha|sozinho|sem plateia]]', hint: 'Em pé, como se estivesse no lugar da apresentação.' },
  { id: 'gravar', label: 'Gravar um áudio curto e ouvir', hint: 'Opcional. Ouça buscando o que já funciona.' },
  { id: 'espelho', label: 'Ensaiar olhando para um ponto fixo ou espelho', hint: 'Treina sustentar o olhar.' },
  { id: 'confianca', label: 'Apresentar para uma pessoa de confiança', hint: 'Peça um retorno sobre uma coisa só.' },
  { id: 'chamada', label: 'Falar numa chamada de vídeo com poucas pessoas', hint: 'Câmera ligada, se for possível.' },
  { id: 'grupo', label: 'Fazer um comentário num grupo pequeno', hint: 'Uma pergunta ou opinião de 30 segundos.' },
  { id: 'reuniao', label: 'Apresentar um ponto numa reunião', hint: 'Prepare a abertura e um fechamento.' },
  { id: 'publico', label: 'Apresentar para um público maior', hint: 'Quando e se fizer sentido para você.' },
]

export const preparation3min = [
  { text: 'Pés no chão. Sinta o apoio e deixe os ombros descerem.', seconds: 40 },
  { text: 'Solte o ar devagar algumas vezes, sem forçar. Se preferir, só solte a mandíbula.', seconds: 40 },
  { text: 'Diga a sua abertura em voz baixa, uma vez.', seconds: 40 },
  { text: 'Lembre o objetivo: qual é a ideia principal que você quer que as pessoas levem?', seconds: 30 },
  { text: '"É possível sentir nervosismo e ainda assim comunicar minha ideia."', seconds: 30 },
]
