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
- **Combo:** ordena pelo maior `max_combo` do usuário, com desempate por precisão e PPM. Exige precisão ≥ 90%, duração ≥ 15 s, PPM ≥ 20 e ≥ 50 caracteres corretos.
- **Fases:** usa resultados `lesson` e permite filtro futuro por `lessonId`.
- **Textos:** usa resultados `practice_text` e `free`.
- **Desafio Diário:** ranking diário dedicado com tabela própria (`daily_challenge_results`), um resultado por usuário por dia, padrão "Hoje".
- **Arcade:** melhor score por usuário por jogo — Panda Keys, Seal Challenge e futuros minigames.

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
- `public.online_typing_ranking_best_accuracy`;
- `public.online_typing_ranking_best_combo`;
- `public.online_typing_ranking_best_by_phase`;
- `public.online_typing_ranking_best_by_text`;
- `public.online_daily_challenge_ranking` (tabela separada: `daily_challenge_results`);
- `public.online_arcade_ranking_best` (tabela separada: `arcade_scores`).

As views `best` usam `row_number()` com `partition by user_id` para exibir no
máximo um resultado por usuário em cada mural. Todas filtram
`valid_for_ranking = true`.

A view `online_typing_ranking_best_by_phase` usa `partition by user_id, lesson_id`,
permitindo que o mesmo usuário apareça uma vez por fase.

A view `online_typing_ranking_best_by_text` usa `partition by user_id, practice_text_id`,
permitindo que o mesmo usuário apareça uma vez por texto praticado.

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
- **Combo:** `max_combo desc`, `accuracy desc`, `ppm desc`.
- **Fases:** `ranking_score desc`, `ppm desc`, `accuracy desc`, `max_combo desc` por `(user_id, lesson_id)`.
- **Textos:** `ranking_score desc`, `ppm desc`, `accuracy desc`, `max_combo desc` por `(user_id, practice_text_id)`.
- **Desafio Diário:** `ranking_score desc`, `ppm desc`, `accuracy desc`, `max_combo desc` por `(user_id, challenge_date)`.
- **Arcade:** `ranking_score desc` (= score), `max_combo desc`, `level_reached desc` por `(user_id, game_id)`.

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

## Ranking Online de Combo

O Ranking Online de Combo exibe o melhor resultado de combo (`max_combo`) de cada
usuário. Cada usuário aparece no máximo uma vez.

**View:** `public.online_typing_ranking_best_combo`

**Campo principal:** `max_combo` (integer na tabela `typing_results`). A view
expõe esse valor como `ranking_score` para manter compatibilidade com o front-end.

**Critérios mínimos de elegibilidade:**

- `valid_for_ranking = true` (camada de antifraude já aplicada);
- `accuracy >= 90`;
- `duration_seconds >= 15`;
- `ppm >= 20`;
- `correct_chars >= 50` — evita sessões artificialmente curtas que inflariam o combo.

**Desempate (dentro do mesmo usuário e entre usuários com combo igual):**

```sql
row_number() over (
  partition by user_id
  order by max_combo desc, accuracy desc, ppm desc, duration_seconds desc, completed_at asc
)
```

**Mapeamento no front-end:**

- Métrica `combo` → view `online_typing_ranking_best_combo`;
- Ordenação remota por `max_combo desc`, `accuracy desc`, `ppm desc`.

**Por que melhor resultado por usuário?** Mostrar todas as tentativas de um mesmo
usuário tornaria o mural dominado por quem treina com mais frequência. A
deduplicação por `row_number() PARTITION BY user_id` garante diversidade no
ranking e representa o pico real de cada jogador.

## Ranking Online por Fases

O Ranking Online por Fases exibe o melhor resultado de cada usuário em cada
fase específica do Dojo. Um jogador pode aparecer múltiplas vezes no ranking —
uma vez por fase que completou — mas nunca duas vezes na mesma fase.

**View:** `public.online_typing_ranking_best_by_phase`

**Campo de fase:** `lesson_id` (text, ex: `'base-keys'`, `'left-hand'`). O campo
`mode = 'lesson'` identifica treinos de fase no Mapa do Dojo.

**Critérios mínimos de elegibilidade:**

- `valid_for_ranking = true` (camada de antifraude já aplicada);
- `mode = 'lesson'` e `lesson_id is not null`;
- `accuracy >= 90`;
- `duration_seconds >= 15`.

