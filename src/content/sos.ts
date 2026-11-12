import type { ExerciseStep } from '../types'

/**
 * "Preciso de ajuda agora": recursos de baixo risco, poucas palavras por tela.
 * Cada dificuldade tem sequências curtas. Sequências com foco na respiração têm
 * alternativa sem respiração, e nenhuma pede retenção de ar.
 */

export type SosNeed = 'coracao' | 'mente' | 'medo' | 'concentracao' | 'orientar'
export type SosTime = 30 | 120 | 300

export interface SosBlock {
  id: string
  title: string
  breathFocus: boolean
  steps: ExerciseStep[]
}

export const needs: { id: SosNeed; label: string }[] = [
  { id: 'coracao', label: 'Meu coração está acelerado' },
  { id: 'mente', label: 'Minha mente não para' },
  { id: 'medo', label: 'Estou com medo' },
  { id: 'concentracao', label: 'Não consigo me concentrar' },
  { id: 'orientar', label: 'Quero me orientar no ambiente' },
]

const blocks: Record<string, SosBlock> = {
  apoio: {
    id: 'apoio',
    title: 'Pontos de apoio',
    breathFocus: false,
    steps: [
      { text: 'Sinta os pés no chão.', seconds: 8 },
      { text: 'Perceba onde o corpo está apoiado.', seconds: 8 },
      { text: 'Apoie as mãos nas pernas. Sinta o peso delas.', seconds: 8 },
      { text: '"O chão me sustenta agora."', seconds: 6 },
    ],
  },
  apoioLongo: {
    id: 'apoioLongo',
    title: 'Corpo apoiado',
    breathFocus: false,
    steps: [
      { text: 'Pressione os pés no chão de leve. Solte.', seconds: 15 },
      { text: 'Sinta as pernas e o quadril na cadeira, ou o peso do corpo para baixo.', seconds: 15 },
      { text: 'Solte os ombros. Afaste um pouco os dentes.', seconds: 15 },
      { text: 'Segure algo nas mãos: o celular, uma almofada, a borda da mesa. Note a textura.', seconds: 20 },
      { text: 'Você não precisa fazer o coração desacelerar à força. Só fique com o apoio.', seconds: 15 },
    ],
  },
  respirar: {
    id: 'respirar',
    title: 'Respiração confortável',
    breathFocus: true,
    steps: [
      { text: 'Inspire no seu ritmo.', seconds: 4, breath: 'inspire' },
      { text: 'Solte o ar devagar, um pouco mais longo.', seconds: 6, breath: 'expire' },
      { text: 'Inspire.', seconds: 4, breath: 'inspire' },
      { text: 'Solte devagar.', seconds: 6, breath: 'expire' },
      { text: 'Inspire.', seconds: 4, breath: 'inspire' },
      { text: 'Solte devagar. Depois respire do seu jeito.', seconds: 6, breath: 'expire' },
    ],
  },
  sentidos: {
    id: 'sentidos',
    title: 'Pelos sentidos',
    breathFocus: false,
    steps: [
      { text: 'Diga 5 coisas que você vê.', seconds: 25 },
      { text: 'Diga 4 coisas que você pode tocar.', seconds: 25 },
      { text: 'Diga 3 sons que você ouve.', seconds: 20 },
      { text: 'Diga 2 cheiros, ou lembre de dois que você gosta.', seconds: 15 },
      { text: 'Diga 1 sabor, ou tome um gole de água.', seconds: 15 },
    ],
  },
  sentidosCurto: {
    id: 'sentidosCurto',
    title: 'Pelos sentidos',
    breathFocus: false,
    steps: [
      { text: 'Diga 3 coisas que você vê.', seconds: 12 },
      { text: 'Diga 2 sons que você ouve.', seconds: 10 },
      { text: 'Diga 1 coisa que você toca agora.', seconds: 8 },
    ],
  },
  nomear: {
    id: 'nomear',
    title: 'Nomear os pensamentos',
    breathFocus: false,
    steps: [
      { text: 'Quando um pensamento vier, diga: "Estou tendo o pensamento de que..."', seconds: 25 },
      { text: 'Dê um nome curto a ele: "preocupação", "plano", "lembrança".', seconds: 25 },
      { text: 'Deixe passar, como um carro na rua. Não precisa responder.', seconds: 25 },
      { text: 'Volte para uma coisa que você vê agora.', seconds: 15 },
    ],
  },
  acolher: {
    id: 'acolher',
    title: 'Acolher o medo',
    breathFocus: false,
    steps: [
      { text: 'Coloque uma mão no peito ou no braço, se for confortável.', seconds: 10 },
      { text: '"Estou com medo. Faz sentido sentir isso agora."', seconds: 10 },
      { text: '"Esse momento é difícil, e ele vai mudar."', seconds: 10 },
      { text: '"Eu posso cuidar de mim um minuto de cada vez."', seconds: 10 },
    ],
  },
  foco: {
    id: 'foco',
    title: 'Uma coisa só',
    breathFocus: false,
    steps: [
      { text: 'Pegue um objeto perto de você.', seconds: 10 },
      { text: 'Descreva a cor e o formato dele.', seconds: 20 },
      { text: 'Perceba o peso e a temperatura.', seconds: 20 },
      { text: 'Encontre um detalhe que você nunca tinha notado.', seconds: 20 },
      { text: 'Agora escolha uma tarefa só para os próximos minutos.', seconds: 15 },
    ],
  },
  focoCurto: {
    id: 'focoCurto',
    title: 'Uma coisa só',
    breathFocus: false,
    steps: [
      { text: 'Pegue um objeto perto de você.', seconds: 8 },
      { text: 'Diga a cor, o formato e a textura dele.', seconds: 14 },
      { text: 'Encontre um detalhe pequeno.', seconds: 8 },
    ],
  },
  orientar: {
    id: 'orientar',
    title: 'Onde estou',
    breathFocus: false,
    steps: [
      { text: '"Meu nome é..."', seconds: 6 },
      { text: '"Hoje é..." Diga o dia da semana.', seconds: 6 },
      { text: '"Eu estou em..." Nomeie o lugar.', seconds: 8 },
      { text: 'Nomeie 3 coisas que você vê.', seconds: 10 },
    ],
  },
  orientarLongo: {
    id: 'orientarLongo',
    title: 'Me situar',
    breathFocus: false,
    steps: [
      { text: 'Olhe ao redor devagar, da esquerda para a direita.', seconds: 15 },
      { text: 'Encontre a porta, a janela ou a saída mais próxima.', seconds: 15 },
      { text: 'Diga o nome do lugar e o que você estava fazendo antes.', seconds: 15 },
      { text: 'Que horas são, mais ou menos? Que dia é hoje?', seconds: 15 },
      { text: 'Encontre algo de uma cor de que você gosta.', seconds: 15 },
    ],
  },
  soltar: {
    id: 'soltar',
    title: 'Soltar o corpo',
    breathFocus: false,
    steps: [
      { text: 'Feche as mãos de leve por alguns segundos. Solte.', seconds: 15 },
      { text: 'Suba os ombros devagar. Solte e deixe cair.', seconds: 15 },
      { text: 'Afaste os dentes. Solte a testa.', seconds: 15 },
      { text: 'Sacuda as mãos devagar.', seconds: 15 },
    ],
  },
}

