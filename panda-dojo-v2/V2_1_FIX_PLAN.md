# Plano de Correções — Panda Dojo Arcade V2.1

## Escopo

Versão de refinamento pós-feedback público. O objetivo é corrigir problemas reais de uso, clareza e polimento sem criar backend, login real, ranking global ou redesign radical.

## Alta prioridade

- Type Arena: deixar claro que a área de texto recebe o foco e inicia a digitação.
- Type Arena: reforçar o timer para continuar contando durante a digitação.
- Type Arena: melhorar leitura de erros/teclas erradas no resultado final.
- Type Arena: investigar e proteger a contagem de erros contra estados negativos ou instáveis.
- Mobile: preservar responsividade da Arena e reduzir atrito com foco/teclado.
- Mapa do Dojo: explicar melhor a regra local de avanço e desbloqueio.

## Média prioridade simples

- Tornar o teclado virtual opcional nas configurações.
- Reduzir um pouco o tamanho do título principal da Home.
- Melhorar microcopy do Arcade para ficar mais claro como experiência local/protótipo.
- Corrigir strings visíveis com acentuação quebrada nas telas tocadas.

## Fora da V2.1

- Backend, autenticação real e ranking global.
- Música, trilha sincronizada ou novos minigames grandes.
- Redesign completo do Type Arena já aprovado.
- Migração da V1 ou alteração estrutural profunda.

## Critérios de aceite

- `npm run lint` sem erro crítico novo.
- `npm run build` concluindo.
- Rotas principais abrindo em servidor local.
- Sem quebra da configuração de tema, cursor ou navegação.
- Type Arena continua com o visual aprovado e fluxo normal.
