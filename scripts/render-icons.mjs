// Gera os ícones PNG a partir de public/favicon.svg (uso local; requer Playwright).
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
const svg = readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8')
const browser = await chromium.launch()
const page = await browser.newPage()
async function shot(size, file, maskable = false) {
  await page.setViewportSize({ width: size, height: size })
  const inner = maskable
    ? svg.replace('rx="112"', 'rx="0"').replace('<g fill="#FAF7F2" transform="translate(0 -14)">', '<g fill="#FAF7F2" transform="translate(51 40) scale(.8)">').replace('<path d="M118', '<path transform="translate(51 51) scale(.8)" d="M118').replace('<circle', '<circle transform="translate(51 51) scale(.8)"')
    : svg
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{width:${size}px;height:${size}px;display:block}</style>${inner}`)
  await page.screenshot({ path: new URL(`../public/icons/${file}`, import.meta.url).pathname, omitBackground: true })
}
await shot(192, 'icon-192.png')
await shot(512, 'icon-512.png')
await shot(512, 'icon-maskable-512.png', true)
await shot(180, 'apple-touch-icon.png', true)
await shot(32, 'favicon-32.png')
await browser.close()
