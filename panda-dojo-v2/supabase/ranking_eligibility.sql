-- Ranking eligibility hardening - PandaDigitacoes V2
--
-- Execute este arquivo em projetos que ja possuem public.typing_results.
-- Ele adiciona o motivo simples de inelegibilidade sem apagar dados antigos.

alter table public.typing_results
add column if not exists ranking_invalid_reason text;

update public.typing_results
set ranking_invalid_reason = case
  when valid_for_ranking = true then null
  when ranking_invalid_reason is not null then ranking_invalid_reason
  when ranking_invalid_reasons ? 'accuracy_too_low' then 'low_accuracy'
  when ranking_invalid_reasons ? 'duration_too_short' then 'too_short'
  when ranking_invalid_reasons ? 'not_enough_correct_chars' then 'too_few_chars'
  when ranking_invalid_reasons ? 'repeated_key_abuse' then 'suspicious_repetition'
  when ranking_invalid_reasons ? 'input_burst_suspicious' then 'invalid_input_pattern'
  when ranking_invalid_reasons ? 'random_typing_pattern' then 'invalid_input_pattern'
  when ranking_invalid_reasons ? 'too_many_errors' then 'invalid_input_pattern'
  else 'missing_required_data'
end
where valid_for_ranking = false
  and ranking_invalid_reason is null;

comment on column public.typing_results.ranking_invalid_reason is
  'Motivo principal de inelegibilidade para ranking publico: low_accuracy, too_short, too_few_chars, suspicious_repetition, invalid_input_pattern ou missing_required_data.';
