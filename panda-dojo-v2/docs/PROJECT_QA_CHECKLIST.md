# Checklist Permanente de QA — PandaDigitações V2

## Antes de implementar
- [ ] Entender o escopo.
- [ ] Confirmar se a mudança é bug, melhoria ou feature.
- [ ] Verificar se afeta Type Arena, Mapa do Dojo, Arcade, Ranking ou Conta.
- [ ] Verificar se afeta localStorage.
- [ ] Verificar se afeta futuro Supabase.

## Durante a implementação
- [ ] Não espalhar lógica em componentes sem necessidade.
- [ ] Criar ou reutilizar services, utils e hooks.
- [ ] Manter TypeScript tipado.
- [ ] Evitar `any` desnecessário.
- [ ] Evitar duplicação de CSS.
- [ ] Usar tokens de tema.
- [ ] Preservar tema claro/escuro.
- [ ] Preservar responsividade.
- [ ] Preservar acessibilidade.
- [ ] Não quebrar modos existentes.

## Revisão Textual
- [ ] Conferir acentuação.
- [ ] Conferir pontuação.
- [ ] Conferir termos padronizados.
- [ ] Conferir botões e labels.
- [ ] Conferir mensagens de erro e sucesso.
- [ ] Remover textos quebrados ou com símbolos estranhos.
- [ ] Evitar nomes internos na interface.

## Testes Obrigatórios
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Testar tema claro.
- [ ] Testar tema escuro.
- [ ] Testar mobile.
- [ ] Testar desktop.
- [ ] Testar localStorage limpo.
- [ ] Testar localStorage com dados antigos.

## Rotas Principais
- [ ] `/`
- [ ] `/arena`
- [ ] `/mapa`
- [ ] `/aprenda`
- [ ] `/arcade`
- [ ] `/conta`
- [ ] `/ranking`

## Type Arena
- [ ] Palavras Aleatórias funciona.
- [ ] Textos para Praticar funciona.
- [ ] Fases do Mapa funcionam.
- [ ] Desafio Diário funciona.
- [ ] Backspace não quebra.
- [ ] Timer funciona.
- [ ] Resultado aparece.
- [ ] Ranking eligibility funciona.
- [ ] Teclado virtual funciona.
- [ ] Cursor da arena funciona.

## Mapa
- [ ] Fases bloqueiam e desbloqueiam.
- [ ] Textos para Praticar aparecem.
- [ ] Palavras Aleatórias inicia a Arena.
- [ ] Desafio Diário aparece.
- [ ] Progresso local funciona.

## Arcade
- [ ] Panda Keys inicia.
- [ ] Pausar/reiniciar funciona.
- [ ] Recorde salva.
- [ ] Feedback de acerto/erro está correto.
- [ ] Sem loop duplicado.

## Ranking
- [ ] Ranking filtra resultados válidos.
- [ ] Estado vazio funciona.
- [ ] Histórico antigo não quebra.

## Conta
- [ ] Perfil local aparece.
- [ ] Dados locais aparecem.
- [ ] Mensagem de conta futura/Supabase está clara.

## Antes de Concluir
- [ ] Sem erro crítico no console.
- [ ] Sem scroll horizontal.
- [ ] Sem texto quebrado.
- [ ] Sem import não usado relevante.
- [ ] Sem `console.log` desnecessário.
- [ ] Documentação atualizada, se necessário.
