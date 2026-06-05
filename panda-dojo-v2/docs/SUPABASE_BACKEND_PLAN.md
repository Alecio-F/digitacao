# Plano Backend Supabase — PandaDigitações V2

## Fase Atual

Fase 1E: Pending Sync simples para falhas temporárias de envio ao Supabase.

Base já existente da Fase 1B:

- client Supabase com fallback quando env estiver ausente;
- Auth service;
- AuthProvider/useAuth;
- repository remoto de perfil;
- `/conta` preparada para login/cadastro;
- schema SQL com RLS;
- seed inicial de conquistas;
- documentação de setup.

Entregas adicionadas na Fase 1C:

- repositories remotos para histórico, fases, Arcade e conquistas;
- service de sync local-first;
- importação manual na Conta;
- espelhamento remoto de novos resultados e recordes;
- fallback local quando Supabase estiver indisponível.

Entregas adicionadas na Fase 1E:

- fila local `pandaPendingSyncQueue`;
- `pendingSyncRepository`;
- `pendingSyncService`;
- flush automático ao carregar o app e quando o navegador volta online;
- indicador e botão "Sincronizar agora" na Conta;
- enfileiramento de falhas para Type Arena, Mapa, Arcade e conquistas.

## Schema

Tabelas criadas em `supabase/schema.sql`:

- `profiles`
- `typing_results`
- `lesson_progress`
- `achievements`
- `user_achievements`
- `arcade_scores`
- `daily_challenge_results`
- `user_settings`

## Auth

O cadastro usa Supabase Auth com e-mail/senha. Um trigger em `auth.users` cria
o profile base em `public.profiles`.

## RLS

Todas as tabelas públicas têm RLS ativo. O padrão é:

- `id = auth.uid()` para `profiles`;
- `user_id = auth.uid()` para dados do usuário;
- `achievements` pode ser lida por usuários autenticados.

## Services

- `src/services/supabase/supabaseClient.ts`
- `src/services/supabase/authService.ts`
- `src/repositories/remote/profileRemoteRepository.ts`
- `src/repositories/remote/typingResultRemoteRepository.ts`
- `src/repositories/remote/lessonProgressRemoteRepository.ts`
- `src/repositories/remote/arcadeScoreRemoteRepository.ts`
- `src/repositories/remote/userAchievementRemoteRepository.ts`
- `src/features/backend-sync/syncLocalProgressService.ts`
- `src/features/auth/AuthContext.tsx`

## Fase 1C — Sync local para Supabase

A Fase 1C mantém o app local-first e adiciona sincronização segura quando o
usuário entra na conta online.

### Importação manual

Na página `/conta`, usuários logados veem o card "Importar progresso local" se
existirem dados no navegador e a flag `pandaCloudSyncImported` ainda não estiver
ativa. O card mostra:

- nível;
- XP;
- treinos;
- fases concluídas;
- melhor PPM;
- recordes Arcade.

Ao clicar em "Importar progresso", o app envia dados locais para o Supabase e só
marca `pandaCloudSyncImported=true` quando a importação termina sem erro. Dados
locais não são apagados.

### Dados importados

- `profiles`: XP, nível, título, streak e última data de treino, sempre sem
  reduzir valores remotos maiores.
- `typing_results`: histórico da Type Arena, incluindo modo, lição, texto,
  desafio diário, duração, métricas, ranking eligibility e flags suspeitas.
- `lesson_progress`: progresso do Mapa do Dojo com upsert por `user_id +
  lesson_id`.
- `arcade_scores`: recordes de Panda Keys e Selos do Teclado.
- `user_achievements`: conquistas locais desbloqueadas.

### Novos eventos logados

Depois que o usuário está autenticado, novos resultados continuam salvando
localmente primeiro. Em seguida o app tenta espelhar:

- resultado da Type Arena em `typing_results`;
- progresso de fase em `lesson_progress`;
- XP/nível/conquistas em `profiles` e `user_achievements`;
- novos recordes do Arcade em `arcade_scores`.

Falhas remotas não quebram a UI e não removem dados locais.

### O que ainda não faz

Ainda não há:

- ranking global;
- importação automática do progresso local;
- desafio diário online separado em `daily_challenge_results`;
- resolução avançada de conflitos entre múltiplos dispositivos.

## Fase 1D — Leitura Remota e Reconstrução de Progresso

