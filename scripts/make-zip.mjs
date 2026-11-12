// Gera release/integra-app-<versão>.zip com o CONTEÚDO de dist/ (inclui o .htaccess).
// No cPanel, esse conteúdo vai dentro da pasta public_html/app/.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
if (!existsSync('dist/index.html')) {
  console.error('dist/ não encontrado. Rode "npm run build" antes.')
  process.exit(1)
}
mkdirSync('release', { recursive: true })
const out = `release/integra-app-${pkg.version}.zip`
rmSync(out, { force: true })
execFileSync('zip', ['-r', '-X', `../${out}`, '.'], { cwd: 'dist', stdio: 'inherit' })
console.log(`\nPronto: ${out}`)