**Lógica de melhor resultado por usuário por fase:**

```sql
row_number() over (
  partition by user_id, lesson_id
  order by ranking_score desc, ppm desc, accuracy desc, max_combo desc, completed_at asc
)
```

A partição por `(user_id, lesson_id)` garante que cada jogador aparece uma vez
por fase, mostrando sempre o seu melhor desempenho naquela fase específica.

**ranking_score usado:** campo calculado pelo cliente ao salvar o resultado,
que já considera velocidade, precisão e combo. Se um resultado antigo tiver
`ranking_score = 0`, ele ranqueará abaixo dos demais, o que é comportamento correto.

**Mapeamento no front-end:**

- Categoria `phases` → view `online_typing_ranking_best_by_phase`;
- `getModeLabel` usa `lesson_id` para exibir o nome real da fase (ex: "Fase 01 — Teclas Base");
- Filtro por `lessonId` disponível no repositório para filtrar fase específica;
- Fallback deduplica por `(user_id, lesson_id)` para manter consistência.

**Limitações atuais do Ranking por Fases:**

- Não há seletor de fase na UI nesta versão — o ranking exibe todas as fases
  combinadas, com até um resultado por usuário por fase;
- Um futuro seletor pode filtrar pela `lesson_id` usando a opção `lessonId` já
  disponível no `getOnlineTypingRanking`;
- `ranking_score` é client-side; resultados com score zerado aparecem no fim.

## Ranking Online por Textos

O Ranking Online por Textos exibe o melhor resultado de cada usuário em cada
texto específico praticado. Um jogador pode aparecer múltiplas vezes no ranking —
uma vez por texto que completou de forma elegível — mas nunca duas vezes no mesmo texto.

**View:** `public.online_typing_ranking_best_by_text`

**Campo de texto:** `practice_text_id` (text, ex: `'dojo-routine'`, `'focus-before-speed'`). O
campo `mode = 'practice_text'` identifica resultados de textos para praticar.

**Critérios mínimos de elegibilidade:**

- `valid_for_ranking = true` (camada de antifraude já aplicada);
- `mode = 'practice_text'` e `practice_text_id is not null`;
- `accuracy >= 90`;
- `duration_seconds >= 15`.

**Lógica de melhor resultado por usuário por texto:**

```sql
row_number() over (
  partition by user_id, practice_text_id
  order by ranking_score desc, ppm desc, accuracy desc, max_combo desc, completed_at asc
)
```

A partição por `(user_id, practice_text_id)` garante que cada jogador aparece uma vez
por texto, mostrando sempre o seu melhor desempenho naquele texto específico.

**ranking_score usado:** campo calculado pelo cliente ao salvar o resultado, que já
considera velocidade, precisão e combo (`ppm * 1.4 + accuracy * 2 + combo * 0.4 - errors * 1.5`).

**Mapeamento no front-end:**

- Categoria `texts` → view `online_typing_ranking_best_by_text`;
- `getModeLabel` usa `practice_text_id` para exibir o título real do texto (ex: "Rotina do Dojo");
- Filtro por `practiceTextId` disponível no repositório para filtrar texto específico;
- Fallback deduplica por `(user_id, practice_text_id)` para manter consistência.

**Textos disponíveis** (definidos em `src/features/practiceTexts/data/practiceTexts.ts`):

| ID | Título |
|---|---|
| `dojo-routine` | Rotina do Dojo |
| `coffee-code` | Café e Código |
| `digital-apprentice` | Aprendiz Digital |
| `focus-before-speed` | Foco Antes da Velocidade |
| `panda-journey` | Jornada do Panda |
| `night-at-dojo` | Noite no Dojo |
| `perfect-sequence` | Sequência Perfeita |
| `control-and-rhythm` | Controle e Ritmo |
| `guardian-challenge` | Desafio do Guardião |
| `keyboard-final-trial` | Prova Final do Teclado |

**Limitações atuais do Ranking por Textos:**

- Não há seletor de texto na UI nesta versão — o ranking exibe todos os textos
  combinados, com até um resultado por usuário por texto;
- Resultados com `mode = 'free'` (treino livre sem texto fixo) não entram nesta view;
- Um futuro seletor pode filtrar pela `practice_text_id` usando a opção `practiceTextId`
  já disponível no `getOnlineTypingRanking`;
- `ranking_score` é client-side; resultados antigos com score zerado aparecem no fim.

