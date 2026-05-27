import { PRACTICE_OPTIONS } from '@/features/typing/hooks/useTypingTimer';
import styles from './TimerHud.module.css';

interface TimerHudProps {
  formattedTime: string;
  progressPercent: number;
  ppm: number;
  cpm: number;
  precision: number;
  errors: number;
  combo: number;
  duration: number;
  isIdle: boolean;
  onDurationChange: (d: number) => void;
}

export function TimerHud({
  formattedTime,
  progressPercent,
  ppm,
  cpm,
  precision,
  errors,
  combo,
  duration,
  isIdle,
  onDurationChange,
}: TimerHudProps) {
  return (
    <div>
      <div className={styles.hud}>
        <div className={styles.metric}>
          <span className={[styles.value, styles.valueHighlight].join(' ')}>{formattedTime}</span>
          <span className={styles.label}>Tempo</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.value}>{ppm}</span>
          <span className={styles.label}>PPM</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.value}>{cpm}</span>
          <span className={styles.label}>CPM</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.value}>{precision}%</span>
          <span className={styles.label}>Precisão</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.value}>{errors}</span>
          <span className={styles.label}>Erros</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.value}>{combo}x</span>
          <span className={styles.label}>Combo</span>
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {isIdle && (
        <div className={styles.durationRow} style={{ marginTop: 10 }}>
          <span className={styles.durationLabel}>Duração:</span>
          <select
            className={styles.select}
            value={duration}
            onChange={(e) => onDurationChange(parseFloat(e.target.value))}
          >
            {PRACTICE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt < 1 ? `${opt * 60}s` : `${opt}min`}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
