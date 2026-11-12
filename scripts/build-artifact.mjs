// Gera dist-artifact/integra-preview.html: o app inteiro em um só arquivo (JS, CSS, fontes e imagens embutidos).
// Uso: npm run build:preview
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
execSync('vite build', { stdio: 'inherit', env: { ...process.env, VITE_ARTIFACT: '1' } })
const dir = 'dist-artifact'
let html = readFileSync(`${dir}/artifact.html`, 'utf8')
const js = readdirSync(`${dir}/assets`).find((f) => f.endsWith('.js'))
const css = readdirSync(`${dir}/assets`).find((f) => f.endsWith('.css'))
let code = readFileSync(`${dir}/assets/${js}`, 'utf8')
for (const img of ['monograma-rn.webp', 'simbolo-rn.webp', 'rosa/rosa-retrato-01.webp', 'rosa/rosa-retrato-02.webp', 'rosa/rosa-retrato-03.webp']) {
  const data = `data:image/webp;base64,${readFileSync(`public/brand/${img}`).toString('base64')}`
  code = code.split(`./brand/${img}`).join(data).replace(new RegExp('\\$\\{[\\w$]+\\}brand/' + img.replace(/[./]/g, (c) => '\\' + c), 'g'), data)
}
code = code.replace(/<\/script/gi, '<\\/script')
const style = css ? readFileSync(`${dir}/assets/${css}`, 'utf8') : ''
const title = html.match(/<title>.*?<\/title>/)[0]
const out = `${title}\n<style>${style}</style>\n<div id="root"></div>\n<script type="module">${code}</script>\n`
writeFileSync(`${dir}/integra-preview.html`, out)
console.log(`Pronto: ${dir}/integra-preview.html (${Math.round(out.length / 1024)} KB)`)
