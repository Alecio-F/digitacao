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
- Ranking Local e Ranking Online (Geral, Velocidade, Precisão, Combo, Fases, Textos, Desafio Diário, Arcade).
- Elegibilidade competitiva com motivo de invalidação para resultados fora do ranking.
- Desafio Diário com ranking dedicado em tabela própria (`daily_challenge_results`), um resultado por usuário por dia.
- Ranking do Arcade com melhor score por usuário por jogo (`arcade_scores`) — Panda Keys e Seal Challenge.
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

4. Execute os SQLs no Supabase SQL Editor, nesta ordem:

```text
panda-dojo-v2/supabase/schema.sql
panda-dojo-v2/supabase/seed.sql
panda-dojo-v2/supabase/ranking_eligibility.sql
panda-dojo-v2/supabase/ranking_views.sql
panda-dojo-v2/supabase/ranking_combo_view.sql
panda-dojo-v2/supabase/ranking_phase_view.sql
panda-dojo-v2/supabase/ranking_text_view.sql
panda-dojo-v2/supabase/daily_challenge_ranking.sql
panda-dojo-v2/supabase/arcade_ranking.sql
panda-dojo-v2/supabase/security_fixes.sql
```

O script `fix_profiles_null_names.sql` é auxiliar e só deve ser usado para corrigir perfis antigos sem nome.

`ranking_eligibility.sql` adiciona o campo `ranking_invalid_reason` em bancos já existentes e normaliza motivos principais de resultados inelegíveis.

`ranking_combo_view.sql`, `ranking_phase_view.sql` e `ranking_text_view.sql` ativam rankings online específicos de Combo, Fases e Textos com views dedicadas.

`daily_challenge_ranking.sql` adiciona campos de ranking em `daily_challenge_results`, cria indexes, policies públicas e a view `online_daily_challenge_ranking`. É idempotente.

`arcade_ranking.sql` adiciona grant público e policy de leitura em `arcade_scores` e cria a view `online_arcade_ranking_best`. É idempotente.

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
- **Online:** usa Supabase. Categorias disponíveis: Geral, Velocidade, Precisão, Combo, Fases, Textos, Desafio Diário e Arcade.

O Desafio Diário usa tabela própria (`daily_challenge_results`) com ranking dedicado e garante um resultado por usuário por dia. O Arcade usa `arcade_scores` com melhor score por usuário por jogo — sem interferir no histórico geral de digitação.

Resultados de Type Arena entram no ranking apenas quando passam pela elegibilidade mínima: precisão suficiente, duração mínima, quantidade adequada de caracteres e ausência de padrões suspeitos. Resultados fora do ranking continuam salvos no histórico, mas recebem `ranking_invalid_reason`.

Documentação técnica:

- [`panda-dojo-v2/docs/RANKING_SYSTEM.md`](./panda-dojo-v2/docs/RANKING_SYSTEM.md)
- [`panda-dojo-v2/docs/RANKING_VALIDATION_RULES.md`](./panda-dojo-v2/docs/RANKING_VALIDATION_RULES.md)
- [`panda-dojo-v2/supabase/ranking_eligibility.sql`](./panda-dojo-v2/supabase/ranking_eligibility.sql)
- [`panda-dojo-v2/supabase/ranking_views.sql`](./panda-dojo-v2/supabase/ranking_views.sql)
- [`panda-dojo-v2/supabase/ranking_combo_view.sql`](./panda-dojo-v2/supabase/ranking_combo_view.sql)
- [`panda-dojo-v2/supabase/ranking_phase_view.sql`](./panda-dojo-v2/supabase/ranking_phase_view.sql)
- [`panda-dojo-v2/supabase/ranking_text_view.sql`](./panda-dojo-v2/supabase/ranking_text_view.sql)
- [`panda-dojo-v2/supabase/daily_challenge_ranking.sql`](./panda-dojo-v2/supabase/daily_challenge_ranking.sql)
- [`panda-dojo-v2/supabase/arcade_ranking.sql`](./panda-dojo-v2/supabase/arcade_ranking.sql)

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

- Perfil público completo ainda não existe.
- Antifraude do ranking é client-side; recálculo server-side ainda não implementado.
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
