# Supabase: Painel da Rosa, "Sua voz importa" e estatísticas

O app continua hospedado na TurboCloud. O Supabase guarda **apenas** o que a pessoa escolhe enviar
(estatísticas anônimas, avaliações, respostas compartilhadas e mensagens) e faz o login da Rosa.
Diário, check-ins, fotos e gravações **nunca** vão para lá.

Sem esta configuração, o app funciona normalmente. As telas "Sua voz importa" e "Painel da Rosa"
mostram que a integração está pendente, e nada é enviado.

## O que depende de você (uns 20 minutos)

### 1. Criar a conta e o projeto
1. Crie uma conta em https://supabase.com (plano gratuito serve para começar).
2. **New project** → nome `integra-ansiedade` → região **South America (São Paulo)** → crie uma senha forte para o banco e guarde num gerenciador de senhas.

### 2. Criar as tabelas e regras de segurança
1. No projeto, abra **SQL Editor → New query**.
2. Cole todo o conteúdo de `supabase/migrations/20261112120000_integra_painel.sql` e clique em **Run**.
3. Deve aparecer "Success. No rows returned".

### 3. Configurar o login
1. **Authentication → Sign In / Providers → Email**: deixe ativo.
2. **Authentication → Sign In / Providers**: **desative "Allow new users to sign up"**. Só você cria contas.
3. **Authentication → Users → Add user → Create new user**: e-mail da Rosa e uma senha forte. Marque "Auto Confirm User".
4. Copie o **User UID** da conta criada.
5. No **SQL Editor**, rode (trocando pelo UID copiado):
   ```sql
   insert into public.admins (user_id) values ('COLE-O-UID-AQUI');
   ```
6. Recomendado: em **Authentication → Attack Protection**, ative "Prevent use of leaked passwords".

### 4. Limpeza automática (retenção)
1. **Database → Extensions**: ative `pg_cron`.
2. **SQL Editor**:
   ```sql
   select cron.schedule('integra-limpeza', '17 4 * * *', 'select public.purge_old_data()');
   ```
   Apaga estatísticas com mais de 13 meses e os registros anti-spam com mais de 2 dias.

### 5. Ligar o app ao Supabase
1. **Project Settings → API** (ou **Data API**): copie a **Project URL** e a chave **anon / publishable**.
   **Nunca** use a chave `service_role` / `secret` no app.
2. No computador do projeto, crie o arquivo `.env.local` (ao lado do `package.json`):
   ```
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=cole-a-chave-anon-aqui
   ```
3. Gere e publique de novo:
   ```bash
   npm run release
   ```
   Envie o novo ZIP para `guia.rosaneves.com.br/app/` como antes. O `.htaccess` gerado já libera a conexão com o seu Supabase (e só com ele).

Se preferir, me envie a Project URL e a chave anon (são públicas por natureza) que eu gero o ZIP.
**Não me envie** a senha do banco, a senha da Rosa nem a chave `service_role`.

### 6. Entrar no painel
Abra `https://guia.rosaneves.com.br/app/painel`, entre com o e-mail e a senha criados no passo 3.
O endereço não é secreto: a proteção é o login e as regras do banco.

## Como a segurança funciona

| Quem | Pode | Não pode |
| --- | --- | --- |
| Qualquer visitante (chave anon) | Chamar `log_events`, `submit_message`, `submit_exercise_feedback`, `share_quiz`, `delete_my_data` | Ler qualquer tabela, inserir direto, ver estatísticas |
| Conta logada que não é admin | O mesmo | Ler mensagens, avaliações, eventos ou estatísticas |
| Rosa (em `public.admins`) | Ver estatísticas agregadas (`admin_stats`), ler mensagens e comentários, mudar o status da mensagem | Ler eventos individuais, alterar o texto de mensagens, apagar mensagens, criar outra admin pelo app |

Outras proteções:
- Row Level Security em todas as tabelas, com `revoke` explícito das permissões padrão.
- As funções públicas validam tudo: nomes de evento numa lista fechada, propriedades só em formato de código (texto livre é descartado), respostas do quiz só entre as opções existentes.
- Anti-spam: campo-armadilha, tempo mínimo de preenchimento, limites por aparelho (3 mensagens/hora, 10/dia), por IP (6/hora, guardado só como hash) e geral (120/hora).
- Nenhum IP, nome ou e-mail nas estatísticas. Nome e e-mail só nas mensagens, e só se a pessoa preencher.

## Testes

```bash
PGHOST=... PGPORT=... PGUSER=postgres npm run test:db
```

Cria um banco descartável num Postgres 15+ local, simula os papéis do Supabase
(`supabase/tests/00_supabase_local.sql`), aplica a migração e roda 69 verificações de acesso e
funcionamento (`supabase/tests/10_security.sql`).
