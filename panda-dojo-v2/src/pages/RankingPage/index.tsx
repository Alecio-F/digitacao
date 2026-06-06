import { PageShell } from '@/components/layout/PageShell';
import { useRankingViewModel } from '@/features/ranking/useRankingViewModel';
import { RankingControls } from './components/RankingControls';
import { RankingEmptyState } from './components/RankingEmptyState';
import { RankingHero } from './components/RankingHero';
import { RankingInsightCard } from './components/RankingInsightCard';
import { RankingList } from './components/RankingList';
import { RankingPodium } from './components/RankingPodium';
import { RankingStatsSummary } from './components/RankingStatsSummary';
import styles from './RankingPage.module.css';

export function RankingPage() {
  const viewModel = useRankingViewModel();
  const shouldShowEmpty = viewModel.isOnlineLoading || Boolean(viewModel.onlineError) || viewModel.entries.length === 0;

  return (
    <PageShell title="Ranking">
      <main className={styles.page}>
        <RankingHero viewModel={viewModel} />
        <RankingControls viewModel={viewModel} />

        {shouldShowEmpty ? (
          <RankingEmptyState
            isPreparedOnly={viewModel.isPreparedOnly}
            categoryTitle={viewModel.selectedConfig.title}
            scope={viewModel.scope}
            isLoading={viewModel.isOnlineLoading}
            error={viewModel.onlineError}
          />
        ) : (
          <>
            <RankingPodium
              entries={viewModel.podiumEntries}
              metric={viewModel.metric}
              metricLabel={viewModel.currentMetricLabel}
            />
            <RankingList
              entries={viewModel.listEntries}
              fallbackEntries={viewModel.entries}
              metric={viewModel.metric}
              metricLabel={viewModel.currentMetricLabel}
            />
          </>
        )}

        <RankingStatsSummary stats={viewModel.stats} scope={viewModel.scope} />
        <RankingInsightCard insight={viewModel.insight} />
      </main>
    </PageShell>
  );
}
