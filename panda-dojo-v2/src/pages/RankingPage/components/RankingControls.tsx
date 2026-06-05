import {
  getMetricLabel,
  RANKING_CATEGORY_OPTIONS,
  RANKING_PERIOD_OPTIONS,
  RANKING_SCOPE_OPTIONS,
  type RankingViewModel,
} from '@/features/ranking/useRankingViewModel';
import { RANKING_CATEGORY_CONFIG } from '@/features/ranking/rankingConfig';
import type { RankingCategory, RankingMetric, RankingPeriod, RankingScope } from '@/features/ranking/rankingTypes';
import styles from '../RankingPage.module.css';

interface Props {
  viewModel: RankingViewModel;
}

export function RankingControls({ viewModel }: Props) {
  const { category, period, scope, metric, selectedConfig } = viewModel;

  return (
    <section className={styles.controlsPanel} aria-labelledby="ranking-controls-title">
      <div className={styles.controlsHeader}>
        <span className={styles.eyebrow}>Filtros do mural</span>
        <h2 id="ranking-controls-title">Escolha sua arena de disputa</h2>
        <p>{selectedConfig.description}</p>
      </div>

      <div className={styles.controlGroup} aria-label="Categorias do ranking">
        {RANKING_CATEGORY_OPTIONS.map((option) => {
          const config = RANKING_CATEGORY_CONFIG[option];
          const isActive = category === option;
          return (
            <button
              key={option}
              type="button"
              className={`${styles.controlChip} ${isActive ? styles.controlChipActive : ''}`}
              aria-pressed={isActive}
              onClick={() => viewModel.setCategory(option as RankingCategory)}
            >
              {config.title}
              {config.status === 'soon' && <small>em breve</small>}
            </button>
          );
        })}
      </div>

      <div className={styles.controlRows}>
        <div className={styles.controlBlock}>
          <span>Métrica</span>
          <div className={styles.controlGroup} aria-label="Métrica do ranking">
            {selectedConfig.availableMetrics.map((option) => (
              <button
                key={option}
                type="button"
                className={`${styles.controlChip} ${metric === option ? styles.controlChipActive : ''}`}
                aria-pressed={metric === option}
                onClick={() => viewModel.setMetric(option as RankingMetric)}
              >
                {getMetricLabel(option)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.controlBlock}>
          <span>Período</span>
          <div className={styles.controlGroup} aria-label="Período do ranking">
            {RANKING_PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.controlChip} ${period === option.value ? styles.controlChipActive : ''}`}
                aria-pressed={period === option.value}
                onClick={() => viewModel.setPeriod(option.value as RankingPeriod)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.controlBlock}>
          <span>Escopo</span>
          <div className={styles.controlGroup} aria-label="Escopo do ranking">
            {RANKING_SCOPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.controlChip} ${scope === option.value ? styles.controlChipActive : ''}`}
                aria-pressed={scope === option.value}
                disabled={option.disabled}
                onClick={() => viewModel.setScope(option.value as RankingScope)}
              >
                {option.label}
                {option.disabled && <small>em breve</small>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
