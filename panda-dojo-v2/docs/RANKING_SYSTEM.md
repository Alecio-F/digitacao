# Sistema de Ranking — PandaDigitações V2

## Objetivo

O Ranking do Dojo combina dados locais e, na Parte 3, um ranking online inicial
com Supabase. A UI usa o mesmo contrato `RankingEntry` para manter o Ranking
Local funcionando mesmo quando o Supabase estiver indisponível.

## Arquivos Principais

- `src/features/ranking/rankingTypes.ts`
- `src/features/ranking/rankingConfig.ts`
- `src/features/ranking/rankingScoring.ts`
- `src/features/ranking/rankingFilters.ts`
- `src/features/ranking/rankingMappers.ts`
- `src/features/ranking/rankingSelectors.ts`
- `src/features/ranking/hooks/useLocalRanking.ts`
- `src/features/ranking/useRankingViewModel.ts`
- `src/repositories/remote/rankingRemoteRepository.ts`
- `src/pages/RankingPage/`

## Categorias

- **Geral:** usa `ranking_score` e exige resultado elegível.
- **Velocidade:** usa `ppm` ou `cpm` e exige precisão mínima de 90%.
- **Precisão:** ordena por precisão, com desempate por PPM, erros e tempo.
- **Fases:** usa resultados `lesson` e permite filtro futuro por `lessonId`.
- **Textos:** usa resultados `practice_text` e `free`.
- **Arcade:** espaço preparado para Panda Keys e próximos minigames.
- **Desafio Diário:** espaço preparado para ranking diário dedicado futuro.

## Fórmula Geral

O score geral inicial é:

```text
score = ppm * 1.4 + accuracy * 2 + maxCombo * 0.4 - errors * 1.5
```

Regras:

- `validForRanking === false` retorna score competitivo `0`.
- Precisão abaixo de 85% recebe penalidade forte.
- A fórmula é centralizada em `calculateGeneralRankingScore`.

## Elegibilidade

Resultados competitivos respeitam as regras já calculadas pela Type Arena:

- `validForRanking`;
- `rankingScore`;
- `rankingInvalidReasons`;
- `suspiciousFlags`.

O Ranking não recalcula anti-abuso. Ele apenas filtra, mapeia e ordena dados já
normalizados.

## Ranking Local

O histórico local é convertido para `RankingEntry` por
`mapLocalHistoryToRankingEntry`. Quando não há usuário online:

- `userId`: `local-user`;
- `username`: `local`;
- `displayName`: `Você`.

O Ranking Local continua sendo o fallback principal e não depende do Supabase.

## Ranking Online Inicial

A Parte 3 adiciona leitura online com Supabase usando:

- `public.typing_results`;
- `public.profiles`;
- view recomendada: `public.online_typing_ranking`.

O front-end busca dados pelo repository
`src/repositories/remote/rankingRemoteRepository.ts`. Componentes React não
acessam Supabase diretamente.

### View Recomendada

O arquivo `supabase/ranking_views.sql` cria `public.online_typing_ranking`.

A view expõe somente:

- id do resultado;
- user_id;
- display_name;
- username;
- title;
- mode;
- lesson_id;
- practice_text_id;
- daily_challenge_id;
- duration_seconds;
- ppm;
- cpm;
- accuracy;
- errors;
- max_combo;
- ranking_score;
- valid_for_ranking;
- completed_at.

Ela filtra `valid_for_ranking = true` e não expõe dados sensíveis.

### Fallback

Se a view ainda não existir, o repository tenta uma leitura direta em
`typing_results` com `profiles`. Se RLS bloquear a leitura, a UI mostra erro
amigável no escopo Online e mantém o Ranking Local intacto.

## Ordenação Online

- **Geral:** `ranking_score desc`, `ppm desc`, `accuracy desc`.
- **Velocidade:** precisão mínima de 90%, ordenando por `ppm` ou `cpm`.
- **Precisão:** `accuracy desc`, `ppm desc`, `errors asc`.
- **Fases:** `mode = lesson`, preparado para filtro por fase.
- **Textos:** `mode in (practice_text, free)`.

Arcade e Desafio Diário continuam preparados para fases futuras.

## Filtros

Filtros disponíveis:

- período: `today`, `week`, `month`, `all`;
- escopo: `local`, `online`;
- categoria;
- métrica.

No online, o período é aplicado com datas ISO calculadas no front-end:

- hoje: início do dia local;
- semana: últimos 7 dias;
- mês: últimos 30 dias;
- sempre: sem filtro.

## UI

A Parte 2 redesenhou a página como Hall da Fama do Dojo:

- hero próprio;
- filtros em chips;
- pódio Top 3;
- lista completa em cards;
- resumo de estatísticas;
- dica do Mestre Panda;
- estados de loading, vazio e erro.

## Limitações Atuais

- Ranking Online depende da execução de `supabase/ranking_views.sql`.
- Não há ranking diário dedicado com `daily_challenge_results` nesta fase.
- Não há ranking global avançado por temporada.
- Não há perfil público completo.
- Regras anti-abuso continuam sendo geradas na Type Arena e apenas respeitadas no Ranking.

## Próximas Fases

- Ranking diário dedicado.
- Ranking de Arcade com `arcade_scores`.
- Filtros avançados por fase/texto específicos.
- RPC ou materialized view se o volume de resultados crescer.
- Testes automatizados dos selectors, mappers e repository remoto.
