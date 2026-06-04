import { Link } from 'react-router';
import { KEYS } from '@/constants';
import type { HistoryItem } from '@/features/gamification/types';
import type { LessonMedal } from '@/features/lessons/types';
import { getResultRecommendation } from '@/features/typing/utils/saveResult';
import { getStorage } from '@/services/storage/storageService';
import styles from './ResultsScreen.module.css';

interface ResultsScreenProps {
  ppm: number;
  cpm: number;
  precision: number;
  errors: number;
  maxCombo: number;
  gainedXp: number;
  level: number;
  title: string;
  isRecord: boolean;
  topErrors: [string, number][];
  duration: string;
  lessonCompleted: boolean;
  lessonCompletedNow: boolean;
  lessonMedal: LessonMedal | null;
  nextLessonTitle: string | null;
  nextActionLabel?: string;
  onRestart: () => void;
  onNext: () => void;
}

function getAchievement(precision: number, ppm: number) {
  if (precision >= 98 && ppm >= 50) return { label: 'Precisão · Ouro', tier: 'gold' as const };
  if (precision >= 95 && ppm >= 30) return { label: 'Precisão · Prata', tier: 'silver' as const };
  if (precision >= 85) return { label: 'Precisão · Bronze', tier: 'bronze' as const };
  return null;
}

function formatErrorKey(char: string) {
  return char === ' ' ? 'ESPAÇO' : char.toUpperCase();
}

const MEDAL_LABEL: Record<LessonMedal, string> = {
  none: 'Sem medalha',
  bronze: 'Bronze',
  silver: 'Prata',
  gold: 'Ouro',
};

interface Metric {
  label: string;
  value: string;
  tone?: 'mSuccess' | 'mWarning' | 'mSpecial';
}

