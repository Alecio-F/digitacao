# PandaDigitações

PandaDigitações é uma aplicação web estática para treino de digitação em português. O projeto evoluiu para a identidade **Panda Dojo Arcade**, unindo teste cronometrado, prática educativa, progressão local, minigames e microinterações com estética de jogo.

> Status: em desenvolvimento ativo.

## Visão Geral

O objetivo do projeto é oferecer uma experiência simples, rápida e acessível para treinar velocidade, precisão e foco no teclado. A aplicação roda diretamente no navegador, sem backend, sem framework e sem etapa de build.

A experiência atual é organizada como uma plataforma de treino:

- **Início:** entrada do Panda Dojo Arcade, atalhos de treino, progresso local e ranking visual.
- **Type Arena:** teste cronometrado com métricas em tempo real, combo, feedback visual e teclado virtual.
- **Aprenda:** tutorial gamificado "Aprenda com o Mestre Panda", com módulos, cards, checklist e CTA para prática.
- **Mapa do Dojo:** trilhas e fases visuais para treinos guiados.
- **Arcade do Panda:** minigame Panda Keys em Canvas e protótipos de novos desafios.
- **Conta:** tela visual para login/cadastro futuro, com progresso salvo localmente por enquanto.

## Recursos

- Teste de digitação cronometrado.
- Seleção de tempo de prática: 15 segundos a 15 minutos.
- Cálculo de PPM, CPM, precisão e erros.
- Destaque de caracteres corretos, incorretos, extras e caractere atual.
- Pausa, reinício e troca de texto.
- Histórico local dos últimos resultados.
- Recorde pessoal por PPM.
- Teclas mais erradas na rodada.
- Sistema local de XP, nível, títulos e conquistas.
- Status de jogador no header com nível, XP e barra de progresso.
- Tema claro/escuro persistido no navegador.
- Drawer lateral de configurações.
- Fundo animado em Canvas com elementos de teclado, arcade e dojo.
- Microinterações com GSAP quando disponível, com fallback seguro.
- Teclado virtual animado na Type Arena.
- Minigame **Panda Keys** em Canvas, com pontuação, combo, vidas, níveis e recorde local.
- Protótipo visual/interativo de **Selos do Teclado**.
- Layout responsivo para desktop, tablet e celular.
- Suporte a `prefers-reduced-motion` para reduzir animações.

## Tecnologias

- HTML5
- CSS3
- JavaScript moderno com ES Modules
- jQuery via CDN
- GSAP e ScrollTrigger via CDN
- Canvas API
- Web Storage API (`localStorage`)
- Google Material Symbols
- Google AdSense

Não há React, Vue, Vite, Next, backend ou dependências de build.

## Como Executar Localmente

Como o projeto usa ES Modules, execute por um servidor local estático.

### Python

```bash
cd assets
python -m http.server 5500
```

Acesse:

```text
http://localhost:5500
```

### Node.js

```bash
npx serve assets
```

Depois, abra a URL exibida no terminal.

## Estrutura

```text
.
|-- README.md
|-- LICENSE
`-- assets
    |-- index.html
    |-- css
    |   |-- style.css
    |   |-- mediaquery.css
    |   |-- dojo.css
    |   |-- animations.css
    |   `-- game.css
    |-- img
    |   |-- PandaDigitacoes-logo.png
    |   |-- logoDarktheme.png
    |   |-- mentor-panda.png
    |   `-- ...
    |-- js
    |   |-- allScript.js
    |   |-- config.mjs
    |   |-- typing.mjs
    |   |-- tempo.mjs
    |   |-- paramentros.mjs
    |   |-- historico.mjs
    |   |-- estado.mjs
    |   |-- gamification.mjs
    |   |-- animations.mjs
    |   |-- dojoBackground.mjs
    |   |-- pandaMascot.mjs
    |   |-- dojo-home.mjs
    |   |-- confete.mjs
    |   `-- game
    |       |-- game.mjs
    |       |-- state.mjs
    |       |-- loop.mjs
    |       |-- renderer.mjs
    |       |-- spawner.mjs
    |       |-- input.mjs
    |       |-- score.mjs
    |       |-- audio.mjs
    |       `-- dojo-challenges.mjs
    `-- page
        |-- digitando.html
        |-- aprenda.html
        |-- pratique.html
        |-- game.html
        `-- entrarCriarConta.html
