# MIGRATION_TASKS.md
# PandaDigitações — Tarefas Executáveis de Migração

> Baseado em: `MIGRATION_PLAN.md`
> Regra: trabalhar um ciclo por vez. Parar e aguardar revisão antes de avançar.
> A v1 estática em `assets/` deve ser preservada integralmente durante todo o processo.

---

## Ciclo 0 — Preservar v1 Estática
**Objetivo:** Garantir ponto de retorno seguro antes de qualquer migração.
**Risco:** Baixo — apenas git, sem alteração de código.
**Critério de aceite:** Tag `v1.0-static` criada, branch de backup existente, remote atualizado.

```bash
git add assets/ MIGRATION_PLAN.md MIGRATION_TASKS.md QA_CHECKLIST.md RELEASE_NOTES.md README.md
git commit -m "chore: finalizar v1 estática Panda Dojo Arcade antes da migração"
git tag v1.0-static
git branch main-static-backup
git push origin Organizando
git push origin v1.0-static
git push origin main-static-backup
```

- [ ] Commitar estado atual da v1
- [ ] Criar tag `v1.0-static`
- [ ] Criar branch `main-static-backup`
- [ ] Fazer push do tag e da branch para o remote
- [ ] Confirmar que `assets/` continua intacta após os comandos

---

## Ciclo 1 — Criar Projeto Vite Paralelo
**Objetivo:** Estrutura React/Vite/TypeScript vazia, sem tocar na v1.
**Risco:** Baixo — projeto novo em pasta separada.
**Critério de aceite:** `panda-dojo-v2/` roda com `npm run dev`, build sem erros, `assets/` intocada.
**Branch sugerida:** `feat/react-migration`

### Tarefas
- [ ] Criar branch `feat/react-migration`
- [ ] Criar projeto: `npm create vite@latest panda-dojo-v2 -- --template react-ts`
- [ ] Instalar dependências: `cd panda-dojo-v2 && npm install`
- [ ] Instalar ESLint + Prettier:
  ```bash
  npm install -D eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-jsx-a11y
  npm install -D prettier eslint-config-prettier
  ```
- [ ] Criar `.prettierrc`
- [ ] Criar `eslint.config.js` ou `.eslintrc.json`
- [ ] Configurar alias `@/` → `src/` no `vite.config.ts` e `tsconfig.json`
- [ ] Criar estrutura de pastas inicial:
  ```
  panda-dojo-v2/src/
    app/
    pages/
    components/
    features/
    services/
    styles/
    assets/
    constants/
    utils/
    tests/
  ```
- [ ] Criar `src/App.tsx` mínimo (só `<h1>Panda Dojo v2</h1>`)
- [ ] Confirmar `npm run dev` funciona
- [ ] Confirmar `npm run build` funciona sem erros TypeScript

### Arquivos esperados
- `panda-dojo-v2/package.json`
- `panda-dojo-v2/vite.config.ts`
- `panda-dojo-v2/tsconfig.json`
- `panda-dojo-v2/tsconfig.app.json`
- `panda-dojo-v2/.prettierrc`
- `panda-dojo-v2/eslint.config.js`
- `panda-dojo-v2/src/App.tsx`

### Riscos
- Nenhum risco para a v1 — pasta completamente separada.
- Se preferir migrar na raiz: requer atenção extra para não apagar `assets/`.

---

## Ciclo 2 — Migrar Constantes e Utilitários
**Objetivo:** Mover as partes de mais baixo risco primeiro — sem UI, sem componentes.
**Risco:** Baixo — apenas arquivos TypeScript puros, sem DOM.
**Critério de aceite:** `npm run build` sem erros, `tsc --noEmit` sem erros, chaves localStorage idênticas à v1.

**Referências da v1:**
- `assets/js/constants.mjs`
- `assets/js/utils/storage.mjs`
- `assets/js/utils/format.mjs`

### Tarefas

