import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Badge, Button } from '@/components/ui';
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
import styles from '../DojoMapPage.module.css';

export function DailyChallengeMapCard() {
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
    <section className={styles.dailyMapCard} aria-labelledby="daily-map-card-title">
      <div className={styles.dailyMapContent}>
        <div className={styles.dailyMapTopline}>
          <span className={styles.eyebrow}>Missão especial de hoje</span>
          <Badge variant={completed ? 'success' : 'warning'}>
            {completed ? 'Concluído hoje' : 'Diário'}
          </Badge>
          <Badge variant="special">{challenge.text.difficulty}</Badge>
        </div>

        <h2 id="daily-map-card-title">Missão Diária do Dojo</h2>
        <p>
          Um desafio renovado todos os dias para testar ritmo e precisão fora das fases do mapa.
        </p>

        <div className={styles.dailyMapMeta}>
          <span>{formatDailyDisplayDate(challenge.dayKey)}</span>
          <span>+{getDailyChallengeRewardXp()} XP estimado</span>
          <span>{getDailyResetLabel()}</span>
        </div>

        {result && (
          <div className={styles.dailyMapResult}>
            <span>{result.ppm} PPM</span>
            <span>{result.accuracy}% precisão</span>
            <span>Combo {result.maxCombo}x</span>
            <span>{medal ?? 'Sem medalha'}</span>
          </div>
        )}
      </div>

      <div className={styles.dailyMapActions}>
        <Button variant="primary" onClick={handleStart}>
          {completed ? 'Refazer desafio' : 'Iniciar desafio'}
        </Button>
        {result && (
          <Button variant="secondary" onClick={handleShare}>
            {copyStatus === 'copied'
              ? 'Resultado copiado!'
              : copyStatus === 'failed'
              ? 'Não foi possível copiar'
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
    </section>
  );
}
