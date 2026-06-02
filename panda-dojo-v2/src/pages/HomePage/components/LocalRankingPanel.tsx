import { MetricCard, Panel } from '@/components/ui';
import type { DojoProfile } from '@/features/gamification/types';
import styles from '../HomePage.module.css';

interface Props {
  profile: DojoProfile;
}

function parsePrecision(value: string) {
  return Number(String(value).replace('%', '').replace(',', '.')) || 0;
}

export function LocalRankingPanel({ profile }: Props) {
  const bestPrecision = profile.history.reduce(
    (best, item) => Math.max(best, parsePrecision(item.precisao)),
    0,
  );
  const bestCombo = profile.history.reduce(
    (best, item) => Math.max(best, Number((item as { combo?: number }).combo) || 0),
    0,
  );

  return (
    <Panel as="section" title="Ranking local" subtitle="Seu melhor resultado salvo neste navegador.">
      <div className={styles.rankingMetrics}>
        <MetricCard label="Melhor PPM" value={profile.bestPpm || '--'} tone="special" compact />
        <MetricCard label="Precisão" value={bestPrecision ? `${bestPrecision}%` : '--'} tone="success" compact />
        <MetricCard label="Combo" value={bestCombo || '--'} compact />
        <MetricCard label="Panda Keys" value={profile.gameBestScore || '--'} tone="special" compact />
      </div>
      <p className={styles.smallNote}>Ranking global chegará em versão futura.</p>
    </Panel>
  );
}
