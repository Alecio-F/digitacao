import { useCallback, useEffect, useRef, useState } from 'react';
import { IconButton } from '@/components/ui';
import { TipCard, type Tip } from './TipCard';
import styles from './TipCarousel.module.css';

const TIPS: Tip[] = [
  { icon: 'speed',           title: 'Precisão antes de velocidade', text: 'Treine devagar primeiro. Precisão cria confiança. Velocidade vem como consequência quando os dedos memorizam o caminho.' },
  { icon: 'keyboard_return', title: 'Regra do retorno',             text: 'Depois de cada tecla, volte para ASDF e JKLÇ. Essa é a posição base que garante alcance correto para todas as teclas.' },
  { icon: 'self_improvement',title: 'Postura protege você',         text: 'Costas retas, ombros relaxados e pulsos leves. Uma postura ruim força seu corpo e limita quanto tempo você consegue treinar.' },
  { icon: 'visibility_off',  title: 'Não olhe para o teclado',      text: 'Resistir ao impulso de olhar para as teclas é o maior salto da digitação. Confie na memória muscular dos seus dedos.' },
  { icon: 'space_bar',       title: 'Polegares no espaço',          text: 'Os polegares ficam no espaço. É a tecla mais fácil de alcançar e garante ritmo entre as palavras.' },
];

const AUTO_ADVANCE_MS = 5000;
const DEBOUNCE_MS = 600;

export function TipCarousel() {
  const [current, setCurrent] = useState(0);
  const canClick = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback((delta: 1 | -1) => {
    if (!canClick.current) return;
    canClick.current = false;
    setCurrent((prev) => (prev + delta + TIPS.length) % TIPS.length);
    setTimeout(() => { canClick.current = true; }, DEBOUNCE_MS);
    restartTimer();
  }, []);

  function restartTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => advance(1), AUTO_ADVANCE_MS);
  }

  useEffect(() => {
    restartTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <div className={styles.carousel} aria-label="Dicas do Mestre Panda">
      <div className={styles.track}>
        {TIPS.map((tip, i) => (
          <TipCard key={tip.icon} tip={tip} visible={i === current} />
        ))}
      </div>

      <div className={styles.controls}>
        <IconButton icon="chevron_left" label="Dica anterior" onClick={() => advance(-1)} />
        <div className={styles.dots} role="tablist" aria-label="Dicas">
          {TIPS.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Dica ${i + 1}`}
              className={[styles.dot, i === current ? styles.dotActive : ''].filter(Boolean).join(' ')}
              onClick={() => { if (canClick.current) { canClick.current = false; setCurrent(i); restartTimer(); setTimeout(() => { canClick.current = true; }, DEBOUNCE_MS); } }}
            />
          ))}
        </div>
        <IconButton icon="chevron_right" label="Próxima dica" onClick={() => advance(1)} />
      </div>
    </div>
  );
}
