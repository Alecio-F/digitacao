# PandaDigitações

PandaDigitações é uma aplicação web estática para treino de digitação em português. A versão atual consolida a identidade **Panda Dojo Arcade** com Type Arena, Mapa do Dojo, Arcade, progressão local e recursos de treino inteligente usando apenas HTML, CSS, JavaScript com ES Modules, Canvas API e localStorage.

Não há backend, framework, etapa de build, React, Vue, Vite ou Next.

## Versão atual — Panda Dojo Arcade Local v1

Esta versão é uma edição local estável e pronta para compartilhamento. Ela mantém todo o progresso no navegador do usuário e organiza a experiência em páginas estáticas com caminhos relativos, adequadas para execução por servidor local simples ou publicação via GitHub Pages.

## Recursos prontos na v1

- Home com atalhos, progresso local, ranking visual e recomendações.
- Type Arena com treino cronometrado, PPM, CPM, precisão, erros, combo, histórico e tela final.
- Aprenda com módulos educativos, checklist e CTAs para prática.
- Mapa do Dojo com fases, bloqueios, medalhas, XP e integração com a Type Arena.
- Arcade do Panda com Panda Keys em Canvas.
- Protótipo jogável de Selos do Teclado.
- Conta visual para login/cadastro futuro.
- XP, níveis, títulos e conquistas locais.
- Missões diárias e recomendações inteligentes locais.
- Tema claro/escuro persistido.
- Drawer de configurações.
- Teclado virtual da Type Arena.
- Histórico local e recordes locais.
- Layout responsivo para desktop, notebook, tablet e celular.
- Animações com fallback e respeito a `prefers-reduced-motion`.

## Recursos locais

A aplicação usa `localStorage` para salvar preferências e progresso. Principais chaves:

- `ativo`: preferência de tema.
- `tempoPratica`: tempo padrão de treino.
- `historico`: resultados recentes da Type Arena.
- `pandaXp`: XP local.
- `pandaLevel`: nível local.
- `pandaAchievements`: conquistas desbloqueadas.
- `pandaDailyStreak`: sequência diária.
- `pandaLastTrainingDate`: data do último treino.
- `pandaLastMistakes`: teclas mais erradas recentes.
- `pandaKeysBestScore`: melhor pontuação do Panda Keys.
- `pandaDailyMissions`: missões diárias locais.
- `pandaMissionDate`: data das missões atuais.
- `pandaLessonProgress`: progresso das fases do Mapa.
- `pandaTrainingRecommendations`: recomendações recentes.

Os dados não saem do navegador e podem ser limpos nas ferramentas de desenvolvedor.

## Recursos ainda protótipos

- Conta ainda é visual, sem autenticação real.
- Ranking é local/visual, sem placar global.
- Selos do Teclado está em MVP.
- Algumas fases do Mapa usam conjuntos de textos simples e podem evoluir.
- Recomendações são heurísticas locais, não personalização por backend.

## Como executar localmente

Como o projeto usa ES Modules, execute por um servidor estático:

```bash
cd assets
python -m http.server 5500
```

URLs principais:

```text
http://localhost:5500
http://localhost:5500/page/digitando.html
http://localhost:5500/page/aprenda.html
http://localhost:5500/page/pratique.html
http://localhost:5500/page/game.html
http://localhost:5500/page/entrarCriarConta.html
```

## Estrutura

```text
.
|-- README.md
|-- QA_CHECKLIST.md
|-- RELEASE_NOTES.md
|-- LICENSE
`-- assets
    |-- index.html
    |-- css
    |   |-- style.css
    |   |-- mediaquery.css
    |   |-- dojo.css
    |   |-- animations.css
    |   `-- game.css
    |-- js
    |   |-- constants.mjs
    |   |-- config.mjs
    |   |-- typing.mjs
    |   |-- tempo.mjs
    |   |-- historico.mjs
    |   |-- gamification.mjs
    |   |-- trainingRecommendations.mjs
    |   |-- dojoLessons.mjs
    |   |-- dailyMissions.mjs
    |   |-- utils
    |   `-- game
    `-- page
        |-- digitando.html
        |-- aprenda.html
        |-- pratique.html
        |-- game.html
        `-- entrarCriarConta.html
```

## Publicação via GitHub Pages

Se o conteúdo publicado for a pasta `assets`, uma opção é enviar essa pasta para a branch `gh-pages`:

```bash
git subtree push --prefix assets origin gh-pages
```

Se for necessário sobrescrever a branch publicada:

```bash
git push origin `git subtree split --prefix assets main`:gh-pages --force
```

No GitHub Pages, configure a publicação para:

```text
Branch: gh-pages
Folder: / (root)
```

Não há etapa de build. Os caminhos do projeto foram mantidos relativos para funcionar tanto localmente quanto no GitHub Pages.

## Limitações conhecidas

- Progresso ainda é local por navegador.
- Não há login real.
- Não há ranking global real.
- Não há backend.
- Alguns minigames ainda são protótipos.
- A conta ainda é uma tela visual.
- CDNs externos precisam estar disponíveis no primeiro carregamento para jQuery, GSAP e ícones.

## Boas práticas para manutenção

- Não adicionar backend ou framework sem uma decisão explícita de arquitetura.
- Preservar ES Modules e caminhos relativos.
- Não remover IDs usados pelo JavaScript.
- Testar com localStorage limpo e com dados antigos.
- Validar console, responsividade e ausência de scroll horizontal após cada alteração visual.

## Licença

Este projeto está licenciado sob os termos da licença MIT. Consulte [LICENSE](LICENSE).
