# Regras de Sync Supabase — PandaDigitações V2

## Princípio

O app é local-first. Toda ação importante salva primeiro no localStorage e só
depois tenta espelhar no Supabase quando houver usuário autenticado.

## Importação Manual

- A importação nunca é automática.
- O card aparece em `/conta` apenas para usuário logado com progresso local e
  `pandaCloudSyncImported` diferente de `true`.
- A flag `pandaCloudSyncImported` só é marcada quando a importação termina sem
  erro.
- Dados locais não são apagados depois da importação.

## Dados Importados

- Histórico da Type Arena para `typing_results`.
- Progresso do Mapa para `lesson_progress`.
- Recordes do Arcade para `arcade_scores`.
- Conquistas para `user_achievements`.
- XP, nível, título, streak e última data para `profiles`.

## Deduplicação

Nesta fase, a deduplicação principal é a flag `pandaCloudSyncImported`.

Regras adicionais:

- `lesson_progress` usa upsert por `user_id + lesson_id`.
- Progresso remoto de fase não deve piorar `best_accuracy`, `best_ppm`, medalha
  ou status concluído.
- Perfil remoto não deve perder XP, nível ou streak maiores.
- Arcade registra novos recordes locais como eventos em `arcade_scores`.

## Fallback

Falhas remotas não podem:

- apagar dados locais;
- quebrar a Type Arena;
- quebrar o Arcade;
- travar a Conta;
- causar tela preta.

O erro deve ser tratado como feedback controlado quando a ação for manual. Em
sync automático, a falha fica silenciosa nesta fase.

## Riscos Conhecidos

- Sem fila offline, uma falha no sync automático de novo resultado não é
  reenviada depois.
- Sem leitura remota completa, login em novo dispositivo ainda não reconstrói o
  progresso local.
- Importação parcial pode deixar registros já enviados se uma etapa posterior
  falhar. A flag não é marcada nesses casos, então o usuário pode tentar de
  novo.

## Próxima Fase Recomendada

Fase 1D deve criar uma fila de pending sync e leitura remota segura para
restaurar progresso em novos dispositivos.