#### src/constants/
- [ ] Criar `storageKeys.ts` — `STORAGE_KEYS` e `KEYS` como `as const`
- [ ] Criar `trainingModes.ts` — `TRAINING_MODES` como `as const`
- [ ] Criar `levelTitles.ts` — `LEVEL_TITLES` como `as const`
- [ ] Criar `config.ts` — `XP_PER_LEVEL`, `MAX_HISTORY`, `WORDS_COUNT`, `MAX_EXTRA_LETTERS`, `COMBO_MILESTONE`, `TOP_ERRORS_COUNT`

#### src/services/storage/
- [ ] Criar `storageService.ts` com:
  - `getStorage<T>(key: string, fallback: T): T`
  - `setStorage<T>(key: string, value: T): T`
  - `removeStorage(key: string): void`
  - `updateStorage<T>(key: string, updater: (current: T) => T, fallback: T): T`
  - Tratar: JSON inválido, localStorage indisponível (SSR-safe), fallback seguro

#### src/utils/
- [ ] Criar `format.ts` com:
  - `formatPercent(value: number): string`
  - `formatDate(date?: Date | string): string`
  - `formatDuration(seconds: number): string`
  - `formatNumber(value: number): string`
  - `clamp(value: number, min: number, max: number): number`

### Arquivos esperados
```
panda-dojo-v2/src/
  constants/
    storageKeys.ts
    trainingModes.ts
    levelTitles.ts
    config.ts
  services/storage/
    storageService.ts
  utils/
    format.ts
```

### Riscos
- As chaves localStorage DEVEM ser idênticas às da v1 para manter compatibilidade com dados existentes.
- Verificar: `KEYS.historico === "historico"`, `KEYS.xp === "pandaXp"`, etc.

---

## Ciclo 3 — Migrar Tokens CSS e Design System Base
**Objetivo:** Criar a base visual do Panda Dojo Arcade em React. Sem páginas ainda.
**Risco:** Médio — decisão sobre CSS Modules vs CSS global vs Tailwind. Escolher antes de iniciar.
**Critério de aceite:** App mostra componentes base com visual Panda Dojo Arcade, dark mode funciona, build ok.

**Referências da v1:**
- `assets/css/style.css` (variáveis, reset, tipografia)
- `assets/css/dojo.css` (tokens `--dojo-*`, componentes)
- `assets/css/animations.css` (keyframes, reduced-motion)

### Tarefas

#### src/styles/
- [ ] Criar `tokens.css` — todas as variáveis `--dojo-*` de `dojo.css`
- [ ] Criar `global.css` — reset, tipografia, `body`, variáveis de cor
- [ ] Criar `animations.css` — keyframes base + `prefers-reduced-motion`
- [ ] Importar tudo no `main.tsx`

#### src/components/ui/
- [ ] `Button.tsx` — variants: primary, secondary, ghost; disabled state
- [ ] `IconButton.tsx` — Material Symbol icon + aria-label
- [ ] `Card.tsx` — dojo-card base, locked variant
- [ ] `Panel.tsx` — dojo-panel
- [ ] `Badge.tsx` — variants: success, warning, danger, muted
- [ ] `Chip.tsx` — variants: special, success, danger, muted
- [ ] `MetricCard.tsx` — label + value + highlight variant
- [ ] `ProgressBar.tsx` — value 0-100, aria-label, animated variant

#### Validação visual
- [ ] Criar `src/pages/DevPage/index.tsx` com showcase de todos os componentes
- [ ] Verificar dark mode toggling
- [ ] Verificar `prefers-reduced-motion`
- [ ] Verificar responsividade (320px, 768px, 1024px)

### Arquivos esperados
```
panda-dojo-v2/src/
  styles/
    tokens.css
    global.css
    animations.css
  components/ui/
    Button.tsx
    IconButton.tsx
    Card.tsx
    Panel.tsx
    Badge.tsx
    Chip.tsx
    MetricCard.tsx
    ProgressBar.tsx
  pages/DevPage/
    index.tsx
```

