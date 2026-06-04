# Correções Pós-Feedback — PandaDigitações V2

## Objetivo

Organizar bugs, melhorias e ajustes encontrados após o teste público controlado.

Use os IDs abaixo para referenciar itens em commits e tarefas.

## Bugs corrigidos na V2.1

| ID | Problema | Página | Status |
| --- | --- | --- | --- |
| BUG-001 | Timer da Type Arena reforçado para não depender apenas do intervalo visual durante digitação intensa. | Type Arena | Corrigido |
| BUG-002 | Contagem de erros protegida contra decrementos negativos ao corrigir entradas. | Type Arena | Corrigido |
| BUG-003 | Entrada mobile melhorada com input invisível controlado, sem `readOnly`, para abrir teclado do dispositivo. | Type Arena | Corrigido |

## Melhorias de UX aplicadas

| ID | Melhoria | Página | Prioridade | Status |
| --- | --- | --- | --- | --- |
| UX-001 | Mensagem explícita indicando que o usuário deve clicar/tocar na arena para digitar. | Type Arena | Alta | Concluído |
| UX-002 | Teclado virtual agora pode ser mostrado/ocultado nas configurações locais. | Type Arena / Configurações | Média | Concluído |
| UX-003 | Mapa do Dojo explica a regra local de avanço com 85% de precisão. | Mapa | Alta | Concluído |
| UX-004 | Card recomendado do Mapa informa que a Arena abre com textos focados na fase. | Mapa | Média | Concluído |
| UX-005 | Arcade recebeu microcopy explicando objetivo do Panda Keys e progresso local. | Arcade | Média | Concluído |

## Melhorias visuais aplicadas

| ID | Ajuste | Página | Prioridade | Status |
| --- | --- | --- | --- | --- |
| UI-001 | Título principal da Home reduzido para melhorar equilíbrio visual. | Home | Média | Concluído |
| UI-002 | Teclas erradas no resultado final ganharam chips maiores e tom menos agressivo. | Type Arena | Alta | Concluído |
| UI-003 | Strings visíveis com acentuação quebrada foram corrigidas nas telas tocadas. | Arena / Mapa / Arcade | Média | Concluído |

## Mobile

| ID | Problema | Página | Dispositivo | Status |
| --- | --- | --- | --- | --- |
| MOB-001 | Teclado do celular podia não abrir por causa do input invisível `readOnly`. | Type Arena | Mobile | Corrigido |
| MOB-002 | Instrução de toque adicionada para orientar o início da digitação. | Type Arena | Mobile | Corrigido |

## Acessibilidade

| ID | Problema | Página | Status |
| --- | --- | --- | --- |
| A11Y-001 | Rótulo da área de digitação e do input invisível corrigidos. | Type Arena | Corrigido |
| A11Y-002 | Configuração do teclado virtual exposta como switch acessível. | Configurações | Corrigido |

## Deixado para versão futura

- Login real, backend e ranking global.
- Música/trilha sonora avançada no Arcade.
- Mais minigames completos.
- Preview visual do cursor nas configurações.
- Redesenho maior do Panda Keys.

## Critérios para lançar V2.1

- [x] Type Arena com instrução de foco.
- [x] Timer da Type Arena reforçado.
- [x] Resultado final mais legível.
- [x] Teclado virtual opcional.
- [x] Mapa com regra de avanço clara.
- [x] Arcade com microcopy mais clara.
- [x] Build passando.
- [x] Lint passando.
- [x] Rotas principais testadas localmente.
