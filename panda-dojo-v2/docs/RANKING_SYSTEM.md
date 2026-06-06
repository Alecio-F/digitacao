# Sistema de Ranking — PandaDigitações V2

## Objetivo

O Ranking do Dojo combina dados locais e ranking online com Supabase. A UI usa
o mesmo contrato `RankingEntry` para manter o Ranking Local funcionando mesmo
quando o Supabase estiver indisponível.

## Arquivos principais

- `src/features/ranking/rankingTypes.ts`
- `src/features/ranking/rankingConfig.ts`
- `src/features/ranking/rankingScoring.ts`
- `src/features/ranking/rankingFilters.ts`
- `src/features/ranking/rankingMappers.ts`
- `src/features/ranking/rankingSelectors.ts`
- `src/features/ranking/hooks/useLocalRanking.ts`
- `src/features/ranking/useRankingViewModel.ts`
- `src/repositories/remote/rankingRemoteRepository.ts`
- `src/features/typing/logic/rankingEligibility.ts`
- `src/pages/RankingPage/`
- `supabase/ranking_views.sql`
- `supabase/ranking_eligibility.sql`

## Categorias

- **Geral:** usa `ranking_score` e exige resultado elegível.
- **Velocidade:** usa `ppm` ou `cpm` e exige precisão mínima.
- **Precisão:** ordena por precisão, com desempate por PPM, erros e tempo.
- **Fases:** usa resultados `lesson` e permite filtro futuro por `lessonId`.
- **Textos:** usa resultados `practice_text` e `free`.
- **Arcade:** espaço preparado para Panda Keys e próximos minigames.
- **Desafio Diário:** espaço preparado para ranking diário dedicado futuro.

## Fórmula geral

O score geral local inicial é:

```text
score = ppm * 1.4 + accuracy * 2 + maxCombo * 0.4 - errors * 1.5
```

Regras:

- `validForRanking === false` retorna score competitivo `0`.
- precisão abaixo do mínimo competitivo recebe penalidade forte.
- a fórmula é centralizada em `calculateGeneralRankingScore`.

## Elegibilidade e antifraude básica

A Type Arena calcula a elegibilidade antes de salvar um resultado. O histórico
continua registrando todos os treinos, mas rankings locais e online usam apenas
rodadas elegíveis.

Um treino competitivo precisa atender aos critérios mínimos:

- precisão mínima de 90%;
- duração mínima de 15 segundos;
- pelo menos 50 caracteres corretos;
- PPM, CPM, precisão e contagens obrigatórias válidas;
- PPM dentro de um limite conservador;
- sem repetição excessiva de tecla;
- sem sequência de input claramente suspeita.

Campos locais usados:

- `validForRanking`;
- `rankingScore`;
- `rankingInvalidReason`;
- `rankingInvalidReasons`;
- `suspiciousFlags`.

Campos remotos em `public.typing_results`:

- `valid_for_ranking`;
- `ranking_score`;
- `ranking_invalid_reason`;
- `ranking_invalid_reasons`;
- `suspicious_flags`.

Motivos principais de `ranking_invalid_reason`:

- `low_accuracy`;
- `too_short`;
- `too_few_chars`;
- `suspicious_repetition`;
- `invalid_input_pattern`;
- `missing_required_data`.

A validação é propositalmente conservadora. Ela remove rodadas muito curtas,
imprecisas ou suspeitas sem tentar criar um sistema antifraude definitivo.

## Ranking Local

O histórico local é convertido para `RankingEntry` por
`mapLocalHistoryToRankingEntry`. Quando não há usuário online:

- `userId`: `local-user`;
- `username`: `local`;
- `displayName`: `Você`.

O Ranking Local continua sendo o fallback principal e não depende do Supabase.

## Ranking Online

O Ranking Online usa:

- `public.typing_results`;
- `public.profiles`;
- views definidas em `supabase/ranking_views.sql`.

Views principais:

- `public.online_typing_ranking`;
- `public.online_typing_ranking_best`;
- `public.online_typing_ranking_best_speed`;
- `public.online_typing_ranking_best_accuracy`.

As views `best` usam `row_number()` com `partition by user_id` para exibir no
máximo um resultado por usuário em cada mural. Todas filtram
`valid_for_ranking = true`.

### Campos expostos pelas views

- id do resultado;
- user_id;
- display_name;
- username;
- avatar_url, quando disponível;
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

As views não expõem texto digitado, texto alvo, e-mail ou dados sensíveis.

## Fallback

Se a view ainda não existir, o repository tenta uma leitura direta em
`typing_results` com `profiles`. Se RLS bloquear a leitura, a UI mostra erro
amigável no escopo Online e mantém o Ranking Local intacto.

## Ordenação online

- **Geral:** `ranking_score desc`, `ppm desc`, `accuracy desc`.
- **Velocidade:** precisão mínima de 90%, ordenando por `ppm` ou `cpm`.
- **Precisão:** `accuracy desc`, `ppm desc`, `errors asc`.
- **Fases:** preparado para `mode = lesson`.
- **Textos:** preparado para `mode in (practice_text, free)`.

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

A página funciona como Hall da Fama do Dojo:

- hero próprio;
- filtros em chips;
- pódio Top 3;
- lista completa em cards;
- resumo de estatísticas;
- dica do Mestre Panda;
- estados de loading, vazio e erro.

## Limitações atuais

- Ranking Online depende da execução dos SQLs em `supabase/`.
- Antifraude ainda é básico e client-side.
- Não há ranking diário dedicado com `daily_challenge_results` nesta fase.
- Não há ranking global avançado por temporada.
- Não há perfil público completo.

## Próximas fases

- Recalcular elegibilidade no servidor, se o ranking ganhar competição real.
- Ranking diário dedicado.
- Ranking de Arcade com `arcade_scores`.
- Filtros avançados por fase/texto específicos.
- RPC ou materialized view se o volume de resultados crescer.
- Testes automatizados dos selectors, mappers e repository remoto.