### Riscos
- Não copiar `dojo.css` inteiro — selecionar apenas o que cada componente precisa.
- Evitar dependência de classes globais nos componentes (preferir props/variants).
- `prefers-reduced-motion` nuclear do `animations.css` da v1 pode conflitar — testar antes de migrar.

---

## Ciclo 4 — Criar Layout Global
**Objetivo:** Header, nav mobile, drawer de configurações e canvas de fundo funcionando.
**Risco:** Médio — header precisa ler localStorage para player status.
**Critério de aceite:** App com layout completo, tema funciona, drawer abre/fecha, canvas de fundo anima.

**Referências da v1:**
- `assets/js/config.mjs` (renderDojoHeader, setupThemeToggle, setupConfigDrawer)
- `assets/js/dojoBackground.mjs` (canvas de fundo)
- `assets/js/pandaMascot.mjs` (mascote animado)

### Tarefas

#### src/features/settings/
- [ ] Criar `types.ts` — `Settings`, `Theme`
- [ ] Criar `hooks/useSettings.ts` — ler/escrever tema e tempoPratica do localStorage

#### src/components/layout/
- [ ] `AppLayout.tsx` — wrapper raiz com `BackgroundCanvas` e `AppLayout`
- [ ] `HeaderHud.tsx` — logo, nav desktop, `PlayerStatus` mock, botão config, CTA
- [ ] `MobileBottomNav.tsx` — 5 itens: Início, Arena, Mapa, Arcade, Conta
- [ ] `SettingsDrawer.tsx` — tema, seletor de tempo, sons, animações
- [ ] `BackgroundCanvas.tsx` — partículas Canvas + grid arcade; pausa em `visibilitychange` e `prefers-reduced-motion`
- [ ] `PageShell.tsx` — wrapper de página com title

#### src/components/mascot/
- [ ] `PandaMascot.tsx` — mascote Panda com animação de olhos (pode ser stub visual inicialmente)

#### src/app/
- [ ] `providers.tsx` — ThemeProvider (aplica `data-theme` no `<html>`)
- [ ] `App.tsx` — monta `AppLayout` com `PageShell` básico

### Arquivos esperados
```
panda-dojo-v2/src/
  features/settings/
    types.ts
    hooks/useSettings.ts
  components/layout/
    AppLayout.tsx
    HeaderHud.tsx
    MobileBottomNav.tsx
    SettingsDrawer.tsx
    BackgroundCanvas.tsx
    PageShell.tsx
  components/mascot/
    PandaMascot.tsx
  app/
    App.tsx
    providers.tsx
```

### Riscos
- `BackgroundCanvas` usa `requestAnimationFrame` — cleanup no `useEffect` é obrigatório.
- `HeaderHud` vai precisar de `usePlayerProgress` — usar dados mockados até o Ciclo 6.
- Tema dark: usar `data-theme="dark"` no `<html>` + CSS vars, NÃO classes por elemento (diferente da v1).

---

## Ciclo 5 — Migrar Home
**Objetivo:** Primeira página React funcional com dados reais do localStorage.
**Risco:** Baixo-médio — página menos complexa, sem engine crítica.
**Critério de aceite:** Home abre, progresso aparece, missões aparecem, recomendações aparecem.

**Referências da v1:**
- `assets/index.html`
- `assets/js/dojo-home.mjs`
- `assets/js/gamification.mjs`
- `assets/js/dailyMissions.mjs`
- `assets/js/trainingRecommendations.mjs`

### Tarefas

#### src/features/gamification/
- [ ] Criar `types.ts` — `DojoProfile`, `Achievement`, `HistoryItem`
- [ ] Criar `logic/xpCalculator.ts` — de `gamification.mjs`
- [ ] Criar `logic/achievementChecker.ts` — de `gamification.mjs`
- [ ] Criar `hooks/usePlayerProgress.ts` — lê perfil do localStorage

#### src/features/missions/
- [ ] Criar `types.ts` — `DailyMission`
- [ ] Criar `data/missionTemplates.ts` — de `dailyMissions.mjs`
- [ ] Criar `hooks/useDailyMissions.ts` — de `dailyMissions.mjs`

