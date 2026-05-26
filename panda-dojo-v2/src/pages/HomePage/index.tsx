import { usePlayerProgress } from '@/features/gamification/hooks/usePlayerProgress';
import { useDailyMissions } from '@/features/missions/hooks/useDailyMissions';
import { useRecommendations } from '@/features/recommendations/hooks/useRecommendations';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui';
import { useNavigate } from 'react-router';
import { AchievementsPanel } from './components/AchievementsPanel';
import { DailyMissionList } from './components/DailyMissionList';
import { PlayerProgressPanel } from './components/PlayerProgressPanel';
import { RankingPanel } from './components/RankingPanel';
import { RecommendationCard } from './components/RecommendationCard';
import { TypingHistoryList } from './components/TypingHistoryList';
import styles from './HomePage.module.css';

export function HomePage() {
  const profile = usePlayerProgress();
  const missions = useDailyMissions();
  const recommendations = useRecommendations();
  const navigate = useNavigate();

  return (
    <PageShell title="Início">
      <div className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.kicker}>Panda Dojo Arcade</span>
          <h1 className={styles.heading}>
            Treine sua digitação.<br />Evolua todo dia.
          </h1>
          <p className={styles.sub}>
            Arena de digitação, mapa de fases e minigames — tudo em um só lugar.
          </p>
          <div className={styles.heroCta}>
            <Button variant="primary" size="lg" onClick={() => navigate('/arena')}>
              Começar treino
            </Button>
            <Button variant="ghost" onClick={() => navigate('/mapa')}>
              Ver Mapa do Dojo
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.grid} id="progresso">
        <PlayerProgressPanel profile={profile} />
        <RecommendationCard recommendation={recommendations[0]} />
        <TypingHistoryList history={profile.history} />
        <AchievementsPanel achievements={profile.achievementDetails} mistakes={profile.lastMistakes} />
        <DailyMissionList missions={missions} />
        <RankingPanel bestPpm={profile.bestPpm} />
      </div>
    </PageShell>
  );
}
