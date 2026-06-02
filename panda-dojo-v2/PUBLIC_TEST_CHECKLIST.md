# Checklist de Teste Público — PandaDigitações V2

Use esta lista ao validar a versão publicada com testadores.

## Geral
- [ ] Site carrega
- [ ] Sem erro no console
- [ ] Tema claro funciona
- [ ] Tema escuro funciona
- [ ] Mobile funciona
- [ ] Sem scroll horizontal

## Navegação
- [ ] Home (`/`)
- [ ] Arena (`/arena`)
- [ ] Aprenda (`/aprenda`)
- [ ] Mapa (`/mapa`)
- [ ] Arcade (`/arcade`)
- [ ] Conta (`/conta`)
- [ ] Ranking (`/ranking`)
- [ ] Recarregar (F5) em uma rota interna não dá 404
- [ ] Item ativo destacado no header/menu mobile

## Arena
- [ ] Digitação funciona
- [ ] Timer funciona
- [ ] Pausar funciona
- [ ] Reiniciar funciona
- [ ] Resultado aparece
- [ ] Histórico salva
- [ ] Cursor Arcade funciona
- [ ] Cursor V1 fino funciona
- [ ] Tempo padrão (Configurações) é respeitado

## Mapa
- [ ] Fases aparecem
- [ ] Fase bloqueada não inicia
- [ ] Fase disponível inicia
- [ ] Seleção salva para a Arena

## Arcade
- [ ] Panda Keys inicia
- [ ] Pontuação funciona
- [ ] Pausar funciona
- [ ] Reiniciar funciona
- [ ] Recorde salva
- [ ] Canvas nítido (sem blur) em tela HiDPI
- [ ] Sair da página não deixa loop rodando (console limpo)

## Conta e Ranking
- [ ] Perfil local aparece
- [ ] Ranking local aparece (ordenado por PPM)
- [ ] Estado vazio funciona (localStorage limpo)
- [ ] Limpar progresso local pede confirmação e preserva configurações

## localStorage
- [ ] localStorage vazio → sem tela branca
- [ ] localStorage com dados antigos da V1 → não quebra
- [ ] localStorage com JSON inválido → não quebra

## Configurações
- [ ] Abrir/fechar drawer de configurações
- [ ] Alternar tema persiste após reload
- [ ] Reduzir efeitos / animações funciona
