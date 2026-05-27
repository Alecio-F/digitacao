import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui';
import { useSealChallenge } from '@/features/arcade/sealChallenge/useSealChallenge';
import styles from './SealChallenge.module.css';

export function SealChallenge() {
  const { state, start, handleInput } = useSealChallenge();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.phase === 'playing') inputRef.current?.focus();
  }, [state.phase]);

  const statusClass = {
    neutral: styles.statusNeutral,
    success: styles.statusSuccess,
    danger: styles.statusDanger,
  }[state.status.tone];

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.icon}>SE</span>
        <div className={styles.info}>
          <h3 className={styles.title}>Selos do Teclado</h3>
          <p className={styles.desc}>
            Ative selos digitando palavras em sequência. Cada acerto aumenta o combo.
          </p>
        </div>
      </div>

      <strong className={styles.currentWord}>
        {state.phase === 'playing' ? (state.sequence[state.wordIndex] ?? 'completo') : 'foco'}
      </strong>

      <div className={styles.sealList} aria-label="Selos da sequência">
        {state.sequence.map((word, i) => (
          <span
            key={i}
            className={[styles.sealToken, i < state.wordIndex ? styles.sealTokenLit : '']
              .filter(Boolean)
              .join(' ')}
          >
            {word}
          </span>
        ))}
      </div>

      <input
        ref={inputRef}
        className={styles.input}
        type="text"
        autoComplete="off"
        spellCheck={false}
        placeholder="Digite o selo"
        disabled={state.phase !== 'playing'}
        value={state.currentInput}
        onChange={(e) => handleInput(e.target.value)}
        aria-label="Digite o selo atual"
      />

      <div className={styles.statsRow}>
        <span className={styles.stat}>Combo <strong>{state.combo}x</strong></span>
        <span className={styles.stat}>Pontos <strong>{state.score}</strong></span>
        <span className={styles.stat}>Recorde <strong>{state.best}</strong></span>
      </div>

      <p className={[styles.status, statusClass].join(' ')}>{state.status.text}</p>

      <Button
        variant="secondary"
        size="sm"
        onClick={start}
        disabled={state.phase === 'playing'}
      >
        {state.phase === 'finished' ? 'Jogar novamente' : 'Jogar protótipo'}
      </Button>
    </div>
  );
}
