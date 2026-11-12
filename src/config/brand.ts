/**
 * Marca e imagens. Para trocar por arquivos oficiais, substitua os arquivos em public/brand/
 * mantendo o nome, ou altere os caminhos abaixo. Nenhum componente precisa ser reescrito.
 */
const base = import.meta.env.BASE_URL

export const brand = {
  appName: 'INTEGRA | Ansiedade',
  shortName: 'INTEGRA',
  signature: 'Rosa Neves',
  methodName: 'Método INTEGRA',
  methodTagline: 'Integração entre mente, corpo e comportamento',

  /** Monograma RN enviado no pacote de referência (fundo removido para o app). */
  logoUrl: `${base}brand/monograma-rn.webp`,
  symbolUrl: `${base}brand/simbolo-rn.webp`,

  /**
   * Foto principal da Rosa, escolhida por ela para o app (12/11/2026).
   * PENDENTE: confirmar semelhança e direito de uso antes de publicar (ver src/config/contact.ts).
   */
  photoUrl: `${base}brand/rosa/rosa-retrato-01.webp`,
  photoApproved: true,
  photoAlt: 'Rosa Neves',
} as const

/** Texto de apresentação aprovado como base (sujeito a revisão final da Rosa). */
export const rosaProfile = {
  name: 'Rosa Neves',
  roles: 'Psicoterapeuta, professora, palestrante e especialista em comportamento humano',
  bio: [
    'Rosa Neves é psicoterapeuta, professora e palestrante, com mais de 15 anos de experiência em desenvolvimento humano.',
    'Seu trabalho se concentra na compreensão da ansiedade e do comportamento, aproximando conhecimento, escuta e práticas que podem ajudar as pessoas a lidar melhor com pensamentos, emoções e sinais do corpo.',
    'É criadora do Método INTEGRA, que olha para mente, corpo e comportamento de maneira conectada.',
  ],
  themes: ['Ansiedade e pensamentos acelerados', 'Regulação emocional', 'Medo de falar em público', 'Sobrecarga e autocobrança', 'Comportamento humano'],
  /**
   * Itens que só aparecem depois de confirmados pela Rosa. Deixe null até lá.
   * Não preencher com suposições.
   */
  pending: {
    professionalRegistry: null as string | null,
    education: null as string | null,
  },
}