#### src/features/recommendations/
- [ ] Criar `types.ts` — `TrainingRecommendation`
- [ ] Criar `hooks/useRecommendations.ts` — de `trainingRecommendations.mjs`

#### src/pages/HomePage/
- [ ] `index.tsx` — monta a home
- [ ] `components/PlayerProgressPanel.tsx`
- [ ] `components/RankingPanel.tsx` (local/visual)
- [ ] `components/DailyMissionList.tsx`
- [ ] `components/RecommendationCard.tsx`
- [ ] `components/AchievementsPanel.tsx`
- [ ] `components/TypingHistoryList.tsx`

#### src/app/router.tsx
- [ ] Configurar React Router com rota `/` → `HomePage`

### Riscos
- Dados do localStorage da v1 devem ser legíveis sem transformação.
- Ranking é visual/local — não implementar competitivo.
- `usePlayerProgress` pode chamar `getDojoProfile()` — testar com localStorage vazio e com dados reais.

---

## Ciclo 6 — Migrar Aprenda
**Objetivo:** Página tutorial quase estática, fácil de migrar.
**Risco:** Baixo.
**Critério de aceite:** Carrossel funciona, responsivo, visual Panda Dojo Arcade.

**Referências da v1:**
- `assets/page/aprenda.html`
- `assets/js/script.mjs` (carrossel de dicas)

### Tarefas
- [ ] Criar `src/pages/LearnPage/index.tsx`
- [ ] `components/MentorHero.tsx`
- [ ] `components/TipCarousel.tsx` — auto-advance, setas, block durante animação
- [ ] `components/TipCard.tsx`
- [ ] `components/FingerPositionMap.tsx` (imagem ou SVG)
- [ ] `components/LearnCta.tsx`
- [ ] Adicionar rota `/aprenda` no router

---

## Ciclo 7 — Migrar Mapa do Dojo
**Objetivo:** Trilha visual de fases com progresso real do localStorage.
**Risco:** Médio — estados de fase dependem de `useLessonProgress`.
**Critério de aceite:** 8 fases renderizadas, estados calculados, desbloqueio funciona, medalhas aparecem.

**Referências da v1:**
- `assets/page/pratique.html`
- `assets/js/pratique.mjs`
- `assets/js/dojoLessons.mjs`
- `assets/js/lessonTexts.mjs`

### Tarefas

#### src/features/lessons/
- [ ] Criar `types.ts` — `Lesson`, `LessonProgress`, `LessonProgressMap`, `Medal`
- [ ] Criar `data/lessons.ts` — array de 8 lições de `dojoLessons.mjs`
- [ ] Criar `data/lessonTexts.ts` — de `lessonTexts.mjs`
- [ ] Criar `hooks/useLessonProgress.ts` — lê/escreve progresso, desbloqueio, medalhas

#### src/pages/DojoMapPage/
- [ ] `index.tsx`
- [ ] `components/PlayerCard.tsx`
- [ ] `components/LessonTrail.tsx`
- [ ] `components/TrailStep.tsx` — zigzag, side: left | right
- [ ] `components/TrailNode.tsx` — ícone + estado
- [ ] `components/LessonCard.tsx` — CTA, status, medalha
- [ ] `components/LessonStatusBadge.tsx`

- [ ] Adicionar rota `/mapa` no router
- [ ] Ao iniciar fase: salvar `KEYS.selectedLessonId` no localStorage

### Riscos
- A integração "iniciar lição → abrir Type Arena" pode ser mockada se a Type Arena ainda não estiver migrada.
- Zigzag CSS: testar mobile (320px) — nó sempre na esquerda no mobile.

---

## Ciclo 8 — Migrar Type Arena ⚠️ FASE CRÍTICA
**Objetivo:** Núcleo do produto. Não iniciar sem as bases anteriores estáveis.
**Risco:** Alto — engine de digitação complexa, muitos edge cases.
**Critério de aceite:** Ver lista de testes abaixo.

