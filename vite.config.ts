/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'

// O app é publicado em https://guia.rosaneves.com.br/app/
// Para outro caminho, defina VITE_BASE (ex.: VITE_BASE=/ npm run build).
const base = process.env.VITE_BASE ?? '/app/'
// Origem do Supabase (se configurado) liberada na CSP; nenhum outro servidor recebe conexões do app.
const supabaseOrigin = (() => {
  try {
    const env = { ...loadEnv('production', process.cwd(), 'VITE_'), ...process.env }
    return new URL(env.VITE_SUPABASE_URL ?? '').origin
  } catch {
    return ''
  }
})()
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }

/**
 * Gera o .htaccess do subdiretório: rotas do app voltam para index.html, cache seguro
 * (service worker e index sem cache; arquivos com hash por 1 ano) e cabeçalhos de segurança.
 * Vale só dentro da pasta do app, sem afetar o WordPress ou o quiz.
 */
function htaccess(): Plugin {
  return {
    name: 'integra-htaccess',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: '.htaccess',
        source: `# INTEGRA | Ansiedade: vale apenas para ${base}
Options -Indexes
DirectoryIndex index.html

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase ${base}
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . ${base}index.html [L]
</IfModule>

<IfModule mod_mime.c>
  AddType application/manifest+json .webmanifest
  AddType image/webp .webp
  AddType font/woff2 .woff2
</IfModule>

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set Permissions-Policy "camera=(), geolocation=(), microphone=(self)"
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self'; connect-src 'self'${supabaseOrigin ? ' ' + supabaseOrigin : ''}; manifest-src 'self'; worker-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'"

  <FilesMatch "^(index\\.html|sw\\.js|registerSW\\.js|manifest\\.webmanifest)$">
    Header set Cache-Control "no-cache, must-revalidate"
  </FilesMatch>
  <FilesMatch "^workbox-.*\\.js$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType image/webp "access plus 1 month"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/svg+xml "access plus 1 month"
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>
`,
      })
    },
  }
}

const artifact = process.env.VITE_ARTIFACT === '1'

const painel = process.env.VITE_TARGET === 'painel'

/** .htaccess da pasta do painel: sem indexação, sem cache do index e sem abrir dentro de outros sites. */
function htaccessPainel(): Plugin {
  return {
    name: 'integra-htaccess-painel',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: '.htaccess',
        source: `# Painel da Rosa: vale apenas para /painel/
Options -Indexes
DirectoryIndex index.html

<IfModule mod_headers.c>
  Header always set X-Robots-Tag "noindex, nofollow"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "no-referrer"
  Header always set X-Frame-Options "DENY"
  Header always set Permissions-Policy "camera=(), geolocation=(), microphone=()"
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'${supabaseOrigin ? ' ' + supabaseOrigin : ''}; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  <FilesMatch "^index\\.html$">
    Header set Cache-Control "no-cache, must-revalidate"
  </FilesMatch>
</IfModule>
`,
      })
    },
  }
}

export default defineConfig(painel ? {
  // Painel da Rosa, página separada em /painel/ (scripts/build-painel.mjs). Sem PWA.
  base: '/painel/',
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [react(), tailwindcss(), htaccessPainel()],
  publicDir: false,
  build: { outDir: 'dist-painel', emptyOutDir: true, rollupOptions: { input: 'painel.html' } },
} : artifact ? {
  // Pré-visualização em arquivo único (scripts/build-artifact.mjs). Sem service worker.
  base: './',
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist-artifact',
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    rollupOptions: { input: 'artifact.html', output: { inlineDynamicImports: true } },
  },
} : {
  base,
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [
    react(),
    htaccess(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'brand/*.webp', 'icons/*.png'],
      manifest: {
        id: base,
        name: 'INTEGRA | Ansiedade',
        short_name: 'INTEGRA',
        description: 'Práticas curtas, diário privado e apoio para momentos de ansiedade. Por Rosa Neves.',
        lang: 'pt-BR',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FAF7F2',
        theme_color: '#FAF7F2',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Os testes nunca usam o Supabase real (nem o .env.local): a integração é simulada caso a caso.
    env: { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '', VITE_CHECKOUT_URL: '' },
    css: false,
  },
})
