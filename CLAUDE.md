# INTEGRA | Ansiedade · instruções para o Claude

PWA de autocuidado e psicoeducação da Rosa Neves (Método INTEGRA). React + TS + Vite, local-first,
publicado em https://guia.rosaneves.com.br/app/ (cPanel/TurboCloud, pasta `guia.rosaneves.com.br/app`).
Leia `README.md`, `docs/CONTEUDO.md` (fatos x decisões x pendências) e `docs/SUPABASE.md` antes de mudar algo.

## Regras de conteúdo (não negociáveis)
- Não inventar credenciais (CRP, títulos), depoimentos, números, resultados ou promessas de cura.
- Nada de diagnóstico; ajuda imediata sempre gratuita e sem conteúdo comercial; SAMU 192 e CVV 188.
- Voz da Rosa: português brasileiro simples, acolhedor, sem travessões. Formas f/m/n via `[[f|m|n]]`.
- Diário, check-ins, fotos e gravações nunca saem do aparelho. Envio remoto só com consentimento.

## Supabase (projeto `jgyeerefacmsaxrcwngc`, São Paulo)
Autorização da proprietária (12/11/2026): aplicar diretamente as mudanças de banco que o app precisar,
sem pedir confirmação. Sempre: novo arquivo em `supabase/migrations/`, `npm run test:db` antes,
`get_advisors` depois, registrar na tabela de `docs/SUPABASE.md` e relatar o que mudou.
Continua exigindo confirmação: apagar dados reais; pausar/excluir/criar projeto ou gerar custo;
ler conteúdo de mensagens ou dados pessoais sem necessidade da tarefa; alterar quem é administradora.
Nunca colocar a chave secreta/service_role no app ou no repositório.

## Antes de entregar
`npm run release` (lint, tipos, testes, build, ZIP). Testar no celular quando houver mudança visual.