Implementada a leitura remota para reconstruir o progresso local ao logar em
outro navegador/dispositivo.

### Serviço

`src/features/backend-sync/restoreRemoteProgressService.ts`:

- `getRemoteProgressSummary(userId)` — busca perfil, resultados, fases, recordes
  e conquistas; retorna `{ ok, error, summary }` com nível, XP, título, streak,
  total de treinos, fases concluídas, recordes do Arcade, conquistas e melhor PPM.
- `hasRemoteProgress(userId)` — `true` se houver qualquer progresso remoto.
- `restoreRemoteProgressToLocal(userId)` — reconstrói o estado local a partir do
  Supabase (controle de erro, sem throw).
- Flags `hasCompletedRestore()` / `markRestoreCompleted()`.

### Repositories remotos (leitura) usados

- `profileRemoteRepository.getProfile`
- `typingResultRemoteRepository.getUserTypingResults` (+ `getRankingEligibleResults`)
- `lessonProgressRemoteRepository.getLessonProgress`
- `arcadeScoreRemoteRepository.getArcadeScores` (+ `getBestArcadeScore`)
- `userAchievementRemoteRepository.getUserAchievements`

### Repositories locais (escrita) usados

- `typingResultRepository.setHistory` (bulk restore, respeita `MAX_HISTORY`)
- `profileProgressRepository.updateProfileProgress`
- `lessonProgressRepository.saveLessonProgress`
- `arcadeScoreRepository.saveScore` (best-of)

### UI

`/conta` (logado) exibe `RestoreRemoteProgressCard` com resumo remoto e os botões
"Restaurar progresso" / "Agora não". Após sucesso, a tela é recarregada para
refletir o progresso reconstruído.

## Fase 1E — Pending Sync

Implementada uma fila local simples para reenviar dados que já foram salvos no
navegador, mas falharam ao espelhar no Supabase.

### Arquivos

- `src/features/backend-sync/pendingSyncTypes.ts`
- `src/repositories/pendingSyncRepository.ts`
- `src/features/backend-sync/pendingSyncService.ts`
- `src/features/backend-sync/usePendingSync.ts`
- `src/features/backend-sync/PendingSyncRunner.tsx`
- `src/pages/AccountPage/components/PendingSyncCard.tsx`

### Dados cobertos

- Resultados da Type Arena (`typing_result`).
- Progresso do Mapa (`lesson_progress`).
- Recordes do Arcade (`arcade_score`).
- Conquistas (`user_achievement`).

### Comportamento

- Falha remota não quebra o app e não apaga dados locais.
- A fila usa `pandaPendingSyncQueue` no localStorage.
- O flush automático roda com usuário logado e Supabase configurado.
- O evento `online` dispara nova tentativa.
- A Conta mostra quantos itens estão pendentes e permite sincronizar
  manualmente.
- Tentativas automáticas param em 5 falhas por item; a ação manual pode tentar
  novamente.

## Ranking Online Inicial

Implementada a primeira leitura online do Ranking do Dojo usando Supabase sem
remover o ranking local.

### Arquivos

- `src/repositories/remote/rankingRemoteRepository.ts`
- `src/features/ranking/useRankingViewModel.ts`
- `src/features/ranking/rankingMappers.ts`
- `supabase/ranking_views.sql`
- `docs/RANKING_SYSTEM.md`

### Fonte de dados

O front-end consulta `public.online_typing_ranking`, view criada por
`supabase/ranking_views.sql`. A view usa:

- `public.typing_results`;
- `public.profiles`;
- apenas resultados `valid_for_ranking = true`;
- campos mínimos necessários para o mural online.

### Comportamento

- O escopo `Local` continua usando histórico do navegador.
- O escopo `Online` busca resultados no Supabase.
- Categorias Geral, Velocidade e Precisão usam ordenação remota inicial.
- Fases e Textos ficam preparados usando filtros por `mode`.
- Arcade e Desafio Diário seguem reservados para etapas futuras.
- Se Supabase, RLS ou view não estiverem prontos, a UI mostra mensagem amigável
  e o ranking local permanece funcional.

## Próximos Passos

1. Sincronizar `daily_challenge_results` de forma dedicada.
2. Evoluir ranking global com RPC/materialized view se o volume crescer.
3. Resolução avançada de conflitos entre múltiplos dispositivos (merge com timestamps).
4. Adicionar testes automatizados dos mapeamentos local/remoto, restauração e
   Pending Sync.
