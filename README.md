# INTEGRA | Ansiedade · por Rosa Neves

Aplicativo web instalável (PWA) de autocuidado e psicoeducação para ansiedade, baseado no
Método INTEGRA (mente, corpo e comportamento) e no quiz SOS Ansiedade.

Funciona no celular (iPhone e Android) e no computador, pode ser instalado na tela inicial e
mantém as ferramentas essenciais funcionando sem internet. Não tem cadastro. Os registros
ficam só no aparelho da pessoa.

> Conteúdo de autocuidado e psicoeducação. Não substitui avaliação, psicoterapia, orientação
> médica ou atendimento de emergência.

## O que está pronto

| Área | O que faz |
| --- | --- |
| Boas-vindas e primeiros passos | Perguntas do quiz SOS (preservadas), desconforto 0 a 10, preferências. Resultado com 3 práticas, trilha inicial e o motivo de cada sugestão. Dá para pular ou refazer. |
| Início | Saudação, check-in 0 a 10 (com "Ainda não sei" e campos opcionais), "Talvez isso ajude agora", continuar prática interrompida, cartões Antes/Durante/Depois, trilha, favoritos, últimas práticas. |
| Preciso de ajuda agora | 30 s, 2 min ou 5 min. "O que está mais difícil neste momento?" com 5 opções. Pular, Parar, Trocar exercício e Voltar. Opção sem foco na respiração. SAMU 192, CVV 188, busca de pronto atendimento. Nunca fica atrás de pagamento. |
| Explorar | 12 situações (A a L) com conteúdo próprio: o que pode estar acontecendo, antes, durante (prática interativa), depois, 5 práticas, plano opcional, frase de apoio, anotação pessoal e favorito. Busca e filtros. |
| Falar em público | Preparação de 3 minutos, checklist do corpo, pensamentos que travam (com frases alternativas), roteiro de abertura com modelos (sem IA), simulador com cronômetro, cartões e pausas, gravação de áudio opcional com consentimento, plano gradual voluntário, check-in antes e depois e "O que funcionou". |
| Praticar | 29 práticas em Mente, Respiração e Corpo, com objetivo, quando ajuda, preparo, passo a passo, timer, pausar, pular, voltar, parar, trocar, concluir e avaliação opcional. Retomada de práticas interrompidas. |
| Trilhas | 7, 14 e 21 dias. Cada dia traz texto, prática, pergunta e ação. Dá para retomar, pular dias, trocar de trilha e recomeçar. |
| Meu progresso | Resumo, gráfico semanal ou mensal dos check-ins (só aparece a partir de 3 registros), práticas mais usadas, diário (rápido em 30 s ou completo em 5 min, com filtros), lista de check-ins. |
| INTEGRA | Perceber, Regular e Agir. Quatro caminhos opcionais (Emoções, Corpo, Mente, Valores e sentido), com micropráticas e reflexões. Espiritualidade só aparece se a pessoa ativar. |
| Converse com a Rosa | Apresentação com foto, galeria (ampliar e navegar por teclado), consultas presencial (São Sebastião do Paraíso, MG) e online, valores (R$ 120,00 a consulta, R$ 500,00 o acompanhamento mensal), palestras e treinamentos, perguntas frequentes. Botões de WhatsApp com mensagem pronta para cada assunto. Fica fora da ajuda imediata e das práticas. |
| Sua voz importa | Sugestão, dúvida, problema técnico ou elogio, com nome e e-mail opcionais, anti-spam e aviso de que não é atendimento. Vai para o Painel da Rosa. Requer Supabase. |
| Painel da Rosa | Página separada em `guia.rosaneves.com.br/painel/` (`npm run build:painel`, pacote próprio), só com login de administradora (verificado no banco). Visitantes, sessões, páginas, exercícios, áreas, jornadas, funil do quiz com abandono, cliques no WhatsApp, avaliações, respostas compartilhadas e mensagens com classificação. Filtros de período, gráfico, tabelas e exportação CSV/JSON. Requer Supabase. |
| Perfil | Nome, forma de tratamento (feminino, masculino ou neutro), preferências (práticas curtas, sem respiração, menos animação, texto maior), favoritos, exportar dados, apagar tudo, instalar o app, Conheça a Rosa, Acesso, Privacidade, Limites. |