export function ResultsScreen({
  ppm,
  cpm,
  precision,
  errors,
  maxCombo,
  gainedXp,
  level,
  title,
  isRecord,
  topErrors,
  duration,
  lessonCompleted,
  lessonCompletedNow,
  lessonMedal,
  nextLessonTitle,
  nextActionLabel,
  onRestart,
  onNext,
}: ResultsScreenProps) {
  const recommendation = getResultRecommendation(precision, ppm, topErrors);
  const history = getStorage<HistoryItem[]>(KEYS.historico, []);
  const safeHistory = Array.isArray(history) ? history : [];
  const bestPpm = safeHistory.reduce((best, result) => Math.max(best, Number(result.ppm) || 0), 0);
  const achievement = getAchievement(precision, ppm);
  const hasMedal = lessonCompleted && lessonMedal != null && lessonMedal !== 'none';
  const hasStatus = Boolean(achievement || isRecord || hasMedal);

  const metrics: Metric[] = [
    { label: 'TEMPO', value: duration },
    { label: 'PPM', value: String(ppm) },
    { label: 'CPM', value: String(cpm) },
    { label: 'PRECISÃO', value: `${precision}%`, tone: 'mSuccess' },
    { label: 'ERROS', value: String(errors), tone: 'mWarning' },
    { label: 'COMBO MÁX.', value: `${maxCombo}x`, tone: 'mSpecial' },
  ];

  const reviewKeys = [...topErrors].sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <div className={styles.screen}>
      <section className={styles.resultCard}>
        <header className={styles.resultHeader}>
          <div className={styles.resultHeadInfo}>
            <span className={styles.resultEyebrow}>Resultado da rodada</span>
            <h2 className={styles.resultTitle}>
              Nível {level} · {title}
            </h2>
            {lessonCompleted && (
              <p className={styles.resultSubline}>
                {lessonCompletedNow ? 'Fase concluída' : 'Fase já concluída'}
                {hasMedal ? ` · Medalha ${MEDAL_LABEL[lessonMedal as LessonMedal]}` : ''}
              </p>
            )}
          </div>
          <span className={styles.xpChip}>+{gainedXp} XP</span>
        </header>

        {hasStatus && (
          <div className={styles.statusRow}>
            {achievement && (
              <span className={[styles.statusBadge, styles[`tier_${achievement.tier}`]].join(' ')}>
                <span className="material-symbols-outlined" aria-hidden="true">emoji_events</span>
                {achievement.label}
              </span>
            )}
            {hasMedal && (
              <span className={[styles.statusBadge, styles.tier_lesson].join(' ')}>
                <span className="material-symbols-outlined" aria-hidden="true">verified</span>
                Medalha {MEDAL_LABEL[lessonMedal as LessonMedal]}
              </span>
            )}
            {isRecord && (
              <span className={[styles.statusBadge, styles.tier_record].join(' ')}>
                <span className="material-symbols-outlined" aria-hidden="true">bolt</span>
                Novo recorde!
              </span>
            )}
          </div>
        )}

        <div className={styles.metricsGrid}>
          {metrics.map(({ label, value, tone }) => (
            <div
              key={label}
              className={[styles.metricCard, tone ? styles[tone] : ''].filter(Boolean).join(' ')}
            >
              <span className={styles.metricLabel}>{label}</span>
              <strong className={styles.metricValue}>{value}</strong>
            </div>
          ))}
        </div>

        {reviewKeys.length > 0 ? (
          <div className={styles.reviewKeys}>
            <span className={styles.reviewLabel}>Teclas para revisar</span>
            <div className={styles.reviewChips}>
              {reviewKeys.map(([char, count]) => (
                <span key={char} className={styles.reviewChip}>
                  {formatErrorKey(char)}
                  <small>{count}x</small>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.noErrors}>
            <span className="material-symbols-outlined" aria-hidden="true">task_alt</span>
            Nenhuma tecla errada nesta rodada.
          </div>
        )}

        <div className={styles.masterTip}>
          <span className={`material-symbols-outlined ${styles.masterTipIcon}`} aria-hidden="true">
            lightbulb
          </span>
          <div className={styles.masterTipBody}>
            <span className={styles.masterTipTitle}>Recomendação do Mestre Panda</span>
            <p className={styles.masterTipText}>{recommendation.text}</p>
          </div>
          {recommendation.href && recommendation.linkText && (
            <Link to={recommendation.href} className={styles.tipBtn}>
              {recommendation.linkText}
            </Link>
          )}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.btnSecondary} onClick={onRestart}>
            Tentar novamente
          </button>
          <button type="button" className={styles.btnPrimary} onClick={onNext}>
            {nextActionLabel ?? (nextLessonTitle ? 'Próxima fase' : 'Próximo texto')}
          </button>
          <Link to="/mapa" className={styles.btnGhost}>
            Ir para o Mapa
          </Link>
        </div>

        {nextLessonTitle && (
          <p className={styles.nextHint}>Próxima fase: {nextLessonTitle}</p>
        )}
      </section>

      {safeHistory.length > 0 && (
        <section className={styles.historySection}>
          <h3 className={styles.historyTitle}>Últimos resultados</h3>
          <div className={styles.historyScroll}>
            {safeHistory.slice(0, 8).map((item, index) => {
              const itemPpm = Number(item.ppm) || 0;
              const isItemRecord = itemPpm > 0 && itemPpm === bestPpm;
              const isFirst = index === 0;

              return (
                <div
                  key={`${item.data ?? 'resultado'}-${index}`}
                  className={[
                    styles.historyCard,
                    isFirst ? styles.historyCardCurrent : '',
                    isItemRecord ? styles.historyCardRecord : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className={styles.historyCardTop}>
                    <span className={styles.historyDate}>{item.data ?? '-'}</span>
                    {isFirst && <span className={styles.historyBadgeCurrent}>Atual</span>}
                    {isItemRecord && <span className={styles.historyBadgeRecord}>Recorde</span>}
                  </div>
                  <div className={styles.historyPpmRow}>
                    <strong className={styles.historyPpm}>{itemPpm}</strong>
                    <span className={styles.historyPpmUnit}>PPM</span>
                  </div>
                  <div className={styles.historyMeta}>
                    <span>{item.precisao}</span>
                    {item.cpm != null && <span>{item.cpm} CPM</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
