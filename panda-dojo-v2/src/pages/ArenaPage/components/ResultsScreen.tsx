import { Link } from 'react-router';
import { KEYS } from '@/constants';
import { getStorage } from '@/services/storage/storageService';
import type { HistoryItem } from '@/features/gamification/types';
import { getResultRecommendation } from '@/features/typing/utils/saveResult';
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
  onRestart: () => void;
}

function getAchievement(precision: number, ppm: number) {
  if (precision >= 98 && ppm >= 50) return { label: 'Precisão · Ouro', tier: 'gold' as const };
  if (precision >= 95 && ppm >= 30) return { label: 'Precisão · Prata', tier: 'silver' as const };
  if (precision >= 85)              return { label: 'Precisão · Bronze', tier: 'bronze' as const };
  return null;
}

export function ResultsScreen({
  ppm, cpm, precision, errors, maxCombo,
  gainedXp, level, title, isRecord,
  topErrors, duration, onRestart,
}: ResultsScreenProps) {
  const recommendation = getResultRecommendation(precision, ppm, topErrors);
  const history = getStorage<HistoryItem[]>(KEYS.historico, []);
  const bestPpm = history.reduce((b, r) => Math.max(b, Number(r.ppm) || 0), 0);
  const achievement = getAchievement(precision, ppm);

  const METRICS = [
    { label: 'TEMPO',     value: duration },
    { label: 'PPM',       value: String(ppm) },
    { label: 'CPM',       value: String(cpm) },
    { label: 'PRECISÃO',  value: `${precision}%` },
    { label: 'ERROS',     value: String(errors) },
    { label: 'COMBO MÁX.', value: `${maxCombo}x` },
  ];

  return (
    <div className={styles.screen}>

      {/* ── Nível atual ── */}
      <div className={styles.levelHeader}>
        <div className={styles.levelInfo}>
          <span className={styles.levelEyebrow}>Nível atual</span>
          <span className={styles.levelTitle}>Nível {level} · {title}</span>
        </div>
        <span className={styles.xpBadge}>+{gainedXp} XP</span>
      </div>

      {/* ── Achievement banner ── */}
      {(achievement || isRecord) && (
        <div className={[
          styles.achievementBanner,
          achievement ? styles[`tier_${achievement.tier}`] : styles.tier_record,
        ].join(' ')}>
          <span className={`material-symbols-outlined ${styles.achieveIcon}`}>emoji_events</span>
          <span className={styles.achieveLabel}>
            {achievement ? achievement.label : 'Novo recorde pessoal!'}
          </span>
          {isRecord && achievement && (
            <span className={styles.recordTag}>Novo recorde!</span>
          )}
        </div>
      )}

      {/* ── Desempenho ── */}
      <section>
        <h3 className={styles.sectionTitle}>Desempenho</h3>
        <div className={styles.metricsGrid}>
          {METRICS.map(({ label, value }) => (
            <div key={label} className={styles.metricCard}>
              <span className={styles.metricLabel}>{label}</span>
              <strong className={styles.metricValue}>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* ── Teclas mais erradas ── */}
      {topErrors.length > 0 && (
        <div className={styles.errorsRow}>
          <span className={styles.errorsLabel}>Teclas mais erradas:</span>
          <div className={styles.errorKeys}>
            {topErrors.slice(0, 6).map(([char, count]) => (
              <span key={char} className={styles.errorKey}>
                {char === ' ' ? '␣' : char.toUpperCase()}
                <small>{count}×</small>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Recomendação do Mestre Panda ── */}
      <div className={styles.recCard}>
        <div className={styles.recIconWrap}>
          <span className="material-symbols-outlined">lightbulb</span>
        </div>
        <div className={styles.recContent}>
          <span className={styles.recTitle}>Recomendação do Mestre Panda</span>
          <p className={styles.recText}>{recommendation.text}</p>
        </div>
        {recommendation.href && recommendation.linkText && (
          <Link to={recommendation.href} className={styles.recBtn}>
            {recommendation.linkText}
          </Link>
        )}
      </div>

      {/* ── Ações ── */}
      <div className={styles.actions}>
        <button className={styles.btnSecondary} onClick={onRestart}>
          Fazer novamente
        </button>
        <button className={styles.btnPrimary} onClick={onRestart}>
          Próximo texto
        </button>
      </div>

      {/* ── Últimos resultados (scroll horizontal) ── */}
      {history.length > 0 && (
        <section className={styles.historySection}>
          <h3 className={styles.historyTitle}>Últimos resultados</h3>
          <div className={styles.historyScroll}>
            {history.slice(0, 10).map((item, i) => {
              const itemPpm = Number(item.ppm) || 0;
              const isItemRecord = itemPpm > 0 && itemPpm === bestPpm;
              const isFirst = i === 0;
              return (
                <div
                  key={i}
                  className={[
                    styles.historyCard,
                    isFirst        ? styles.historyCardCurrent : '',
                    isItemRecord   ? styles.historyCardRecord  : '',
                  ].filter(Boolean).join(' ')}
                >
                  <div className={styles.historyCardTop}>
                    <span className={styles.historyDate}>{item.data ?? '—'}</span>
                    {isFirst      && <span className={styles.historyBadgeCurrent}>Atual</span>}
                    {isItemRecord && <span className={styles.historyBadgeRecord}>Recorde</span>}
                  </div>
                  <div className={styles.historyPpmRow}>
                    <strong className={styles.historyPpm}>{itemPpm}</strong>
                    <span className={styles.historyPpmUnit}>PPM</span>
                  </div>
                  <div className={styles.historyMeta}>
                    <span>{item.precisao}</span>
                    {item.cpm != null && <span>{item.cpm} CPM</span>}
                    {item.erros != null && <span>{item.erros} erros</span>}
                    {item.tempo != null && (
                      <span>{item.tempo < 1 ? `${Math.round(item.tempo * 60)}s` : `${item.tempo}min`}</span>
                    )}
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