**Referências da v1:**
- `assets/page/digitando.html`
- `assets/js/typing.mjs`
- `assets/js/tempo.mjs`
- `assets/js/estado.mjs`
- `assets/js/paramentros.mjs`
- `assets/js/historico.mjs`
- `assets/js/palavras.mjs`
- `assets/js/linhas.mjs`
- `assets/js/cursor.mjs`

### Tarefas

#### src/features/typing/
- [ ] Criar `types.ts` — `WordItem`, `LetterItem`, `LetterStatus`, `TrainingResult`
- [ ] Criar `data/wordBank.ts` — banco de palavras PT
- [ ] Criar `logic/wordGenerator.ts` — shuffle, obterProximaPalavra, modo lição
- [ ] Criar `logic/precisionCalc.ts` — calcularPrecisao
- [ ] Criar `hooks/useTypingEngine.ts` — handler completo de digitação:
  - letras corretas/incorretas
  - backspace (4 casos)
  - espaço (2 casos)
  - letras extras
  - combo
  - erros por tecla
- [ ] Criar `hooks/useTimer.ts` — countdown, PPM, CPM, finalizar
- [ ] Criar `hooks/useVirtualKeyboard.ts` — next key highlight

#### src/pages/TypeArenaPage/
- [ ] `index.tsx`
- [ ] `components/TypeArenaCard.tsx`
- [ ] `components/ArenaTopbar.tsx`
- [ ] `components/MetricsHud.tsx`
- [ ] `components/MasterFeedback.tsx`
- [ ] `components/TypingTextBox.tsx` — renderização de letras com refs
- [ ] `components/TypingPreview.tsx`
- [ ] `components/VirtualKeyboard.tsx`
- [ ] `components/TimerBar.tsx`
- [ ] `components/ResultScreen.tsx` — count-up animado, XP, histórico
- [ ] `components/HistoryGrid.tsx`

- [ ] Adicionar rota `/arena` no router
- [ ] Integrar `usePlayerProgress` (XP + conquistas ao finalizar)
- [ ] Integrar modo lição (`selectedLessonId` do localStorage)

### Checklist de testes obrigatório
- [ ] Iniciar treino (primeira tecla inicia o timer)
- [ ] Pausar e retomar (timer para e volta)
- [ ] Reiniciar (soft reset — "Próximo texto")
- [ ] Recarregar ("Fazer novamente")
- [ ] Letra correta (verde, combo+1)
- [ ] Letra errada (vermelho, combo=0, erro registrado)
- [ ] Backspace no meio da palavra (desfaz anterior)
- [ ] Backspace na primeira letra (volta palavra anterior)
- [ ] Backspace com letra extra (remove extra)
- [ ] Backspace no fim da palavra (desfaz última)
- [ ] Espaço com palavra incompleta (marca restante como errado)
- [ ] Espaço com palavra completa (avança para próxima)
- [ ] Letras extras além do limite (MAX_EXTRA_LETTERS=5 bloqueado)
- [ ] Timer zera → resultado aparece
- [ ] Resultado salva no localStorage (`historico`)
- [ ] XP é ganho e salvo
- [ ] Novo recorde detectado corretamente
- [ ] Teclado virtual destaca próxima tecla
- [ ] Modo lição carrega palavras corretas
- [ ] Histórico aparece na tela de resultado
- [ ] Recomendação adaptativa aparece no resultado

### Riscos
- `useTypingEngine` é o maior risco. Testar cada caso de backspace separadamente.
- Scroll de linhas (de `linhas.mjs`) — implementar com `useRef` + `scrollIntoView`.
- Cursor visual — CSS puro com `position: absolute` no container.
- PPM/CPM: validar contra v1 com mesmos dados de entrada.
- Não usar jQuery. Nenhum `$(...)`.

---

## Ciclo 9 — Migrar Arcade ⚠️ FASE COMPLEXA
**Objetivo:** Panda Keys com Canvas, game loop e touch controls.
**Risco:** Alto — game loop + React precisa de cleanup cuidadoso.
**Critério de aceite:** Ver checklist abaixo.

