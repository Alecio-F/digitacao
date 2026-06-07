import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Badge, Button } from '@/components/ui';
import type { DailyChallengeDifficulty } from '@/features/dailyChallenge/types';
import {
  formatDailyDisplayDate,
  getDailyChallengeRewardXp,
  getDailyResetLabel,
  startDailyChallenge,
} from '@/features/dailyChallenge/utils/dailyChallengeService';
import { getDailyChallenge } from '@/features/dailyChallenge/utils/getDailyChallenge';
import {
  copyDailyResultToClipboard,
  generateDailyShareText,
  getDailyMedal,
} from '@/features/dailyChallenge/utils/shareDailyResult';
import { getTodayResult } from '@/repositories/dailyChallengeRepository';
import styles from '../HomePage.module.css';

const DIFFICULTY_VARIANT: Record<DailyChallengeDifficulty, 'success' | 'warning' | 'danger'> = {
  Fácil: 'success',
  Médio: 'warning',
  Difícil: 'danger',
};

export function DailyChallengeBanner() {
  const navigate = useNavigate();
  const challenge = useMemo(() => getDailyChallenge(), []);
  const [result] = useState(() => getTodayResult(challenge.dayKey));
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const completed = result !== null;
  const medal = result ? getDailyMedal(result.accuracy, result.ppm) : null;

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
    <section
      className={[
        styles.dailyChallengeBanner,
        completed ? styles.dailyChallengeBannerCompleted : styles.dailyChallengeBannerAvailable,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-labelledby="daily-challenge-banner-title"
    >
      <div className={styles.dailyChallengeContent}>
        <div className={styles.dailyChallengeTopline}>
          <span className={styles.dailyChallengeEyebrow}>Missão diária</span>
          <Badge variant={completed ? 'success' : 'warning'}>
            {completed ? 'Concluído hoje' : 'Novo hoje'}
          </Badge>
          <Badge variant={DIFFICULTY_VARIANT[challenge.text.difficulty]}>
            {challenge.text.difficulty}
          </Badge>
        </div>

        <h2 id="daily-challenge-banner-title">Desafio Diário do Dojo</h2>
        <p>
          Um treino especial renovado todos os dias para testar sua velocidade, precisão e foco.
        </p>

        <div className={styles.dailyChallengeMeta} aria-label="Detalhes do desafio diário">
          <span>
            <strong>Missão de Hoje</strong>
            {formatDailyDisplayDate(challenge.dayKey)}
          </span>
          <span>
            <strong>Recompensa</strong>
            +{getDailyChallengeRewardXp()} XP estimado
          </span>
          <span>
            <strong>Reset</strong>
            {getDailyResetLabel()}
          </span>
        </div>

        {result ? (
          <div className={styles.dailyChallengeResult} aria-label="Melhor resultado de hoje">
            <span>
              <strong>{result.ppm}</strong>
              PPM
            </span>
            <span>
              <strong>{result.accuracy}%</strong>
              precisão
            </span>
            <span>
              <strong>{result.maxCombo}x</strong>
              combo
            </span>
            <span>
              <strong>{medal ?? 'Sem medalha'}</strong>
              medalha
            </span>
          </div>
        ) : (
          <p className={styles.dailyChallengeStatus}>
            O desafio de hoje está disponível. Ele reinicia amanhã com uma nova missão.
          </p>
        )}

        <div className={styles.dailyChallengeActions}>
          <Button variant="primary" onClick={handleStart}>
            {completed ? 'Tentar melhorar' : 'Começar desafio'}
          </Button>
          {result && (
            <Button variant="secondary" onClick={handleShare}>
              {copyStatus === 'copied'
                ? 'Resultado copiado!'
                : copyStatus === 'failed'
                ? 'Não foi possível copiar'
                : 'Compartilhar resultado'}
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
      </div>

      <div className={styles.dailyChallengeVisual} aria-hidden="true">
        <span className={styles.dailyChallengeCalendar}>
          <span>HOJE</span>
          <strong>{formatDailyDisplayDate(challenge.dayKey).slice(0, 5)}</strong>
        </span>
        <span className={styles.dailyChallengePandaStage}>
          <img
            className={styles.dailyChallengePandaImage}
            src="/desafio.png"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </span>
      </div>
    </section>
  );
}
