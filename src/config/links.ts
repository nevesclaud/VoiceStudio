/**
 * Links e contatos. Use apenas endereços verdadeiros e confirmados.
 * Campo vazio = o botão correspondente não aparece.
 */
export const links = {
  instagram: { handle: '@rosanevespsi', url: 'https://www.instagram.com/rosanevespsi/' },
  /** Página para "Conhecer o trabalho da Rosa". O guia já existe no domínio. */
  rosaWork: 'https://guia.rosaneves.com.br/',
  /** Quiz SOS Ansiedade existente (não é alterado pelo app). */
  quiz: 'https://guia.rosaneves.com.br/quiz/',
  /** Contato profissional: ver src/config/contact.ts (WhatsApp confirmado). */
}

/** Contatos de ajuda no Brasil. O app não presta atendimento de emergência. */
export const emergency = {
  samu: { label: 'SAMU', number: '192', description: 'Urgência médica: sintomas físicos fortes, novos ou diferentes do habitual.' },
  cvv: {
    label: 'CVV',
    number: '188',
    description: 'Apoio emocional gratuito, 24 horas, por telefone. Também há chat no site.',
    url: 'https://cvv.org.br/',
  },
  bombeiros: { label: 'Bombeiros', number: '193', description: 'Situações de perigo e resgate.' },
  /** Abre uma busca de mapa apenas quando a pessoa toca no botão. */
  localSearch: 'https://www.google.com/maps/search/pronto+atendimento+perto+de+mim',
}