**Referências da v1:**
- `assets/page/game.html`
- `assets/js/game/` (todos os 9 módulos)

### Tarefas

#### src/features/arcade/
- [ ] Criar `types.ts` — `GameStatus`, `Tile`, `Particle`, `GameStage`, `GameState`
- [ ] Criar `panda-keys/gameRenderer.ts` — de `game/renderer.mjs` (puro, sem React)
- [ ] Criar `panda-keys/spawner.ts` — de `game/spawner.mjs`
- [ ] Criar `panda-keys/score.ts` — de `game/score.mjs`
- [ ] Criar `panda-keys/useGameLoop.ts` — fixed-step, rAF, cleanup obrigatório
- [ ] Criar `panda-keys/useGameInput.ts` — keyboard + touch, cleanup obrigatório
- [ ] Criar `panda-keys/useAudio.ts` — Web Audio API, AudioContext lazy
- [ ] Criar `panda-keys/PandaKeysGame.tsx` — canvas ref + orquestra hooks
- [ ] Criar `seal-challenge/SealChallengeGame.tsx`
- [ ] Criar `shared/ArcadeHud.tsx`
- [ ] Criar `shared/GameModeSelector.tsx`
- [ ] Criar `shared/GameStatusPanel.tsx`
- [ ] Criar `shared/FloatingScoreLayer.tsx`
- [ ] Criar `src/pages/ArcadePage/index.tsx`
- [ ] Adicionar rota `/arcade` no router

### Checklist de testes obrigatório
- [ ] Iniciar Panda Keys (todos os 4 estágios)
- [ ] Tiles caem e chegam na linha de hit
- [ ] Tecla correta acerta tile (pontuação aumenta, combo aumenta)
- [ ] Tecla errada ou tile escapando (miss, vida diminui)
- [ ] Tutorial: 3 primeiros misses não tiram vida
- [ ] Game over quando vidas = 0
- [ ] Play again reseta estado
- [ ] Recorde salvo no localStorage
- [ ] Touch controls funcionam no mobile
- [ ] Pause/resume para o canvas
- [ ] Resize do canvas sem quebrar
- [ ] Sem memory leak ao desmontar componente (verificar via DevTools)
- [ ] Visibilitychange pausa o jogo

### Riscos
- **Memory leak crítico**: `requestAnimationFrame` DEVE ser cancelado no cleanup do `useEffect`.
- **CSS vars para tema no Canvas**: ler com `getComputedStyle` dentro do `useEffect` (após mount), nunca no top-level do módulo.
- **StrictMode do React**: o `useEffect` roda duas vezes em dev — testar com e sem StrictMode.
- `useGameInput` e `useAudio` precisam de cleanup de event listeners.

---

## Ciclo 10 — Testes e QA
**Objetivo:** Segurança mínima para a nova versão.
**Risco:** Baixo — apenas adicionar testes, sem alterar lógica.
**Critério de aceite:** Suítes passam, sem regressões, build ok.

### Configuração
- [ ] Instalar Vitest: `npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event`
- [ ] Configurar `vite.config.ts` com `test: { environment: 'jsdom' }`
- [ ] Instalar Playwright (opcional): `npm init playwright@latest`

### Testes unitários (Vitest)
- [ ] `storageService.test.ts` — get/set/remove/update, JSON inválido, fallback
- [ ] `format.test.ts` — formatPercent, formatDate, formatDuration, clamp
- [ ] `precisionCalc.test.ts` — precisão com 0 letras, 100%, 50%, etc.
- [ ] `wordGenerator.test.ts` — shuffle, modo lição, modo aleatório
- [ ] `xpCalculator.test.ts` — cálculo de XP por precisão, recorde, sem pausa
- [ ] `achievementChecker.test.ts` — first-training, precision-90, etc.
- [ ] `score.test.ts` — hit ratings, penalidades de miss
- [ ] `spawner.test.ts` — geração de tiles por estágio e tempo
- [ ] `lessonProgress.test.ts` — desbloqueio por requisitos, medalhas

