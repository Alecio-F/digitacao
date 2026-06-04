import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Badge, Button, Card, Chip } from '@/components/ui';
import { startDailyChallenge } from '@/features/dailyChallenge/utils/dailyChallengeService';
import { getDailyChallenge } from '@/features/dailyChallenge/utils/getDailyChallenge';
import {
  copyDailyResultToClipboard,
  generateDailyShareText,
} from '@/features/dailyChallenge/utils/shareDailyResult';
import { getTodayResult } from '@/repositories/dailyChallengeRepository';
import type { DailyChallengeDifficulty } from '@/features/dailyChallenge/types';
import styles from '../HomePage.module.css';

const DIFFICULTY_VARIANT: Record<DailyChallengeDifficulty, 'success' | 'warning' | 'danger'> = {
  Fácil: 'success',
  Médio: 'warning',
  Difícil: 'danger',
};

export function DailyChallengeCard() {
  const navigate = useNavigate();
  const challenge = useMemo(() => getDailyChallenge(), []);
  const [result] = useState(() => getTodayResult(challenge.dayKey));
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const done = result !== null;

  function handleStart() {
    startDailyChallenge(challenge);
    navigate('/arena');
  }

  async function handleShare() {
    if (!result) return;
    const ok = await copyDailyResultToClipboard(generateDailyShareText(result));
    setCopyStatus(ok ? 'copied' : 'failed');
    window.setTimeout(() => setCopyStatus('idle'), 2500);
  }

  return (
    <Card as="section" className={styles.dailyCard} aria-labelledby="daily-challenge-title">
      <div className={styles.dailyHead}>
        <Chip variant="purple" icon={<span className="material-symbols-outlined">calendar_today</span>}>
          Diário
        </Chip>
        <Badge variant={DIFFICULTY_VARIANT[challenge.text.difficulty]}>
          {challenge.text.difficulty}
        </Badge>
        <span className={styles.dailyNumber}>#{challenge.challengeNumber}</span>
      </div>

      <h2 id="daily-challenge-title" className={styles.dailyTitle}>Desafio Diário</h2>
      <p className={styles.dailyText}>
        {done
          ? 'Você já concluiu o desafio de hoje. Refaça para melhorar sua marca.'
          : 'O treino de hoje já está disponível. Compare seu resultado com amigos.'}
      </p>

      <p className={[styles.dailyStatus, done ? styles.dailyStatusDone : ''].filter(Boolean).join(' ')}>
        <span className="material-symbols-outlined" aria-hidden="true">
          {done ? 'check_circle' : 'event_available'}
        </span>
        {done ? 'Concluído hoje' : 'Não feito hoje'}
      </p>

      {result && (
        <div className={styles.dailyBest}>
          <span><strong>{result.ppm}</strong> PPM</span>
          <span><strong>{result.accuracy}%</strong> precisão</span>
          <span>Combo <strong>{result.maxCombo}x</strong></span>
        </div>
      )}

      <div className={styles.dailyActions}>
        <Button variant="primary" onClick={handleStart}>
          {done ? 'Refazer desafio' : 'Fazer desafio'}
        </Button>
        {result && (
          <Button variant="secondary" onClick={handleShare}>
            {copyStatus === 'copied'
              ? 'Copiado!'
              : copyStatus === 'failed'
              ? 'Falha ao copiar'
              : 'Compartilhar'}
          </Button>
        )}
      </div>

      <span className={styles.srOnly} role="status" aria-live="polite">
        {copyStatus === 'copied'
          ? 'Resultado copiado para a área de transferência.'
          : copyStatus === 'failed'
          ? 'Não foi possível copiar. Tente novamente.'
          : ''}
      </span>
    </Card>
  );
}
