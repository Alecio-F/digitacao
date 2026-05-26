# MIGRATION_PLAN.md
# PandaDigitações — Plano de Migração para Vite + React + TypeScript

> **Status:** Documentação de planejamento — v1 estática preservada integralmente.
> **Data:** 2026-05-26
> **Versão atual:** Panda Dojo Arcade Local v1 (estática, sem build step)
> **Alvo futuro:** Vite + React + TypeScript + Zustand + React Router

---

## Sumário

1. [Inventário do Projeto Atual](#1-inventário-do-projeto-atual)
2. [Mapeamento de Componentes Futuros](#2-mapeamento-de-componentes-futuros)
3. [Mapeamento de Estados Futuros](#3-mapeamento-de-estados-futuros)
4. [localStorage — Mapeamento para Camada de Storage](#4-localstorage--mapeamento-para-camada-de-storage)
5. [Arquitetura Futura Proposta](#5-arquitetura-futura-proposta)
6. [Plano de Migração por Etapas](#6-plano-de-migração-por-etapas)
7. [O que Não Deve ser Migrado Literalmente](#7-o-que-não-deve-ser-migrado-literalmente)
8. [Checklist de Migração](#8-checklist-de-migração)
9. [Relatório Final e Riscos](#9-relatório-final-e-riscos)

---

## 1. Inventário do Projeto Atual

### 1.1 Páginas

---

#### Página: Home
**Arquivo:** `assets/index.html`
**Responsabilidade:** Ponto de entrada. Apresenta a marca, resume o progresso local do usuário, exibe ranking, missões diárias, recomendações de treino e conquistas.
**Scripts relacionados:**
- `dojo-home.mjs` (renderiza progresso, ranking, recomendações, missões)
- `gamification.mjs` (lê perfil, XP, conquistas)
- `dailyMissions.mjs` (missões diárias)
- `trainingRecommendations.mjs` (recomendações inteligentes)
- `allScript.js` (config + dicas)
- `animations.mjs` (GSAP + fundo animado)

**CSS usado:** `style.css`, `dojo.css`, `animations.css`, `mediaquery.css`

**Dependências de DOM (data-attributes):**
`[data-dojo-best-ppm]`, `[data-dojo-precision]`, `[data-dojo-level]`, `[data-dojo-title]`, `[data-dojo-xp]`, `[data-dojo-streak]`, `[data-dojo-progress-bar]`, `[data-dojo-progress-text]`, `[data-dojo-history]`, `[data-dojo-mistakes]`, `[data-dojo-achievements]`, `[data-dojo-ranking]`, `[data-home-recommendations]` (injetado), `[data-home-daily-missions]` (injetado)

**Observação crítica de migração:**
O `index.html` tem o header **hardcoded** no HTML. Todas as outras páginas usam o header **injetado por `config.mjs`**. Essa inconsistência precisa ser resolvida antes ou durante a migração — o índice deve ser atualizado para usar o script dinâmico como as demais páginas. Em React, isso desaparece naturalmente (header vira componente compartilhado).

**Possíveis componentes futuros:** `HomePage`, `PlayerProgressPanel`, `RankingPanel`, `DailyMissionList`, `RecommendationCard`, `AchievementsPanel`, `TypingHistoryList`

---

#### Página: Type Arena
**Arquivo:** `assets/page/digitando.html`
**Responsabilidade:** Treino livre de digitação cronometrado. Suporta modo aleatório e modo de lição. Exibe métricas em tempo real, feedback do Mestre Panda, resultado final e histórico.
**Scripts relacionados:**
- `allScript.js` → `typing.mjs`, `config.mjs`, `script.mjs`
- `tempo.mjs` (timer, PPM/CPM em tempo real, exibição de resultados)
- `estado.mjs` (erros por tecla, combo máximo)
- `historico.mjs` (salvar e renderizar histórico)
- `gamification.mjs` (XP, nível, conquistas)
- `dojoLessons.mjs` (identifica lição ativa)
- `lessonTexts.mjs` (fornece palavras da lição)
- `animations.mjs` (teclado virtual, micro-interações, GSAP)

**CSS usado:** `style.css`, `dojo.css`, `animations.css`, `mediaquery.css`

**Dependências de DOM críticas:**
- `#digitandoTexto` — input de captura (não pode ser removido sem reimplementar a lógica de digitação)
- `#palavras` — container das letras `.letra` e `.palavra`
- `#amostraTexto` — prévia das próximas palavras
- `#cursor` — cursor visual (posicionado por CSS relativo ao `#digitacaoDoTexto`)
- `#tempoS`, `[data-live-time]`, `[data-live-ppm]`, `[data-live-cpm]`, `[data-live-precision]`, `[data-live-errors]` — métricas ao vivo
- `#dojo-combo-value`, `#dojo-feedback` — feedback do Mestre Panda
- `#barra-progresso` — barra de progresso do timer
- `#desempenhoTexto` — painel de resultados (oculto/exibido)
- `#proxima-acao .acao:nth-child(1)` = "Fazer novamente" (reload), `:nth-child(2)` = "Próximo texto" (reiniciar sem reload) — **ORDEM DEVE SER PRESERVADA**
- `.parametros` — topbar + métricas (jQuery `.show()/.hide()`)
- `.dojo-typing-panel` — feedback do Mestre Panda (jQuery `.show()/.hide()`)
- `.arena-progress` — barra de progresso (jQuery `.show()/.hide()`)
- `.dojo-keyboard` — teclado virtual (injetado por `animations.mjs`)

**Modo lição:**
`localStorage.getItem(KEYS.selectedLessonId)` é lido ao inicializar. Se uma lição estiver selecionada, `obterProximaPalavra()` usa `getWordsForLesson()` em vez de `palavrasAleatorias()`.

**Possíveis componentes futuros:** `TypeArenaPage`, `TypeArenaCard`, `ArenaTopbar`, `MetricsHud`, `MasterFeedback`, `TypingTextBox`, `VirtualKeyboard`, `TimerBar`, `ResultScreen`, `HistoryGrid`

---

#### Página: Aprenda com o Mestre Panda
**Arquivo:** `assets/page/aprenda.html`
**Responsabilidade:** Tutorial com módulos de aprendizado: postura, posição dos dedos, ritmo, técnicas. CTA para Type Arena.
**Scripts relacionados:**
- `allScript.js` (config + animações + dicas do carrossel via `script.mjs`)
- `animations.mjs`

**CSS usado:** `style.css`, `dojo.css`, `animations.css`, `mediaquery.css`

**Dependências de DOM:** `.dica` (cards do carrossel de dicas), `.seta-esquerda`, `.seta-direita` (navegação do carrossel)

**Observação:** Pouco JavaScript dinâmico — página quase estática. Mais simples de migrar.

**Possíveis componentes futuros:** `LearnPage`, `MentorHero`, `TipCarousel`, `TipCard`, `FingerPositionMap`, `PostureGuide`, `LearnCta`

---

#### Página: Mapa do Dojo
**Arquivo:** `assets/page/pratique.html`
**Responsabilidade:** Trilha visual de 8 fases em zigzag. Exibe card do jogador com XP/nível. Estados de fase (is-current, is-completed, is-unlocked, is-soon, is-locked) calculados dinamicamente a partir do localStorage.
**Scripts relacionados:**
- `allScript.js` (config)
- `pratique.mjs` (lê perfil, atualiza estados das fases)
- `animations.mjs`

**CSS usado:** `style.css`, `dojo.css`, `animations.css`, `mediaquery.css`

**Dependências de DOM:**
- `.trail-step[data-phase="N"]` — cada fase da trilha
- `.trail-node-icon` — ícone do nó (alterado por JS)
- `.stage-cta` — botão de CTA (texto alterado por JS)
- `[data-map-title]`, `[data-map-level]`, `[data-map-xp-bar]`, `[data-map-xp-progress]`, `[data-map-xp]` — card do jogador

**Possíveis componentes futuros:** `DojoMapPage`, `PlayerCard`, `LessonTrail`, `TrailStep`, `TrailNode`, `LessonCard`, `LessonStatusBadge`

---

#### Página: Arcade do Panda
**Arquivo:** `assets/page/game.html`
**Responsabilidade:** Hub de minigames. Jogo principal "Panda Keys" (Canvas API, tipo Piano Tiles). Protótipos de "Selos do Teclado" e "Bamboo Code".
**Scripts relacionados:**
- `game/game.mjs` (inicializa todo o arcade, chama `config()`)
- `game/state.mjs` (estado do jogo, estágios, GameStatus)
- `game/loop.mjs` (game loop com fixed-step, `MAX_FRAME_DELTA`)
- `game/renderer.mjs` (Canvas 2D, leitura de CSS vars para tema)
- `game/spawner.mjs` (geração de tiles)
- `game/input.mjs` (teclado + toque)
- `game/score.mjs` (cálculo de pontuação, penalidades)
- `game/audio.mjs` (sons via Web Audio API ou AudioContext)
- `game/dojo-challenges.mjs` (Selos do Teclado)
- `animations.mjs`

**CSS usado:** `style.css`, `dojo.css`, `game.css`, `animations.css`, `mediaquery.css`

**Dependências de DOM críticas:**
- `#game-canvas` — Canvas do Panda Keys
- `#game-key-catcher` — input oculto de captura de teclas
- `[data-game-touch-controls]` — botões de toque (gerados por JS)
- `[data-game-stages]` — seletor de estágio (gerado por JS)
- `[data-game-score]`, `[data-game-combo]`, `[data-game-lives]`, `[data-game-level]`, `[data-game-stage]`, `[data-game-best]` — HUD
- `[data-game-status]`, `[data-game-status-title]`, `[data-game-status-text]` — painel de status
- `[data-game-start]`, `[data-game-pause]`, `[data-game-reset]`, `[data-game-again]` — botões de controle
- `[data-game-countdown]` — countdown
- `[data-game-floating]` — camada de score flutuante
- `[data-game-live]` — região ao vivo (a11y)

**Observação:** O `pauseButton.textContent` é alterado dinamicamente ("Pausar" / "Continuar") — não pode ser ícone-only.

**Possíveis componentes futuros:** `ArcadePage`, `PandaKeysGame`, `ArcadeHud`, `GameModeSelector`, `GameStatusPanel`, `SealChallengeGame`, `FloatingScoreLayer`

---

#### Página: Conta / Login
**Arquivo:** `assets/page/entrarCriarConta.html`
**Responsabilidade:** Placeholder visual de login e criação de conta. Sem backend.
**Scripts relacionados:** `allScript.js`, `animations.mjs`
**CSS usado:** `style.css`, `dojo.css`, `animations.css`, `mediaquery.css`
**Possíveis componentes futuros:** `AccountPage`, `LoginPlaceholder`, `LocalProgressPanel`, `FutureAuthNotice`

---

### 1.2 CSS Atual

---

#### `style.css`
**Função:** Base global — variáveis CSS (`--corHeader`, `--corBanner`, `--corTexto`, `--corTitulo`, etc.), reset básico, tipografia, layout base, tema dark/light via classes `.darkTheme`, `body.darkTheme`.
**O que deve virar global:** Variáveis de cor, tipografia, reset.
**O que deve virar componente:** Estilos de header, footer, botões genéricos.
**O que deve ser removido:** Classes de tema dark via JS (substituir por `data-theme` ou CSS `prefers-color-scheme`).
**Riscos:** Muitas classes de tema aplicadas via jQuery (`.inputDDark`, `.testeDigitaDarktheme`, etc.) — acoplamento forte entre JS e CSS que precisa ser quebrado.

#### `dojo.css`
**Função:** Design system principal do Panda Dojo Arcade. Contém: tokens CSS (`--dojo-*`), layout, cards, botões, chips, header, drawer, métricas, teclado virtual, trilha do Mapa do Dojo, arcade, tipografia, resultado, histórico, recomendações, missões diárias.
**O que deve virar global:** Tokens `--dojo-*` (cores, sombras, bordas, raios).
**O que deve virar componente:** Cada bloco de componente (`.dojo-card`, `.dojo-button`, `.trail-step`, `.arena-metric`, etc.).
**O que deve ser removido:** Classes redundantes herdadas de versões anteriores.
**Riscos:** Arquivo grande (~3700+ linhas). Alguns seletores assumem estrutura DOM específica. Precisa ser desmembrado por componente.

#### `animations.css`
**Função:** Keyframes globais, micro-animações, confete, `prefers-reduced-motion` nuclear (`* { animation: none !important }`).
**O que deve virar global:** Keyframes base, `prefers-reduced-motion`.
**O que deve virar componente:** Animações de componentes específicos (toast, pulse, reveal).
**O que deve ser removido:** Fallbacks para browsers antigos.
**Riscos:** A regra nuclear `*` do `prefers-reduced-motion` sobrescreve tudo — em React com CSS Modules, pode precisar de abordagem diferente (Framer Motion com `useReducedMotion`).

#### `mediaquery.css`
**Função:** Breakpoints e responsividade global.
**O que deve virar global:** Breakpoints como variáveis ou tokens.
**O que deve virar componente:** Media queries específicas de componente.
**Riscos:** Queries globais podem conflitar com CSS Modules em React.

#### `game.css`
**Função:** Estilos exclusivos do Arcade — canvas, HUD, botões de toque, stage options, countdown, floating score.
**O que deve virar global:** Tokens de cor do jogo.
**O que deve virar componente:** `PandaKeysGame`, `ArcadeHud`, `GameTouchControls`.
**Riscos:** Estilos de Canvas são decorativos (o jogo renderiza tudo internamente). O CSS apenas estiliza a estrutura ao redor do Canvas.

---

### 1.3 Módulos JavaScript

---

| Módulo | Responsabilidade | Manipula DOM | localStorage | Futuro |
|---|---|---|---|---|
| `allScript.js` | Entry point da Type Arena, Aprenda, Mapa, Conta | Indiretamente | Não | Deletar — React entry substituirá |
| `config.mjs` | Renderiza header, drawer, tema, timer selector | Sim (gera HTML completo) | KEYS.tema, tempoPratica, xp, level | Virar `<AppLayout>` + `useSettings` hook |
| `typing.mjs` | Engine de digitação, handler de input, modo lição | Sim (jQuery intensivo) | KEYS.selectedLessonId | Virar feature `typing/` com hook `useTypingEngine` |
| `tempo.mjs` | Timer, PPM/CPM ao vivo, exibição de resultados | Sim (jQuery intensivo) | KEYS.tempoPratica | Virar `useTimer` hook + `ResultScreen` component |
| `estado.mjs` | Contagem de erros por tecla, max combo | Não (apenas estado em memória) | Não | Virar parte do `typingState` (Zustand) |
| `paramentros.mjs` | Cálculo e exibição de precisão | Sim (jQuery) | Não | Virar `calcPrecision()` utility + estado |
| `historico.mjs` | Salvar resultado no localStorage, renderizar histórico | Sim (jQuery para renderizar) | KEYS.historico | Virar `historyRepository.ts` + `<HistoryGrid>` |
| `gamification.mjs` | XP, nível, conquistas, streak, perfil completo, `awardXp()`, `unlockAchievement()` | Não | KEYS.xp, level, achievements, dailyStreak, etc. | Virar `gamificationService.ts` + `usePlayerProgress` hook |
| `dojoLessons.mjs` | Dados das 8 lições, progresso, desbloqueio, medalhas | Não | KEYS.lessonProgress | Virar `lessonRepository.ts` + `useLessonProgress` hook |
| `lessonTexts.mjs` | Textos e palavras por lição | Não | Não | Virar `data/lessonTexts.ts` |
| `dailyMissions.mjs` | Geração, reset e progresso de missões diárias | Não | KEYS.dailyMissions, missionDate | Virar `dailyMissionRepository.ts` + `useDailyMissions` hook |
| `trainingRecommendations.mjs` | Análise de desempenho e recomendações adaptativas | Não | KEYS.recommendations | Virar `recommendationService.ts` |
| `pratique.mjs` | Lê perfil e atualiza estados do Mapa do Dojo | Sim (querySelector direto) | Via gamification | Virar `<DojoMapPage>` com `usePlayerProgress` |
| `dojo-home.mjs` | Renderiza progresso, ranking, recomendações, missões na home | Sim (querySelector) | Via gamification, missions, recommendations | Virar `<HomePage>` com múltiplos hooks |
| `animations.mjs` | GSAP, teclado virtual, micro-interações, fundo animado, confete | Sim (cria e manipula DOM) | Não | Dividir: `<VirtualKeyboard>`, hooks de animação, `useGsap` |
| `dojoBackground.mjs` | Canvas animado de fundo (partículas, grid arcade) | Sim (cria Canvas) | Não | Virar `<BackgroundCanvas>` com `useAnimationFrame` |
| `pandaMascot.mjs` | Mascote Panda animado (olhos, respiração) | Sim | Não | Virar `<PandaMascot>` component |
| `eventos.mjs` | Click em `.inputD`, pause/resume, scroll | Sim (jQuery) | Não | Incorporar em `<TypeArenaCard>` como event handlers |
| `confete.mjs` | Lança confetes CSS no DOM | Sim | Não | Virar `fireConfetti()` utility ou Framer Motion |
| `palavras.mjs` | Banco de palavras em PT, shuffle, `formatarPalavras()` | Não | Não | Virar `wordBank.ts` + `formatWord()` utility |
| `linhas.mjs` | Move as linhas de texto (`#palavras`) ao avançar | Sim (jQuery) | Não | Incorporar no `<TypingTextBox>` como scroll ref |
| `cursor.mjs` | Posiciona e anima cursor visual | Sim | Não | Virar CSS puro ou ref no `<TypingTextBox>` |
| `script.mjs` | Carrossel de dicas da página Aprenda | Sim (jQuery) | Não | Virar `<TipCarousel>` com useState |
| `constants.mjs` | Single source of truth: KEYS, TRAINING_MODES, LEVEL_TITLES, constantes numéricas | Não | Não | Migrar diretamente para `src/constants/` em TypeScript |
| `utils/storage.mjs` | `getStorage`, `setStorage`, `removeStorage`, `updateStorage` | Não | Sim | Migrar para `src/services/storage/storageService.ts` — já está pronto para TS |
| `utils/format.mjs` | `formatPercent`, `formatDate`, `formatDuration`, `formatNumber`, `clamp` | Não | Não | Migrar para `src/utils/format.ts` — já está pronto para TS |
| `utils/dom.mjs` | `qs`, `qsa`, `on`, `setText` | Sim | Não | Substituir pelos patterns React (refs, event handlers) |
| `game/game.mjs` | Orquestra o Arcade, chama `config()`, gerencia botões, HUD, floating score | Sim (DOM + jQuery) | KEYS.gameBestScore | Virar `<ArcadePage>` + `usePandaKeysGame` hook |
| `game/state.mjs` | Estado imutável do jogo, estágios, GameStatus, funções puras | Não | Não | Virar `arcade/state.ts` com Zustand slice — já é quase puro |
| `game/loop.mjs` | Game loop com fixed-step (60fps), `MAX_FRAME_DELTA=100`, rAF | Não (usa callbacks) | Não | Virar `useGameLoop` hook |
| `game/renderer.mjs` | Renderização Canvas 2D, leitura de CSS vars para tema | Sim (Canvas) | Não | Virar `gameRenderer.ts` (puro, não React) |
| `game/spawner.mjs` | Geração de tiles por tempo e dificuldade | Não (puro) | Não | Virar `spawner.ts` utility |
| `game/input.mjs` | Keyboard + touch input, hit detection | Sim (eventos) | Não | Virar `useGameInput` hook |
| `game/score.mjs` | Cálculo de pontuação, penalidades, ratings | Não (puro) | Não | Virar `score.ts` utility |
| `game/audio.mjs` | Sons via Web Audio API | Sim (cria AudioContext) | Não | Virar `useAudio` hook ou `audioService.ts` |
| `game/dojo-challenges.mjs` | Selos do Teclado, protótipos | Sim (DOM) | KEYS.sealBestScore | Virar `<SealChallengeGame>` |

---

## 2. Mapeamento de Componentes Futuros

### 2.1 Layout

#### `AppLayout`
**Responsabilidade:** Wrapper raiz. Injeta provider de tema, fundo animado, nav.
**Props:** `children: ReactNode`
**Estado interno:** Nenhum.

#### `HeaderHud`
**Responsabilidade:** Header completo com logo, nav desktop, player status (XP, nível), CTA, botão de configurações.
**Props:** `currentRoute: string`
**Dependências:** `usePlayerProgress`, `useSettings`

#### `MobileBottomNav`
**Responsabilidade:** Nav inferior mobile com 5 itens (Início, Arena, Mapa, Arcade, Conta).
**Props:** `currentRoute: string`

#### `SettingsDrawer`
**Responsabilidade:** Drawer lateral de configurações (tema, tempo, sons, animações, motion).
**Props:** `isOpen: boolean`, `onClose: () => void`
**Dependências:** `useSettings`

#### `BackgroundCanvas`
**Responsabilidade:** Canvas animado de fundo com partículas (teclas, bambu, panda, sparks) e grid arcade.
**Props:** `density?: number`
**Estado interno:** `animationFrame`, `particles[]`
**Observação:** Deve parar quando `prefers-reduced-motion` ou `document.hidden`.

#### `PageShell`
**Responsabilidade:** Wrapper de página com `AppLayout`, scroll behavior, meta title.
**Props:** `title: string`, `children: ReactNode`

---

### 2.2 UI Base

#### `Button`
**Props:** `variant: 'primary' | 'secondary' | 'ghost'`, `disabled?: boolean`, `onClick`, `children`

#### `IconButton`
**Props:** `icon: string` (Material Symbol), `aria-label: string`, `onClick`

#### `Card`
**Props:** `className?: string`, `children`, `locked?: boolean`

#### `Panel`
**Props:** `children`, `className?`

#### `Badge`
**Props:** `label: string`, `variant?: 'success' | 'warning' | 'danger' | 'muted'`

#### `Chip`
**Props:** `label: string`, `variant?: 'special' | 'success' | 'danger' | 'muted'`

#### `MetricCard`
**Props:** `label: string`, `value: string | number`, `highlight?: boolean`

#### `ProgressBar`
**Props:** `value: number` (0-100), `aria-label: string`, `animated?: boolean`

#### `Toast`
**Props:** `title: string`, `message?: string`, `visible: boolean`
**Estado interno:** Auto-dismiss timer.

#### `Modal`
**Props:** `isOpen: boolean`, `onClose: () => void`, `children`

#### `Drawer`
**Props:** `isOpen: boolean`, `onClose: () => void`, `side: 'left' | 'right'`, `children`

---

### 2.3 Type Arena

#### `TypeArenaPage`
**Responsabilidade:** Container da página. Gerencia modo (aleatório vs. lição). Integra timer, engine e resultado.
**Dependências:** `useTypingEngine`, `useTimer`, `usePlayerProgress`, `useLessonProgress`

#### `TypeArenaCard`
**Props:** Nenhuma (consome store).

#### `ArenaTopbar`
**Props:** `modLabel: string`, `onPause: () => void`, `onReset: () => void`

#### `MetricsHud`
**Props:** `time: string`, `ppm: number`, `cpm: number`, `precision: string`, `errors: number`, `combo: number`

#### `MasterFeedback`
**Props:** `message: string`, `tone: 'neutral' | 'success' | 'danger'`, `combo: number`

#### `TypingTextBox`
**Responsabilidade:** Renderiza palavras com letras individuais (`<span class="letra">`), captura input, exibe cursor.
**Props:** `words: WordItem[]`, `onKeyPress: (key: string) => void`
**Estado interno:** Posição do cursor, scroll de linhas.

#### `TypingPreview`
**Props:** `words: WordItem[]`

#### `VirtualKeyboard`
**Props:** `nextKey?: string`, `activeKey?: string`, `errorKey?: string`

#### `TimerBar`
**Props:** `progress: number` (0-100)

#### `ResultScreen`
**Props:** `result: TrainingResult`, `onPlayAgain: () => void`, `onNextText: () => void`
**Dependências:** `usePlayerProgress`, `useHistory`

---

### 2.4 Aprenda

#### `LearnPage`
**Responsabilidade:** Página tutorial estática com carrossel e CTA.

#### `MentorHero`
**Props:** `title: string`, `subtitle: string`

#### `TipCarousel`
**Props:** `tips: Tip[]`, `autoAdvance?: number` (ms)
**Estado interno:** `currentIndex`, `canClick`

#### `TipCard`
**Props:** `tip: Tip`, `visible: boolean`

#### `FingerPositionMap`
**Responsabilidade:** Diagrama visual de posição dos dedos (estático ou SVG interativo).

#### `LearnCta`
**Props:** `href: string`, `label: string`

---

### 2.5 Mapa do Dojo

#### `DojoMapPage`
**Responsabilidade:** Renderiza trilha de fases com estado calculado do progresso.
**Dependências:** `usePlayerProgress`, `useLessonProgress`

#### `PlayerCard`
**Props:** `profile: DojoProfile`

#### `LessonTrail`
**Props:** `lessons: LessonItem[]`, `progress: LessonProgressMap`

#### `TrailStep`
**Props:** `lesson: LessonItem`, `status: 'completed' | 'current' | 'unlocked' | 'soon' | 'locked'`, `side: 'left' | 'right'`

#### `TrailNode`
**Props:** `icon: string`, `status: TrailStepStatus`

#### `LessonCard`
**Props:** `lesson: LessonItem`, `status: TrailStepStatus`, `onStart: () => void`

#### `LessonStatusBadge`
**Props:** `status: TrailStepStatus`, `medal?: 'gold' | 'silver' | 'bronze' | 'none'`

---

### 2.6 Arcade

#### `ArcadePage`
**Responsabilidade:** Hub de minigames. Renderiza `PandaKeysGame` e protótipos.

#### `PandaKeysGame`
**Responsabilidade:** Wrapper do jogo Canvas. Gerencia canvas ref, loop, input, HUD, painel de status.
**Dependências:** `useGameLoop`, `useGameInput`, `useAudio`, Zustand `arcadeStore`

#### `ArcadeHud`
**Props:** `score: number`, `combo: number`, `lives: number`, `level: number`, `stage: string`, `best: number`

#### `GameModeSelector`
**Props:** `stages: GameStage[]`, `selectedId: string`, `onChange: (id: string) => void`

#### `GameStatusPanel`
**Props:** `title: string`, `text: string`, `visible: boolean`, `onStart: () => void`

#### `SealChallengeGame`
**Responsabilidade:** Protótipo "Selos do Teclado". Input + combo visual.

#### `FloatingScoreLayer`
**Responsabilidade:** Camada de scores flutuantes com animação.

---

### 2.7 Conta / Perfil Futuro

#### `AccountPage`
**Responsabilidade:** Placeholder de conta. Exibe progresso local e indica backend futuro.

#### `LocalProgressPanel`
**Props:** `profile: DojoProfile`

#### `LoginPlaceholder`
**Responsabilidade:** UI de login/cadastro visual sem funcionalidade real.

#### `FutureAuthNotice`
**Responsabilidade:** Aviso de que conta online estará disponível em versão futura.

---

### 2.8 Gamificação

#### `PlayerStatus` (no header)
**Props:** `xp: number`, `level: number`, `title: string`, `progressPercent: number`

#### `XPBar`
**Props:** `value: number`, `label?: string`

#### `AchievementToast`
**Props:** `title: string`, `message: string`, `visible: boolean`

#### `DailyMissionCard`
**Props:** `mission: DailyMission`, `compact?: boolean`

#### `RecommendationCard`
**Props:** `recommendation: TrainingRecommendation`, `onAction: () => void`

#### `LevelTitleBadge`
**Props:** `title: string`, `level: number`

---

## 3. Mapeamento de Estados Futuros

### `typingState` — Zustand `typingStore`
**Origem atual:** Variáveis locais em `typing.mjs`, `estado.mjs`, `paramentros.mjs`
**localStorage relacionado:** `KEYS.selectedLessonId`, `KEYS.selectedTrainingMode`

```
currentWords: WordItem[]        // palavras geradas para o treino atual
currentWordIndex: number        // índice da palavra atual
currentLetterIndex: number      // índice da letra atual na palavra
errors: Record<string, number>  // erros por tecla (de estado.mjs)
extras: number                  // letras extras digitadas
totalCorrect: number
totalIncorrect: number
isRunning: boolean
isPaused: boolean
combo: number
maxCombo: number
selectedMode: TrainingMode      // randomWords | baseKeys | ...
selectedLessonId: string | null
```

---

### `timerState` — Zustand `timerStore`
**Origem atual:** Variáveis locais em `tempo.mjs`
**localStorage relacionado:** `KEYS.tempoPratica`

```
duration: number        // minutos selecionados (ex: 1, 2, 5)
timeLeft: number        // segundos restantes
elapsed: number         // segundos decorridos
isRunning: boolean
isPaused: boolean
ppm: number             // PPM em tempo real
cpm: number             // CPM em tempo real
```

---

### `playerProgressState` — Zustand `playerStore`
**Origem atual:** `gamification.mjs` (`getDojoProfile()`)
**localStorage relacionado:** `KEYS.xp`, `KEYS.level`, `KEYS.achievements`, `KEYS.dailyStreak`, `KEYS.lastTrainingDate`

```
xp: number
level: number
title: string
nextTitle: string
progressPercent: number
currentLevelXp: number
requiredForLevel: number
achievements: string[]
achievementDetails: Achievement[]
dailyStreak: number
lastTrainingDate: string
bestPpm: number
lastPrecision: string
lastResult: HistoryItem | null
history: HistoryItem[]
lastMistakes: [string, number][]
gameBestScore: number
```

---

### `lessonProgressState` — Zustand `lessonStore`
**Origem atual:** `dojoLessons.mjs`
**localStorage relacionado:** `KEYS.lessonProgress`, `KEYS.selectedLessonId`, `KEYS.startedLessons`

```
lessons: Lesson[]
lessonProgress: LessonProgressMap
selectedLessonId: string | null
completedLessons: string[]
unlockedLessons: string[]
recommendedLesson: Lesson | null
```

---

### `dailyMissionState` — Zustand `missionStore`
**Origem atual:** `dailyMissions.mjs`
**localStorage relacionado:** `KEYS.dailyMissions`, `KEYS.missionDate`

```
missions: DailyMission[]
missionDate: string
completedCount: number
totalXpAvailable: number
```

---

### `arcadeState` — Zustand `arcadeStore`
**Origem atual:** `game/state.mjs` (estado em memória, mutável)
**localStorage relacionado:** `KEYS.gameBestScore`, `KEYS.sealBestScore`

```
status: GameStatus
stageId: string
level: number
speed: number
spawnInterval: number
score: number
combo: number
maxCombo: number
lives: number
activeTiles: Tile[]
particles: Particle[]
laneFlashes: LaneFlash[]
elapsed: number
bestScore: number
currentGame: 'panda-keys' | 'seal-challenge' | null
```

---

### `settingsState` — Zustand `settingsStore`
**Origem atual:** `config.mjs`, `tempo.mjs` (localStorage direto)
**localStorage relacionado:** `KEYS.tema`, `KEYS.tempoPratica`

```
theme: 'light' | 'dark'
defaultPracticeTime: number      // em minutos
soundsEnabled: boolean
animationsEnabled: boolean
reducedMotion: boolean           // lido do sistema via matchMedia
```

---

### `uiState` — Zustand `uiStore`
**Origem atual:** Disperso — `config.mjs`, jQuery handlers
**localStorage relacionado:** Nenhum (efêmero)

```
drawerOpen: boolean
activeToast: Toast | null
activeModal: Modal | null
isMobileNavOpen: boolean
```

---

## 4. localStorage — Mapeamento para Camada de Storage

| Chave localStorage | Alias em KEYS | Tipo | Módulo atual | Futuro |
|---|---|---|---|---|
| `ativo` | `KEYS.tema` | `string \| null` | `config.mjs` | `settingsRepository.ts` |
| `tempoPratica` | `KEYS.tempoPratica` | `string` (número como string) | `config.mjs`, `tempo.mjs` | `settingsRepository.ts` |
| `historico` | `KEYS.historico` | `HistoryItem[]` | `historico.mjs`, `gamification.mjs` | `historyRepository.ts` |
| `pandaXp` | `KEYS.xp` | `number` | `gamification.mjs` | `progressRepository.ts` |
| `pandaLevel` | `KEYS.level` | `number` | `gamification.mjs`, `config.mjs` | `progressRepository.ts` |
| `pandaAchievements` | `KEYS.achievements` | `string[]` | `gamification.mjs` | `progressRepository.ts` |
| `pandaDailyStreak` | `KEYS.dailyStreak` | `number` | `gamification.mjs` | `progressRepository.ts` |
| `pandaLastTrainingDate` | `KEYS.lastTrainingDate` | `string` (ISO date) | `gamification.mjs` | `progressRepository.ts` |
| `pandaLastMistakes` | `KEYS.lastMistakes` | `[string, number][]` | `gamification.mjs` | `historyRepository.ts` |
| `pandaKeysBestScore` | `KEYS.gameBestScore` | `number` | `game/game.mjs`, `gamification.mjs` | `arcadeRepository.ts` |
| `pandaDailyMissions` | `KEYS.dailyMissions` | `DailyMission[]` | `dailyMissions.mjs` | `missionRepository.ts` |
| `pandaMissionDate` | `KEYS.missionDate` | `string` (ISO date) | `dailyMissions.mjs` | `missionRepository.ts` |
| `pandaLessonProgress` | `KEYS.lessonProgress` | `LessonProgressMap` | `dojoLessons.mjs` | `lessonRepository.ts` |
| `pandaTrainingRecommendations` | `KEYS.recommendations` | `TrainingRecommendation[]` | `trainingRecommendations.mjs` | `recommendationRepository.ts` |
| `pandaSelectedLessonId` | `KEYS.selectedLessonId` | `string \| null` | `typing.mjs` | `settingsRepository.ts` |
| `pandaSelectedTrainingMode` | `KEYS.selectedTrainingMode` | `TrainingMode \| null` | (prep) | `settingsRepository.ts` |
| `pandaSealBestScore` | `KEYS.sealBestScore` | `number` | `game/dojo-challenges.mjs` | `arcadeRepository.ts` |
| `pandaStartedLessons` | `KEYS.startedLessons` | `string[]` | (prep) | `lessonRepository.ts` |
| `pandaXpAwards` | `KEYS.xpAwards` | `Record<string, boolean>` | `gamification.mjs` | `progressRepository.ts` |

### Camada de Storage Futura

```typescript
// src/services/storage/

storageService.ts          // getStorage, setStorage, removeStorage, updateStorage
                           // Baseado diretamente em utils/storage.mjs (já está pronto)

progressRepository.ts      // xp, level, achievements, streak, lastTrainingDate, xpAwards
historyRepository.ts        // historico, lastMistakes
settingsRepository.ts      // tema, tempoPratica, selectedLessonId, selectedTrainingMode
lessonRepository.ts         // lessonProgress, startedLessons
missionRepository.ts        // dailyMissions, missionDate
arcadeRepository.ts         // gameBestScore, sealBestScore
recommendationRepository.ts // trainingRecommendations
```

**Observação importante:** O `utils/storage.mjs` já implementa a camada correta (`getStorage`, `setStorage`, `removeStorage`, `updateStorage`). A migração desta camada é praticamente uma conversão de `.mjs` para `.ts` com tipagem.

---

## 5. Arquitetura Futura Proposta

```
src/
├── app/
│   ├── App.tsx                  # Providers + Router raiz
│   ├── router.tsx               # React Router — rotas de todas as páginas
│   └── providers.tsx            # ThemeProvider, QueryClientProvider, etc.
│
├── pages/
│   ├── HomePage/
│   │   ├── index.tsx
│   │   ├── components/
│   │   └── hooks/
│   ├── TypeArenaPage/
│   │   ├── index.tsx
│   │   ├── components/
│   │   └── hooks/
│   ├── LearnPage/
│   ├── DojoMapPage/
│   ├── ArcadePage/
│   └── AccountPage/
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── HeaderHud.tsx
│   │   ├── MobileBottomNav.tsx
│   │   ├── SettingsDrawer.tsx
│   │   ├── BackgroundCanvas.tsx
│   │   └── PageShell.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── IconButton.tsx
│   │   ├── Card.tsx
│   │   ├── Panel.tsx
│   │   ├── Badge.tsx
│   │   ├── Chip.tsx
│   │   ├── MetricCard.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Toast.tsx
│   │   ├── Modal.tsx
│   │   └── Drawer.tsx
│   ├── feedback/
│   │   ├── AchievementToast.tsx
│   │   ├── DailyMissionCard.tsx
│   │   └── RecommendationCard.tsx
│   └── mascot/
│       └── PandaMascot.tsx
│
├── features/
│   ├── typing/
│   │   ├── components/
│   │   │   ├── TypeArenaCard.tsx
│   │   │   ├── ArenaTopbar.tsx
│   │   │   ├── MetricsHud.tsx
│   │   │   ├── MasterFeedback.tsx
│   │   │   ├── TypingTextBox.tsx
│   │   │   ├── TypingPreview.tsx
│   │   │   ├── VirtualKeyboard.tsx
│   │   │   ├── TimerBar.tsx
│   │   │   └── ResultScreen.tsx
│   │   ├── hooks/
│   │   │   ├── useTypingEngine.ts   # lógica de digitação, combo, erros
│   │   │   ├── useTimer.ts          # countdown, PPM/CPM
│   │   │   └── useVirtualKeyboard.ts
│   │   ├── logic/
│   │   │   ├── wordGenerator.ts     # de palavras.mjs
│   │   │   └── precisionCalc.ts     # de paramentros.mjs
│   │   ├── data/
│   │   │   └── wordBank.ts          # de palavras.mjs
│   │   └── types.ts
│   │
│   ├── gamification/
│   │   ├── components/
│   │   │   ├── PlayerStatus.tsx
│   │   │   ├── XPBar.tsx
│   │   │   └── LevelTitleBadge.tsx
│   │   ├── hooks/
│   │   │   └── usePlayerProgress.ts # de gamification.mjs
│   │   ├── logic/
│   │   │   ├── xpCalculator.ts
│   │   │   └── achievementChecker.ts
│   │   └── types.ts
│   │
│   ├── lessons/
│   │   ├── components/
│   │   │   ├── LessonTrail.tsx
│   │   │   ├── TrailStep.tsx
│   │   │   ├── TrailNode.tsx
│   │   │   ├── LessonCard.tsx
│   │   │   └── LessonStatusBadge.tsx
│   │   ├── hooks/
│   │   │   └── useLessonProgress.ts  # de dojoLessons.mjs
│   │   ├── data/
│   │   │   ├── lessons.ts            # de dojoLessons.mjs
│   │   │   └── lessonTexts.ts        # de lessonTexts.mjs
│   │   └── types.ts
│   │
│   ├── missions/
│   │   ├── components/
│   │   │   └── DailyMissionList.tsx
│   │   ├── hooks/
│   │   │   └── useDailyMissions.ts   # de dailyMissions.mjs
│   │   ├── data/
│   │   │   └── missionTemplates.ts
│   │   └── types.ts
│   │
│   ├── recommendations/
│   │   ├── hooks/
│   │   │   └── useRecommendations.ts # de trainingRecommendations.mjs
│   │   └── types.ts
│   │
│   ├── arcade/
│   │   ├── panda-keys/
│   │   │   ├── PandaKeysGame.tsx
│   │   │   ├── useGameLoop.ts        # de game/loop.mjs
│   │   │   ├── useGameInput.ts       # de game/input.mjs
│   │   │   ├── gameRenderer.ts       # de game/renderer.mjs
│   │   │   ├── spawner.ts            # de game/spawner.mjs
│   │   │   ├── score.ts              # de game/score.mjs
│   │   │   └── useAudio.ts           # de game/audio.mjs
│   │   ├── seal-challenge/
│   │   │   └── SealChallengeGame.tsx
│   │   ├── shared/
│   │   │   ├── ArcadeHud.tsx
│   │   │   ├── GameStatusPanel.tsx
│   │   │   └── FloatingScoreLayer.tsx
│   │   └── types.ts                  # de game/state.mjs
│   │
│   └── settings/
│       ├── components/
│       │   └── SettingsPanel.tsx
│       ├── hooks/
│       │   └── useSettings.ts
│       └── types.ts
│
├── services/
│   ├── storage/
│   │   ├── storageService.ts         # de utils/storage.mjs — migração trivial
│   │   ├── progressRepository.ts
│   │   ├── historyRepository.ts
│   │   ├── settingsRepository.ts
│   │   ├── lessonRepository.ts
│   │   ├── missionRepository.ts
│   │   ├── arcadeRepository.ts
│   │   └── recommendationRepository.ts
│   ├── analytics/
│   │   └── (futuro)
│   └── future-api/
│       └── (Supabase — não implementar agora)
│
├── styles/
│   ├── tokens.css                    # variáveis --dojo-* de dojo.css
│   ├── global.css                    # reset + tipografia de style.css
│   └── animations.css                # keyframes de animations.css
│
├── assets/
│   ├── images/
│   ├── sounds/
│   └── animations/
│
├── constants/
│   ├── storageKeys.ts                # de constants.mjs (STORAGE_KEYS, KEYS)
│   ├── trainingModes.ts              # de constants.mjs (TRAINING_MODES)
│   ├── levelTitles.ts                # de constants.mjs (LEVEL_TITLES)
│   └── config.ts                     # XP_PER_LEVEL, WORDS_COUNT, etc.
│
└── tests/
    ├── unit/
    │   ├── typing/
    │   ├── gamification/
    │   └── lessons/
    └── e2e/
        ├── type-arena.spec.ts
        ├── dojo-map.spec.ts
        └── arcade.spec.ts
```

**Por que essa estrutura:**
- **Feature-first**: cada domínio de negócio é coeso e independente — facilita trabalhar em "Lições" sem tocar "Gamificação".
- **Separação lógica/UI**: `hooks/` contêm lógica pura, `components/` apenas renderização. Fácil de testar.
- **Serviços agnósticos**: `services/storage/` não conhece React — pode ser reusado em testes, service workers, SSR futuro.
- **Migração incremental**: cada feature pode ser migrada independentemente, sem afetar as outras.
- **Pronto para Supabase**: `services/future-api/` já está reservado — quando vier o backend, apenas o repositório muda, os hooks permanecem iguais.

---

## 6. Plano de Migração por Etapas

### Fase 0 — Congelar v1 Estática
**Objetivo:** Garantir ponto de retorno seguro.
- [ ] Criar tag `v1.0-static` no repositório
- [ ] Criar branch `main-static-backup`
- [ ] Verificar que todos os arquivos funcionam localmente
- [ ] Documentar URL de deploy atual (GitHub Pages / Vercel / etc.)
- [ ] **Não apagar nenhum arquivo da v1 até a v2 estar estável**

---

### Fase 1 — Criar Projeto Vite Paralelo
**Objetivo:** Estrutura React vazia, sem quebrar a v1.
- [ ] Criar branch `feat/react-migration`
- [ ] `npm create vite@latest panda-dojo-v2 -- --template react-ts`
- [ ] Configurar ESLint + Prettier
- [ ] Configurar aliases de paths (`@/` → `src/`)
- [ ] Copiar `assets/img/`, `assets/sounds/` (se houver) para `public/`
- [ ] Criar `src/styles/tokens.css` com todos os `--dojo-*` de `dojo.css`
- [ ] Criar `src/constants/` com todo o conteúdo de `constants.mjs` tipado
- [ ] Migrar `utils/storage.mjs` → `src/services/storage/storageService.ts`
- [ ] Migrar `utils/format.mjs` → `src/utils/format.ts`
- [ ] **Manter projeto v1 intocado**

---

### Fase 2 — Migrar Design System
**Objetivo:** Componentes UI base e layout funcionando em React.
- [ ] Criar `AppLayout`, `PageShell`, `BackgroundCanvas`
- [ ] Migrar tokens CSS (`--dojo-*`) para Tailwind ou CSS Modules
- [ ] Criar `Button`, `IconButton`, `Card`, `Panel`, `Badge`, `Chip`
- [ ] Criar `HeaderHud` com navegação e player status estático
- [ ] Criar `SettingsDrawer` com tema e seletor de tempo
- [ ] Criar `MobileBottomNav`
- [ ] Implementar `useSettings` hook (tema, tempoPratica)
- [ ] **Testar: dark mode, responsividade, animações reduzidas**

---

### Fase 3 — Migrar Home
**Objetivo:** Página inicial com progresso, ranking, missões e recomendações.
- [ ] Migrar `gamification.mjs` → `gamificationService.ts` + `usePlayerProgress`
- [ ] Migrar `dailyMissions.mjs` → `missionRepository.ts` + `useDailyMissions`
- [ ] Migrar `trainingRecommendations.mjs` → `recommendationRepository.ts` + `useRecommendations`
- [ ] Criar `PlayerStatus`, `XPBar`, `LevelTitleBadge`
- [ ] Criar `DailyMissionCard`, `RecommendationCard`
- [ ] Criar `TypingHistoryList` (mini-histórico)
- [ ] Criar `AchievementsPanel`
- [ ] Montar `HomePage` completo
- [ ] **Testar: dados do localStorage aparecem corretamente**

---

### Fase 4 — Migrar Type Arena
**Objetivo:** O coração do produto — treino de digitação totalmente funcional.
- [ ] Migrar `palavras.mjs` → `wordBank.ts` + `wordGenerator.ts`
- [ ] Migrar `lessonTexts.mjs` → `lessonTexts.ts`
- [ ] Criar `useTypingEngine` hook (lógica de `typing.mjs`)
- [ ] Criar `useTimer` hook (lógica de `tempo.mjs`)
- [ ] Criar `TypingTextBox` com renderização de letras + cursor
- [ ] Criar `VirtualKeyboard` com highlight da próxima tecla
- [ ] Criar `MetricsHud`, `TimerBar`, `MasterFeedback`
- [ ] Criar `ResultScreen` com animação count-up
- [ ] Criar `HistoryGrid` no resultado
- [ ] Integrar `usePlayerProgress` (XP + conquistas ao finalizar)
- [ ] Integrar modo lição (`selectedLessonId`)
- [ ] **Testar: fluxo completo, backspace, espaço, extras, pause, reset, novo recorde**

---

### Fase 5 — Migrar Aprenda
**Objetivo:** Página tutorial com carrossel.
- [ ] Criar `MentorHero`, `TipCarousel`, `TipCard`
- [ ] Criar `FingerPositionMap` (diagrama SVG ou imagem)
- [ ] Montar `LearnPage`
- [ ] **Testar: carrossel, autoadvance, responsive**

---

### Fase 6 — Migrar Mapa do Dojo
**Objetivo:** Trilha de fases integrada ao progresso real do jogador.
- [ ] Migrar `dojoLessons.mjs` → `lessonRepository.ts` + `useLessonProgress`
- [ ] Criar `PlayerCard`, `LessonTrail`, `TrailStep`, `TrailNode`, `LessonCard`
- [ ] Criar `LessonStatusBadge` com medalhas
- [ ] Integrar seleção de lição com `selectedLessonId` na Type Arena
- [ ] Montar `DojoMapPage`
- [ ] **Testar: estados de fase, desbloqueio, medalhas, navegação para Type Arena com lição**

---

### Fase 7 — Migrar Arcade
**Objetivo:** Panda Keys e protótipos funcionando em React.
- [ ] Migrar `game/state.mjs` → `arcade/types.ts` + Zustand `arcadeStore`
- [ ] Migrar `game/loop.mjs` → `useGameLoop` hook
- [ ] Migrar `game/renderer.mjs` → `gameRenderer.ts` (sem React — função pura)
- [ ] Migrar `game/spawner.mjs` → `spawner.ts`
- [ ] Migrar `game/input.mjs` → `useGameInput` hook
- [ ] Migrar `game/score.mjs` → `score.ts`
- [ ] Migrar `game/audio.mjs` → `useAudio` hook
- [ ] Criar `PandaKeysGame` com canvas ref
- [ ] Criar `ArcadeHud`, `GameModeSelector`, `GameStatusPanel`
- [ ] Migrar `game/dojo-challenges.mjs` → `SealChallengeGame`
- [ ] Montar `ArcadePage`
- [ ] **Testar: todos os 4 estágios, pause, game over, recorde, touch controls**

---

### Fase 8 — Testes
**Objetivo:** Cobertura de lógica crítica.
- [ ] Vitest: `calcPrecision`, `xpCalculator`, `achievementChecker`, `score.ts`, `spawner.ts`
- [ ] Vitest: `storageService`, repositories
- [ ] Vitest: `useTypingEngine` (teclas corretas, erros, backspace, combo)
- [ ] Vitest: `useLessonProgress` (desbloqueio, medalhas)
- [ ] Playwright: fluxo completo Type Arena (iniciar → digitar → resultado)
- [ ] Playwright: Mapa do Dojo → selecionar lição → Type Arena com lição ativa
- [ ] Playwright: Arcade → iniciar → game over → play again
- [ ] Testar responsividade mobile (320px, 375px, 768px, 1024px)
- [ ] Testar `prefers-reduced-motion`
- [ ] Testar dark mode

---

### Fase 9 — Preparar Backend Futuro (Supabase)
**Objetivo:** Deixar a arquitetura pronta sem implementar nada.
- [ ] Criar `src/services/future-api/` com interfaces vazias
- [ ] Definir `IProgressRepository`, `IHistoryRepository`, `IAuthService` como interfaces TypeScript
- [ ] Garantir que todos os hooks consomem interfaces, não implementações diretas (inversão de dependência)
- [ ] Documentar schema futuro de tabelas Supabase
- [ ] **Não implementar autenticação, não conectar banco, não adicionar variáveis de ambiente de produção**

---

## 7. O que Não Deve ser Migrado Literalmente

### DOM direto excessivo
**Problema atual:** `config.mjs` gera 80+ linhas de HTML como string em `renderDojoHeader()`. `dojo-home.mjs` injeta seções inteiras no DOM. `typing.mjs` usa jQuery para cada letra digitada.
**Substituição:** Componentes React. O JSX compila para operações de DOM eficientes. Nenhum `innerHTML`.

### jQuery
**Problema atual:** Usado em `typing.mjs`, `tempo.mjs`, `config.mjs`, `eventos.mjs`, `paramentros.mjs`, `historico.mjs`, `allScript.js`, `script.mjs`, `dojo-home.mjs`. A principal utilidade é DOM traversal e show/hide.
**Substituição:** `useState` para visibilidade, refs para DOM refs diretas, event handlers nativos do React. **Remover gradualmente — não tentar coexistir jQuery + React.**

### CSS duplicado e classes aplicadas via JS
**Problema atual:** Tema dark aplicado adicionando/removendo dezenas de classes via jQuery (`inputDDark`, `testeDigitaDarktheme`, etc.). O `index.html` tem header hardcoded enquanto demais páginas usam o header gerado por `config.mjs`.
**Substituição:** `data-theme="dark"` no `<html>` + variáveis CSS que respondem ao atributo. React context de tema. Sem classes de tema por elemento.

### Strings de localStorage espalhadas
**Problema atual:** Antes da Fase 7, existiam raw strings como `"historico"`, `"pandaXp"`, etc. em múltiplos arquivos.
**Status atual:** Já centralizado em `constants.mjs` (KEYS). A migração para TS é trivial.
**Substituição:** `src/constants/storageKeys.ts` com `as const`.

### Manipulação de `.innerHTML` para renderização de listas
**Problema atual:** `historico.mjs`, `dojo-home.mjs`, `config.mjs` usam template literals com HTML como strings.
**Risco:** XSS potencial se dados do usuário não forem escapados (ver `escape()` em `historico.mjs`). Em React, JSX escapa automaticamente.
**Substituição:** Componentes React. XSS não é mais uma preocupação manual.

### Lógica misturada com efeitos visuais
**Problema atual:** `tempo.mjs` mistura timer, cálculo de PPM/CPM, animação count-up, renderização de resultado, recomendações e histórico em um único arquivo de 280 linhas.
**Substituição:** Separar em `useTimer`, `ResultScreen`, `useRecommendations`.

### Header duplicado no `index.html`
**Problema atual:** O `index.html` tem header hardcoded com estrutura antiga (imagem estática, sem player status, sem dojo-kicker). As outras páginas têm header `<header></header>` preenchido por `config.mjs`. São dois headers diferentes.
**Substituição:** Em React, isso não existe — há um único `<HeaderHud>` componente.

### `visibilitychange` + `resize` listeners avulsos
**Problema atual:** Cada módulo que precisa (background, game loop, tempo) registra seus próprios listeners de `visibilitychange`. Não há limpeza centralizada.
**Substituição:** `useEffect` com cleanup, ou um hook global `usePageVisibility`.

### `allScript.js` como orquestrador implícito
**Problema atual:** `allScript.js` é um arquivo ambíguo que serve Type Arena, Aprenda, Mapa e Conta ao mesmo tempo, guarded por `$("#digitandoTexto").length > 0`. Isso é frágil.
**Substituição:** Cada rota React tem seu próprio entry point (`TypeArenaPage.tsx`, etc.). Zero ambiguidade.

---

## 8. Checklist de Migração

### Preparação
- [ ] Criar branch de migração (`feat/react-migration`)
- [ ] Salvar v1 estática com tag e branch de backup
- [ ] Criar projeto Vite + React + TypeScript
- [ ] Configurar TypeScript (`tsconfig.json` estrito)
- [ ] Configurar ESLint (React, TypeScript, a11y)
- [ ] Configurar Prettier

### Design System
- [ ] Migrar tokens CSS (`--dojo-*`)
- [ ] Criar componentes UI base (`Button`, `Card`, `Panel`, `Badge`, `Chip`, `ProgressBar`)
- [ ] Criar `AppLayout` com `BackgroundCanvas`
- [ ] Criar `HeaderHud` com player status
- [ ] Criar `SettingsDrawer`
- [ ] Criar `MobileBottomNav`

### Serviços e Stores
- [ ] Criar `storageService.ts` (de `utils/storage.mjs`)
- [ ] Criar repositórios (progress, history, lesson, mission, arcade, recommendation)
- [ ] Criar Zustand stores (player, typing, timer, lesson, mission, arcade, settings, ui)

### Páginas
- [ ] Migrar Home (`dojo-home.mjs` → `HomePage.tsx`)
- [ ] Migrar Type Arena (`typing.mjs` + `tempo.mjs` → `TypeArenaPage.tsx`)
- [ ] Migrar Aprenda (`script.mjs` → `LearnPage.tsx`)
- [ ] Migrar Mapa do Dojo (`pratique.mjs` → `DojoMapPage.tsx`)
- [ ] Migrar Arcade (`game/` → `ArcadePage.tsx`)
- [ ] Migrar Conta (`entrarCriarConta.html` → `AccountPage.tsx`)

### Qualidade
- [ ] Criar testes unitários para lógica crítica (Vitest)
- [ ] Criar testes E2E para fluxos principais (Playwright)
- [ ] Testar responsividade (mobile, tablet, desktop)
- [ ] Testar `prefers-reduced-motion`
- [ ] Testar dark mode
- [ ] Testar acessibilidade com leitor de tela

### Deploy
- [ ] Configurar build (`vite build`)
- [ ] Testar GitHub Pages / Vercel / Netlify
- [ ] Configurar `base` no `vite.config.ts` se necessário

### Futuro
- [ ] Criar interfaces para backend futuro (Supabase)
- [ ] Planejar migração de dados localStorage → banco de dados

---

## 9. Relatório Final e Riscos

### Inventário — Resumo

| Item | Quantidade |
|---|---|
| Páginas HTML | 6 |
| Módulos JS (.mjs) | 23 (raiz) + 9 (game/) + 3 (utils/) = **35 módulos** |
| Chaves localStorage mapeadas | 19 |
| Componentes futuros identificados | ~65 |
| Stores Zustand futuras | 8 |
| Repositórios de storage futuros | 7 |

---

### Módulos já prontos para TypeScript (migração trivial)

Estes módulos já são **funções puras sem dependência de DOM** — a conversão para `.ts` é basicamente renomear o arquivo e adicionar tipos:

- `utils/storage.mjs` → `storageService.ts`
- `utils/format.mjs` → `format.ts`
- `game/state.mjs` → `arcade/state.ts`
- `game/spawner.mjs` → `spawner.ts`
- `game/score.mjs` → `score.ts`
- `lessonTexts.mjs` → `lessonTexts.ts`
- `palavras.mjs` → `wordBank.ts` (exceto o shuffle top-level)
- `estado.mjs` → parte de `typingStore.ts`
- `paramentros.mjs` → `precisionCalc.ts`
- `constants.mjs` → `src/constants/` (múltiplos arquivos)

---

### Principais Riscos

| Risco | Severidade | Mitigação |
|---|---|---|
| Engine de digitação em jQuery — reescrever `typing.mjs` em React é a tarefa mais complexa da migração | **Alta** | Separar lógica pura de digitação em `useTypingEngine` antes de tocar no DOM |
| `tempo.mjs` mistura timer + renderização — resultado pode ter bugs sutis de ordem | **Média** | Reescrever `useTimer` com `useRef` para o intervalo, testar PPM/CPM contra v1 |
| Canvas do Panda Keys usa CSS vars para tema — em React, `getComputedStyle` precisa ser chamado no momento certo (após mount) | **Média** | Ler tema no `useEffect` após mount, não no módulo top-level |
| `game/loop.mjs` usa `requestAnimationFrame` com fixed-step — integrar com React sem causar memory leaks | **Média** | `useEffect` com cleanup que chama `loop.stop()` |
| Dados localStorage sem schema definido — tipos podem divergir entre usuários de v1 e v2 | **Média** | Criar função de migração de dados no `storageService` para normalizar dados legados |
| `index.html` tem header hardcoded diferente dos demais — estado inconsistente | **Baixa** | Corrigir antes de migrar, ou aceitar que React vai substituir ambos |
| AdSense — integração com `<Script>` do React | **Baixa** | Usar `<script async>` no `index.html` do Vite diretamente |
| `prefers-reduced-motion` nuclear em `animations.css` — pode conflitar com Framer Motion | **Baixa** | Usar `useReducedMotion()` do Framer Motion ou `motion.div` com `variants` |

---

### Ordem Recomendada de Migração

1. **Serviços primeiro** — `storageService.ts`, repositórios, constants. Zero risco, zero UI.
2. **Stores depois** — Zustand stores baseados nos repositórios. Testáveis isoladamente.
3. **Design system** — Componentes UI genéricos sem lógica de negócio.
4. **Home** — Página mais simples do ponto de vista de interatividade.
5. **Aprenda** — Quase estática.
6. **Mapa do Dojo** — Depende de `lessonProgress` já migrado.
7. **Type Arena** — A mais complexa. Migrar por último entre as features principais.
8. **Arcade** — Isolado em `game/` — pode ser migrado em paralelo com a Type Arena.

---

### Pontos que Precisam de Atenção Antes de Migrar

1. **Corrigir `index.html`** para usar o header dinâmico (`config.mjs`) como as demais páginas, ou aceitar que a migração resolverá isso.

2. **Decidir sobre jQuery** — Não usar jQuery no projeto React. Mapear todos os usos atuais e substituição antes de iniciar qualquer componente.

3. **Definir estratégia de tema** — Atualmente 20+ classes CSS são adicionadas via jQuery. Definir se usará `data-theme` + CSS vars ou Context API antes de criar qualquer componente.

4. **Migração de dados localStorage existentes** — Usuários da v1 têm dados no formato atual. O `storageService.ts` da v2 precisa de uma função `migrateV1Data()` para garantir compatibilidade.

5. **`constants.mjs` está desatualizado** nos arquivos da v1** — A versão atual (lida do disco) tem um `KEYS` diferente do que estava no resumo da sessão anterior. Verificar que todos os módulos importam do `constants.mjs` correto (com `STORAGE_KEYS`, `TRAINING_MODES`, `LEVEL_TITLES`).

---

### Próxima Ação Recomendada

**Antes de iniciar a migração React**, executar a seguinte sequência na v1:

1. Corrigir `index.html` para usar o mesmo header dinâmico das outras páginas (ou documentar explicitamente que ficará diferente até a migração).
2. Criar tag `v1.0-static` no git.
3. Criar branch `feat/react-migration`.
4. Iniciar com `npm create vite@latest` e migrar `constants.mjs` + `utils/` como primeiro PR — zero risco, máximo aprendizado sobre o processo.

---

*Documento gerado em 2026-05-26. Versão do projeto analisado: Panda Dojo Arcade Local v1 (branch: Organizando).*
