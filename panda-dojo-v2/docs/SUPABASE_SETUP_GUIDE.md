# Guia de Configuração Supabase — PandaDigitações V2

## 1. Criar Conta/Projeto

Acesse o Dashboard oficial do Supabase:

https://supabase.com/dashboard

Passos:

1. Entrar ou criar conta.
2. Clicar em "New project".
3. Nome sugerido: `PandaDigitacoes`.
4. Definir uma senha forte do banco e salvar em local seguro.
5. Escolher a região mais próxima.
6. Criar o projeto.
7. Aguardar o provisionamento.

## 2. Obter Credenciais

No projeto:

1. Abrir Project Settings.
2. Ir em API.
3. Copiar:
   - Project URL.
   - Publishable/anon key.

A publishable/anon key pode ficar no front-end quando RLS está configurado
corretamente. A `service_role` key nunca deve ir para o front-end.

## 3. Configurar Variáveis

Crie `.env.local` na raiz de `panda-dojo-v2`:

```env
VITE_SUPABASE_URL=cole_a_url_aqui
VITE_SUPABASE_PUBLISHABLE_KEY=cole_a_publishable_key_aqui
```

Não commite `.env.local`.

## 4. Executar SQL

1. Abrir SQL Editor no Supabase.
2. Colar o conteúdo de `supabase/schema.sql`.
3. Executar.
4. Colar o conteúdo de `supabase/seed.sql`.
5. Executar.

## 5. Configurar Auth

Em Authentication:

- confirmar Email provider ativo;
- configurar Site URL: `http://localhost:5173`.

Se usar Vercel futuramente, adicionar a URL de produção em Redirect URLs.

## 6. Testar

1. Rodar `npm run dev`.
2. Abrir `/conta`.
3. Criar uma conta.
4. Verificar `auth.users`.
5. Verificar `public.profiles`.
6. Sair e entrar novamente.

Sem `.env.local`, o app deve continuar em modo local.
