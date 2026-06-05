# Supabase — PandaDigitações V2

Esta pasta contém a fundação SQL do Supabase para a V2.

## Arquivos

- `schema.sql`: tabelas principais, triggers, índices e RLS.
- `seed.sql`: conquistas iniciais.
- `ranking_views.sql`: view pública segura para o Ranking Online inicial.
- `fix_profiles_null_names.sql`: correção auxiliar para perfis antigos sem nome.

## Ordem de Execução

1. Abra o projeto no Supabase Dashboard.
2. Acesse SQL Editor.
3. Execute `schema.sql`.
4. Execute `seed.sql`.
5. Execute `ranking_views.sql`.
6. Execute scripts auxiliares somente se precisar corrigir dados antigos.

## Variáveis

Copie `.env.example` para `.env.local` e preencha:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Use a publishable/anon key no front-end. Nunca use `service_role` no Vite.

## Auth

No Dashboard, confira Authentication > Providers e mantenha Email ativo.

Para desenvolvimento:

- Site URL: `http://localhost:5173`
- Redirect URL: `http://localhost:5173/**`

## RLS

Todas as tabelas públicas do schema têm Row Level Security ativo. As policies
permitem que usuários autenticados acessem apenas seus próprios dados, exceto
`achievements`, que é catálogo de leitura.

## Ranking Online

`ranking_views.sql` cria `public.online_typing_ranking`, uma view de leitura para
o mural online. Ela expõe somente resultados `valid_for_ranking = true` e os
campos mínimos de perfil necessários na UI:

- nome de exibição;
- username;
- título;
- modo/fase/texto;
- PPM, CPM, precisão, erros, combo, score e data.

O front-end usa a publishable key e nunca usa `service_role`. Se a view ainda
não tiver sido executada, a página `/ranking` mostra um erro amigável no escopo
Online e mantém o ranking local funcionando.

## Escopo Atual

A base atual cobre Auth, perfis, sync local-first, restauração nuvem para local,
fila de pending sync e Ranking Online inicial por `typing_results`.
