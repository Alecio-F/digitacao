# Supabase - PandaDigitacoes V2

Esta pasta contem a base SQL do Supabase para a V2.

## Arquivos

- `schema.sql`: tabelas principais, triggers, indices e RLS.
- `seed.sql`: conquistas iniciais.
- `ranking_eligibility.sql`: migracao idempotente para o motivo simples de inelegibilidade do ranking.
- `ranking_views.sql`: views e policies para o Ranking Online.
- `ranking_curiosities.sql`: views e policies para o Ranking Online de Curiosidades.
- `fix_profiles_null_names.sql`: correcao auxiliar para perfis antigos sem nome.
- `security_fixes.sql`: ajustes de seguranca para funcoes e permissoes.

## Ordem de Execucao

1. Abra o projeto no Supabase Dashboard.
2. Acesse SQL Editor.
3. Execute `schema.sql`.
4. Execute `seed.sql`.
5. Execute `ranking_eligibility.sql`.
6. Execute `ranking_views.sql`.
7. Execute `ranking_curiosities.sql`.
8. Execute `security_fixes.sql`.
9. Execute scripts auxiliares somente se precisar corrigir dados antigos.

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

`ranking_eligibility.sql` adiciona `ranking_invalid_reason` em bancos ja
existentes e preenche o motivo principal de resultados invalidos quando houver
dados antigos em `ranking_invalid_reasons`.

`ranking_views.sql` cria quatro views de leitura:

- `public.online_typing_ranking`: view inicial mantida para compatibilidade.
- `public.online_typing_ranking_best`: view usada pelo front-end no Ranking
  Online Geral. Ela retorna apenas o melhor resultado elegivel por usuario.
- `public.online_typing_ranking_best_speed`: view usada pelo Ranking Online de
  Velocidade. Ela retorna apenas o melhor resultado por usuario focado em PPM.
- `public.online_typing_ranking_best_accuracy`: view usada pelo Ranking Online
  de Precisao. Ela retorna apenas o melhor resultado por usuario focado em
  accuracy.
- `public.online_curiosity_ranking_most_errors`: view usada por Curiosidades >
  Mais erros. Ela retorna apenas o resultado com mais erros por usuario.
- `public.online_curiosity_ranking_chaos`: view usada por Curiosidades > Maior
  caos. Ela calcula `errors * 2 + greatest(0, 100 - accuracy)` e retorna apenas
  o resultado mais caotico por usuario.

A view `online_typing_ranking_best` usa `security_invoker = true`, le dados de
`typing_results` + `profiles`, filtra somente resultados elegiveis e calcula:

```sql
ranking_score = (ppm * 0.7) + (accuracy * 0.3)
```

As views `best`, `best_speed` e `best_accuracy` usam `security_invoker = true`
e `row_number() over (partition by user_id ...)` para manter somente o melhor
resultado de cada usuario no ranking selecionado.

As views de Curiosidades tambem usam `security_invoker = true` e `row_number()`,
mas aceitam `low_accuracy` para compor o Mural dos Distraidos. Elas continuam
ignorando sessoes curtas, sem caracteres suficientes ou marcadas como
`suspicious_repetition`, `invalid_input_pattern` ou `missing_required_data`.

O front-end usa a publishable key e nunca usa `service_role`. Se a view ainda
nao tiver sido executada, a pagina `/ranking` mostra um erro amigavel no escopo
Online e mantem o ranking local funcionando.

## Escopo Atual

A base atual cobre Auth, perfis, sync local-first, restauracao nuvem para local,
fila de pending sync e Ranking Online por melhor resultado de usuario.