### Testes E2E (Playwright, se configurado)
- [ ] Home abre e exibe conteúdo
- [ ] Type Arena: iniciar → digitar palavra → resultado aparece
- [ ] Mapa do Dojo: fases renderizadas, CTA funciona
- [ ] Arcade: iniciar Panda Keys, tecla correta → pontuação aumenta
- [ ] Dark mode: toggle funciona em todas as páginas

---

## Ciclo 11 — Preparar Backend Futuro (Supabase)
**Objetivo:** Interfaces TypeScript sem implementação. Zero risco.
**Risco:** Nenhum — apenas types e interfaces.

### Tarefas
- [ ] Criar `src/services/future-api/types.ts` — interfaces:
  ```typescript
  interface IAuthService {
    signIn(email: string, password: string): Promise<void>
    signUp(email: string, password: string): Promise<void>
    signOut(): Promise<void>
    getUser(): Promise<User | null>
  }

  interface IProgressRepository {
    getProfile(userId: string): Promise<DojoProfile>
    saveProgress(userId: string, progress: Partial<DojoProfile>): Promise<void>
  }

  interface IHistoryRepository {
    getHistory(userId: string): Promise<HistoryItem[]>
    addResult(userId: string, result: TrainingResult): Promise<void>
  }

  interface ILessonRepository {
    getLessonProgress(userId: string): Promise<LessonProgressMap>
    saveLessonProgress(userId: string, progress: LessonProgressMap): Promise<void>
  }

  interface IRankingRepository {
    getTopPlayers(limit?: number): Promise<RankingEntry[]>
  }
  ```
- [ ] Documentar schema futuro de tabelas Supabase em `src/services/future-api/README.md`
- [ ] Garantir que repositórios locais (`progressRepository.ts`, etc.) implementem as interfaces — preparado para swap quando Supabase chegar

### NÃO fazer
- Não criar projeto Supabase
- Não adicionar `VITE_SUPABASE_URL` ou `VITE_SUPABASE_ANON_KEY`
- Não instalar `@supabase/supabase-js`
- Não implementar autenticação

---

## Regras Globais (relembrar a cada ciclo)

1. Trabalhar um ciclo por vez — parar e aguardar revisão.
2. Nunca apagar ou modificar `assets/`.
3. Nunca usar jQuery na versão React.
4. Nunca implementar backend antes do Ciclo 11.
5. Sempre verificar `npm run build` ao final de cada ciclo.
6. Preservar as chaves localStorage da v1 (compatibilidade de dados).
7. Usar TypeScript com tipos explícitos.
8. Preferir funções puras — fácil de testar.
9. Cleanup de `useEffect` é obrigatório para Canvas, rAF e event listeners.
10. Respeitar `prefers-reduced-motion` e acessibilidade.

---

## Progresso

| Ciclo | Status | Branch |
|---|---|---|
| 0 — Preservar v1 | ⏳ Pendente | `Organizando` |
| 1 — Projeto Vite | ⏳ Aguardando Ciclo 0 | `feat/react-migration` |
| 2 — Constantes/utils | ⏳ Aguardando Ciclo 1 | `feat/react-migration` |
| 3 — Design System | ⏳ Aguardando Ciclo 2 | `feat/react-migration` |
| 4 — Layout global | ⏳ Aguardando Ciclo 3 | `feat/react-migration` |
| 5 — Home | ⏳ Aguardando Ciclo 4 | `feat/react-migration` |
| 6 — Aprenda | ⏳ Aguardando Ciclo 5 | `feat/react-migration` |
| 7 — Mapa do Dojo | ⏳ Aguardando Ciclo 6 | `feat/react-migration` |
| 8 — Type Arena | ⏳ Aguardando Ciclo 7 | `feat/react-migration` |
| 9 — Arcade | ⏳ Aguardando Ciclo 8 | `feat/react-migration` |
| 10 — Testes | ⏳ Aguardando Ciclo 9 | `feat/react-migration` |
| 11 — Backend futuro | ⏳ Aguardando Ciclo 10 | `feat/react-migration` |