```

## Páginas

| Página | Caminho | Descrição |
| --- | --- | --- |
| Início | `assets/index.html` | Home do Panda Dojo Arcade com atalhos, progresso e ranking visual. |
| Type Arena | `assets/page/digitando.html` | Teste de digitação com HUD, métricas, feedback e teclado virtual. |
| Aprenda | `assets/page/aprenda.html` | Tutorial gamificado com módulos do Mestre Panda. |
| Mapa do Dojo | `assets/page/pratique.html` | Mapa visual de fases e lições. |
| Arcade do Panda | `assets/page/game.html` | Panda Keys e protótipos de minigames. |
| Conta | `assets/page/entrarCriarConta.html` | Interface de conta futura; progresso salvo no navegador. |

## Persistência Local

A aplicação salva preferências e progresso no `localStorage`.

Principais chaves:

- `ativo`: tema escuro.
- `tempoPratica`: tempo padrão do teste.
- `historico`: últimos resultados de digitação.
- `pandaXp`: XP local do jogador.
- `pandaLevel`: nível local.
- `pandaAchievements`: conquistas desbloqueadas.
- `pandaDailyStreak`: sequência diária local.
- `pandaLastTrainingDate`: data do último treino.
- `pandaLastMistakes`: teclas mais erradas recentes.
- `pandaKeysBestScore`: recorde local do Panda Keys.

Esses dados ficam apenas no navegador do usuário.

## Gamificação

O módulo `assets/js/gamification.mjs` calcula progresso local com base no histórico. A lógica atual considera:

- XP por treino concluído.
- Bônus por precisão alta.
- Bônus por novo recorde.
- Títulos de progressão por nível.
- Conquistas simples como primeiro treino, precisão alta e rotina de treinos.

Exemplos de títulos:

- Nível 1: Filhote de Panda.
- Nível 5: Aprendiz do Dojo.
- Nível 10: Panda Ágil.
- Nível 20: Mestre das Teclas.
- Nível 30: Guardião do Teclado.

## Animações e UX

A camada visual usa `assets/js/animations.mjs` e `assets/js/dojoBackground.mjs`.

Principais pontos:

- Animações globais com GSAP quando disponível.
- Reveals por scroll com ScrollTrigger.
- Microinterações em cards, botões, header e teclado virtual.
- Fundo animado em Canvas com partículas, teclas, bambus e grade arcade.
- Toasts e feedback visual para conquistas/recordes.
- Fallback seguro caso GSAP não carregue.
- Respeito a `prefers-reduced-motion`.

## Boas Práticas do Projeto

- Manter a arquitetura estática.
- Não adicionar framework ou etapa de build.
- Preservar ES Modules.
- Não quebrar a compatibilidade com `python -m http.server`.
- Centralizar estilos visuais da identidade Dojo em `dojo.css` e `animations.css`.
- Usar `localStorage` apenas para progresso local e preferências.
- Garantir contraste, foco visível e responsividade.

## Verificação Manual

Após alterações, recomenda-se validar:

```bash
cd assets
python -m http.server 5500
```

Abrir no navegador:

```text
http://localhost:5500
http://localhost:5500/page/digitando.html
http://localhost:5500/page/aprenda.html
http://localhost:5500/page/pratique.html
http://localhost:5500/page/game.html
http://localhost:5500/page/entrarCriarConta.html
```

Também é útil conferir o console do navegador para garantir que os módulos carregaram sem erro.

## Próximos Passos

- Implementar lições reais no Mapa do Dojo.
- Evoluir os protótipos Selos do Teclado e Expedição Bamboo Code.
- Melhorar acessibilidade com testes de navegação por teclado e leitores de tela.
- Revisar textos e acentuação em arquivos legados.
- Criar testes automatizados para cálculo de métricas e gamificação.
- Avaliar remoção gradual de jQuery em favor de JavaScript nativo.
- Implementar autenticação apenas se o projeto deixar de ser exclusivamente local.

## Licença

Este projeto está licenciado sob os termos da licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.
