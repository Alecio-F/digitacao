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

## Fase 1D — Restauração (nuvem → local)

### Regras de restauração

Ao restaurar o progresso remoto para o navegador atual, **nada é apagado** e
mantém-se sempre o melhor dos dois lados:

- **Histórico:** une o histórico local com o remoto, sem duplicar (chave =
  `completedAt|ppm|mode|lessonId`), ordena por data e respeita o limite local
  (`MAX_HISTORY`). O ranking local volta a funcionar com os dados restaurados.
- **Perfil:** `xp`, `level`, `dailyStreak` usam `max(local, remoto)`;
  `lastTrainingDate` usa a data mais recente. O título é derivado do nível.
- **Fases (Mapa):** status `completed` prevalece; `bestAccuracy`/`bestPpm`/
  `attempts` usam o maior; medalha usa a melhor.
- **Arcade:** `saveScore` é best-of (`panda-keys`, `seal-challenge → seal`),
  nunca reduz recorde local.
- **Conquistas:** união (sem duplicar).

### Conflito local vs remoto

Sem merge automático complexo. Regra simples, baseada em dois cards em `/conta`:

- Local **sem** progresso + remoto **com** progresso → `RestoreRemoteProgressCard`
  ("Restaurar progresso da nuvem").
- Local **com** progresso e ainda não importado → `LocalProgressImportCard`
  ("Importar progresso local").
- **Ambos** com progresso → os dois cards aparecem; o card de restauração avisa
  que "restaurar mantém o melhor dos dois — nada é apagado". O usuário escolhe a
  direção (importar este navegador para a nuvem **ou** restaurar da nuvem).

### Flags usadas

- `pandaCloudSyncImported` — marcada após importação local → nuvem com sucesso
  (e também após uma restauração, pois o local passa a refletir a nuvem).
- `pandaCloudRestoreCompleted` — marcada após restauração nuvem → local com
  sucesso. Evita prompt repetitivo, mas **não** impede restauração manual futura.

### Fallback e erros

- Supabase ausente/erro → mensagem amigável, app local segue funcionando, sem
  tela preta e sem apagar `localStorage`.
- Mensagens: "Não foi possível restaurar agora. Tente novamente em instantes." /
  "Seu progresso local continua salvo neste navegador." / "Nenhum progresso
  remoto encontrado." (o card simplesmente não aparece).

## Próxima Fase Recomendada

Fase 1E: fila de pending sync (offline-first), `daily_challenge_results`
dedicado, ranking global e resolução avançada de conflitos por timestamp.
