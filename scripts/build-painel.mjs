// Gera dist-painel/ (Painel da Rosa como página separada, para guia.rosaneves.com.br/painel/).
import { execSync } from 'node:child_process'
import { copyFileSync, renameSync } from 'node:fs'
execSync('vite build', { stdio: 'inherit', env: { ...process.env, VITE_TARGET: 'painel' } })
renameSync('dist-painel/painel.html', 'dist-painel/index.html')
// Arquivos que o painel usa da pasta public (o resto não é necessário).
copyFileSync('public/favicon.svg', 'dist-painel/favicon.svg')
console.log('Pronto: dist-painel/')
