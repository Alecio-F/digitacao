# Supabase - PandaDigitacoes V2

Esta pasta contem a base SQL do Supabase para a V2.

## Arquivos

- `schema.sql`: tabelas principais, triggers, indices e RLS.
- `seed.sql`: conquistas iniciais.
- `ranking_views.sql`: views e policies para o Ranking Online.
- `fix_profiles_null_names.sql`: correcao auxiliar para perfis antigos sem nome.
- `security_fixes.sql`: ajustes de seguranca para funcoes e permissoes.

## Ordem de Execucao

1. Abra o projeto no Supabase Dashboard.
2. Acesse SQL Editor.
3. Execute `schema.sql`.
4. Execute `seed.sql`.
5. Execute `ranking_views.sql`.
6. Execute `security_fixes.sql`.
7. Execute scripts auxiliares somente se precisar corrigir dados antigos.

## Variaveis

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

Todas as tabelas publicas do schema tem Row Level Security ativo. As policies
principais permitem que usuarios autenticados acessem seus proprios dados.

Para o Ranking Online, `ranking_views.sql` adiciona policies publicas
especificas e limitadas para:

- resultados elegiveis em `typing_results`;
- perfis que aparecem no mural online.

## Ranking Online

`ranking_views.sql` cria duas views de leitura:

- `public.online_typing_ranking`: view inicial mantida para compatibilidade.
- `public.online_typing_ranking_best`: view usada pelo front-end no Ranking
  Online Geral. Ela retorna apenas o melhor resultado elegivel por usuario.

A view `online_typing_ranking_best` usa `security_invoker = true`, le dados de
`typing_results` + `profiles`, filtra somente resultados elegiveis e calcula:

```sql
ranking_score = (ppm * 0.7) + (accuracy * 0.3)
```

Ela usa `row_number() over (partition by user_id ...)` para manter somente o
melhor resultado de cada usuario.

O front-end usa a publishable key e nunca usa `service_role`. Se a view ainda
nao tiver sido executada, a pagina `/ranking` mostra um erro amigavel no escopo
Online e mantem o ranking local funcionando.

## Escopo Atual

A base atual cobre Auth, perfis, sync local-first, restauracao nuvem para local,
fila de pending sync e Ranking Online por melhor resultado de usuario.
