-- Security fixes — PandaDigitações V2
-- Execute depois do schema.sql e das views.

-- 1. Corrige search_path da função set_updated_at
alter function public.set_updated_at()
set search_path = public;

-- 2. Corrige search_path da função handle_new_user
alter function public.handle_new_user()
set search_path = public;

-- 3. Impede que usuários chamem handle_new_user manualmente
-- A função deve ser executada apenas pelo trigger de criação de usuário.
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;