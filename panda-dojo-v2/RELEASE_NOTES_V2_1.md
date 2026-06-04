# Panda Dojo Arcade V2.1

## Destaques

- Type Arena recebeu instrução explícita de foco para desktop e mobile.
- Timer da Arena foi reforçado com cálculo por relógio real.
- Teclado virtual agora pode ser ocultado ou exibido nas configurações.
- Resultado final mostra teclas para revisar com leitura mais confortável.
- Mapa do Dojo explica melhor a regra local de avanço.
- Home teve título principal levemente reduzido.
- Arcade recebeu textos mais claros sobre Panda Keys e progresso local.

## Correções

- Proteção contra contagem negativa de erros ao corrigir entradas.
- Input invisível da Arena deixou de ser `readOnly`, melhorando teclado em celulares.
- Rótulos acessíveis da área de digitação foram corrigidos.
- Strings visíveis com acentuação quebrada foram corrigidas nas telas ajustadas.

## Recursos locais

- Preferência de teclado virtual salva em `localStorage`.
- Tema, cursor, sons, animações e redução de efeitos seguem como configurações locais.
- Progresso, XP, histórico e recordes continuam locais.

## Limitações conhecidas

- Ainda não há backend, autenticação real ou ranking global.
- Alguns minigames continuam como protótipos.
- O progresso depende do navegador/dispositivo usado.
- Preview visual do cursor nas configurações fica para uma próxima rodada.

## Como testar

```bash
cd panda-dojo-v2
npm install
npm run dev
```

Rotas principais:

- `http://localhost:5173/`
- `http://localhost:5173/arena`
- `http://localhost:5173/aprenda`
- `http://localhost:5173/mapa`
- `http://localhost:5173/arcade`
- `http://localhost:5173/conta`
- `http://localhost:5173/ranking`
