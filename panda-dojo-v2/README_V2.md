# PandaDigitações V2 — Panda Dojo Arcade

Versão 2 do PandaDigitações: app de treino de digitação gamificado, com fases,
missões, ranking local e minigames no estilo arcade.

## Stack

- **Vite** (bundler/dev server)
- **React 19**
- **TypeScript**
- **React Router 7** (`BrowserRouter`)
- CSS Modules + tokens de design (`src/styles/`)

Sem backend, sem login, sem dependências de gráfico. Todo o progresso é local.

## Como rodar localmente

```bash
npm install
npm run dev
```

O Vite sobe em `http://localhost:5173` por padrão.

## Como gerar build de produção

```bash
npm run build     # tsc -b && vite build  → gera /dist
npm run preview   # serve a build de /dist localmente (porta 4173)
```

`npm run lint` roda o ESLint em todo o projeto.

## Rotas

| Rota        | Página                |
| ----------- | --------------------- |
| `/`         | Home                  |
| `/arena`    | Type Arena (digitação)|
| `/aprenda`  | Aprenda               |
| `/mapa`     | Mapa do Dojo (fases)  |
| `/arcade`   | Arcade (Panda Keys)   |
| `/conta`    | Conta / Perfil local  |
| `/ranking`  | Ranking local         |

Rotas desconhecidas caem na Home (`path="*"`).

## Dados locais

Todo o progresso é salvo no **localStorage do navegador** — não há servidor.
Limpar os dados do navegador (ou usar outro dispositivo/navegador) zera o
progresso. Principais chaves:

- `ativo` (tema)
- `tempoPratica` (tempo padrão de treino)
- `pandaCursorMode` (estilo do cursor da Arena: `arcade` | `classic`)
- `historico` (resultados de treino)
- `pandaXp`, `pandaLevel`, `pandaAchievements`
- `pandaLessonProgress` (progresso das fases)
- `pandaKeysBestScore`, `pandaSealBestScore` (recordes do Arcade)
- `pandaDailyMissions`, `pandaTrainingRecommendations`

A leitura passa por `src/services/storage/storageService.ts`, com fallback
seguro: localStorage vazio, ausente ou com JSON inválido **não quebra** a tela.

## Limitações atuais

- Sem backend;
- Sem login real;
- Sem ranking global real (apenas local, por navegador);
- Progresso apenas local;
- Conta online planejada para uma versão futura.

## Deploy

### Vercel (recomendado)

A V2 usa `BrowserRouter`, então o deploy mais simples é a **Vercel**, que já
está configurada via [`vercel.json`](./vercel.json):

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Passos:

1. Importar o repositório na Vercel.
2. Framework preset: **Vite** (detectado automaticamente).
3. Build command: `npm run build` · Output directory: `dist`.
4. Sem variáveis de ambiente (não há backend).

O `rewrites` garante que recarregar uma rota interna (ex.: `/arena`) devolva o
`index.html` e o React Router assuma o roteamento — sem 404.

> Importante para a Vercel: defina o **Root Directory** do projeto como
> `panda-dojo-v2` se o repositório contiver também a V1 na raiz.

### GitHub Pages (alternativa, requer ajustes)

GitHub Pages serve em subcaminho (`https://usuario.github.io/nome-do-repo/`) e
não tem fallback de SPA nativo. Para usá-lo seria necessário:

1. Definir `base: "/nome-do-repo/"` no `vite.config.ts`; **e**
2. Trocar `BrowserRouter` por `HashRouter` (URLs com `#`), **ou** publicar um
   `404.html` que redirecione para o `index.html`.

Por isso, **a Vercel é a opção recomendada** nesta etapa — mantém
`BrowserRouter` e URLs limpas sem configuração extra.

## Teste público controlado

A V2 do PandaDigitações está em fase de **teste público controlado**.

Objetivo:

- validar a experiência da Type Arena;
- validar o Mapa do Dojo;
- validar o Arcade;
- encontrar bugs;
- coletar feedback real;
- preparar uma versão V2.1.

Arquivos relacionados:

- [`USER_TEST_SCRIPT_V2.md`](./USER_TEST_SCRIPT_V2.md) — roteiro entregue a quem vai testar.
- [`FEEDBACK_TEST_V2.md`](./FEEDBACK_TEST_V2.md) — onde registrar o feedback coletado.
- [`POST_FEEDBACK_FIXES_V2.md`](./POST_FEEDBACK_FIXES_V2.md) — backlog de correções pós-teste (V2.1).
- [`PUBLIC_TEST_CHECKLIST.md`](./PUBLIC_TEST_CHECKLIST.md) — checklist técnico de smoke test.

Fluxo sugerido: entregue o `USER_TEST_SCRIPT_V2.md` ao testador → registre o
retorno em `FEEDBACK_TEST_V2.md` → consolide o que virar ação em
`POST_FEEDBACK_FIXES_V2.md` para planejar a V2.1.
