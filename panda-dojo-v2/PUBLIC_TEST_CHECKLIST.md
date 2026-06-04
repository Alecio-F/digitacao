# Checklist de Teste Público — PandaDigitações V2

Use esta lista ao validar a versão publicada com testadores.

## Geral
- [x] Site carrega
- [x] Sem erro no console
- [x] Tema claro funciona
- [x] Tema escuro funciona
- [x] Mobile funciona
- [x] Sem scroll horizontal

## Navegação
- [x] Home (`/`)
- [x] Arena (`/arena`)
- [x] Aprenda (`/aprenda`)
- [x] Mapa (`/mapa`)
- [x] Arcade (`/arcade`)
- [x] Conta (`/conta`)
- [x] Ranking (`/ranking`)
- [x] Recarregar (F5) em uma rota interna não dá 404
- [x] Item ativo destacado no header/menu mobile

## Arena
- [x] Digitação funciona
- [x] Timer funciona
- [x] Pausar funciona
- [x] Reiniciar funciona
- [x] Resultado aparece
- [x] Histórico salva
- [x] Cursor Arcade funciona
- [x] Cursor V1 fino funciona
- [x] Tempo padrão (Configurações) é respeitado

## Mapa
- [x] Fases aparecem
- [x] Fase bloqueada não inicia
- [x] Fase disponível inicia
- [x] Seleção salva para a Arena

## Arcade
- [x] Panda Keys inicia
- [x] Pontuação funciona
- [x] Pausar funciona
- [x] Reiniciar funciona
- [x] Recorde salva
- [x] Canvas nítido (sem blur) em tela HiDPI
- [x] Sair da página não deixa loop rodando (console limpo)

## Conta e Ranking
- [x] Perfil local aparece
- [x] Ranking local aparece (ordenado por PPM)
- [x] Estado vazio funciona (localStorage limpo)
- [x] Limpar progresso local pede confirmação e preserva configurações

## localStorage
- [x] localStorage vazio → sem tela branca
- [x] localStorage com dados antigos da V1 → não quebra
- [x] localStorage com JSON inválido → não quebra

## Configurações
- [x] Abrir/fechar drawer de configurações
- [x] Alternar tema persiste após reload
- [x] Reduzir efeitos / animações funciona
