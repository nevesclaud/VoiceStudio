// Capturas das telas de envio e do painel (uso local): node scripts/smoke-admin.mjs <saida>
import { chromium, devices } from 'playwright'
import { readFileSync } from 'node:fs'
const out = process.argv[2] ?? '.'
const axe = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8')
const base = 'http://localhost:4173/app'
const b = await chromium.launch()
const ctx = await b.newContext({ ...devices['iPhone 13'] })
await ctx.route(/supabase\.co/, (r) => r.abort())
const p = await ctx.newPage()
const errs = []
p.on('pageerror', (e) => errs.push(String(e)))
async function shot(name, path, full = false) {
  await p.goto(base + path, { waitUntil: 'networkidle' })
  await p.waitForTimeout(500)
  await p.screenshot({ path: `${out}/${name}.png`, fullPage: full })
  await p.addScriptTag({ content: axe })
  const v = await p.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] })).violations.map((x) => `${x.id}: ${x.nodes[0]?.target}`))
  console.log(name, v.length ? v : 'ok')
}
await shot('01-boas-vindas', '/')
await p.getByRole('button', { name: 'Explorar sem responder' }).click()
await p.waitForTimeout(400)
await shot('02-inicio', '/', true)
await shot('03-sua-voz', '/sua-voz', true)
await shot('04-painel', '/painel')
await shot('05-privacidade', '/privacidade', true)
await shot('06-perfil', '/perfil', true)
console.log('erros:', errs)
await b.close()
