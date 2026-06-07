# Ranking Validation Rules

Este documento descreve as regras locais usadas pela Type Arena para decidir se
um treino entra no placar competitivo do PandaDigitações V2.

O histórico continua salvando todos os treinos. O ranking local e o ranking
online mostram apenas resultados marcados como `validForRanking: true` ou
`valid_for_ranking = true`.

Exceção: a categoria Curiosidades usa views próprias no Supabase para montar o
"Mural dos Distraídos". Ela pode mostrar resultados com baixa precisão
(`low_accuracy`), mas ainda exige duração mínima, caracteres suficientes e
bloqueia padrões suspeitos.

## Métricas competitivas

- PPM é calculado a partir de caracteres corretos: `(correctChars / 5) / minutos`.
- CPM é calculado a partir de caracteres corretos: `correctChars / minutos`.
- Caracteres errados não aumentam PPM nem CPM.
- O score competitivo combina PPM, precisão e combo:
  `round(ppm * (accuracy / 100) + maxCombo * 0.15)`.

## Campos salvos no histórico

Cada resultado novo salvo em `historico` pode incluir:

- `correctChars`
- `wrongChars`
- `totalTyped`
- `rawKeyCount`
- `repeatedKeyCount`
- `longestWrongStreak`
- `suspiciousInputBursts`
- `validForRanking`
- `rankingScore`
- `rankingInvalidReason`
- `rankingInvalidReasons`
- `suspiciousFlags`

Entradas antigas são normalizadas em tempo de leitura. Quando um campo novo não
existe, o sistema tenta estimar valores a partir de `ppm`, `cpm`, `tempo`,
`precisao` e `erros`.

## Regras de elegibilidade

Um treino fica fora do ranking quando uma ou mais regras abaixo falham:

- precisão menor que 90%;
- duração menor que 15 segundos;
- menos de 50 caracteres corretos;
- PPM ausente, zerado, negativo ou acima do limite conservador atual;
- precisão ausente, negativa ou acima de 100%;
- erros demais em relação aos acertos;
- repetição automática de teclas acima do limite;
- sequência longa de erros sem recuperação;
- muitos bursts suspeitos de input.

As regras são conservadoras. A intenção é remover rodadas claramente ruins ou
suspeitas sem punir jogadores legítimos.

## Motivo principal para Supabase

No Supabase, cada resultado enviado para `typing_results` recebe:

- `valid_for_ranking`: `true` quando o treino pode entrar no mural;
- `ranking_invalid_reason`: motivo principal em texto simples;
- `ranking_invalid_reasons`: lista detalhada usada pela UI e diagnóstico.

Valores de `ranking_invalid_reason`:

- `low_accuracy`: precisão abaixo de 90%;
- `too_short`: duração abaixo de 15 segundos;
- `too_few_chars`: poucos caracteres corretos;
- `suspicious_repetition`: repetição excessiva de tecla;
- `invalid_input_pattern`: padrão de input inconsistente ou erros demais;
- `missing_required_data`: dados obrigatórios ausentes ou inválidos.

## Motivos técnicos detalhados

Os códigos gravados em `rankingInvalidReasons` são:

- `accuracy_too_low`
- `duration_too_short`
- `not_enough_correct_chars`
- `too_many_errors`
- `repeated_key_abuse`
- `input_burst_suspicious`
- `random_typing_pattern`
- `completed_too_fast`
- `unknown`

## Tratamento de event.repeat

- Teclas de caractere e espaço com `event.repeat` são ignoradas para digitação.
- Essas repetições incrementam `repeatedKeyCount`.
- Backspace pode repetir e não deve quebrar índices.
- Backspace em treino pausado, finalizado ou sem caracteres anteriores é ignorado.

## Onde aparece na interface

- A tela final da Arena mostra se o resultado foi elegível para ranking.
- O histórico da tela final mostra todos os treinos e sinaliza se cada item vale
  para ranking.
- A página Ranking usa apenas resultados elegíveis em recordes, timeline e tabela.
- A categoria Curiosidades mostra "Mais erros" e "Maior caos" em um mural
  separado. Esses resultados não entram no ranking competitivo normal.

## Curiosidades / Mural dos Distraídos

As views `online_curiosity_ranking_most_errors` e
`online_curiosity_ranking_chaos` são criadas por
`supabase/ranking_curiosities.sql`.

Regras mínimas:

- `duration_seconds >= 15`;
- pelo menos 50 caracteres via `raw_key_count` ou `correct_chars + wrong_chars`;
- `errors > 0`;
- `accuracy` entre 0 e 100;
- permite `ranking_invalid_reason = low_accuracy`;
- ignora `suspicious_repetition`, `invalid_input_pattern` e `missing_required_data`.

O score de caos é:

```text
chaos = errors * 2 + greatest(0, 100 - accuracy)
```

## Escopo atual

As regras são client-side e baseadas também no histórico local. Elas não
substituem validação de servidor em um ranking global mais rígido. Se o volume
ou a competitividade crescer, o servidor deve recalcular os campos competitivos
e validar o resultado recebido do cliente.
