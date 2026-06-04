# Ranking Validation Rules

Este documento descreve as regras locais usadas pela Type Arena para decidir se
um treino entra no placar competitivo do PandaDigitações V2.

O histórico continua salvando todos os treinos. O ranking local mostra apenas os
resultados marcados como `validForRanking: true`.

## Metricas competitivas

- PPM é calculado a partir de caracteres corretos: `(correctChars / 5) / minutos`.
- CPM é calculado a partir de caracteres corretos: `correctChars / minutos`.
- Caracteres errados não aumentam PPM nem CPM.
- O score competitivo combina PPM, precisão e combo:
  `round(ppm * (accuracy / 100) + maxCombo * 0.15)`.

## Campos salvos no historico

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
- `rankingInvalidReasons`
- `suspiciousFlags`

Entradas antigas são normalizadas em tempo de leitura. Quando um campo novo não
existe, o sistema tenta estimar valores a partir de `ppm`, `cpm`, `tempo`,
`precisao` e `erros`.

## Regras de elegibilidade

Um treino fica fora do ranking quando uma ou mais regras abaixo falham:

- precisão menor que 85%;
- duração menor que 15 segundos;
- menos de 50 caracteres corretos;
- erros demais em relação aos acertos;
- repetição automática de teclas acima do limite;
- sequência longa de erros sem recuperação;
- muitos bursts suspeitos de input.

## Motivos tecnicos

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

## Escopo atual

As regras são locais e baseadas em `localStorage`. Elas não substituem validação
de servidor em um ranking global futuro. Quando houver backend, o servidor deve
recalcular os campos competitivos e validar o resultado recebido do cliente.
