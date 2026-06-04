# Supabase — PandaDigitações V2

Esta pasta contém a fundação SQL da Fase 1B.

## Arquivos

- `schema.sql`: tabelas principais, triggers e RLS.
- `seed.sql`: conquistas iniciais.

## Ordem de Execução

1. Abra o projeto no Supabase Dashboard.
2. Acesse SQL Editor.
3. Execute `schema.sql`.
4. Execute `seed.sql`.

## Variáveis

Copie `.env.example` para `.env.local` e preencha:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Use a publishable/anon key no front-end. Nunca use `service_role` no Vite.

## Auth

No Dashboard, confira Authentication > Providers e mantenha Email ativo.

Para desenvolvimento:

- Site URL: `http://localhost:5173`
- Redirect URL: `http://localhost:5173/**`

## RLS

Todas as tabelas públicas do schema têm Row Level Security ativo. As policies
permitem que usuários autenticados acessem apenas seus próprios dados, exceto
`achievements`, que é catálogo de leitura.

## Escopo Atual

A Fase 1B cria client, Auth, profile remoto e SQL. O sync completo de histórico,
progresso, ranking e Arcade fica para a Fase 1C.
