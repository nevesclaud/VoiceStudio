# Arquitetura

## Stack

| Escolha | Versão | Motivo |
| --- | --- | --- |
| React + TypeScript | 19 / 6.0 | Pedido no briefing. TS 6.0 porque o typescript-eslint ainda não suporta o 7 |
| Vite | 8 | Build rápido, `base` configurável para `/app/` |
| Tailwind CSS | 4 | Design system em tokens (`src/styles/index.css`) |
| React Router | 7 | `BrowserRouter` com `basename`; o `.htaccess` devolve `index.html` nas rotas |
| vite-plugin-pwa (Workbox) | 2 | Manifest, service worker, cache offline, atualização com aviso |
| idb | 8 | IndexedDB com API simples |
| lucide-react | 1 | Ícones |
| Fontes locais (Inter, Cormorant Garamond) | via @fontsource | Funcionam offline, sem chamadas ao Google Fonts |

Sem APIs pagas, sem chaves, sem analytics, sem IA.

## Pastas

```
src/
  config/      marca, links e oferta (tudo o que a Rosa pode querer trocar)
  content/     práticas, situações, trilhas, perguntas, ajuda imediata, falar em público, INTEGRA
  components/  design system (ui.tsx), moldura (Layout), player de práticas, gráfico, marca
  pages/       telas; pages/speaking/ = área de falar em público
  services/    IndexedDB (db.ts), estado global (store.tsx), exportação
  lib/         personalização, estatísticas, textos
  test/        testes de conteúdo, lógica, contraste e fluxos
```

## Dados (local-first)

- Banco IndexedDB `integra-ansiedade`: `kv` (preferências, trilhas, anotações, área de falar, retomada), `checkins`, `journal`, `sessions`, `recordings`.
- Nada sai do aparelho. Exportar gera um JSON. Apagar limpa todas as tabelas.
- O app só aparece depois que os dados locais carregam. Se o IndexedDB não responder em 3 s (janela anônima restrita), o app funciona em memória e avisa que nada será salvo.

## PWA e cache

- Pré-cache de todo o app (cerca de 730 KB). Depois da primeira visita, tudo funciona offline, inclusive a ajuda imediata.
- `registerType: 'prompt'`: a nova versão só entra quando a pessoa toca em "Atualizar".
- `.htaccess` gerado no build: rotas, `no-cache` para `index.html` e `sw.js`, cache longo para arquivos com hash, cabeçalhos de segurança e CSP restrita a `'self'`.

## Acessibilidade (WCAG 2.2 AA)

- Navegação por teclado, link "Pular para o conteúdo", foco visível, foco levado ao conteúdo a cada troca de tela.
- Botões de no mínimo 44 px, escala 0 a 10 como `radiogroup`, alternâncias como `switch`, abas com `tablist`.
- Gráfico com tabela equivalente para leitores de tela.
- `prefers-reduced-motion` respeitado, mais a opção "Reduzir animações". A respiração vira contagem em texto.
- Contraste conferido por teste automático (`src/test/contrast.test.ts`). Telas auditadas com axe-core sem violações.
- Microfone, áudio e notificações nunca são obrigatórios.

## Preparado para crescer

- **Capacitor**: o build é estático e não depende do servidor. Para empacotar, rode `npm i @capacitor/core @capacitor/cli`, depois `npx cap init`, com `webDir: 'dist'` e `VITE_BASE=/`.
- **Área paga real**: exige um backend (por exemplo, uma função serverless) com login, webhook da Kiwify confirmando a compra e conteúdo servido pelo servidor somente após verificação. Esconder com CSS ou `localStorage` não protege nada, por isso não foi feito.
- **Sincronização futura**: precisa de consentimento separado, autenticação, criptografia em trânsito e em repouso, controle de acesso e adequação à LGPD. O modelo de dados já tem `id` e datas para facilitar.