## O que depende de material ou aprovação da Rosa

Lista completa em [`docs/CONTEUDO.md`](docs/CONTEUDO.md). Resumo:

- **Fotos**: em uso por escolha da Rosa, mas o pacote avisa que são referências visuais. Confirmar semelhança e direito de uso antes de publicar. Para esconder, `photosApproved: false` em `src/config/contact.ts`.
- **Checkout Kiwify**: o link fica em `VITE_CHECKOUT_URL`, vazio por padrão. Sem link, o cartão mostra "Em breve".
- **Verificação de compra**: não existe backend. O app não libera conteúdo pago e não diz que uma compra foi confirmada. O material em PDF é entregue pela Kiwify.
- **Registro profissional, formação, depoimentos**: nada foi inventado. Os campos ficam vazios em `src/config/brand.ts`.
- **Práticas "Revisão profissional necessária"**: aguardam a leitura e validação da Rosa.

## Desenvolvimento

Requisitos: Node 20.19 ou mais recente (testado com Node 22).

```bash
npm install
```

```bash
npm run dev
```

Abra o endereço mostrado (termina em `/app/`).

| Comando | O que faz |
| --- | --- |
| `npm run lint` | ESLint |
| `npm run typecheck` | Verificação de tipos (TypeScript) |
| `npm test` | Testes (Vitest + Testing Library + IndexedDB simulado) |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o build em `http://localhost:4173/app/` |
| `npm run release` | Lint, tipos, testes, build e ZIP de publicação em `release/` |

### Configurações

| Onde | O quê |
| --- | --- |
| `src/config/brand.ts` | Nome, logo, foto (e se está aprovada), texto "Conheça a Rosa" |
| `src/config/links.ts` | Instagram, página do trabalho da Rosa, contatos de emergência |
| `src/config/commerce.ts` | Oferta (R$ 29,90, pagamento único), benefícios, checkout |
| `src/config/contact.ts` | WhatsApp, mensagens prontas, valores das consultas, temas de palestras, perguntas frequentes, fotos |
| `.env.local` | `VITE_CHECKOUT_URL=` (link real da Kiwify), `VITE_BASE=` (padrão `/app/`), `VITE_SUPABASE_URL=` e `VITE_SUPABASE_ANON_KEY=` |
| `public/brand/` | Arquivos de imagem. Para trocar, substitua mantendo o nome do arquivo |

### Conteúdo editável

Tudo em `src/content/`: `exercises.ts` (práticas), `categories.ts` (situações),
`journeys.ts` (trilhas), `onboarding.ts` (perguntas), `sos.ts` (ajuda imediata),
`speaking.ts` (falar em público), `integra.ts` (seção INTEGRA). Os testes em
`src/test/content.test.ts` conferem referências quebradas, promessas de cura, travessões,
retenção de ar e outras regras.

Para texto com forma de tratamento, use `[[feminino|masculino|neutro]]`, por exemplo
`Você está [[cansada|cansado|com cansaço]]?`.

## Supabase (painel, mensagens e estatísticas)

Opcional. Sem ele, o app funciona 100% local. Passo a passo e o que depende da Rosa em
[`docs/SUPABASE.md`](docs/SUPABASE.md). Rascunho da política de privacidade em
[`docs/POLITICA_PRIVACIDADE.md`](docs/POLITICA_PRIVACIDADE.md). Testes do banco: `npm run test:db`.

## Publicação no cPanel / TurboCloud

Passo a passo em [`docs/PUBLICACAO.md`](docs/PUBLICACAO.md). O app vai **somente** em
`public_html/app/`. Nada no WordPress, no `/quiz/` ou em outras pastas é alterado.

## Arquitetura e decisões

Ver [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).

### Scripts auxiliares (opcionais)

`scripts/render-icons.mjs` (gera os ícones PNG a partir de `public/favicon.svg`) e
`scripts/smoke.mjs` (capturas de tela, auditoria de acessibilidade com axe-core e teste
offline sobre o `npm run preview`) usam o Playwright, que não faz parte das dependências.
Instale à parte se quiser usá-los.
