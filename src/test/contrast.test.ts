import { describe, expect, it } from 'vitest'

/** Verifica contraste WCAG 2.2 AA (4,5:1) dos pares de cores de texto do design system. */
function lum(hex: string): number {
  const c = hex.replace('#', '').match(/../g)!.map((h) => parseInt(h, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!
}
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p) as [number, number]
  return (x + 0.05) / (y + 0.05)
}

const pairs: [string, string, string][] = [
  ['texto principal / fundo', '#123f4f', '#faf7f2'],
  ['texto secundário / fundo', '#55666d', '#faf7f2'],
  ['texto secundário / cartão', '#55666d', '#ffffff'],
  ['texto secundário / bege', '#55666d', '#f6f0e7'],
  ['botão ajuda (branco / rosé)', '#ffffff', '#9c4f43'],
  ['botão principal (off-white / petróleo)', '#faf7f2', '#123f4f'],
  ['rosé escuro / rosé claro', '#84423a', '#f1ddd7'],
  ['sálvia escuro / sálvia claro', '#3f6348', '#dce6dc'],
  ['azul / azul claro', '#3e6a85', '#dce8f0'],
  ['texto suave / azul claro', '#2b5566', '#eef4f8'],
  ['alerta', '#7a4b00', '#fdf1d8'],
]

describe('contraste de cores', () => {
  it.each(pairs)('%s atende 4,5:1', (_n, fg, bg) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5)
  })
})
