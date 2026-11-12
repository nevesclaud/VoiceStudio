import { describe, expect, it } from 'vitest'
import { exerciseById } from '../content/exercises'
import { sosPlan } from '../content/sos'
import { buildStartPlan, suggestNow } from '../lib/recommend'
import { dailyAverages } from '../lib/stats'
import { tx } from '../lib/text'
import type { CheckIn } from '../types'

describe('tx (forma de tratamento)', () => {
  it('resolve marcadores para feminino, masculino e neutro', () => {
    const s = 'Você está [[cansada|cansado|com cansaço]] hoje?'
    expect(tx(s, 'f')).toBe('Você está cansada hoje?')
    expect(tx(s, 'm')).toBe('Você está cansado hoje?')
    expect(tx(s, 'n')).toBe('Você está com cansaço hoje?')
    expect(tx({ f: 'a', m: 'b', n: 'c' }, 'm')).toBe('b')
  })
})

describe('personalização', () => {
  it('sugere 3 práticas, nunca fora da recomendação automática', () => {
    const plan = buildStartPlan({ firstSign: 'corpo', hardest: ['sensacoes-fisicas', 'sono'], moment: 'noite', length: 'curtos' }, { avoidBreathFocus: false })
    expect(plan.suggestions).toHaveLength(3)
    for (const s of plan.suggestions) {
      expect(s.exercise.autoRecommend).toBe(true)
      expect(s.reason.length).toBeGreaterThan(10)
    }
    expect(plan.reasons.join(' ')).toMatch(/corpo/)
  })

  it('respeita a preferência de evitar foco na respiração', () => {
    const plan = buildStartPlan({ firstSign: 'respiracao', hardest: ['provas-entrevistas'] }, { avoidBreathFocus: true })
    for (const s of plan.suggestions) expect(s.exercise.breathFocus).toBe(false)
    for (const t of [30, 120, 300] as const) for (const b of sosPlan('coracao', t, true)) expect(b.breathFocus).toBe(false)
  })

  it('escolhe a trilha pela evitação e pelo objetivo', () => {
    expect(buildStartPlan({ avoid: 'sempre' }, { avoidBreathFocus: false }).journeyId).toBe('coragem')
    expect(buildStartPlan({ change: 'sono', avoid: 'nao' }, { avoidBreathFocus: false }).journeyId).toBe('mais-calma')
    expect(buildStartPlan({}, { avoidBreathFocus: false }).journeyId).toBe('comecando')
  })

  it('sem respostas, ainda sugere práticas simples e não inventa motivos', () => {
    const plan = buildStartPlan({}, { avoidBreathFocus: false })
    expect(plan.suggestions).toHaveLength(3)
    expect(plan.reasons).toHaveLength(0)
  })

  it('com ansiedade alta agora, sugere prática curta de corpo', () => {
    const s = suggestNow(9, { avoidBreathFocus: false, shortPractices: true, answers: {} }, 14)
    expect(s.exercise.pillar).toBe('corpo')
    expect(exerciseById(s.exercise.id)!.durationMin).toBeLessThanOrEqual(3)
  })
})

describe('progresso', () => {
  it('não inventa valores para dias sem registro e ignora "ainda não sei"', () => {
    const now = new Date(2026, 10, 12, 12)
    const mk = (d: number, level: number | null): CheckIn => ({ id: String(Math.random()), createdAt: new Date(2026, 10, d, 9).getTime(), level, context: 'inicio' })
    const pts = dailyAverages([mk(12, 6), mk(12, 4), mk(10, 8), mk(11, null)], 7, now)
    expect(pts).toHaveLength(7)
    expect(pts[6]!.avg).toBe(5)
    expect(pts[5]!.avg).toBeNull()
    expect(pts[4]!.avg).toBe(8)
    expect(pts.filter((p) => p.avg !== null)).toHaveLength(2)
  })
})
