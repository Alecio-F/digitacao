# Arquitetura de Persistência — PandaDigitações V2

> Fases 1A, 1A.1 e 1A.2 concluídas: a persistência local agora passa por
> `StorageAdapter` + repositories, sem `storageService` legado e sem acesso
> direto a `localStorage` fora do adapter local.

## Por Que Existe Esta Camada

Antes, componentes e hooks liam/gravavam `localStorage` diretamente ou por meio
do `storageService` legado. Isso espalhava chaves, duplicava fluxos de seleção de
treino e dificultaria a futura entrada do Supabase.

A cadeia atual é:

```text
Componente -> Hook/Service -> Repository -> StorageAdapter -> localStorage
```

No futuro:

```text
Componente -> Hook/Service -> Repository -> StorageAdapter -> Supabase
```

Os componentes não precisam saber se a fonte é local ou remota.

## Camadas

### StorageAdapter (`src/services/persistence/`)

- `storageAdapter.ts`: contrato `getItem`, `setItem`, `removeItem`, `updateItem`.
- `localStorageAdapter.ts`: implementação robusta sobre `localStorage`.
- `persistenceKeys.ts`: mapa semântico para as mesmas chaves já existentes.
- `types.ts`: exports da camada e adapter ativo (`persistence`).

Regras do adapter local:

- JSON inválido não quebra a aplicação.
- `window`/storage indisponível retorna fallback.
- Arrays/objetos inválidos voltam para fallback.
- Strings cruas antigas continuam legíveis.
- Nenhum nome real de chave foi alterado.

### Repositories (`src/repositories/`)

| Repository | Responsabilidade |
| --- | --- |
| `typingResultRepository` | Histórico e resultados da Type Arena. |
| `lessonProgressRepository` | Progresso das fases, started lessons, medalhas e conclusão. |
| `profileProgressRepository` | XP, nível, conquistas, streak, last mistakes, limpeza/exportação de progresso. |
| `arcadeScoreRepository` | Recordes de Panda Keys e Selos do Teclado. |
| `dailyChallengeRepository` | Resultado, dismiss, conclusão e seleção do Desafio Diário. |
| `dailyMissionRepository` | Missões diárias e data da missão. |
| `recommendationRepository` | Recomendações locais de treino. |
| `randomWordsRepository` | Palavras recentes do modo Palavras Aleatórias. |
| `settingsRepository` | Tema, cursor, teclado virtual, som, animações e efeitos. |
| `trainingSelectionRepository` | Seleção de treino carregada pela Type Arena. |

`src/repositories/index.ts` expõe um barrel namespaced para a camada.

## Fase 1A — Base

Foi criada a base de persistência:

- `StorageAdapter`;
- `localStorageAdapter`;
- `PERSISTENCE_KEYS`;
- repositories iniciais;
- compatibilidade com chaves antigas.

## Fase 1A.1 — Migração Crítica

Fluxos críticos migrados:

- `usePlayerProgress`;
- `useLocalRanking`;
- `saveSessionResult`;
- seleção de treino/fase;
- configurações locais.

Regras preservadas:

- cálculo de PPM/CPM;
- XP e nível;
- ranking eligibility;
- medalhas;
- formatos antigos no localStorage.

## Fase 1A.2 — Padronização Final Local

Concluída a migração dos usos restantes do `storageService` legado.

### Usos Migrados

| Antes | Agora |
| --- | --- |
| `saveResult -> pandaLastMistakes` | `profileProgressRepository.setLastMistakes` |
| `wordGenerator -> pandaRecentRandomWords` | `randomWordsRepository` |
| `useDailyMissions` | `dailyMissionRepository` |
| `useRecommendations` | `recommendationRepository` |
| `useLocalProfile` | `profileProgressRepository` + `arcadeScoreRepository` |
| `useSealChallenge` | `arcadeScoreRepository` |
| `PandaKeysGame` | `arcadeScoreRepository` |
| `dailyChallenge/storage.ts` | wrapper depreciado sobre `dailyChallengeRepository` |
| `dailyChallengeService.ts` | `dailyChallengeRepository` + `trainingSelectionRepository` |
| `lessonProgressService -> startedLessons` | `lessonProgressRepository` |
| `ResultsScreen -> historico` | `typingResultRepository` |

### Repositories Novos Nesta Fase

- `randomWordsRepository.ts`
- `dailyMissionRepository.ts`
- `recommendationRepository.ts`

### Repositories Atualizados Nesta Fase

- `profileProgressRepository.ts`
- `lessonProgressRepository.ts`
- `dailyChallengeRepository.ts`
- `arcadeScoreRepository.ts`
- `trainingSelectionRepository.ts`

### Status do `storageService`

`src/services/storage/storageService.ts` foi removido porque não há mais imports
ativos. O único acesso direto a `localStorage` fica em
`src/services/persistence/localStorageAdapter.ts`, que é a implementação local do
`StorageAdapter`.

### Pendências Restantes

- `src/features/dailyChallenge/storage.ts` permanece como wrapper depreciado de
compatibilidade. Pode ser removido quando não houver risco de imports externos.
- O próximo passo antes do Supabase é definir models remotos e estratégia de
sync local-first, sem conectar Supabase diretamente em componentes.

## Como o Supabase Deve Entrar Depois

1. Criar um `remoteStorageAdapter` ou repositories Supabase dedicados.
2. Preservar `PERSISTENCE_KEYS` para migração local.
3. Importar dados locais na primeira sessão autenticada.
4. Usar flag `pandaCloudSyncImported`.
5. Manter componentes e hooks chamando repositories, não Supabase direto.

## Estado Para Fase 1B

O projeto está pronto para iniciar a Fase 1B de Supabase Foundation do ponto de
vista da persistência local: a camada local está isolada, testável e substituível.
