# PandaDigitações V2 — Panda Dojo Arcade

PandaDigitações V2 é uma aplicação web gamificada para treino de digitação em português. A experiência atual combina Type Arena, Mapa do Dojo, Arcade, Ranking, Conta, progresso local e integração inicial com Supabase, mantendo a identidade visual **Panda Dojo Arcade**.

O projeto principal fica em [`panda-dojo-v2`](./panda-dojo-v2).

## Estado Atual

A V2 está em fase funcional avançada:

- React + TypeScript + Vite.
- Design system próprio com CSS Modules e tokens globais.
- Type Arena com cursor configurável, teclado virtual, métricas e tela de resultado.
- Mapa do Dojo com fases e progresso.
- Arcade com Panda Keys e protótipos de minigames.
- Conta com autenticação Supabase e fallback local.
- Sync local-first para progresso, histórico, conquistas e recordes.
- Pending Sync para reenviar dados quando o Supabase falhar temporariamente.
- Ranking Local e Ranking Online inicial com Supabase.
- Tema claro/escuro, reduced motion e configurações persistidas.

## Stack

- React 19.
- TypeScript.
- Vite.
- React Router 7.
- Supabase Auth + PostgreSQL.
- CSS Modules.
- localStorage para modo local-first.

Não há Next, Vue, build server próprio ou backend customizado fora do Supabase.

## Como Rodar Localmente

```bash
cd panda-dojo-v2
npm install
npm run dev
```

O Vite abre por padrão em:

```text
http://localhost:5173
```

## Scripts

```bash
npm run dev      # servidor de desenvolvimento
npm run lint     # ESLint
npm run build    # TypeScript + build Vite
npm run preview  # preview da build em dist
```

## Rotas Principais

| Rota | Página |
| --- | --- |
| `/` | Home |
| `/arena` | Type Arena |
| `/aprenda` | Aprenda |
| `/mapa` | Mapa do Dojo |
| `/arcade` | Arcade |
| `/conta` | Conta |
| `/ranking` | Ranking |

Rotas desconhecidas caem na Home.

## Supabase

O app funciona sem Supabase, mantendo dados locais no navegador. Para ativar conta, sync e ranking online:

1. Crie um projeto no Supabase.
2. Copie `.env.example` para `.env.local` dentro de `panda-dojo-v2`.
3. Preencha:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

4. Execute os SQLs no Supabase SQL Editor:

```text
panda-dojo-v2/supabase/schema.sql
panda-dojo-v2/supabase/seed.sql
panda-dojo-v2/supabase/ranking_views.sql
panda-dojo-v2/supabase/security_fixes.sql
```

O script `fix_profiles_null_names.sql` é auxiliar e só deve ser usado para corrigir perfis antigos sem nome.

Nunca use `service_role` no front-end.

## Dados e Persistência

O projeto é local-first:

- dados locais continuam funcionando sem internet/Supabase;
- login online sincroniza progresso quando possível;
- falhas remotas entram na fila de Pending Sync;
- ranking local continua disponível mesmo se o ranking online falhar.

Principais áreas de persistência:

- `src/repositories/`
- `src/services/persistence/`
- `src/repositories/remote/`
- `src/features/backend-sync/`

## Ranking

O Ranking possui dois escopos:

- **Local:** usa histórico salvo no navegador.
- **Online:** usa Supabase via `public.online_typing_ranking`.

Documentação técnica:

- [`panda-dojo-v2/docs/RANKING_SYSTEM.md`](./panda-dojo-v2/docs/RANKING_SYSTEM.md)
- [`panda-dojo-v2/supabase/ranking_views.sql`](./panda-dojo-v2/supabase/ranking_views.sql)

## Estrutura

```text
.
├── README.md
├── LICENSE
├── assets/                  # V1/legado estático
└── panda-dojo-v2/            # aplicação atual
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── features/
    │   ├── pages/
    │   ├── repositories/
    │   ├── services/
    │   └── styles/
    ├── docs/
    ├── supabase/
    ├── public/
    ├── package.json
    └── vite.config.ts
```

## Deploy

### Vercel

Recomendado para a V2.

Configuração:

- Root Directory: `panda-dojo-v2`
- Build Command: `npm run build`
- Output Directory: `dist`

O arquivo [`panda-dojo-v2/vercel.json`](./panda-dojo-v2/vercel.json) já inclui rewrite para SPA.

### GitHub Pages

Possível, mas exige cuidado com SPA e subpath. Para a V2, Vercel é a opção mais simples.

## Documentação Útil

- [`panda-dojo-v2/docs/PROJECT_QA_CHECKLIST.md`](./panda-dojo-v2/docs/PROJECT_QA_CHECKLIST.md)
- [`panda-dojo-v2/docs/PROJECT_TERMS.md`](./panda-dojo-v2/docs/PROJECT_TERMS.md)
- [`panda-dojo-v2/docs/PERSISTENCE_ARCHITECTURE.md`](./panda-dojo-v2/docs/PERSISTENCE_ARCHITECTURE.md)
- [`panda-dojo-v2/docs/SUPABASE_BACKEND_PLAN.md`](./panda-dojo-v2/docs/SUPABASE_BACKEND_PLAN.md)
- [`panda-dojo-v2/docs/SUPABASE_SYNC_RULES.md`](./panda-dojo-v2/docs/SUPABASE_SYNC_RULES.md)

## Limitações Atuais

- Ranking online ainda é inicial.
- Desafio Diário online dedicado ainda não foi separado em tabela própria de ranking diário.
- Perfil público completo ainda não existe.
- O projeto ainda mantém `assets/` como legado da V1.
- Alguns minigames do Arcade ainda são protótipos.

## Manutenção

Antes de concluir mudanças relevantes:

```bash
cd panda-dojo-v2
npm run lint
npm run build
```

Checklist permanente:

```text
panda-dojo-v2/docs/PROJECT_QA_CHECKLIST.md
```

## Licença

MIT. Consulte [`LICENSE`](./LICENSE).