## Ranking Online do Desafio Diário

O Ranking do Desafio Diário usa uma tabela dedicada, separada de `typing_results`,
para garantir semântica de "um resultado por usuário por dia" desde a camada de dados.

**Tabela:** `public.daily_challenge_results`

**Constraint de unicidade:** `unique(user_id, challenge_date)` — ao contrário das
demais categorias, que deduplicam via view, aqui a unicidade é garantida em nível
de banco de dados.

**View:** `public.online_daily_challenge_ranking`

**Campo de data:** `challenge_date` (text `YYYY-MM-DD`), derivado de `completed_at.slice(0, 10)`.

**Campos de ranking adicionados (idempotente via `supabase/daily_challenge_ranking.sql`):**

- `valid_for_ranking` (boolean, default false);
- `ranking_score` (numeric, default 0);
- `ranking_invalid_reason` (text, nullable);
- `ranking_invalid_reasons` (jsonb, default `[]`);
- `suspicious_flags` (jsonb, default `{}`).

**Critérios mínimos de elegibilidade:**

- `valid_for_ranking = true`;
- `user_id is not null`;
- `challenge_date is not null`.

**Lógica de melhor resultado por usuário por dia:**

```sql
row_number() over (
  partition by user_id, challenge_date
  order by ranking_score desc, ppm desc, accuracy desc, max_combo desc, completed_at asc
)
```

A partição por `(user_id, challenge_date)` é mantida por consistência com as demais
views, mesmo que a constraint `unique(user_id, challenge_date)` já garanta uma linha
por usuário por dia. Isso preserva a lógica caso a constraint seja relaxada no futuro.

**Fluxo de salvamento:**

1. `syncTypingResultToSupabase` em `syncLocalProgressService.ts` salva normalmente em `typing_results`;
2. Se `mode === 'daily-challenge'`, chama também `saveDailyChallengeResult` em `dailyChallengeRemoteRepository.ts`;
3. `saveDailyChallengeResult` faz leitura prévia (read-before-write): só executa o upsert se o novo `ranking_score` for estritamente maior que o existente.

**Upsert com `onConflict: 'user_id,challenge_date'`:** se o resultado do dia já existir
com score maior ou igual, a chamada retorna sem alterar o banco.

**Período padrão:** ao selecionar a categoria Desafio Diário, o filtro de período
é ajustado automaticamente para "Hoje" (`defaultPeriod: 'today'`).

**Mapeamento no front-end:**

- Categoria `daily` → view `online_daily_challenge_ranking`;
- `shouldSkipRemoteCategory` retorna `false` para `daily` — a categoria é ativa;
- Post-view dedup por `user_id` aplicado no repositório para consistência.

**Diferenças em relação às demais categorias:**

| Aspecto | Demais categorias | Desafio Diário |
|---|---|---|
| Tabela fonte | `typing_results` | `daily_challenge_results` |
| Unicidade | deduplicação na view | constraint no banco |
| Granularidade | por usuário (geral/speed/accuracy/combo) ou por usuário+fase/texto | por usuário por dia |
| Período padrão | `all` | `today` |
| Fallback | leitura direta em `typing_results` | sem fallback específico |

**Arquivos relevantes:**

- `supabase/daily_challenge_ranking.sql` — DDL completo;
- `src/repositories/remote/dailyChallengeRemoteRepository.ts` — upsert com read-before-write;
- `src/features/backend-sync/syncLocalProgressService.ts` — orquestração do salvamento dual.

## Ranking Online do Arcade

O Ranking do Arcade usa a tabela `public.arcade_scores`, que já existe desde o schema
inicial do projeto. Cada jogador pode aparecer uma vez por jogo no ranking combinado.

**Tabela:** `public.arcade_scores`

**Campos disponíveis:** `game_id`, `score`, `max_combo`, `level_reached`, `played_at`

**View:** `public.online_arcade_ranking_best`

**Jogos disponíveis:**

| `game_id` | Nome exibido |
|---|---|
| `panda-keys` | Panda Keys |
| `seal-challenge` | Seal Challenge |

**Lógica de melhor resultado por usuário por jogo:**

```sql
row_number() over (
  partition by user_id, game_id
  order by score desc, max_combo desc, level_reached desc, played_at asc
)
```

A partição por `(user_id, game_id)` garante que cada jogador aparece no máximo
uma vez por jogo. Em uma visão combinada (sem filtro por jogo), um usuário pode
aparecer duas vezes — uma por jogo — o que é comportamento correto.

