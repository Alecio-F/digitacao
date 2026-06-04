import { Badge, Button } from '@/components/ui';
import {
  formatDailyDisplayDate,
  getDailyChallengeRewardXp,
  getDailyResetLabel,
} from '../utils/dailyChallengeService';
import { dismissToday } from '@/repositories/dailyChallengeRepository';
import type { DailyChallenge } from '../types';
import styles from './DailyChallengeModal.module.css';

interface DailyChallengeModalProps {
  challenge: DailyChallenge;
  onStart: () => void;
  onDismiss: () => void;
}

export function DailyChallengeModal({
  challenge,
  onStart,
  onDismiss,
}: DailyChallengeModalProps) {
  function handleStart() {
    onStart();
  }

  function handleDismiss() {
    dismissToday(challenge.dayKey);
    onDismiss();
  }

  return (
    <div className={styles.backdrop} role="presentation">
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-challenge-modal-title"
        aria-describedby="daily-challenge-modal-description"
      >
        <div className={styles.badgeRow}>
          <Badge variant="warning">Novo hoje</Badge>
          <Badge variant="success">{challenge.text.difficulty}</Badge>
        </div>

        <span className={styles.eyebrow}>Missão diária do Dojo</span>
        <h2 id="daily-challenge-modal-title">Novo Desafio Diário disponível</h2>
        <p id="daily-challenge-modal-description">
          A missão de hoje já está aberta. Complete o treino especial e compare seu resultado com
          amigos.
        </p>

        <div className={styles.metaGrid}>
          <span>
            <strong>Data</strong>
            {formatDailyDisplayDate(challenge.dayKey)}
          </span>
          <span>
            <strong>Recompensa</strong>
            +{getDailyChallengeRewardXp()} XP
          </span>
          <span>
            <strong>Reset</strong>
            {getDailyResetLabel()}
          </span>
        </div>

        <div className={styles.actions}>
          <Button variant="primary" onClick={handleStart}>
            Começar desafio
          </Button>
          <Button variant="ghost" onClick={handleDismiss}>
            Depois
          </Button>
        </div>
      </section>
    </div>
  );
}
