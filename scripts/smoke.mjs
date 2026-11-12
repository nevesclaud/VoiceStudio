// Verificação visual e de acessibilidade do build (uso local): node scripts/smoke.mjs <pasta-de-saida>
import { chromium, devices } from 'playwright'
import { readFileSync } from 'node:fs'
const out = process.argv[2] ?? '.'
const axe = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8')
const base = 'http://localhost:4173/app'
const browser = await chromium.launch()
const ctx = await browser.newContext({ ...devices['iPhone 13'] })
const page = await ctx.newPage()
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(String(e)))

async function audit(name) {
  await page.addScriptTag({ content: axe })
  const r = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] })).violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} · ${v.nodes[0]?.target}`))
  console.log(`[${name}] axe:`, r.length ? r : 'ok')
}
async function shot(name, path, setup) {
  await page.goto(base + path, { waitUntil: 'networkidle' })
  if (setup) await setup()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: false })
  await audit(name)
}

await shot('01-boas-vindas', '/')
await page.getByRole('button', { name: 'Explorar sem responder' }).click()
await page.waitForTimeout(300)
await shot('02-inicio', '/')
await page.screenshot({ path: `${out}/02b-inicio-full.png`, fullPage: true })
await shot('03-onboarding', '/primeiros-passos', async () => {
  await page.getByRole('button', { name: 'No feminino' }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()
})
await shot('04-ajuda', '/ajuda')
await shot('05-ajuda-pratica', '/ajuda', async () => {
  await page.getByRole('button', { name: /2 minutos/ }).click()
  await page.getByRole('button', { name: 'Meu coração está acelerado' }).click()
})
await shot('06-explorar', '/explorar')
await shot('07-categoria', '/explorar/falar-em-publico')
await shot('08-praticar', '/praticar')
await shot('09-pratica-detalhe', '/praticar/suspiro-fisiologico')
await shot('10-pratica-run', '/praticar/respiracao-cadenciada/iniciar', async () => {
  await page.getByRole('button', { name: 'Entendi, quero começar' }).click()
})
await shot('11-progresso', '/progresso')
await shot('12-falar', '/falar-em-publico')
await shot('13-simulador', '/falar-em-publico/simulador')
await shot('14-roteiro', '/falar-em-publico/roteiro')
await shot('15-integra', '/integra')
await shot('16-rosa', '/rosa')
await shot('17-acesso', '/acesso')
await shot('18-perfil', '/perfil')
await shot('19-trilha-dia', '/trilhas/coragem/dia/1')
await shot('20-ajuda-humana', '/ajuda/humana')
await shot('21-converse', '/converse-com-a-rosa')
await page.screenshot({ path: `${out}/21b-converse-full.png`, fullPage: true })

// Computador
const desk = await browser.newPage({ viewport: { width: 1280, height: 860 } })
await desk.goto(base + '/', { waitUntil: 'networkidle' })
await desk.getByRole('button', { name: 'Explorar sem responder' }).click()
await desk.waitForTimeout(400)
await desk.screenshot({ path: `${out}/30-desktop-inicio.png` })
await desk.goto(base + '/explorar/sono', { waitUntil: 'networkidle' })
await desk.screenshot({ path: `${out}/31-desktop-categoria.png` })
await desk.goto(base + '/converse-com-a-rosa', { waitUntil: 'networkidle' })
await desk.screenshot({ path: `${out}/32-desktop-converse.png` })

// Offline: depois da primeira visita, o app deve abrir sem rede
await page.goto(base + '/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
await ctx.setOffline(true)
await page.goto(base + '/ajuda', { waitUntil: 'domcontentloaded' }).catch((e) => errors.push('offline: ' + e))
await page.waitForTimeout(800)
console.log('offline /ajuda:', (await page.textContent('body'))?.includes('Estou aqui com você') ? 'ok' : 'FALHOU')
await ctx.setOffline(false)
console.log('erros de console:', errors.length ? errors : 'nenhum')
await browser.close()