**Compatibilidade com `RemoteRankingEntry`:**

O Arcade não usa os campos `ppm`, `cpm`, `accuracy`, `errors` e `duration_seconds`.
A view retorna `0` nesses campos para compatibilidade com o contrato do front-end.

Mapeamentos relevantes:
- `ranking_score = score` (o score do jogo é usado como ranking_score)
- `practice_text_id = game_id` (transporta o identificador do jogo para o front-end)
- `mode = 'arcade'`
- `valid_for_ranking = true` (todos os scores > 0 são elegíveis)

**`getModeLabel` para Arcade:**

Quando `mode === 'arcade'` e `practiceTextId` está presente, exibe o nome do jogo
(`'panda-keys'` → `'Panda Keys'`, `'seal-challenge'` → `'Seal Challenge'`).

**Stats para Arcade Online:**

Os cards de estatística exibem métricas relevantes para arcade:
- Melhor Score
- Melhor Combo
- Resultados online
- Jogadores únicos

**Elegibilidade:**

O Arcade não tem camada de antifraude dedicada. O critério de elegibilidade mínima
é `score > 0`, aplicado tanto na policy RLS quanto na view.

**Fluxo de salvamento:**

O fluxo de sync remoto já estava implementado desde o início do projeto:
1. Jogo termina → `savePandaKeysBestScore(score)` / `saveSealBestScore(score)` localmente
2. Se logado → `syncArcadeScoreToSupabase(gameId, score, metadata)` em `syncLocalProgressService.ts`
3. → `arcadeScoreRemoteRepository.saveArcadeScore(userId, remoteGameId, input)` → INSERT em `arcade_scores`

O ranking não interfere no fluxo de salvamento — não foi necessário alterar nada no sync.

**Arquivos relevantes:**

- `supabase/arcade_ranking.sql` — grants, policy pública, view
- `src/repositories/remote/rankingRemoteRepository.ts` — routing para arcade view, ordering
- `src/features/ranking/rankingConfig.ts` — status `'ready'`
- `src/features/ranking/rankingScoring.ts` — fix do metric `arcade_score`
- `src/features/ranking/rankingMappers.ts` — `mapRemoteMode` suporta `'arcade'`
- `src/features/ranking/useRankingViewModel.ts` — `getModeLabel` e `getStats` para arcade

**Diferenças em relação às demais categorias:**

| Aspecto | Type Arena (Geral/Speed/etc.) | Desafio Diário | Arcade |
|---|---|---|---|
| Tabela fonte | `typing_results` | `daily_challenge_results` | `arcade_scores` |
| Dedup | por usuário (view) | por usuário/dia (constraint + view) | por usuário/jogo (view) |
| Campos de typing | ppm, cpm, accuracy, etc. | ppm, cpm, accuracy, etc. | não disponíveis (0) |
| Elegibilidade | antifraude completo | antifraude completo | score > 0 |
| Fallback (view falha) | lê `typing_results` direto | nenhum | retorna [] |
| Ranking Local | histórico local | histórico local | não disponível |

**Limitações atuais do Ranking do Arcade:**

- Ranking Local para Arcade não está disponível — os scores do Arcade são armazenados
  em estrutura separada (`arcadeScoreRepository`) e não mapeados para `RankingEntry` local.
- Não há filtro por jogo específico na UI — o ranking combina todos os jogos.
- Stats de PPM, precisão e tempo não fazem sentido para Arcade e são exibidos como `--`.
- `level_reached` é retornado pela view mas não exibido no front-end atual.

## Limitações atuais

- Ranking Online depende da execução dos SQLs em `supabase/`.
- Antifraude ainda é básico e client-side.
- `challenge_date` usa a data UTC de `completed_at`; pode divergir da data local do jogador em fusos muito diferentes do UTC.
- Ranking Local para Arcade não está disponível (scores em estrutura separada).
- Não há filtro por jogo específico na UI do Arcade.
- Não há ranking global avançado por temporada.
- Não há perfil público completo.

## Próximas fases

- Recalcular elegibilidade no servidor, se o ranking ganhar competição real.
- Filtro por jogo específico no Ranking do Arcade.
- Filtros avançados por fase/texto específicos.
- RPC ou materialized view se o volume de resultados crescer.
- Testes automatizados dos selectors, mappers e repository remoto.
