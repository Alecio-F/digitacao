# Auditoria Front-end V2 — PandaDigitações

> **Atualização — Fase 1A de persistência concluída.** Foi criada a camada de
> adapters + repositories (`src/services/persistence/` e `src/repositories/`)
> antes da conexão com Supabase. Os fluxos de seleção de treino e as
> configurações deixaram de acessar `localStorage` diretamente. Detalhes em
> [`PERSISTENCE_ARCHITECTURE.md`](./PERSISTENCE_ARCHITECTURE.md).
>
> **Atualização — Fase 1A.1 de persistência local crítica concluída.**
> `usePlayerProgress`, `useLocalRanking`, o salvamento de histórico/perfil
> (`saveResult`) e `selectLesson` foram migrados para os repositories. Não há
> mais acesso direto a `localStorage` fora da camada de persistência.
>
> **Atualização — Fase 1A.2 concluída.** Os usos restantes do `storageService`
> legado foram migrados para repositories/localStorageAdapter. O arquivo legado
> foi removido e a persistência local está pronta para a Fase 1B Supabase.

## Resumo
Foi feita uma auditoria focada em organização, textos visíveis, acentuação, consistência de termos, localStorage, acessibilidade básica e estabilidade antes da futura entrada do Supabase.

A estrutura geral da V2 está coerente para um projeto React + TypeScript + Vite: rotas em `src/app`, componentes globais em `src/components`, páginas em `src/pages`, funcionalidades em `src/features`, persistência local em `src/services/persistence`, repositories em `src/repositories` e constantes em `src/constants`.

## Arquivos Revisados
- `src/app/router.tsx`
- `src/components/layout/*`
- `src/components/system/ErrorBoundary.tsx`
- `src/components/ui/*`
- `src/features/dailyChallenge/*`
- `src/features/gamification/*`
- `src/features/lessons/*`
- `src/features/practiceTexts/*`
- `src/features/ranking/*`
- `src/features/recommendations/*`
- `src/features/settings/*`
- `src/features/typing/*`
- `src/pages/HomePage/*`
- `src/pages/ArenaPage/*`
- `src/pages/DojoMapPage/*`
- `src/pages/ArcadePage/*`
- `src/pages/AccountPage/*`
- `src/pages/RankingPage/*`
- `src/styles/*`

## Correções Textuais Realizadas
- Correção de acentuação e pontuação em textos de resultado da Type Arena.
- Padronização de termos como "Precisão", "Histórico", "Desafio Diário", "Missão Diária", "Palavras Aleatórias" e "Textos para Praticar".
- Revisão dos textos compartilháveis do Desafio Diário.
- Revisão do banco de textos do Desafio Diário.
- Revisão dos Textos para Praticar.
- Correção de labels no Ranking, incluindo "Evolução recente", "Últimos elegíveis" e "Treinos elegíveis".
- Revisão de microcopy do preview do Design System para remover termos quebrados ou sem acento.

## Correções de Código Realizadas
- Centralização do início do Desafio Diário no card antigo da Home usando `startDailyChallenge`, evitando duplicação de escrita manual no localStorage.
- Migração final dos acessos ao `storageService` para repositories/localStorageAdapter.
- Remoção do `storageService` legado.
- Preservação da lógica existente da Type Arena, Ranking, Mapa e Arcade.
- Nenhuma chave de localStorage foi renomeada.
- Nenhuma regra de pontuação foi alterada.

## Problemas Encontrados e Corrigidos
- Textos visíveis com acentuação ausente ou inconsistência de termos.
- Cópias compartilháveis com termos quebrados.
- Labels de ranking sem acento.
- Duplicação simples da lógica de preparação do Desafio Diário em um componente da Home.

## Pendências Para Depois

### Baixa Prioridade
- Avaliar se o `DailyChallengeCard` antigo ainda é necessário, já que o banner novo é o elemento principal.
- Fazer revisão visual manual completa em navegadores reais para contraste fino de tema claro/escuro.

### Antes do Supabase
- Definir models remotos para histórico, progresso, ranking, perfil, missões e desafios.
- Mapear o formato final dos dados locais que serão sincronizados.
- Definir política de migração de dados antigos do localStorage.
- Manter novas leituras/escritas passando por repositories/adapters.

### Depois do Supabase
- Substituir ranking local por ranking real com regras anti-abuso no servidor.
- Criar autenticação real sem remover o modo local.
- Sincronizar conquistas, XP e histórico com fallback offline.

### Futuras Features
- Mais minigames no Arcade.
- Compartilhamento visual de resultados.
- Painel avançado de evolução por tecla.

## Riscos Restantes
- O projeto ainda depende de localStorage como fonte principal de verdade.
- Ainda não há adapter remoto nem estratégia de sincronização com conflito resolvido.
- A auditoria não substitui QA visual manual em todos os breakpoints.
- Não há suíte automatizada de testes funcionais para Type Arena, Mapa e Arcade.

## Recomendação Final
O projeto está organizado o suficiente para iniciar a fase de planejamento do Supabase, desde que a próxima etapa comece pela modelagem dos dados e pela criação de adapters de persistência. A recomendação é não conectar Supabase diretamente nos componentes; primeiro isolar histórico, ranking, progresso, perfil, missões e desafios em services compatíveis com modo local e modo remoto.