/** Sequências por dificuldade e tempo. A ordem já considera o que é mais simples primeiro. */
const plans: Record<SosNeed, Record<SosTime, string[]>> = {
  coracao: { 30: ['apoio'], 120: ['apoioLongo', 'respirar'], 300: ['apoioLongo', 'respirar', 'sentidos', 'soltar'] },
  mente: { 30: ['sentidosCurto'], 120: ['sentidos', 'nomear'], 300: ['sentidos', 'nomear', 'apoioLongo', 'soltar'] },
  medo: { 30: ['acolher'], 120: ['acolher', 'apoioLongo'], 300: ['acolher', 'apoioLongo', 'respirar', 'sentidos'] },
  concentracao: { 30: ['focoCurto'], 120: ['foco', 'apoio'], 300: ['foco', 'soltar', 'sentidos', 'apoio'] },
  orientar: { 30: ['orientar'], 120: ['orientar', 'orientarLongo'], 300: ['orientar', 'orientarLongo', 'sentidos', 'apoioLongo'] },
}

/** Alternativas para trocar de exercício, sempre sem foco na respiração. */
const swapOrder = ['apoioLongo', 'sentidos', 'orientar', 'soltar', 'foco', 'acolher', 'nomear']

export function sosPlan(need: SosNeed, time: SosTime, avoidBreath: boolean): SosBlock[] {
  const ids = plans[need][time]
  return ids.map((id) => {
    const b = blocks[id]!
    if (avoidBreath && b.breathFocus) return blocks.soltar!
    return b
  })
}

export function swapBlock(currentId: string, usedIds: string[]): SosBlock {
  const next = swapOrder.find((id) => id !== currentId && !usedIds.includes(id)) ?? swapOrder.find((id) => id !== currentId)!
  return blocks[next]!
}

export const sosBlocks = blocks
