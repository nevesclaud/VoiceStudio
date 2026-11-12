/**
 * "Converse com a Rosa": contato, atendimentos, preços e fotos.
 * Tudo o que pode mudar fica aqui. Use apenas dados confirmados pela Rosa.
 *
 * NÃO adicionar: CRP, títulos acadêmicos, certificados, depoimentos, endereço exato,
 * quantidade de sessões do acompanhamento, política de cancelamento ou preço de palestras.
 */
const base = import.meta.env.BASE_URL

export const ROSA_WHATSAPP = '5535991007594'
export const ROSA_WHATSAPP_DISPLAY = '+55 35 99100-7594'
const WHATSAPP_BASE = 'https://api.whatsapp.com/send/'

/** Monta o link do WhatsApp. A mensagem nunca inclui dados do perfil, do diário ou do quiz. */
export function whatsappUrl(message: string): string {
  return `${WHATSAPP_BASE}?phone=${ROSA_WHATSAPP}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`
}

export const whatsappMessages = {
  presencial: 'Olá, Rosa! Vim pelo aplicativo INTEGRA e gostaria de informações sobre a consulta presencial de R$ 120.',
  online: 'Olá, Rosa! Vim pelo aplicativo INTEGRA e gostaria de informações sobre a consulta online de R$ 120.',
  mensal: 'Olá, Rosa! Vim pelo aplicativo INTEGRA e gostaria de entender como funciona o acompanhamento mensal de R$ 500.',
  palestra: 'Olá, Rosa! Vim pelo aplicativo INTEGRA e gostaria de informações sobre palestras e treinamentos para minha empresa ou instituição.',
  geral: 'Olá, Rosa! Conheci seu trabalho pelo aplicativo INTEGRA e gostaria de mais informações.',
} as const

export type ContactTopic = keyof typeof whatsappMessages

export const services = {
  location: 'São Sebastião do Paraíso, MG',
  consulta: { label: 'Consulta individual avulsa', price: 'R$ 120,00' },
  mensal: {
    label: 'Acompanhamento mensal',
    price: 'R$ 500,00',
    note: 'Consulte diretamente a Rosa sobre quantidade de encontros, duração e condições do acompanhamento.',
  },
}

export const speakingTopics = [
  'Inteligência emocional',
  'Ansiedade no ambiente de trabalho',
  'Comunicação e relações interpessoais',
  'Saúde emocional',
  'Liderança e emoções',
  'Palestras para escolas e instituições',
]

export const contactFaq = [
  { q: 'O atendimento é presencial ou online?', a: 'Os dois formatos estão disponíveis, mediante agendamento. O presencial acontece em São Sebastião do Paraíso, MG.' },
  { q: 'Quanto custa a consulta?', a: 'A consulta individual avulsa custa R$ 120,00.' },
  { q: 'Como funciona o acompanhamento mensal?', a: 'O acompanhamento mensal custa R$ 500,00. Quantidade de encontros, duração e condições são combinadas diretamente com a Rosa.' },
  { q: 'Rosa realiza palestras para empresas?', a: 'Sim. A solicitação e o orçamento são feitos pelo WhatsApp.' },
  { q: 'Como agendar?', a: 'Pelos botões de WhatsApp desta página. O atendimento depende de disponibilidade e agendamento.' },
]

/**
 * Fotos da Rosa. Vieram de materiais anteriores e são REFERÊNCIAS VISUAIS:
 * algumas podem ter sido compostas ou geradas digitalmente.
 * PENDENTE: a Rosa confirmar semelhança e direito de uso antes da publicação.
 * Para esconder a galeria e usar só a marca, mude photosApproved para false.
 */
export const photosApproved = true

export const rosaPhotos = [
  { src: `${base}brand/rosa/rosa-retrato-01.webp`, alt: 'Rosa Neves sentada à mesa de trabalho, sorrindo', caption: 'Conheça a Rosa' },
  { src: `${base}brand/rosa/rosa-retrato-02.webp`, alt: 'Rosa Neves sentada em uma poltrona, ao lado da marca Rosa Neves', caption: 'Rosa Neves' },
  { src: `${base}brand/rosa/rosa-retrato-03.webp`, alt: 'Rosa Neves à mesa, com livros sobre comportamento e inteligência emocional', caption: 'Comportamento humano e emoções' },
]
export const PHOTO_WIDTH = 720
export const PHOTO_HEIGHT = 960
