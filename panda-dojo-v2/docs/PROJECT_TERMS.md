# Glossário do Projeto — PandaDigitações V2

Este glossário define os termos oficiais para interface, documentação e futuras integrações com Supabase.

## Nomes Oficiais
- PandaDigitações
- Panda Dojo Arcade
- Type Arena
- Mapa do Dojo
- Desafio Diário
- Missão Diária
- Palavras Aleatórias
- Textos para Praticar
- Panda Keys
- Conta
- Ranking
- Configurações
- Teclado virtual
- Cursor da arena
- Mestre Panda
- Resultado da rodada
- Teclas para revisar
- Próxima fase
- Novo texto
- Nova sequência

## Páginas
- Home: página inicial com hero, Desafio Diário, atalhos e progresso local.
- Type Arena: área principal de treino de digitação.
- Aprenda: conteúdo educativo e fundamentos de digitação.
- Mapa do Dojo: trilha de fases, textos e treinos guiados.
- Arcade: minigames locais, incluindo Panda Keys.
- Conta: perfil local, histórico, conquistas e preparação para conta real.
- Ranking: ranking local e elegibilidade competitiva.

## Modos de Treino Visíveis
- Palavras Aleatórias
- Textos para Praticar
- Fase do Mapa
- Desafio Diário

## Termos Internos Aceitos no Código
- `randomWords`
- `random-words`
- `practice-text`
- `daily-challenge`
- `lesson`
- `pandaSelectedTrainingMode`
- `pandaSelectedLessonId`
- `pandaSelectedPracticeText`
- `pandaSelectedDailyChallengeId`

## Evitar na Interface
- V1 fino
- Arcade como nome isolado de cursor
- randomWords
- practice-text
- daily-challenge
- undefined
- NaN
- IDs técnicos soltos, como `#885`, sem contexto
- texto random
- treino randômico
- fase do mapa escrita como termo técnico

## Recomendações de UX Writing
- Preferir textos curtos, claros e ativos.
- Usar "Teclas para revisar" quando o contexto for educativo.
- Usar "Resultado da rodada" para o fechamento da Type Arena.
- Usar "Novo texto", "Nova sequência" ou "Próxima fase" conforme a origem do treino.
- Não expor nomes de storage, IDs técnicos ou valores internos ao usuário.
