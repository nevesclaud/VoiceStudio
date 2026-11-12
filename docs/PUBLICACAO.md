# Publicar em https://guia.rosaneves.com.br/app/

O app ocupa apenas a pasta `app/`. **Não altere** o WordPress, a pasta `quiz/` nem outros
arquivos do domínio.

## 1. Gerar os arquivos

```bash
npm install
```

Se já tiver o link real da Kiwify, crie o arquivo `.env.local` com
`VITE_CHECKOUT_URL=https://...` antes do próximo comando. Sem ele, o cartão de compra mostra "Em breve".

```bash
npm run release
```

Isso confere o código, roda os testes, gera `dist/` e cria `release/integra-app-<versão>.zip`.
O ZIP já traz o **conteúdo** da pasta `dist/`, incluindo o arquivo oculto `.htaccess`.

## 2. Enviar pelo Gerenciador de Arquivos do cPanel

1. Entre no cPanel da TurboCloud e abra **Gerenciador de Arquivos**.
2. Clique em **Configurações** (canto superior direito) e marque **Mostrar arquivos ocultos (dotfiles)**. Salve.
3. Abra `public_html/`. Confira que o WordPress e a pasta `quiz/` estão lá. **Não mexa neles.**
4. Se a pasta `app/` não existir: **+ Pasta** → nome `app` → Criar.
   Se já existir uma versão anterior, abra `app/`, selecione tudo e clique em **Excluir**. Apague só o conteúdo de `app/`.
5. Entre em `public_html/app/` e clique em **Carregar**. Envie o arquivo `integra-app-<versão>.zip`.
6. Volte para `public_html/app/`, clique com o botão direito no ZIP → **Extrair** → confirme o caminho `/public_html/app`.
7. Confira que dentro de `app/` estão diretamente `index.html`, `.htaccess`, `sw.js`, `manifest.webmanifest` e as pastas `assets/`, `brand/` e `icons/`.
   Se tudo foi parar em uma subpasta (`app/dist/...`), mova o conteúdo para `app/`.
8. Apague o arquivo ZIP de dentro de `app/`.

## 3. Conferir

1. Abra https://guia.rosaneves.com.br/app/ em uma janela anônima.
2. Navegue até **Explorar → Antes de dormir** e recarregue a página. Ela deve abrir normalmente (isso confirma o `.htaccess`).
3. Abra https://guia.rosaneves.com.br/ e https://guia.rosaneves.com.br/quiz/ e confirme que continuam iguais.
4. No celular, abra o app, use o menu do navegador e escolha **Adicionar à tela inicial**.

## 3b. Painel da Rosa (página separada)

O `npm run release` também gera `release/integra-painel-<versão>.zip`.

1. Em `guia.rosaneves.com.br/`, crie a pasta `painel` (ao lado de `app` e `quiz`).
2. Entre em `painel`, carregue o ZIP do painel, extraia ali e apague o ZIP.
3. Dentro de `painel` devem ficar `index.html`, `.htaccess`, `favicon.svg` e a pasta `assets`.
4. Abra `https://guia.rosaneves.com.br/painel/` e entre com a conta da Rosa.

A página não aparece no Google (noindex) e só mostra dados depois do login de administradora.

## 4. Atualizar depois

Repita os passos 1 e 2 (apagando só o conteúdo de `app/`). Quem já usa o app vê o aviso
"Há uma nova versão" e escolhe quando atualizar. Os registros das pessoas ficam no aparelho
delas e **não são apagados** em uma atualização.

## Problemas comuns

| Sintoma | Causa provável | Solução |
| --- | --- | --- |
| Página em branco | Arquivos dentro de `app/dist/` | Mova o conteúdo para `app/` |
| Recarregar uma página dá erro 404 | `.htaccess` não foi enviado | Ative "Mostrar arquivos ocultos" e confira o `.htaccess` em `app/` |
| Botão de compra mostra "Em breve" | `VITE_CHECKOUT_URL` vazio | Crie `.env.local` com o link real e rode `npm run release` de novo |
| Versão antiga continua aparecendo | Cache do navegador | Feche e abra o app. O aviso de atualização aparece em seguida |

## Outro endereço

Para publicar em outro caminho, gere com `VITE_BASE=/outro-caminho/ npm run release`. O
`.htaccess` é gerado para o caminho escolhido.
